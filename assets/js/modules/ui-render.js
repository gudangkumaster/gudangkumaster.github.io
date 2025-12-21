/**
 * UI Renderer Module
 * Handles all dashboard and list rendering.
 */

const headerIncomeSisaEl = document.getElementById('header-income-sisa');
const rowTotalBalanceEl = document.getElementById('row-total-balance');
const expenseEl = document.getElementById('total-expense');
const investEl = document.getElementById('total-invest');
const budgetContainer = document.getElementById('budget-progress-container');
const transactionList = document.getElementById('transaction-list');
const contextMenuModal = document.getElementById('context-menu-modal');

let selectedTransactionId = null;
let contextMenuCallback = null;

// Budget Limits Configuration
export const BUDGET_LIMITS = {
    'FOOD': 1500000,
    'BILLS': 2000000,
    'SHOPPING': 1000000,
    'LEISURE': 800000,
    'TRANSPORT': 500000,
    'HEALTH': 1000000,
    'EDUCATION': 500000
};

export function initUI(onContextAction) {
    contextMenuCallback = onContextAction;

    // Context Menu Handlers
    const closeContextX = document.getElementById('close-context-x');
    const editBtn = document.getElementById('edit-transaction-btn');
    const deleteBtn = document.getElementById('delete-transaction-btn');

    if (closeContextX) {
        closeContextX.addEventListener('click', () => {
            if (contextMenuModal) contextMenuModal.classList.remove('active');
            selectedTransactionId = null;
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (contextMenuCallback && selectedTransactionId) {
                contextMenuCallback('edit', selectedTransactionId);
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (contextMenuCallback && selectedTransactionId) {
                contextMenuCallback('delete', selectedTransactionId);
            }
        });
    }

    // Expose helpers globally
    window.filterTransactions = filterTransactions;
    window.searchTransactions = searchTransactions;
}

export function showLoadingState() {
    if (headerIncomeSisaEl) headerIncomeSisaEl.innerText = 'Rp ━━━━━';
    if (rowTotalBalanceEl) rowTotalBalanceEl.innerText = 'Rp ━━━━━';
    if (expenseEl) expenseEl.innerText = 'Rp ━━━━━';
    if (investEl) investEl.innerText = 'Rp ━━━━━';

    const marqueeEl = document.getElementById('marquee-content');
    if (marqueeEl) marqueeEl.innerText = '⟳ MEMUAT DATA TERBARU...';
}

export function updateDashboard(cashBalance, finalTotal, totalExpense, totalInvest) {
    if (headerIncomeSisaEl) headerIncomeSisaEl.innerText = `Rp ${cashBalance.toLocaleString()}`;
    if (rowTotalBalanceEl) rowTotalBalanceEl.innerText = `Rp ${finalTotal.toLocaleString()}`;
    if (expenseEl) expenseEl.innerText = `Rp ${totalExpense.toLocaleString()}`;
    if (investEl) investEl.innerText = `Rp ${totalInvest.toLocaleString()}`;
}

export function updateBudgetUI(sums) {
    if (!budgetContainer) return;

    const COLOR_MAP = {
        'FOOD': 'bg-yellow',
        'BILLS': 'bg-pink',
        'SHOPPING': 'bg-orange',
        'LEISURE': 'bg-purple',
        'TRANSPORT': 'bg-blue',
        'HEALTH': 'bg-cyan',
        'INVEST': 'bg-orange',
        'BITCOIN': 'bg-orange',
        'EDUCATION': 'bg-white'
    };

    budgetContainer.innerHTML = '';
    Object.keys(BUDGET_LIMITS).forEach((cat, index) => {
        const spent = sums[cat] || 0;
        const limit = BUDGET_LIMITS[cat];
        const percent = Math.min(Math.round((spent / limit) * 100), 100);
        const barColor = COLOR_MAP[cat] || 'bg-primary';

        const itemHtml = `
            <div class="nb-flex-between mb-1 ${index > 0 ? 'mt-3' : ''}">
                <span class="text-bold">${cat}</span>
                <span class="text-bold">Rp ${spent.toLocaleString()}</span>
            </div>
            <div class="progress ${index === Object.keys(BUDGET_LIMITS).length - 1 ? '' : 'mb-3'}">
                <div class="progress-bar ${barColor}" style="width: ${percent}%;"></div>
            </div>
        `;
        budgetContainer.innerHTML += itemHtml;
    });
}

export function clearTransactionList() {
    if (transactionList) transactionList.innerHTML = '';
}

export function renderTransactionItem(item) {
    if (!transactionList) return;

    const div = document.createElement('div');
    const type = (item.cat === 'INVEST' || item.cat === 'BITCOIN') ? 'invest' : (item.cat === 'INCOME' ? 'income' : 'expense');
    div.className = `card mb-2 animate-bounceIn transaction-item`;
    div.setAttribute('data-type', type);

    const textClass = type === 'income' ? 'income-text' : (type === 'invest' ? 'invest-text' : 'expense-text');

    // Date Safety Check
    let dateStr = "Unknown Date";
    try {
        if (item.createdAt && typeof item.createdAt.toDate === 'function') {
            dateStr = item.createdAt.toDate().toLocaleDateString('id-ID');
        } else {
            dateStr = new Date().toLocaleDateString('id-ID');
        }
    } catch (e) { console.warn('Date parsing error', e); }

    const symbolMap = { bitcoin: 'BTC', ethereum: 'ETH', zerebro: 'ZRB' };
    const assetSymbol = symbolMap[item.asset] || 'BTC';
    const isInvest = (item.cat === 'INVEST' || item.cat === 'BITCOIN');
    const displayAmount = isInvest
        ? `${item.amount} ${assetSymbol}`
        : `Rp ${item.amount.toLocaleString()}`;

    div.innerHTML = `
        <div class="card-body p-2 nb-flex-between" style="align-items: flex-start;">
            <div style="flex: 1; min-width: 0; padding-right: 10px;">
                <p class="m-0 text-bold" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.desc}</p>
                <div class="nb-flex" style="gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span class="category-tag ${item.bg}">${isInvest ? 'INVEST' : item.cat}</span>
                    <span class="text-bold" style="font-size: 0.75rem; color: #666;">${dateStr}</span>
                </div>
            </div>
            <p class="m-0 ${textClass} text-bold text-right" style="min-width: 100px; flex-shrink: 0;">${displayAmount}</p>
        </div>
    `;

    // Long Press & Context Menu Logic
    let longPressTimer;

    div.addEventListener('touchstart', () => {
        longPressTimer = setTimeout(() => {
            selectTransaction(item, type);
        }, 500);
    });

    div.addEventListener('touchend', () => clearTimeout(longPressTimer));
    div.addEventListener('touchmove', () => clearTimeout(longPressTimer));

    div.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectTransaction(item, type);
    });

    transactionList.appendChild(div);
}

function selectTransaction(item, type) {
    selectedTransactionId = {
        id: item.id,
        collection: (type === 'income' || type === 'invest') ? 'income' : 'expenses',
        data: item
    };
    if (contextMenuModal) contextMenuModal.classList.add('active');
}

export function closeContextMenu() {
    if (contextMenuModal) contextMenuModal.classList.remove('active');
    selectedTransactionId = null;
}

function filterTransactions(type, el) {
    document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    el.classList.add('active');

    const items = document.querySelectorAll('.transaction-item');
    items.forEach(item => {
        if (type === 'all' || item.getAttribute('data-type') === type) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchTransactions() {
    const queryVal = document.getElementById('transaction-search').value.toLowerCase();
    const items = document.querySelectorAll('.transaction-item');

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(queryVal)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
