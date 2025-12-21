// Modals Component
const modalsHTML = `
<!-- Scanner UI Modal Overlay -->
<div id="scanner-modal" class="scanner-overlay">
    <div class="scan-viewfinder">
        <img id="scan-preview" src="" alt="Preview"
            style="display: none; width: 100%; height: 100%; max-height: 400px; object-fit: contain; border-radius: 8px; margin-bottom: 20px;">
        <div id="scan-bar" class="scanning-bar"></div>
    </div>
    <div class="mt-5 text-center px-3">
        <h2 id="scan-title" style="color: white; border: none; box-shadow: none;">SEDANG MEMINDAI...</h2>
        <p id="scan-status" style="color: var(--nb-yellow);">Menganalisis struk dengan AI</p>
        <div id="scan-loader" style="display: none; margin: 20px auto;">
            <div
                style="border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid var(--nb-yellow); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;">
            </div>
        </div>
        <button id="cancel-scan" class="btn btn-danger btn-lg mt-3">BATAL</button>
    </div>
</div>

<!-- Scan Options selection Modal -->
<div id="scan-options-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-blue">
            <span>PILIH METODE SCAN</span>
            <span id="close-scan-options-x" style="cursor:pointer">×</span>
        </div>
        <div class="modal-body p-4">
            <button id="use-camera" class="btn btn-yellow w-100 mb-3 btn-lg text-bold py-3"
                style="font-size: 1.1rem;">
                GUNAKAN KAMERA
            </button>
            <button id="use-file" class="btn btn-yellow w-100 btn-lg text-bold py-3" style="font-size: 1.1rem;">
                PILIH DARI FILE
            </button>
            <!-- Hidden inputs for different methods -->
            <input type="file" id="camera-capture-input" hidden accept="image/*" capture="environment">
            <input type="file" id="receipt-file-input" hidden accept="image/*">
        </div>
    </div>
</div>

<!-- Custom Neobrutalist Modal Pop-up -->
<div id="nb-custom-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header">
            <span id="modal-title">INFO</span>
            <span id="close-modal-x" style="cursor:pointer">×</span>
        </div>
        <div id="modal-content" class="modal-body">
            <!-- Message content goes here -->
        </div>
        <div class="modal-footer">
            <button id="modal-ok-btn" class="btn btn-primary btn-sm btn-3d">OK</button>
        </div>
    </div>
</div>

<!-- Manual Input Modal -->
<div id="manual-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-yellow">
            <span>INPUT MANUAL</span>
            <span id="close-manual-x" style="cursor:pointer">×</span>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">TOTAL NOMINAL</label>
                <input type="text" id="input-amount" class="form-control" placeholder="Contoh: 50000 atau 0.005">
            </div>
            <div class="form-group">
                <label class="form-label">DESKRIPSI / NAMA</label>
                <input type="text" id="input-desc" class="form-control" placeholder="Contoh: Beli Kopi"
                    style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">KATEGORI</label>
                <div class="custom-select-wrapper">
                    <div class="custom-select-trigger" id="cat-select-trigger">
                        <span id="cat-selected-text">MAKANAN (FOOD)</span>
                        <span class="custom-select-arrow">▼</span>
                    </div>
                    <div class="custom-select-options" id="cat-select-options">
                        <div class="custom-select-option" data-value="FOOD">MAKANAN (FOOD)</div>
                        <div class="custom-select-option" data-value="BILLS">TAGIHAN (BILLS)</div>
                        <div class="custom-select-option" data-value="SHOPPING">BELANJA (SHOPPING)</div>
                        <div class="custom-select-option" data-value="LEISURE">HIBURAN (LEISURE)</div>
                        <div class="custom-select-option" data-value="TRANSPORT">TRANSPORTASI</div>
                        <div class="custom-select-option" data-value="HEALTH">KESEHATAN</div>
                        <div class="custom-select-option" data-value="INVEST">INVEST</div>
                        <div class="custom-select-option" data-value="INCOME">PEMASUKAN (INCOME)</div>
                        <div class="custom-select-option" data-value="EDUCATION">PENDIDIKAN (EDUCATION)</div>
                    </div>
                    <!-- Hidden select for compatibility -->
                    <select id="input-cat" class="form-control" style="display: none;">
                        <option value="FOOD">MAKANAN (FOOD)</option>
                        <option value="BILLS">TAGIHAN (BILLS)</option>
                        <option value="SHOPPING">BELANJA (SHOPPING)</option>
                        <option value="LEISURE">HIBURAN (LEISURE)</option>
                        <option value="TRANSPORT">TRANSPORTASI</option>
                        <option value="HEALTH">KESEHATAN</option>
                        <option value="INVEST">INVEST</option>
                        <option value="INCOME">PEMASUKAN (INCOME)</option>
                        <option value="EDUCATION">PENDIDIKAN (EDUCATION)</option>
                    </select>
                </div>
            </div>
            <div id="asset-group" class="form-group" style="display: none;">
                <label class="form-label">JENIS ASET</label>
                <div class="custom-select-wrapper">
                    <div class="custom-select-trigger" id="asset-select-trigger">
                        <span id="asset-selected-text">BITCOIN (BTC)</span>
                        <span class="custom-select-arrow">▼</span>
                    </div>
                    <div class="custom-select-options" id="asset-select-options">
                        <div class="custom-select-option" data-value="bitcoin">BITCOIN (BTC)</div>
                        <div class="custom-select-option" data-value="ethereum">ETHEREUM (ETH)</div>
                        <div class="custom-select-option" data-value="zerebro">ZEREBRO</div>
                    </div>
                    <!-- Hidden select for compatibility -->
                    <select id="input-asset" class="form-control" style="display: none;">
                        <option value="bitcoin">BITCOIN (BTC)</option>
                        <option value="ethereum">ETHEREUM (ETH)</option>
                        <option value="zerebro">ZEREBRO (ZRB)</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="save-manual-btn" class="btn btn-primary btn-block btn-3d">SIMPAN TRANSAKSI</button>
        </div>
    </div>
</div>

<!-- Context Menu for Transaction Actions -->
<div id="context-menu-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-purple">
            <span>OPSI TRANSAKSI</span>
            <span id="close-context-x" style="cursor:pointer">×</span>
        </div>
        <div class="modal-body p-3">
            <button id="edit-transaction-btn" class="btn btn-primary w-100 mb-3 btn-lg text-bold py-3">
                EDIT TRANSAKSI
            </button>
            <button id="delete-transaction-btn" class="btn btn-danger w-100 btn-lg text-bold py-3">
                HAPUS TRANSAKSI
            </button>
        </div>
    </div>
</div>

<!-- Custom Confirmation Modal -->
<div id="confirm-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-danger">
            <span id="confirm-title">KONFIRMASI</span>
        </div>
        <div class="modal-body">
            <p id="confirm-message" class="text-center text-bold" style="font-size: 1.1rem;"></p>
        </div>
        <div class="modal-footer">
            <button id="confirm-yes-btn" class="btn btn-danger btn-sm btn-3d mr-2">YA, HAPUS</button>
            <button id="confirm-no-btn" class="btn btn-primary btn-sm btn-3d">BATAL</button>
        </div>
    </div>
</div>

<!-- Bill Input Modal -->
<div id="bill-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-purple">
            <span style="color: white; font-weight: 900;">TAMBAH TO-DO LIST</span>
            <span id="close-bill-x" style="cursor:pointer; color: white;">×</span>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">NAMA TAGIHAN</label>
                <input type="text" id="bill-name" class="form-control" placeholder="CONTOH: BAYAR WIFI" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">NOMINAL (RP)</label>
                <input type="text" id="bill-amount" class="form-control" placeholder="250000" inputmode="numeric">
            </div>
            <div class="form-group">
                <label class="form-label">DESKRIPSI (OPTIONAL)</label>
                <input type="text" id="bill-desc" class="form-control" placeholder="CONTOH: PAKAI DANA DARURAT" style="text-transform: uppercase;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label class="form-label">TGL JATUH TEMPO PERTAMA</label>
                    <input type="date" id="bill-date" class="form-control">
                </div>
                <div class="form-group">
                    <label class="form-label">REPETISI (BULAN)</label>
                    <input type="number" id="bill-months" class="form-control" placeholder="12" min="1">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="save-bill-btn" class="btn btn-primary btn-block btn-3d">SIMPAN KE LIST</button>
        </div>
    </div>
</div>
<!-- To-Do Context Menu -->
<div id="todo-context-menu" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-purple">
            <span style="color: white; font-weight: 900;">OPSI KEGIATAN</span>
            <span id="close-todo-context-x" style="cursor:pointer; color: white;">×</span>
        </div>
        <div class="modal-body p-3">
            <button id="pay-bill-btn" class="btn btn-yellow w-100 mb-3 btn-lg text-bold py-3" style="font-size: 1.1rem; border-color: #000;">
                SELESAIKAN TAGIHAN
            </button>
            <button id="delete-todo-btn" class="btn btn-danger w-100 btn-lg text-bold py-3" style="font-size: 1.1rem; border-color: #000;">
                HAPUS KEGIATAN
            </button>
        </div>
    </div>
</div>
`;

