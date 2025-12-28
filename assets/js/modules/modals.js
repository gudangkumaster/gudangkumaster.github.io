/**
 * Modals Module
 * Handles all popup interaction logic.
 */

// UI References
// UI References (Lazily fetched)
const getEl = (id) => document.getElementById(id);

let confirmCallback = null;

export function initModals() {
    // Basic Modal Closers
    const modalOkBtn = getEl('modal-ok-btn');
    const closeModalX = getEl('close-modal-x');
    const closeManualX = getEl('close-manual-x');
    const closeScanOptionsX = getEl('close-scan-options-x');
    const scanOptionsModal = getEl('scan-options-modal');

    // Confirm Modal Refs
    const confirmYesBtn = getEl('confirm-yes-btn');
    const confirmNoBtn = getEl('confirm-no-btn');
    const confirmModal = getEl('confirm-modal');

    if (modalOkBtn) modalOkBtn.addEventListener('click', hideModal);
    if (closeModalX) closeModalX.addEventListener('click', hideModal);

    if (closeManualX) {
        closeManualX.addEventListener('click', () => {
            hideManualModal();
        });
    }

    if (closeScanOptionsX && scanOptionsModal) {
        closeScanOptionsX.addEventListener('click', () => {
            scanOptionsModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            if (window.resumePTR) window.resumePTR();
        });
    }

    const closeCatFilterX = getEl('close-cat-filter-x');
    if (closeCatFilterX) {
        closeCatFilterX.addEventListener('click', hideCategoryFilterModal);
    }

    // Confirmation Modal Listeners
    if (confirmYesBtn && confirmModal) {
        confirmYesBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            if (window.resumePTR) window.resumePTR();
            if (confirmCallback) {
                confirmCallback();
                confirmCallback = null;
            }
        });
    }

    if (confirmNoBtn && confirmModal) {
        confirmNoBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            if (window.resumePTR) window.resumePTR();
            confirmCallback = null;
            if (window.soundManager) window.soundManager.playClick();
        });
    }

    // Expose globals for other scripts (router, etc.)
    window.showAppModal = showModal;
    window.showAppConfirm = showConfirm;
    window.openManualModal = openManualModal;
    window.hideManualModal = hideManualModal;

    // --- Click Outside to Close ---
    const overlays = ['manual-modal', 'nb-custom-modal', 'scan-options-modal', 'confirm-modal', 'category-filter-modal'];
    overlays.forEach(id => {
        const el = getEl(id);
        if (el) {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    if (id === 'manual-modal') hideManualModal();
                    else if (id === 'nb-custom-modal') hideModal();
                    else if (id === 'category-filter-modal') hideCategoryFilterModal();
                    else {
                        el.classList.remove('active');
                        document.body.classList.remove('modal-open');
                        if (window.resumePTR) window.resumePTR();

                        // Verify callback cleanup for confirm
                        if (id === 'confirm-modal' && confirmCallback) confirmCallback = null;
                    }
                }
            });
        }
    });

    // (Esc listener moved to initApp for stability)
}

export function showModal(title, message) {
    const customModal = getEl('nb-custom-modal');
    if (!customModal) return;

    getEl('modal-title').innerText = title;
    getEl('modal-content').innerHTML = message;
    customModal.classList.add('active');
    document.body.classList.add('modal-open');
    if (window.pausePTR) window.pausePTR();

    // Determine Type for Sound & Styling
    const titleLower = title.toLowerCase();
    const isError = titleLower.includes('error') || titleLower.includes('gagal');

    // Sound
    if (window.soundManager) {
        if (isError) window.soundManager.playError();
        else window.soundManager.playSuccess();
    }

    // Calculate Duration based on text length
    // Base 2200ms + 50ms per char. Max 6000ms.
    const baseDuration = 2200;
    const charDuration = 50;
    const calculatedDuration = Math.min(6000, baseDuration + (message.length * charDuration));

    // Progress Bar Animation (Run for ALL single-option modals)
    const progressBar = document.getElementById('modal-progress-bar');
    if (progressBar) {
        // Reset
        progressBar.style.transition = 'none';
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = isError ? '#FF4D4D' : '#000'; // Red for error, Black for others
        void progressBar.offsetWidth; // Trigger Reflow

        // Animate
        progressBar.style.transition = `width ${calculatedDuration}ms linear`;
        progressBar.style.width = '0%';
    }

    // Auto-Close Logic (For ALL)
    setTimeout(() => {
        const currentModal = getEl('nb-custom-modal');
        if (currentModal && currentModal.classList.contains('active')) {
            const currentTitle = getEl('modal-title').innerText;
            // Only close if it's still the same modal (title check is a decent proxy)
            if (currentTitle === title) hideModal();
        }
    }, calculatedDuration);
}

export function hideModal() {
    const customModal = getEl('nb-custom-modal');
    if (customModal) {
        customModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (window.resumePTR) window.resumePTR();
    }
}

