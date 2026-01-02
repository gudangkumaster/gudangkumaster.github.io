/**
 * Main Application Entry Point
 * Modular Architecture
 */

import { initModals, showModal, showConfirm, hideManualModal } from "./modules/modals.js";
import { initUI, showLoadingState, updateDashboard, updateBudgetUI, clearTransactionList, renderTransactionItem, renderEmptyState, closeContextMenu, renderPaginationControls, renderAnalytics } from "./modules/ui-render.js";
import { initTransactionService, addTransaction, updateTransaction, deleteTransaction } from "./modules/transaction-service.js";
import { initScanner } from "./modules/scanner.js";
import { validateGeminiApiKey } from "./api.js";
import "./modules/calendar-manager.js";

// Make API Validator available globally for settings.js
window.validateGeminiApiKey = validateGeminiApiKey;

// --- Pull To Refresh Setup (Global Wrappers for SPA) ---
window.currentPTR = null;

window.initHomePTR = () => {
    if (window.PullToRefresh) {
        if (window.currentPTR) window.currentPTR.destroy();

        window.currentPTR = new PullToRefresh({
            shouldPullToRefresh: () => {
                // 1. Check Global Modal State (Robust method)
                const isModalOpen = document.body.classList.contains('modal-open');

                // 2. Check if user is typing (Input/Textarea focused)
                const activeEl = document.activeElement;
                const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

                // Return true only if NO modal is open AND NO input is focused AND verified top
                return !isModalOpen && !isInputActive && window.scrollY === 0;
            },
            onRefresh: async () => {
                console.log('🔄 Refreshing Home Data...');
                if (window.soundManager) window.soundManager.playClick();

                // Dim entire Home Content
                const content = document.getElementById('home-content');
                if (content) content.style.opacity = '0.4';
                if (content) content.style.pointerEvents = 'none';

                await new Promise(r => setTimeout(r, 1000));

                if (window.forceUpdateAssets) await window.forceUpdateAssets();

                await new Promise(r => setTimeout(r, 1000));

                if (content) {
                    content.style.opacity = '1';
                    content.style.pointerEvents = 'auto';
                }
            }
        });
    }
};

window.initTodoPTR = () => {
    if (window.PullToRefresh) {
        if (window.currentPTR) window.currentPTR.destroy(); // CLEANUP FIRST!

        /* 
           Disabled by user request, but kept structure if needed later.
           Currently does nothing except cleanup old instance.
        */
    }
};

window.disablePTR = () => {
    if (window.currentPTR) {
        window.currentPTR.destroy();
        window.currentPTR = null;
    }
    // No longer removing .ptr-container as elements are static
};

// Global Helpers for Modals
window.pausePTR = () => {
    // console.log('⏸️ Pausing PTR');
    window.disablePTR();
};

window.resumePTR = () => {
    // console.log('▶️ Resuming PTR');
    // Simple debounce to prevent rapid re-init issues
    setTimeout(() => {
        if (!document.body.classList.contains('modal-open')) {
            window.initHomePTR();
        }
    }, 100);
};

// --- Global State for Data Managment ---
let allTransactions = [];
let filteredTransactions = [];
const filterConfig = {
    search: '',
    type: 'all',
    category: null,
    date: ''
};
const paginationConfig = {
    page: 1,
    limit: 5
};

