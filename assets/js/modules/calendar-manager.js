/**
 * Calendar Manager Module
 * Handles the Custom Neobrutalism Calendar Modal
 */

class CalendarManager {
    constructor() {
        console.log('🗓️ CalendarManager: Constructor called');
        this.currentDate = new Date();
        this.selectedDate = null;
        this.targetInputId = null;
        this.triggerBtnId = null;
        this.modalId = 'calendar-modal';
        this.initialized = false;
    }

    init() {
        console.log('🗓️ CalendarManager: init called');
        if (this.initialized) return;

        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.error('❌ CalendarManager: Modal not found!');
            return;
        }

        // Controls
        document.getElementById('close-calendar-x').addEventListener('click', () => this.close());
        document.getElementById('cal-prev').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('cal-next').addEventListener('click', () => this.changeMonth(1));

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });

        this.initialized = true;
    }

    open(targetInputId, triggerBtnId) {
        console.log(`🗓️ CalendarManager: Open called for ${targetInputId}`);
        // Ensure initialized (in case injected late)
        if (!this.initialized) this.init();

        this.targetInputId = targetInputId;
        this.triggerBtnId = triggerBtnId;

        const input = document.getElementById(targetInputId);
        if (input && input.value) {
            this.selectedDate = new Date(input.value);
            this.currentDate = new Date(this.selectedDate); // clone
        } else {
            this.selectedDate = null;
            this.currentDate = new Date();
        }

        this.render();
        document.getElementById(this.modalId).classList.add('active');
        document.body.classList.add('modal-open');
        if (window.pausePTR) window.pausePTR();
    }

    close() {
        document.getElementById(this.modalId).classList.remove('active');
        document.body.classList.remove('modal-open');
        if (window.resumePTR) window.resumePTR();
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    render() {
        const grid = document.getElementById('calendar-grid');
        const header = document.getElementById('cal-month-year');

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Month Names
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        header.textContent = `${months[month]} ${year}`;

        grid.innerHTML = '';

        // First day of month
        const firstDay = new Date(year, month, 1).getDay();
        // Days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            grid.appendChild(empty);
        }

        const today = new Date();
        const isTodayMonth = today.getMonth() === month && today.getFullYear() === year;

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = d;

            // Check Today
            if (isTodayMonth && d === today.getDate()) {
                dayEl.classList.add('today');
            }

            // Check Selected
            if (this.selectedDate &&
                this.selectedDate.getDate() === d &&
                this.selectedDate.getMonth() === month &&
                this.selectedDate.getFullYear() === year) {
                dayEl.classList.add('selected');
            }

            dayEl.onclick = () => this.selectDate(d);
            grid.appendChild(dayEl);
        }
    }

    selectDate(day) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Format YYYY-MM-DD
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        // Update Input
        if (this.targetInputId) {
            const input = document.getElementById(this.targetInputId);
            if (input) {
                input.value = dateStr;
                // Important: Trigger change so HomeView updates logic
                input.dispatchEvent(new Event('change'));
            }
        }

        // Update Button Text (if manual update needed, but HomeView logic might handle it via onchange?
        // Actually HomeView logic is: onchange="const btn... btn.innerHTML = ..."
        // So triggering 'change' on input is enough!
        // But the input type changed? No, it's still hidden 'date' input in my proposal?
        // Wait, HomeView.js uses a hidden <input type="date"> currently.
        // It relies on `onchange` logic attached to that input.
        // So dispatchEvent('change') is PERFECT.

        this.close();
    }
}

// Global Instance
window.calendarManager = new CalendarManager();
