
const modalsHTML = `
<!-- Scanner UI Modal Overlay -->
<div id="scanner-modal" class="scanner-overlay">
    <div class="scan-viewfinder">
        <img id="scan-preview" src="" alt="Preview"
            style="display: none; width: 100%; height: 100%; max-height: 400px; object-fit: contain; border-radius: 8px; margin-bottom: 20px;">
        <div id="scan-bar" class="scanning-bar"></div>
    </div>
    <div class="mt-5 text-center px-3">
        <h2 id="scan-title" style="color: white; border: none; box-shadow: none;">SCANNING...</h2>
        <p id="scan-status" style="color: var(--nb-yellow);">Analyzing receipt with AI</p>
        <div id="scan-loader" style="display: none; margin: 20px auto;">
            <div
                style="border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid var(--nb-yellow); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;">
            </div>
        </div>
        <button id="cancel-scan" class="btn btn-danger btn-lg mt-3">CANCEL</button>
    </div>
</div>

<!-- Scan Options selection Modal -->
<div id="scan-options-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-blue">
            <span>SELECT SCAN METHOD</span>
            <span id="close-scan-options-x" style="cursor:pointer">×</span>
        </div>
        <div class="modal-body p-4">
            <button id="use-camera" class="btn btn-yellow w-100 mb-3 btn-lg text-bold py-3"
                style="font-size: 1.1rem;">
                USE CAMERA
            </button>
            <button id="use-file" class="btn btn-yellow w-100 btn-lg text-bold py-3" style="font-size: 1.1rem;">
                CHOOSE FROM FILE
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
        <div class="modal-header" style="position: relative;">
            <div id="modal-progress-bar" style="position: absolute; top: 0; left: 0; width: 0%; height: 5px; background: #000; transition: width linear;"></div>
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
            <span>MANUAL INPUT</span>
            <span id="close-manual-x" style="cursor:pointer">×</span>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">TOTAL AMOUNT</label>
                <input type="text" id="input-amount" class="form-control" placeholder="Example: 50000 or 0.005">
            </div>
            <div class="form-group">
                <label class="form-label">DESCRIPTION / NAME</label>
                <input type="text" id="input-desc" class="form-control" placeholder="Example: Coffee"
                    style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">CATEGORY</label>
                <div class="custom-select-wrapper">
                    <div class="custom-select-trigger" id="cat-select-trigger">
                        <span id="cat-selected-text">FOOD</span>
                        <span class="custom-select-arrow">▼</span>
                    </div>
                    <div class="custom-select-options" id="cat-select-options">
                        <div class="custom-select-option" data-value="FOOD">FOOD</div>
                        <div class="custom-select-option" data-value="BILLS">BILLS</div>
                        <div class="custom-select-option" data-value="SHOPPING">SHOPPING</div>
                        <div class="custom-select-option" data-value="LEISURE">LEISURE</div>
                        <div class="custom-select-option" data-value="TRANSPORT">TRANSPORT</div>
                        <div class="custom-select-option" data-value="HEALTH">HEALTH</div>
                        <div class="custom-select-option" data-value="INVEST">INVEST</div>
                        <div class="custom-select-option" data-value="INCOME">INCOME</div>
                        <div class="custom-select-option" data-value="EDUCATION">EDUCATION</div>
                    </div>
                    <!-- Hidden select for compatibility -->
                    <select id="input-cat" class="form-control" style="display: none;">
                        <option value="FOOD">FOOD</option>
                        <option value="BILLS">BILLS</option>
                        <option value="SHOPPING">SHOPPING</option>
                        <option value="LEISURE">LEISURE</option>
                        <option value="TRANSPORT">TRANSPORT</option>
                        <option value="HEALTH">HEALTH</option>
                        <option value="INVEST">INVEST</option>
                        <option value="INCOME">INCOME</option>
                        <option value="EDUCATION">EDUCATION</option>
                    </select>
                </div>
            </div>
            <div id="asset-group" class="form-group" style="display: none;">
                <label class="form-label">ASSET TYPE</label>
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
            <button id="save-manual-btn" class="btn btn-primary btn-block btn-3d">SAVE TRANSACTION</button>
        </div>
    </div>
</div>

<!-- Context Menu for Transaction Actions -->
<div id="context-menu-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-purple">
            <span>TRANSACTION OPTIONS</span>
            <span id="close-context-x" style="cursor:pointer">×</span>
        </div>
        <div class="modal-body p-3">
            <button id="edit-transaction-btn" class="btn btn-primary w-100 mb-3 btn-lg text-bold py-3">
                EDIT TRANSACTION
            </button>
            <button id="delete-transaction-btn" class="btn btn-danger w-100 btn-lg text-bold py-3">
                DELETE TRANSACTION
            </button>
        </div>
    </div>
</div>

<!-- Custom Confirmation Modal -->
<div id="confirm-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-danger">
            <span id="confirm-title">CONFIRMATION</span>
        </div>
        <div class="modal-body">
            <p id="confirm-message" class="text-center text-bold" style="font-size: 1.1rem;"></p>
        </div>
        <div class="modal-footer">
            <button id="confirm-yes-btn" class="btn btn-danger btn-sm btn-3d mr-2">YES, DELETE</button>
            <button id="confirm-no-btn" class="btn btn-primary btn-sm btn-3d">CANCEL</button>
        </div>
    </div>
</div>

<!-- Bill Input Modal -->
<div id="bill-modal" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-purple">
            <span style="color: white; font-weight: 900;">ADD TO-DO ITEM</span>
            <span id="close-bill-x" style="cursor:pointer; color: white;">×</span>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">ITEM NAME</label>
                <input type="text" id="bill-name" class="form-control" placeholder="EXAMPLE: WIFI BILL" style="text-transform: uppercase;">
            </div>
            <div class="form-group">
                <label class="form-label">AMOUNT (IDR)</label>
                <input type="text" id="bill-amount" class="form-control" placeholder="250000" inputmode="numeric">
            </div>
            <div class="form-group">
                <label class="form-label">DESCRIPTION (OPTIONAL)</label>
                <input type="text" id="bill-desc" class="form-control" placeholder="EXAMPLE: USE EMERGENCY FUND" style="text-transform: uppercase;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="form-group">
                    <label class="form-label">FIRST DUE DATE</label>
                    <input type="date" id="bill-date" class="form-control">
                </div>
                <div class="form-group">
                    <label class="form-label">REPETITION</label>
                    <input type="number" id="bill-months" class="form-control" placeholder="12" min="1">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button id="save-bill-btn" class="btn btn-primary btn-block btn-3d">SAVE TO LIST</button>
        </div>
    </div>
</div>
<!-- To-Do Context Menu -->
<div id="todo-context-menu" class="modal-overlay">
    <div class="modal">
        <div class="modal-header bg-purple">
            <span style="color: white; font-weight: 900;">TODO OPTIONS</span>
            <span id="close-todo-context-x" style="cursor:pointer; color: white;">×</span>
        </div>
        <div class="modal-body p-3">
            <button id="pay-bill-btn" class="btn btn-yellow w-100 mb-3 btn-lg text-bold py-3" style="font-size: 1.1rem; border-color: #000;">
                COMPLETE ITEM
            </button>
            <button id="delete-todo-btn" class="btn btn-danger w-100 btn-lg text-bold py-3" style="font-size: 1.1rem; border-color: #000;">
                DELETE ITEM
            </button>
        </div>
    </div>
</div>
</div>

<!-- Custom Calendar Modal -->
<div id="calendar-modal" class="modal-overlay" style="z-index: 10002;">
    <div class="modal" style="width: 320px;">
        <div class="modal-header bg-yellow nb-flex-between">
            <span style="font-weight: 900; font-size: 1.2rem;">SELECT DATE</span>
            <span id="close-calendar-x" style="cursor:pointer; font-size: 1.5rem; line-height: 1;">×</span>
        </div>
        <div class="modal-body p-3 bg-white">
            <div class="nb-flex-between mb-3 p-2" style="border: 3px solid #000; background: #eee;">
                 <button id="cal-prev" class="btn btn-sm btn-primary" style="padding: 0 10px; font-weight: 900;"><</button>
                 <span id="cal-month-year" class="text-bold" style="font-size: 1.1rem;">JAN 2025</span>
                 <button id="cal-next" class="btn btn-sm btn-primary" style="padding: 0 10px; font-weight: 900;">></button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 5px;">
                <div class="calendar-header-day">SU</div>
                <div class="calendar-header-day">MO</div>
                <div class="calendar-header-day">TU</div>
                <div class="calendar-header-day">WE</div>
                <div class="calendar-header-day">TH</div>
                <div class="calendar-header-day">FR</div>
                <div class="calendar-header-day">SA</div>
            </div>

            <div id="calendar-grid" class="calendar-grid">
                <!-- Days injected here -->
            </div>
        </div>
    </div>
</div>


`;

const modalsContainer = document.getElementById('modals-container');
if (modalsContainer) {
    modalsContainer.innerHTML = modalsHTML;
}