// Initialize Function
async function initApp() {
    console.log('🚀 Initializing Modular App...');

    // 1. Init Modals (Global helpers)
    initModals();

    // 2. Init UI Handlers
    initUI((action, payload) => {
        if (action === 'edit') handleEditTransaction(payload);
        else if (action === 'delete') handleDeleteTransaction(payload);
    });

    // 3. Setup Filter & Search Listeners
    setupFilterListeners();

    // 4. Setup Manual Input
    try {
        setupManualInput();
    } catch (e) {
        console.error("Manual Input Setup Failed:", e);
    }

    // 5. Global Sound Listener
    // (Listener is added outside initApp, but we can init BGM here)
    if (window.soundManager) {
        window.soundManager.initBGM();
    }
    document.addEventListener('click', (e) => {
        // Universal Selector for any interactive element
        const target = e.target.closest(`
            button, 
            a, 
            .btn, 
            .tab-item, 
            .nav-link, 
            .fab-manual, 
            .scanner-trigger, 
            .custom-select-option, 
            .custom-select-trigger,
            .page-link, 
            summary, 
            [role="button"],
            .calendar-day:not(.empty),
            .todo-item,
            [onclick],
            [id^="close-"],
            #date-clear-icon,
            #date-trigger-btn
        `);

        if (target && !target.disabled && window.soundManager) {
            // Avoid double sound if bubbling from child interactive element
            // (e.g. button inside card)
            // But 'closest' only picks one. 
            window.soundManager.playClick();
        }
    });

    // 6. Initialize PTR
    if (window.initHomePTR) window.initHomePTR();

    // 7. Global Keyboard Shortcuts (Esc to Close, Enter to Save)
    document.addEventListener('keydown', (e) => {
        // Esc to Close
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.nb-modal.active');
            if (activeModal) {
                if (activeModal.id === 'manual-modal') hideManualModal();
                else if (activeModal.id === 'nb-custom-modal') hideModal();
                else {
                    activeModal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                    if (window.resumePTR) window.resumePTR();
                }
            }
        }

        // Enter to Save / OK
        if (e.key === 'Enter') {
            const manualModal = document.getElementById('manual-modal');
            const customModal = document.getElementById('nb-custom-modal');

            // 1. Manual Form Save
            if (manualModal && manualModal.classList.contains('active')) {
                const activeEl = document.activeElement;
                if (activeEl.id === 'input-amount' || activeEl.id === 'input-desc') {
                    e.preventDefault();
                    const saveBtn = document.getElementById('save-manual-btn');
                    if (saveBtn) saveBtn.click();
                }
            }
            // 2. Generic Modal OK
            else if (customModal && customModal.classList.contains('active')) {
                e.preventDefault();
                const okBtn = document.getElementById('modal-ok-btn');
                if (okBtn) okBtn.click();
            }
        }
    });

    // 7. Init Scanner
    initScanner();

    // 7.5 Apply Home Settings (Visibility)
    if (window.applyHomeSettings) window.applyHomeSettings();

    // 8. Init Data Service & Bind to UI
    showLoadingState();

    initTransactionService((data) => {
        console.log('📊 Update Received:', data);
        // Update Dashboard with Monthly Expense, but All-Time Balance
        updateDashboard(data.cashBalance, data.finalTotalValue, data.monthlyExpense, data.totalInvest);

        // Store category sums globally for budget refresh
        window.lastCategorySums = data.categorySums;
        updateBudgetUI(data.categorySums);
        renderAnalytics(data.allTransactions);



        // Update local state and render
        // Update local state and render
        allTransactions = data.allTransactions;
        // Expose for Smart Alerts
        window.getAllTransactions = () => allTransactions;

        // Trigger Smart Alert Update (Spam Check needs fresh transactions)
        if (window.updateBillAlert) window.updateBillAlert();

        applyFiltersAndRender(true); // true = reset to page 1
    });
}

/**
 * Filter & Pagination Logic
 */
