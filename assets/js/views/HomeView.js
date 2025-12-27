
const homeHTML = `
<!-- Stats Carousel (Main Balance + Other Stats) - Full Width -->
<div id="section-stats" class="stats-carousel mt-3">
    <div class="stats-carousel-item">
        <div class="card bg-pink p-2 text-center"
            style="min-height: 130px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
            <p class="m-0 text-bold" style="font-size: 1.1rem;">MAIN BALANCE</p>
            <h5 id="header-income-sisa" class="m-0 mt-3"
                style="font-size: 1.6rem; word-break: break-all;">
                Rp 0</h5>
        </div>
    </div>
    <div class="stats-carousel-item">
        <div class="card bg-green p-2 text-center"
            style="min-height: 130px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
            <p class="m-0 text-bold" style="font-size: 1.1rem;">BALANCE</p>
            <h5 id="row-total-balance" class="m-0 mt-3"
                style="font-size: 1.6rem; word-break: break-all;">Rp
                0</h5>
        </div>
    </div>
    <div class="stats-carousel-item">
        <div class="card bg-yellow p-2 text-center"
            style="min-height: 130px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
            <p class="m-0 text-bold" style="font-size: 1.1rem;">EXPENSE</p>
            <h5 id="total-expense" class="m-0 mt-3" style="font-size: 1.6rem; word-break: break-all;">Rp
                0
            </h5>
        </div>
    </div>
    <div class="stats-carousel-item">
        <div class="card bg-orange p-2 text-center"
            style="min-height: 130px; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
            <p class="m-0 text-bold" style="font-size: 1.1rem;">INVEST</p>
            <h5 id="total-invest" class="m-0 mt-3" style="font-size: 1.6rem; word-break: break-all;">Rp
                0
            </h5>
        </div>
    </div>
</div>

<!-- Main Content Container -->
<div class="container" style="margin-top: 30px;">



    <!-- Recent Transactions -->
    <div id="section-recent" class="mt-4">
        <h3 class="sticker sticker-blue">TRANSACTIONS</h3>

        <!-- Search Bar & Date Filter -->
        <div class="nb-search-container mt-2" style="display: flex; border: 3px solid #000; background: white; padding: 0;">
            <input type="text" id="transaction-search" class="nb-input" placeholder="Search..."
                style="flex: 1; border: none; border-right: 3px solid #000; margin: 0; box-shadow: none;">
            <div style="width: 150px; flex: none; position: relative; display: flex; align-items: stretch;">
                <input type="date" id="transaction-date" 
                    style="position: absolute; opacity: 0; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;"
                    onchange="const textSpan = document.getElementById('date-placeholder-text'); const clearIcon = document.getElementById('date-clear-icon'); const calIcon = document.getElementById('date-icon-svg'); if(this.value) { textSpan.innerHTML = this.value.split('-').reverse().join('/'); textSpan.style.color = '#000'; textSpan.style.fontWeight='900'; if(clearIcon) clearIcon.style.display = 'block'; if(calIcon) calIcon.style.display = 'none'; } else { textSpan.innerHTML = 'DATE'; textSpan.style.color = '#aaa'; if(clearIcon) clearIcon.style.display = 'none'; if(calIcon) calIcon.style.display = 'block'; }">
                
                <button id="date-trigger-btn" type="button" 
                    style="width: 100%; height: 100%; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-family: var(--font-main); font-weight: 900; font-size: 0.9rem;"
                    onclick="if(event.target.closest('#date-clear-icon')) return; window.calendarManager.open('transaction-date', 'date-trigger-btn')">
                    <span id="date-placeholder-text" style="color: #aaa; font-size: 0.9rem;">DATE</span>
                    
                    <div style="display: flex; align-items: center;">
                        <!-- Clear Icon (Hidden by default) -->
                        <div id="date-clear-icon" style="display: none; cursor: pointer;"
                             onclick="event.stopPropagation(); if(window.soundManager) window.soundManager.playClick(); const input = document.getElementById('transaction-date'); input.value = ''; input.dispatchEvent(new Event('change'));">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </div>

                        <!-- Calendar Icon (Visible by default) -->
                        <svg id="date-icon-svg" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                </button>
            </div>
        </div>

        <div class="tab-group mt-3">
            <div class="tab-item active" data-filter="all">ALL</div>
            <div class="tab-item" data-filter="INCOME">INCOME</div>
            <div class="tab-item" data-filter="EXPENSE">EXPENSE</div>
        </div>

        <div id="transaction-list" class="mt-2">
            <!-- Transaction Items will be injected here -->
        </div>

        <div id="pagination-controls" class="mt-3 nb-flex-between" style="display: none;">
            <button id="prev-page" class="btn btn-primary btn-sm btn-3d">PREV</button>
            <span id="page-indicator" class="text-bold">Page 1</span>
            <button id="next-page" class="btn btn-primary btn-sm btn-3d">NEXT</button>
        </div>
    </div>

    <!-- Budget Tracker (Now Dynamic) -->
    <div id="section-budget" class="mt-4">
        <h3 class="sticker mb-1">BUDGET TRACKER</h3>
        <div id="budget-progress-container" class="card card-inner mt-1 p-3">
            <!-- Progress items will be injected here -->
        </div>
    </div>

    <!-- Analytics (Progress Bar Style) -->
    <div id="section-analytics" class="mt-4 mb-5 pb-4">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 class="sticker sticker-purple m-0">ANALYTICS</h3>
            <div style="display: flex; gap: 5px;">
                <!-- Custom Month Select -->
                <div class="custom-select-wrapper" style="width: 100px;">
                    <div class="custom-select-trigger" id="analytics-month-select-trigger" style="padding: 5px 10px; font-size: 0.9rem;">
                        <span id="analytics-month-selected-text">MAY</span>
                        <span class="custom-select-arrow">▼</span>
                    </div>
                    <div class="custom-select-options" id="analytics-month-select-options">
                        <div class="custom-select-option" data-value="0">JAN</div>
                        <div class="custom-select-option" data-value="1">FEB</div>
                        <div class="custom-select-option" data-value="2">MAR</div>
                        <div class="custom-select-option" data-value="3">APR</div>
                        <div class="custom-select-option" data-value="4">MAY</div>
                        <div class="custom-select-option" data-value="5">JUN</div>
                        <div class="custom-select-option" data-value="6">JUL</div>
                        <div class="custom-select-option" data-value="7">AUG</div>
                        <div class="custom-select-option" data-value="8">SEP</div>
                        <div class="custom-select-option" data-value="9">OCT</div>
                        <div class="custom-select-option" data-value="10">NOV</div>
                        <div class="custom-select-option" data-value="11">DEC</div>
                    </div>
                    <select id="analytics-month" style="display: none;">
                        <option value="0">JAN</option>
                        <option value="1">FEB</option>
                        <option value="2">MAR</option>
                        <option value="3">APR</option>
                        <option value="4">MAY</option>
                        <option value="5">JUN</option>
                        <option value="6">JUL</option>
                        <option value="7">AUG</option>
                        <option value="8">SEP</option>
                        <option value="9">OCT</option>
                        <option value="10">NOV</option>
                        <option value="11">DEC</option>
                    </select>
                </div>

                <!-- Custom Year Select -->
                <div class="custom-select-wrapper" style="width: 90px;">
                     <div class="custom-select-trigger" id="analytics-year-select-trigger" style="padding: 5px 10px; font-size: 0.9rem;">
                        <span id="analytics-year-selected-text">2025</span>
                        <span class="custom-select-arrow">▼</span>
                    </div>
                    <div class="custom-select-options" id="analytics-year-select-options">
                        <div class="custom-select-option" data-value="2025">2025</div>
                        <div class="custom-select-option" data-value="2026">2026</div>
                        <div class="custom-select-option" data-value="2027">2027</div>
                    </div>
                    <select id="analytics-year" style="display: none;">
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mt-1 p-3 bg-white" style="border: 3px solid #000;">
             <!-- Income Progress -->
             <div class="nb-flex-between mb-1">
                 <span class="text-bold">INCOME</span>
                 <span id="analytics-income-value" class="text-bold">Rp 0</span>
             </div>
             <div class="progress mb-4" style="height: 25px; border: 3px solid #000; background: #eee;">
                 <div id="analytics-income-bar" class="progress-bar bg-green" style="width: 0%; border-right: 3px solid #000; height: 100%;"></div>
             </div>

             <!-- Expense Progress -->
             <div class="nb-flex-between mb-1">
                 <span class="text-bold">EXPENSE</span>
                 <span id="analytics-expense-value" class="text-bold">Rp 0</span>
             </div>
             <div class="progress" style="height: 25px; border: 3px solid #000; background: #eee;">
                 <div id="analytics-expense-bar" class="progress-bar bg-yellow" style="width: 0%; border-right: 3px solid #000; height: 100%;"></div>
             </div>

             <!-- Category Breakdown -->
             <div id="analytics-details" class="mt-4 pt-3" style="border-top: 3px solid #000; display: none;">
                <!-- Category items will be injected here -->
             </div>
        </div>
    </div>

</div> <!-- End of .container -->
`;

const homeContainer = document.getElementById('home-content');
if (homeContainer) {
    homeContainer.innerHTML = homeHTML;
}
