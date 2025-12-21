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
        });
    }

    // Confirmation Modal Listeners
    if (confirmYesBtn && confirmModal) {
        confirmYesBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            if (confirmCallback) {
                confirmCallback();
                confirmCallback = null;
            }
        });
    }

    if (confirmNoBtn && confirmModal) {
        confirmNoBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            confirmCallback = null;
            if (window.soundManager) window.soundManager.playClick();
        });
    }

    // Expose globals for other scripts (router, etc.)
    window.showAppModal = showModal;
    window.showAppConfirm = showConfirm;
    window.openManualModal = openManualModal;
    window.hideManualModal = hideManualModal;
}

export function showModal(title, message) {
    const customModal = getEl('nb-custom-modal');
    if (!customModal) return;

    getEl('modal-title').innerText = title;
    getEl('modal-content').innerHTML = message;
    customModal.classList.add('active');

    // Play alert sound based on title
    if (window.soundManager) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('berhasil') || titleLower.includes('success')) {
            window.soundManager.playSuccess();
        } else if (titleLower.includes('error') || titleLower.includes('gagal')) {
            window.soundManager.playError();
        } else {
            window.soundManager.playSuccess(); // Default to success
        }
    }
}

export function hideModal() {
    const customModal = getEl('nb-custom-modal');
    if (customModal) customModal.classList.remove('active');
}

export function openManualModal() {
    const manualModal = getEl('manual-modal');
    if (manualModal) {
        if (window.soundManager) window.soundManager.playClick();
        manualModal.classList.add('active');
    }
}

export function hideManualModal() {
    const manualModal = getEl('manual-modal');
    if (manualModal) {
        manualModal.classList.remove('active');

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

    if (window.soundManager) window.soundManager.playAlert();
}