function setupFilterListeners() {
    const searchInput = document.getElementById('transaction-search');
    const dateInput = document.getElementById('transaction-date');
    const tabs = document.querySelectorAll('.tab-item');

    // Search Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterConfig.search = e.target.value.toLowerCase();
            applyFiltersAndRender(true);
        });
    }

    // Date Listener
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            filterConfig.date = e.target.value; // YYYY-MM-DD
            applyFiltersAndRender(true);
        });
    }

    // Category Tabs Listener
    // Category Tabs Listener
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-filter');

            // Skip if it's the dropdown trigger (handled by setupCustomDropdown)
            if (!type) return;

            // Normal tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Remove active from dropdown trigger too
            const dropTrigger = document.getElementById('filter-cat-select-trigger');
            if (dropTrigger) dropTrigger.classList.remove('active-tab'); // Use special class to avoid conflict with 'active' dropdown state

            tab.classList.add('active');

            // Reset category filter if switching to main tabs
            filterConfig.type = type;
            filterConfig.category = null;

            // Update dropdown UI back to default
            if (window.updateCustomDropdownUI) window.updateCustomDropdownUI('filter-cat', 'RESET');
            const catText = document.getElementById('filter-cat-selected-text');
            if (catText) catText.innerText = 'CATEGORY';

            applyFiltersAndRender(true);
        });
    });

    // Init Dropdown
    if (window.setupCustomDropdown) window.setupCustomDropdown('filter-cat');

    // Category Dropdown Change Listener
    const inputFilterCat = document.getElementById('input-filter-cat');
    if (inputFilterCat) {
        inputFilterCat.addEventListener('change', (e) => {
            const cat = e.target.value;
            const dropTrigger = document.getElementById('filter-cat-select-trigger');

            // Reset other tabs
            tabs.forEach(t => t.classList.remove('active'));

            if (cat === 'RESET') {
                filterConfig.type = 'all';
                filterConfig.category = null;

                if (dropTrigger) dropTrigger.classList.remove('active-tab');
                // Default to ALL
                document.querySelector('[data-filter="all"]').classList.add('active');

                // Reset text
                const catText = document.getElementById('filter-cat-selected-text');
                if (catText) catText.innerText = 'CATEGORY';
            } else {
                filterConfig.type = 'category';
                filterConfig.category = cat;

                if (dropTrigger) dropTrigger.classList.add('active-tab');
                // The text is auto-updated by setupCustomDropdown logic
            }

            applyFiltersAndRender(true);
        });
    }

    // Category Modal Options Listener
    const catModalBtns = document.querySelectorAll('#category-filter-modal button[data-cat]');
    catModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-cat');

            // Highlight Tab
            tabs.forEach(t => t.classList.remove('active'));
            const catTab = document.getElementById('tab-category');
            catTab.classList.add('active');

            filterConfig.type = 'category';
            filterConfig.category = cat;
            catTab.innerText = cat; // Show selected category name

            hideCategoryFilterModal();
            applyFiltersAndRender(true);
        });
    });
}

function applyFiltersAndRender(resetPage = false) {
    if (resetPage) paginationConfig.page = 1;

    // 1. Filter
    filteredTransactions = allTransactions.filter(item => {
        // Type Filter ('income' and 'invest' group under INCOME tab logic usually, but here request is MASUK/KELUAR)
        // Adjusting logic to match previous tab behavior locally or using precise categories
        // Previous behavior: tab 'income' showed type 'income', 'expense' showed 'expense'
        // Data has specific categories.

        let matchType = true;
        if (filterConfig.type !== 'all') {
            const itemType = (item.cat === 'INVEST' || item.cat === 'BITCOIN' || item.cat === 'INCOME') ? 'INCOME' : 'EXPENSE';
            // Note: INVEST is traditionally an expense cash-flow wise but asset building. 
            // Checking previous ui-render logic:
            // type = (cat===INVEST || BITCOIN) ? 'invest' : (cat===INCOME ? 'income' : 'expense')
            // Filter tabs were: "MASUK" (income), "KELUAR" (expense)
            // If user previously filtered 'income', it showed strictly INCOME. 
            // Let's stick to the data attribute on tabs.

            const isInvest = (item.cat === 'INVEST' || item.cat === 'BITCOIN');
            const isIncome = (item.cat === 'INCOME');

            // Tab 'INCOME' -> match INCOME
            if (filterConfig.type === 'INCOME') {
                matchType = isIncome;
            }
            // Tab 'EXPENSE' -> match EXPENSE + INVEST (as cash outflow maybe?) OR just Expense?
            // Let's look at previous behavior: 
            // <div class="tab-item" onclick="filterTransactions('expense', this)">KELUAR</div>
            // It checked item.getAttribute('data-type') === 'expense'
            // Render logic: type = (invest) ? 'invest': (income)?'income':'expense'
            // So 'expense' tab ONLY showed real expenses, not investments.

            else if (filterConfig.type === 'EXPENSE') {
                matchType = !isIncome && !isInvest;
            }

            // New Category Filter
            else if (filterConfig.type === 'category' && filterConfig.category) {
                // Strict match for category
                matchType = item.cat === filterConfig.category;
            }
        }

        // Search Filter
        let matchSearch = true;
        if (filterConfig.search) {
            matchSearch = item.desc.toLowerCase().includes(filterConfig.search);
        }

        // Date Filter
        let matchDate = true;
        if (filterConfig.date) {
            let itemDateStr = '';
            if (item.createdAt && typeof item.createdAt.toDate === 'function') {
                itemDateStr = item.createdAt.toDate().toISOString().split('T')[0];
            }
            matchDate = itemDateStr === filterConfig.date;
        }

        return matchType && matchSearch && matchDate;
    });

    // 2. Paginate
    const startIndex = (paginationConfig.page - 1) * paginationConfig.limit;
    const endIndex = startIndex + paginationConfig.limit;
    const pageItems = filteredTransactions.slice(startIndex, endIndex);

    // 3. Render Items
    clearTransactionList();
    if (pageItems.length === 0) {
        renderEmptyState();
    } else {
        pageItems.forEach((item, index) => renderTransactionItem(item, index));
    }

    // 4. Render Pagination
    const hasNext = endIndex < filteredTransactions.length;
    renderPaginationControls(
        paginationConfig.page,
        hasNext,
        () => changePage(-1),
        () => changePage(1)
    );
}