// Footer Navigation Component
const footerNavHTML = `
<!-- Enhanced Bottom Navigation -->
<div class="bottom-nav-enhanced">
    <div class="nav-items-container">
        <a href="#" data-route="/" class="nav-item-enhanced active" data-label="HOME" oncontextmenu="return false;">
            <div class="nav-icon-enhanced">🏠</div>
            <span class="nav-label">HOME</span>
        </a>
        <a href="#" id="scan-trigger" class="nav-item-enhanced" data-label="SCAN" oncontextmenu="return false;">
            <div class="nav-icon-enhanced scan-icon">📷</div>
            <span class="nav-label">SCAN</span>
        </a>
        <a href="#" data-route="/todo" class="nav-item-enhanced" data-label="TODO" oncontextmenu="return false;">
            <div class="nav-icon-enhanced">📝</div>
            <span class="nav-label">TO-DO</span>
        </a>
        <a href="#" data-route="/settings" class="nav-item-enhanced" data-label="SETTING" oncontextmenu="return false;">
            <div class="nav-icon-enhanced">⚙️</div>
            <span class="nav-label">SETTING</span>
        </a>
    </div>
</div>
`;

// Load all components immediately
const modalsContainer = document.getElementById('modals-container');
if (modalsContainer) {
    modalsContainer.innerHTML = modalsHTML;
}

const footerContainer = document.getElementById('footer-nav-container');
if (footerContainer) {
    footerContainer.innerHTML = footerNavHTML;
}

// Prevent long-press context menu on navigation items
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item-enhanced');
    navItems.forEach(item => {
        // Prevent context menu (right-click and long-press)
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Prevent text selection on long-press
        item.style.userSelect = 'none';
        item.style.webkitUserSelect = 'none';
        item.style.webkitTouchCallout = 'none';
    });
});

