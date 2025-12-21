/**
 * Main Application Entry Point
 * Modular Architecture
 */

import { initModals, showModal, showConfirm, hideManualModal } from "./modules/modals.js";
import { initUI, showLoadingState, updateDashboard, updateBudgetUI, clearTransactionList, renderTransactionItem, closeContextMenu } from "./modules/ui-render.js";
import { initTransactionService, addTransaction, updateTransaction, deleteTransaction } from "./modules/transaction-service.js";
import { initScanner } from "./modules/scanner.js";

// --- Pull To Refresh Setup (Global Wrappers for SPA) ---
window.currentPTR = null;

window.initHomePTR = () => {
    if (window.PullToRefresh) {
        if (window.currentPTR) window.currentPTR.destroy();

        window.currentPTR = new PullToRefresh({
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
    // Fallback cleanup
    document.querySelectorAll('.ptr-container').forEach(e => e.remove());
};


// Initialize Function
async function initApp() {
    console.log('🚀 Initializing Modular App...');

    // 1. Init Modals (Global helpers)
    initModals();

    // 2. Init UI Handlers (Context Menu Actions)
    initUI((action, payload) => {
        if (action === 'edit') {
            handleEditTransaction(payload);
        } else if (action === 'delete') {
            handleDeleteTransaction(payload);
        }
    });

    // 3. Setup Manual Input Listeners (CRITICAL: Do this early so buttons work)
    try {
        setupManualInput();
    } catch (e) {
        console.error("Manual Input Setup Failed:", e);
    }

    // 4. Global Sound Listener
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .btn, .tab-item, .nav-link, .fab-manual, .scanner-trigger, .custom-select-option, .page-link, summary, [id^="close-"]');
        if (target && !target.disabled && window.soundManager) {
            window.soundManager.playClick();
        }
    });

    // 5. Initialize PTR for initial load
    if (window.initHomePTR) window.initHomePTR();

    // 6. Init Scanner
    initScanner();

    // 7. Init Data Service & Bind to UI
    showLoadingState();

    initTransactionService((data) => {
        console.log('📊 Update Received:', data); // Debug logging
        // This callback runs whenever data updates
        updateDashboard(data.cashBalance, data.finalTotalValue, data.totalExpense, data.totalInvest);
        updateBudgetUI(data.categorySums);

        // Refresh List
        clearTransactionList();
        data.allTransactions.forEach(item => renderTransactionItem(item));
    });
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
    const catSelect = document.getElementById('input-cat');
    const assetGroup = document.getElementById('asset-group');
    if (catSelect && assetGroup) {
        catSelect.addEventListener('change', () => {
            if (catSelect.value === 'INVEST') {
                assetGroup.style.display = 'block';
            } else {
                assetGroup.style.display = 'none';
            }
        });
    }

    if (saveManualBtn) {
        saveManualBtn.addEventListener('click', async () => {
            const isEditMode = saveManualBtn.getAttribute('data-edit-mode') === 'true';

            // Get inputs
            let amountRaw = document.getElementById('input-amount').value.trim();
            const desc = document.getElementById('input-desc').value.trim().toUpperCase();
            const cat = document.getElementById('input-cat').value;
            const asset = document.getElementById('input-asset').value;

            if (!amountRaw || !desc) {
                hideManualModal();
                showModal("ERROR", "Mohon isi semua data!");
                return;
            }

            let amount;
            if (cat === 'INVEST' || cat === 'BITCOIN') {
                amount = parseFloat(amountRaw.replace(',', '.'));
            } else {
                amount = parseFloat(amountRaw.replace(/\./g, '').replace(/,/g, ''));
            }

            if (isNaN(amount)) {
                hideManualModal();
                showModal("ERROR", "Nominal tidak valid!");
                return;
            }

            // Determine BG Color
            // (Duplicated logic for now, could be util)
            let bgClass = "bg-yellow";
            if (cat === "INCOME") bgClass = "bg-green";
            else if (cat === "BILLS") bgClass = "bg-pink";
            else if (cat === "SHOPPING") bgClass = "bg-orange";
            else if (cat === "LEISURE") bgClass = "bg-purple";
            else if (cat === "TRANSPORT") bgClass = "bg-blue";
            else if (cat === "HEALTH") bgClass = "bg-cyan";
            else if (cat === "INVEST" || cat === "BITCOIN") bgClass = "bg-orange";
            else if (cat === "EDUCATION") bgClass = "bg-white";

            const docData = {
                desc, cat, amount, bg: bgClass,
                asset: (cat === 'INVEST' || cat === 'BITCOIN') ? asset : null
            };

            try {
                if (isEditMode) {
                    const editId = saveManualBtn.getAttribute('data-edit-id');
                    const editCollection = saveManualBtn.getAttribute('data-edit-collection');
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
    const item = payload.data;

    // Pre-fill
    document.getElementById('input-amount').value = item.amount;
    document.getElementById('input-desc').value = item.desc;
    document.getElementById('input-cat').value = item.cat;

    // Update custom dropdown UI for 'cat'
    // Simplified: Trigger change event so listeners update the UI text
    updateCustomDropdownUI('cat', item.cat);

    // Save Button Mode
    const saveBtn = document.getElementById('save-manual-btn');
    saveBtn.innerText = 'UPDATE TRANSAKSI';
    saveBtn.setAttribute('data-edit-mode', 'true');
    saveBtn.setAttribute('data-edit-id', payload.id);
    saveBtn.setAttribute('data-edit-collection', payload.collection);

    closeContextMenu();
    window.openManualModal();
}

function handleDeleteTransaction(payload) {
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

// Helper: Custom Dropdowns (Migrated from old app.js)
function setupCustomDropdown(prefix) {
    const trigger = document.getElementById(`${prefix}-select-trigger`);
    const options = document.getElementById(`${prefix}-select-options`);
    const hiddenSelect = document.getElementById(`input-${prefix}`);
    const selectedText = document.getElementById(`${prefix}-selected-text`);

    if (!trigger || !options) return;

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
document.addEventListener('DOMContentLoaded', initApp);