function changePage(delta) {
    paginationConfig.page += delta;
    applyFiltersAndRender(false);
}

/**
 * Handle Manual Transaction Saving
 */
function setupManualInput() {
    const saveManualBtn = document.getElementById('save-manual-btn');
    const fabManual = document.getElementById('fab-manual');

    // Ensure FAB opens the modal (Redundant backup for SPA Router)
    if (fabManual) {
        fabManual.onclick = (e) => {
            e.preventDefault();
            if (window.openManualModal) window.openManualModal();
        };
    }

    // Dropdown Logic
    setupCustomDropdown('cat');
    setupCustomDropdown('asset'); // Optional

    // Invest Logic: Show/Hide Asset Type
    // Invest Logic: Show/Hide Asset Type
    const catSelect = document.getElementById('input-cat');
    const assetGroup = document.getElementById('asset-group');
    const coinGroup = document.getElementById('coin-amount-group'); // New

    if (catSelect && assetGroup) {
        catSelect.addEventListener('change', () => {
            const amountLabel = document.querySelector('label[for="input-amount"]') ||
                (document.getElementById('input-amount') ? document.getElementById('input-amount').previousElementSibling : null);

            if (catSelect.value === 'INVEST') {
                assetGroup.style.display = 'block';
                if (coinGroup) coinGroup.style.display = 'block';
                if (amountLabel) amountLabel.innerText = 'RUPIAH SPENT';
                // Hide Description for Invest
                const descGroup = document.getElementById('input-desc').closest('.form-group');
                if (descGroup) descGroup.style.display = 'none';
            } else {
                assetGroup.style.display = 'none';
                if (coinGroup) coinGroup.style.display = 'none';
                if (amountLabel) amountLabel.innerText = 'TOTAL AMOUNT';
                // Show Description for others
                const descGroup = document.getElementById('input-desc').closest('.form-group');
                if (descGroup) descGroup.style.display = 'block';
            }
        });
    }

    if (saveManualBtn) {
        // Enter Key Listener for Inputs
        const inputs = [document.getElementById('input-amount'), document.getElementById('input-desc')];
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        saveManualBtn.click();
                    }
                });
            }
        });

        // Auto-Format Currency Listener (Amount)
        const amountInput = document.getElementById('input-amount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                // Remove non-digits
                let val = e.target.value.replace(/\D/g, '');
                if (val) {
                    // Add dots
                    val = parseInt(val).toLocaleString('id-ID');
                    e.target.value = val;
                }
            });
        }

        // Auto-Capitalize Listener (Desc)
        const descInput = document.getElementById('input-desc');
        if (descInput) {
            descInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }

        saveManualBtn.addEventListener('click', async () => {
            const isEditMode = saveManualBtn.getAttribute('data-edit-mode') === 'true';

            // Get inputs
            // Get inputs
            let amountRaw = document.getElementById('input-amount').value.trim();
            const cat = document.getElementById('input-cat').value;
            const asset = document.getElementById('input-asset').value;
            const coinAmountRaw = document.getElementById('input-coin-amount') ? document.getElementById('input-coin-amount').value : '0';

            // Strip dots for saving
            const amount = parseInt(amountRaw.replace(/\./g, ''));

            let descElement = '';
            // Override Desc for Invest
            if (cat === 'INVEST' || cat === 'BITCOIN') {
                // Use selected Asset Value (Uppercase) e.g. bitcoin -> BITCOIN
                descElement = asset.toUpperCase();
            } else {
                descElement = document.getElementById('input-desc').value.trim().toUpperCase();
            }
            const desc = descElement;

            if (!amount || isNaN(amount) || !desc) {
                hideManualModal();
                showModal("ERROR", "Mohon isi semua data!");
                return;
            }

            // Determine Background Color Logic (replicated)
            let bgClass = "bg-white";
            if (cat === "INCOME") bgClass = "bg-lime";
            else if (cat === "FOOD") bgClass = "bg-yellow";
            else if (cat === "BILLS") bgClass = "bg-pink";
            else if (cat === "SHOPPING") bgClass = "bg-orange";
            else if (cat === "LEISURE") bgClass = "bg-purple";
            else if (cat === "TRANSPORT") bgClass = "bg-blue";
            else if (cat === "HEALTH") bgClass = "bg-cyan";
            else if (cat === "INVEST" || cat === "BITCOIN") bgClass = "bg-orange";

            const docData = {
                desc, cat, amount, bg: bgClass,
                asset: (cat === 'INVEST' || cat === 'BITCOIN') ? asset : null,
                coinAmount: (cat === 'INVEST' || cat === 'BITCOIN') ? parseFloat(coinAmountRaw.replace(',', '.') || 0) : 0
            };

            try {
                if (isEditMode) {
                    const editId = saveManualBtn.getAttribute('data-edit-id');
                    const editCollection = saveManualBtn.getAttribute('data-edit-collection');
                    const originalDataStr = saveManualBtn.getAttribute('data-original');

                    // Check for changes
                    if (originalDataStr) {
                        const originalData = JSON.parse(originalDataStr);
                        // Compare relevant fields
                        const isSame =
                            originalData.amount === docData.amount &&
                            originalData.desc === docData.desc &&
                            originalData.cat === docData.cat &&
                            originalData.asset === docData.asset &&
                            originalData.coinAmount === docData.coinAmount;

                        if (isSame) {
                            hideManualModal();
                            showModal("INFO", "Tidak ada perubahan data.");
                            if (window.soundManager) window.soundManager.playClick();
                            return; // Stop here
                        }
                    }

                    await updateTransaction(editCollection, editId, docData);
                    showModal("BERHASIL!", "Transaksi berhasil diupdate.");
                } else {
                    await addTransaction(docData);
                    showModal("BERHASIL!", "Transaksi manual telah disimpan.");
                }

                hideManualModal();
                if (window.soundManager) window.soundManager.playSuccess();

            } catch (e) {
                console.error(e);
                showModal("ERROR", "Gagal menyimpan data.");
            }
        });
    }
}

