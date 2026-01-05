/**
 * UI Renderer Module
 * Handles all dashboard and list rendering.
 */

// UI References - REMOVED TOP LEVEL CONSTS TO FIX RACE CONDITION
// We will query them lazily inside functions

let selectedTransactionId = null;
let contextMenuCallback = null;

// Budget Limits Configuration (Now Dynamic)
function getBudgetLimits() {
    if (window.getBudgetLimits) {
        return window.getBudgetLimits();
    }
    // Fallback if settings.js not loaded
    return {
        'FOOD': 1500000,
        'BILLS': 2000000,
        'SHOPPING': 1000000,
        'LEISURE': 800000,
        'TRANSPORT': 500000,
        'HEALTH': 1000000,
        'EDUCATION': 500000
    };
}

export function initUI(onContextAction) {
    contextMenuCallback = onContextAction;

    // Context Menu Handlers
    // We can try to attach these if they exist, or delegate to document if they are dynamic
    // Context Menu Modal is usually static in index.html, so this MIGHT be safe, 
    // but let's be safe and check existence.

    const contextMenuModal = document.getElementById('context-menu-modal');
    const closeContextX = document.getElementById('close-context-x');
    const editBtn = document.getElementById('edit-transaction-btn');
    const deleteBtn = document.getElementById('delete-transaction-btn');

    if (closeContextX) {
        closeContextX.addEventListener('click', () => {
            if (contextMenuModal) contextMenuModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            if (window.resumePTR) window.resumePTR();
            selectedTransactionId = null;
        });
    }

    // Background Click Close
    if (contextMenuModal) {
        contextMenuModal.addEventListener('click', (e) => {
            if (e.target === contextMenuModal) {
                contextMenuModal.classList.remove('active');
                document.body.classList.remove('modal-open');
                if (window.resumePTR) window.resumePTR();
                selectedTransactionId = null;
            }
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
}

export function showLoadingState() {
    const headerIncomeSisaEl = document.getElementById('header-income-sisa');
    const rowTotalBalanceEl = document.getElementById('row-total-balance');
    const expenseEl = document.getElementById('total-expense');
    const investEl = document.getElementById('total-invest');

    if (headerIncomeSisaEl) headerIncomeSisaEl.innerText = 'Rp ━━━━━';
    if (rowTotalBalanceEl) rowTotalBalanceEl.innerText = 'Rp ━━━━━';
    if (expenseEl) expenseEl.innerText = 'Rp ━━━━━';
    if (investEl) investEl.innerText = 'Rp ━━━━━';

    const marqueeEl = document.getElementById('marquee-content');
    if (marqueeEl) marqueeEl.innerText = '⟳ MEMUAT DATA TERBARU...';
}

// State for Invest Trend
let lastInvestValue = null;
let currentTrend = 'neutral'; // 'up', 'down', 'neutral'

// Load persisted state
try {
    const savedInvest = localStorage.getItem('lastInvestValue');
    const savedTrend = localStorage.getItem('currentTrend');
    if (savedInvest) lastInvestValue = parseFloat(savedInvest);
    if (savedTrend) currentTrend = savedTrend;
} catch (e) {
    console.warn('Invest State Load Error', e);
}

export function updateDashboard(cashBalance, finalTotal, totalExpense, totalInvest, assetBreakdown) {
    const headerIncomeSisaEl = document.getElementById('header-income-sisa');
    const rowTotalBalanceEl = document.getElementById('row-total-balance');
    const expenseEl = document.getElementById('total-expense');
    // Invest Element is queried fresh below

    if (headerIncomeSisaEl) headerIncomeSisaEl.innerText = `Rp ${Math.round(cashBalance).toLocaleString('id-ID')}`;
    if (rowTotalBalanceEl) rowTotalBalanceEl.innerText = `Rp ${Math.round(finalTotal).toLocaleString('id-ID')}`;
    if (expenseEl) expenseEl.innerText = `Rp ${Math.round(totalExpense).toLocaleString('id-ID')}`;

    // Re-query investEl to ensure we have the live element (since HomeView injects it later)
    const investEl = document.getElementById('total-invest');
    if (investEl) {
        // Trend Logic
        if (lastInvestValue !== null && totalInvest !== lastInvestValue) {
            if (totalInvest > lastInvestValue) {
                currentTrend = 'up';
            } else if (totalInvest < lastInvestValue) {
                currentTrend = 'down';
            }
            // If equal, keep previous trend (don't reset to neutral immediately to show stability?) 
            // Or strictly: equal = neutral? 
            // Usually simpler to just keep the last direction until it changes or render nothing if equal?
            // Let's keep the last active trend for visual flair, or update only on change.
        }

        // If this is the VERY first run ever (no saved state), and we have data
        if (lastInvestValue === null) {
            // Init without trend
            currentTrend = 'neutral';
        }

        // Save State
        lastInvestValue = totalInvest;
        localStorage.setItem('lastInvestValue', totalInvest);
        localStorage.setItem('currentTrend', currentTrend);

        // Render Trend
        let trendHtml = '';
        if (currentTrend === 'up') {
            trendHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#000000" stroke="none" style="margin-left: 5px; vertical-align: middle;">
                <path d="M12 4l-8 8h16l-8-8z"></path>
            </svg>`;
        } else if (currentTrend === 'down') {
            trendHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#000000" stroke="none" style="margin-left: 5px; vertical-align: middle;">
                <path d="M12 20l-8-8h16l-8 8z"></path>
            </svg>`;
        }

        investEl.innerHTML = `Rp ${Math.round(totalInvest).toLocaleString('id-ID')}${trendHtml}`;

        // Interaction Logic: Right Click & Long Press
        const card = investEl.closest('.card');
        if (card) {
            // Debug Log
            console.log('✅ Attaching Interact Listeners to Invest Card', assetBreakdown);

            card.style.cursor = 'pointer';

            // Clean previous listeners (simple overwrite)
            card.oncontextmenu = (e) => {
                e.preventDefault();
                console.log('🖱️ Right Click detected on Invest Card');
                showInvestDetails(assetBreakdown, totalInvest);
            };

            let pressTimer;
            card.ontouchstart = (e) => {
                pressTimer = setTimeout(() => {
                    console.log('👆 Long Press detected on Invest Card');
                    showInvestDetails(assetBreakdown, totalInvest);
                }, 500); // 500ms Long Press
            };
            card.ontouchend = () => clearTimeout(pressTimer);
            card.ontouchmove = () => clearTimeout(pressTimer);
        }
    }
}

function showInvestDetails(breakdown, total) {
    console.log('Show Invest Details:', breakdown, total);
    // Generate HTML
    console.log('Show Invest Details:', breakdown, total);
    // Generate HTML
    let listHtml = '';

    if (!breakdown) breakdown = {};

    // Sort by Value DESC
    const sortedAssets = Object.entries(breakdown).sort((a, b) => b[1].value - a[1].value);

    if (sortedAssets.length === 0) {
        listHtml = '<p class="text-center text-muted">Belum ada investasi.</p>';
    } else {
        sortedAssets.forEach(([name, data]) => {
            listHtml += `
             <div class="nb-flex-between mb-2 p-2" style="border: 2px solid #000; background: #fff;">
                 <div>
                    <div class="text-bold">${name}</div>
                    <div style="font-size: 0.85rem;" class="text-muted">${data.quantity.toFixed(4)} COIN</div>
                 </div>
                 <div class="text-right">
                    <div class="text-bold">Rp ${data.value.toLocaleString('id-ID')}</div>
                 </div>
             </div>
             `;
        });
    }

    const content = `
        <div class="mb-3 text-center">
            <h2 class="text-bold" style="font-size: 2rem;">Rp ${Math.round(total).toLocaleString('id-ID')}</h2>
            <p class="text-muted">Total Aset Kripto</p>
        </div>
        <div style="max-height: 300px; overflow-y: auto;">
            ${listHtml}
        </div>
    `;

    if (window.showModal) {
        window.showModal("PORTFOLIO", content);
    }
}

export function updateBudgetUI(sums) {
    const budgetContainer = document.getElementById('budget-progress-container');
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

    // Define Categories to show (Standard Expense Categories)
    const CATEGORIES = ['FOOD', 'BILLS', 'SHOPPING', 'LEISURE', 'TRANSPORT', 'HEALTH', 'EDUCATION'];

    // Calculate Total Expense for these categories
    let totalTrackedExpense = 0;
    CATEGORIES.forEach(cat => {
        totalTrackedExpense += (sums[cat] || 0);
    });

    // Avoid division by zero
    if (totalTrackedExpense === 0) totalTrackedExpense = 1;

    CATEGORIES.forEach((cat, index) => {
        const spent = sums[cat] || 0;

        // Calculate Percentage of Total
        const percent = Math.round((spent / totalTrackedExpense) * 100);
        const barColor = COLOR_MAP[cat] || 'bg-primary';

        const itemHtml = `
            <div class="nb-flex-between mb-1 ${index > 0 ? 'mt-3' : ''}">
                <span class="text-bold">${cat}</span>
                <span class="text-bold">Rp ${spent.toLocaleString()}</span>
            </div>
            <div class="progress ${index === CATEGORIES.length - 1 ? '' : 'mb-3'}">
                <div class="progress-bar ${barColor}" style="width: ${percent}%;"></div>
            </div>
        `;
        budgetContainer.innerHTML += itemHtml;
    });
}

export function clearTransactionList() {
    const transactionList = document.getElementById('transaction-list');
    if (transactionList) transactionList.innerHTML = '';
}

export function renderTransactionItem(item, index = 0) {
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) return;

    const div = document.createElement('div');
    const type = (item.cat === 'INVEST' || item.cat === 'BITCOIN') ? 'invest' : (item.cat === 'INCOME' ? 'income' : 'expense');
    div.className = `card mb-2 animate-stagger transaction-item`;
    div.style.animationDelay = `${index * 100}ms`; // Stagger Delay
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
    } catch (e) {
        console.warn('Date parsing error', e);
    }

    const symbolMap = { bitcoin: 'BTC', ethereum: 'ETH', zerebro: 'ZRB' };
    const assetSymbol = symbolMap[item.asset] || 'BTC';
    const isInvest = (item.cat === 'INVEST' || item.cat === 'BITCOIN');

    // Determine Display Text
    let amountHtml = '';
    if (isInvest) {
        // Fallback for old data or if coinAmount missing
        const qty = item.coinAmount !== undefined ? item.coinAmount : item.amount;
        const qtyDisplay = `${qty} ${assetSymbol}`;
        const idrDisplay = `Rp ${item.amount.toLocaleString()}`;

        amountHtml = `
            <p class="m-0 ${textClass} text-bold" style="font-size: 1.1rem;">${qtyDisplay}</p>
            <p class="m-0 text-muted" style="font-size: 0.8rem; margin-top: -2px !important;">${idrDisplay}</p>
        `;
    } else {
        const displayAmount = `Rp ${item.amount.toLocaleString()}`;
        amountHtml = `<p class="m-0 ${textClass} text-bold" style="font-size: 1.1rem;">${displayAmount}</p>`;
    }

    // Category Icons Mapping
    const categoryIcons = {
        'FOOD': '🍔',
        'BILLS': '💳',
        'SHOPPING': '🛍️',
        'LEISURE': '🎮',
        'TRANSPORT': '🚗',
        'HEALTH': '🏥',
        'INVEST': '📈',
        'BITCOIN': '₿',
        'INCOME': '💰',
        'EDUCATION': '🎓'
    };
    const categoryIcon = categoryIcons[item.cat] || '💸';
    const categoryDisplay = isInvest ? 'INVEST' : item.cat;

    div.innerHTML = `
        <div class="card-body p-2 nb-flex-between" style="align-items: center;">
            <div style="flex: 1; min-width: 0; padding-right: 10px;">
                <p class="m-0 text-bold" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 4px !important;">${item.desc}</p>
                <div class="nb-flex" style="gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span class="category-tag ${isInvest ? 'bg-orange' : item.bg}" style="font-size: 0.85rem;">${categoryIcon} ${categoryDisplay}</span>
                </div>
            </div>
            <div class="text-right" style="min-width: 100px; flex-shrink: 0;">
                ${amountHtml}
                <span class="text-bold" style="font-size: 0.75rem; color: #666;">${dateStr}</span>
            </div>
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

export function renderEmptyState() {
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) return;

    transactionList.innerHTML = `
        <div class="empty-state-container" style="text-align: center; padding: 40px 20px; opacity: 0.6;">
            <div style="font-size: 4rem; margin-bottom: 10px; animation: floatGhost 3s ease-in-out infinite;">👻</div>
            <h3 style="text-transform: uppercase; font-weight: 900; margin-bottom: 5px;">ZONK!</h3>
            <p style="font-weight: bold;">Belum ada data transaksi.</p>
        </div>
        <style>
            @keyframes floatGhost {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        </style>
    `;
}

export function renderPaginationControls(currentPage, hasNext, onPrev, onNext) {
    const paginationControls = document.getElementById('pagination-controls');
    const pageIndicator = document.getElementById('page-indicator');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    if (!paginationControls || !pageIndicator || !prevPageBtn || !nextPageBtn) return;

    paginationControls.style.display = 'flex';
    pageIndicator.innerText = `Page ${currentPage}`;

    // Reset handlers
    prevPageBtn.onclick = onPrev;
    nextPageBtn.onclick = onNext;

    // State
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = !hasNext;
}

function selectTransaction(item, type) {
    const contextMenuModal = document.getElementById('context-menu-modal');

    selectedTransactionId = {
        id: item.id,
        collection: (type === 'income' || type === 'invest') ? 'income' : 'expenses',
        data: item
    };
    if (contextMenuModal) {
        contextMenuModal.classList.add('active');
        document.body.classList.add('modal-open');
        if (window.pausePTR) window.pausePTR();
    }
}

export function closeContextMenu() {
    const contextMenuModal = document.getElementById('context-menu-modal');
    if (contextMenuModal) {
        contextMenuModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    selectedTransactionId = null;
}


// Analytics Render Logic
let analyticsListenerAttached = false;

export function renderAnalytics(transactions) {
    const monthSelect = document.getElementById('analytics-month');
    const yearSelect = document.getElementById('analytics-year'); // New
    const incomeVal = document.getElementById('analytics-income-value');
    const incomeBar = document.getElementById('analytics-income-bar');
    const expenseVal = document.getElementById('analytics-expense-value');
    const expenseBar = document.getElementById('analytics-expense-bar');

    if (!monthSelect || !yearSelect || !incomeVal || !incomeBar || !expenseVal || !expenseBar) return;
    if (!transactions) transactions = [];

    // Set Defaults (Current Month/Year) if first run
    if (!monthSelect.dataset.initialized) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        monthSelect.value = currentMonth;
        yearSelect.value = currentYear;

        // Update Visible Text
        const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
        const monthText = document.getElementById('analytics-month-selected-text');
        const yearText = document.getElementById('analytics-year-selected-text');

        if (monthText) monthText.innerText = months[currentMonth];
        if (yearText) yearText.innerText = currentYear;

        // Update Custom Options Active State
        const monthOptions = document.querySelectorAll('#analytics-month-select-options .custom-select-option');
        const yearOptions = document.querySelectorAll('#analytics-year-select-options .custom-select-option');

        monthOptions.forEach(opt => {
            if (parseInt(opt.dataset.value) === currentMonth) opt.classList.add('selected');
            else opt.classList.remove('selected');
        });

        yearOptions.forEach(opt => {
            if (parseInt(opt.dataset.value) === currentYear) opt.classList.add('selected');
            else opt.classList.remove('selected');
        });

        // Add Date Range Indicator if not exists
        // Structure: GapContainer > [MonthWrapper] [YearWrapper]
        const gapContainer = monthSelect.parentElement.parentElement;

        if (gapContainer && !document.getElementById('analytics-date-range')) {
            const rangeEl = document.createElement('div');
            rangeEl.id = 'analytics-date-range';
            rangeEl.className = 'text-muted text-bold';
            rangeEl.style.fontSize = '0.75rem';
            rangeEl.style.alignSelf = 'center'; // Vertically center in flex
            rangeEl.style.marginRight = '5px';
            rangeEl.style.whiteSpace = 'nowrap'; // Prevent wrapping
            rangeEl.innerText = '...';

            // Insert at the beginning of the container (Left of Month)
            gapContainer.insertBefore(rangeEl, gapContainer.firstChild);
        }

        monthSelect.dataset.initialized = "true";
        yearSelect.dataset.initialized = "true";
    }

    // Attach Listeners
    monthSelect.onchange = () => renderAnalytics(transactions);
    yearSelect.onchange = () => renderAnalytics(transactions);

    // Initialize Custom Dropdowns (Idempotent)
    if (window.setupCustomDropdown) {
        window.setupCustomDropdown('analytics-month');
        window.setupCustomDropdown('analytics-year');
    }

    const selectedMonth = parseInt(monthSelect.value);
    const selectedYear = parseInt(yearSelect.value);

    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyCategorySums = {};

    // --- SALARY CYCLE LOGIC ---
    // Selected Month X means: 25th of (X-1) to 24th of X

    // Calculate Start Date: 25th of Previous Month
    // Note: Month is 0-indexed (Jan=0)
    // If Sel=Jan(0), 2026 -> Start=Dec 25, 2025. End=Jan 24, 2026.

    const startDate = new Date(selectedYear, selectedMonth - 1, 25, 0, 0, 0); // Month - 1 handles rollover automatically
    const endDate = new Date(selectedYear, selectedMonth, 24, 23, 59, 59);

    // Update Indicator
    const indicator = document.getElementById('analytics-date-range');
    if (indicator) {
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const sM = months[startDate.getMonth()];
        const eM = months[endDate.getMonth()];
        indicator.innerText = `(${startDate.getDate()} ${sM} - ${endDate.getDate()} ${eM} ${endDate.getFullYear()})`;
    }

    transactions.forEach(t => {
        let date;
        if (t.createdAt && typeof t.createdAt.toDate === 'function') {
            date = t.createdAt.toDate();
        } else if (t.createdAt instanceof Date) {
            date = t.createdAt;
        } else if (t.createdAt && !isNaN(new Date(t.createdAt).getTime())) {
            date = new Date(t.createdAt);
        } else {
            return;
        }

        // Filter by Date Range (25th - 24th)
        if (date >= startDate && date <= endDate) {
            if (t.cat === 'INCOME') {
                totalIncome += t.amount;
            } else if (t.cat === 'INVEST' || t.cat === 'BITCOIN') {
                // Keep Invest as Expense for visual flow? Yes.
                totalExpense += t.amount;
                monthlyCategorySums[t.cat] = (monthlyCategorySums[t.cat] || 0) + t.amount;
            } else {
                totalExpense += t.amount;
                monthlyCategorySums[t.cat] = (monthlyCategorySums[t.cat] || 0) + t.amount;
            }
        }
    });

    // Update Text
    incomeVal.innerText = `Rp ${totalIncome.toLocaleString('id-ID')}`;
    expenseVal.innerText = `Rp ${totalExpense.toLocaleString('id-ID')}`;

    // Update Bars (Relative Scale)
    // Base 100% on the larger of the two values + buffer
    const maxVal = Math.max(totalIncome, totalExpense) || 1; // avoid div 0
    // Use 100% width for the max value
    const incomePct = Math.min((totalIncome / maxVal) * 100, 100);
    const expensePct = Math.min((totalExpense / maxVal) * 100, 100);

    incomeBar.style.width = `${incomePct}%`;
    expenseBar.style.width = `${expensePct}%`;

    // --- RENDER BREAKDOWN ---
    const detailsContainer = document.getElementById('analytics-details');
    if (detailsContainer) {
        if (totalExpense === 0) {
            detailsContainer.style.display = 'none';
            return;
        }

        // 1. Convert sums to Array & Sort DESC
        const categoryEntries = Object.entries(monthlyCategorySums)
            .filter(([_, val]) => val > 0)
            .sort((a, b) => b[1] - a[1]);

        if (categoryEntries.length === 0) {
            detailsContainer.style.display = 'none';
        } else {
            detailsContainer.style.display = 'block';
            detailsContainer.innerHTML = '<h4 class="text-bold mb-3" style="font-size: 0.9rem;">TOP EXPENSES</h4>';

            // Take Top 5 or All? Let's show all for now, or max 5 for compactness.
            // User just said "List Top Pengeluaran". Let's show Top 5.
            categoryEntries.slice(0, 5).forEach(([cat, amount]) => {
                const pct = ((amount / totalExpense) * 100).toFixed(1); // 1 decimal

                // Render Item
                detailsContainer.innerHTML += `
                    <div class="mb-2">
                        <div class="nb-flex-between">
                            <span style="font-size: 0.9rem;">${cat} <small class="text-muted">(${pct}%)</small></span>
                            <span style="font-size: 0.9rem;" class="text-bold">Rp ${amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="progress mt-1" style="height: 10px; border: 2px solid #000; background: #fff;">
                            <div class="progress-bar bg-pink" style="width: ${pct}%; height: 100%; border-right: 2px solid #000;"></div>
                        </div>
                    </div>
                 `;
            });
        }
    }
}