export function openManualModal() {
    const manualModal = getEl('manual-modal');
    if (manualModal) {
        if (window.soundManager) window.soundManager.playClick();

        // Clear all input fields to prevent auto-fill
        const amountInput = getEl('input-amount');
        const descInput = getEl('input-desc');
        const catSelect = getEl('input-cat');
        const assetSelect = getEl('input-asset');
        const assetGroup = getEl('asset-group');
        const saveBtn = getEl('save-manual-btn');

        // Reset form fields
        if (amountInput) amountInput.value = '';
        if (descInput) descInput.value = '';
        if (catSelect) catSelect.value = 'FOOD';
        if (assetSelect) assetSelect.value = 'bitcoin';
        if (assetGroup) assetGroup.style.display = 'none';

        // Reset custom dropdown UI
        if (window.updateCustomDropdownUI) {
            window.updateCustomDropdownUI('cat', 'FOOD');
            window.updateCustomDropdownUI('asset', 'bitcoin');
        } else {
            // Fallback: manually set text without icons
            const catSelectedText = getEl('cat-selected-text');
            const assetSelectedText = getEl('asset-selected-text');
            if (catSelectedText) catSelectedText.textContent = 'FOOD';
            if (assetSelectedText) assetSelectedText.textContent = 'BITCOIN (BTC)';
        }

        // Reset button to default state
        if (saveBtn) {
            saveBtn.innerText = 'SAVE TRANSACTION';
            saveBtn.removeAttribute('data-edit-mode');
            saveBtn.removeAttribute('data-edit-id');
            saveBtn.removeAttribute('data-edit-collection');
        }

        // Auto Focus on Amount
        if (amountInput) {
            setTimeout(() => amountInput.focus(), 100);
        }

        manualModal.classList.add('active');
        document.body.classList.add('modal-open');
        if (window.pausePTR) window.pausePTR();
    }
}

export function hideManualModal() {
    const manualModal = getEl('manual-modal');
    if (manualModal) {
        manualModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (window.resumePTR) window.resumePTR();

        // Reset edit mode if active
        const saveBtn = getEl('save-manual-btn');
        if (saveBtn && saveBtn.getAttribute('data-edit-mode') === 'true') {
            saveBtn.innerText = 'SIMPAN TRANSAKSI';
            saveBtn.removeAttribute('data-edit-mode');
            saveBtn.removeAttribute('data-edit-id');
            saveBtn.removeAttribute('data-edit-collection');
            // Reset fields
            document.getElementById('input-amount').value = '';
            document.getElementById('input-desc').value = '';
        }
    }
}

export function showConfirm(title, message, onConfirm) {
    const confirmModal = getEl('confirm-modal');
    if (!confirmModal) return;

    // Support both 2 and 3 argument signatures
    if (typeof message === 'function') {
        onConfirm = message;
        message = title;
        title = "KONFIRMASI";
    }

    getEl('confirm-title').innerText = title;
    getEl('confirm-message').innerHTML = message;
    confirmCallback = onConfirm;
    confirmModal.classList.add('active');
    document.body.classList.add('modal-open');
    if (window.pausePTR) window.pausePTR();

    if (window.soundManager) window.soundManager.playAlert();
}

// --- Toast / Undo Logic ---
export function showUndoToast(message, onUndo, duration = 3000) {
    // Check if toast container exists, if not create it
    let toast = document.getElementById('undo-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'undo-toast';
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px);
            background: #000; color: #fff; padding: 15px 25px;
            border: 3px solid #000; box-shadow: 4px 4px 0px #fff;
            display: flex; align-items: center; gap: 15px; z-index: 10000;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            width: 90%; max-width: 400px; justify-content: space-between;
        `;
        toast.innerHTML = `
            <span id="toast-msg" style="font-weight: bold; font-family: 'Courier New', monospace;"></span>
            <button id="toast-undo-btn" style="
                background: #FF00FF; color: #000; border: 2px solid #fff; 
                padding: 5px 15px; font-weight: 900; cursor: pointer;
                box-shadow: 2px 2px 0px #fff;
            ">UNDO</button>
        `;
        document.body.appendChild(toast);
    }

    const msgEl = toast.querySelector('#toast-msg');
    const undoBtn = toast.querySelector('#toast-undo-btn');

    msgEl.textContent = message;

    // Show Toast
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Cleanup previous timer
    if (window.undoTimer) clearTimeout(window.undoTimer);

    // Setup Undo
    undoBtn.onclick = () => {
        if (onUndo) onUndo();
        hideUndoToast();
    };

    // Auto Hide
    window.undoTimer = setTimeout(() => {
        hideUndoToast();
    }, duration);
}

function hideUndoToast() {
    const toast = document.getElementById('undo-toast');
    if (toast) {
        toast.style.transform = 'translateX(-50%) translateY(150%)';
    }
}