function handleEditTransaction(payload) {
    // Open modal first to reset form
    closeContextMenu();
    window.openManualModal();

    const item = payload.data;

    // Pre-fill
    // Format amount with dots
    document.getElementById('input-amount').value = item.amount.toLocaleString('id-ID');
    document.getElementById('input-desc').value = item.desc;
    document.getElementById('input-cat').value = item.cat;

    // Trigger change to update UI (Asset/Coin fields)
    document.getElementById('input-cat').dispatchEvent(new Event('change'));

    // Pre-fill Coin Amount if exists
    const coinInput = document.getElementById('input-coin-amount');
    if (coinInput) coinInput.value = item.coinAmount || '';

    // Update custom dropdown UI for 'cat'
    updateCustomDropdownUI('cat', item.cat);

    // Save Button Mode
    const saveBtn = document.getElementById('save-manual-btn');
    saveBtn.innerText = 'UPDATE TRANSAKSI';
    saveBtn.setAttribute('data-edit-mode', 'true');
    saveBtn.setAttribute('data-edit-id', payload.id);
    saveBtn.setAttribute('data-edit-collection', payload.collection);

    // Store original data for "No Change" check
    // We only care about editable fields
    const originalState = {
        amount: item.amount,
        desc: item.desc,
        cat: item.cat,
        asset: item.asset || null,
        coinAmount: item.coinAmount || 0
    };
    saveBtn.setAttribute('data-original', JSON.stringify(originalState));
}

function handleDeleteTransaction(payload) {
    // Undo Logic: Temporarily hide items, show toast, if no undo -> delete
    closeContextMenu();

    // Optimistic UI: Hide immediately
    // Since we don't have direct access to DOM element here easily without ID,
    // we will reload data after delete. But for Undo, we'll delay the delete call.

    // Actually, let's use the new showUndoToast from Modals
    if (window.showUndoToast) {
        let isUndone = false;

        // Show Toast
        window.showUndoToast("Transaksi akan dihapus...", () => {
            // On Undo
            isUndone = true;
            if (window.soundManager) window.soundManager.playClick();
            // No action needed, we basically just didn't delete it
        });

        // Actual Delete after 3 seconds if not undone
        setTimeout(async () => {
            if (!isUndone) {
                try {
                    await deleteTransaction(payload.collection, payload.id);
                    // Refresh happens automatically via onSnapshot usually, implies UI update
                    if (window.soundManager) window.soundManager.playSuccess(); // Deletion sound
                } catch (e) {
                    console.error("Delete failed", e);
                }
            }
        }, 3000);

    } else {
        // Fallback to old Confirm
        showConfirm("HAPUS TRANSAKSI?", "Yakin ingin menghapus transaksi ini permanently?", async () => {
            try {
                await deleteTransaction(payload.collection, payload.id);
                closeContextMenu();
                showModal("BERHASIL", "Transaksi dihapus.");
            } catch (e) {
                showModal("ERROR", "Gagal menghapus.");
            }
        });
    }
}

// Helper: Custom Dropdowns (Migrated from old app.js)
function setupCustomDropdown(prefix) {
    const trigger = document.getElementById(`${prefix}-select-trigger`);
    const options = document.getElementById(`${prefix}-select-options`);
    const hiddenSelect = document.getElementById(`input-${prefix}`) || document.getElementById(prefix);
    const selectedText = document.getElementById(`${prefix}-selected-text`);

    if (!trigger || !options) return;
    if (trigger.dataset.customInit) return;
    trigger.dataset.customInit = "true";

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        trigger.classList.toggle('active');
        options.classList.toggle('active');
    });

    options.addEventListener('click', (e) => {
        if (e.target.classList.contains('custom-select-option')) {
            const value = e.target.getAttribute('data-value');
            const text = e.target.textContent;

            selectedText.textContent = text;
            hiddenSelect.value = value;

            // Trigger change
            hiddenSelect.dispatchEvent(new Event('change'));

            // UI select state
            options.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            e.target.classList.add('selected');

            trigger.classList.remove('active');
            options.classList.remove('active');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !options.contains(e.target)) {
            trigger.classList.remove('active');
            options.classList.remove('active');
        }
    });
}
window.setupCustomDropdown = setupCustomDropdown;

function updateCustomDropdownUI(prefix, value) {
    const options = document.getElementById(`${prefix}-select-options`);
    const selectedText = document.getElementById(`${prefix}-selected-text`);
    if (!options) return;

    // Find option text by value
    const option = options.querySelector(`[data-value="${value}"]`);
    if (option) {
        selectedText.textContent = option.textContent;
    }
}

// Start
// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
