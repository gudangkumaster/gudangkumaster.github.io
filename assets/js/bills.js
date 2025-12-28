/**
 * BillManager - Handles Bill Reminders (To-Do List)
 * Migrated to Firebase Firestore for persistence.
 */
import { db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from "./api.js";

class BillManager {
    constructor() {
        this.bills = [];
        this.selectedBillId = null;
        this.longPressTimer = null;
        this.collectionName = "todo";
        this.currentRenderId = 0; // For race condition handling
        this.init();
    }

    init() {
        // Expose to window for SPA router and global access
        window.initBills = () => this.renderBills();
        window.openBillModal = () => this.showModal();
        window.paySelectedBill = () => this.paySelectedBill();

        // Setup real-time listener
        this.setupRealtimeListener();

        // Setup static UI listeners
        this.setupEventListeners();
    }

    setupRealtimeListener() {
        const q = query(collection(db, this.collectionName), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            this.bills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderBills();
            this.renderBillAlert();
        });
    }

    async renderBillAlert() {
        // Track this render request
        const myRenderId = Date.now();
        this.currentRenderId = myRenderId;

        const container = document.getElementById('bill-alert-container');
        if (!container) return;

        // Note: Clearing container is now handled in renderAlertUI to prevent stacking/flickering

        // ---------------------------------------------------------
        // PRIORITY 1: Urgent Bills (<= 7 days OR Overdue)
        // ---------------------------------------------------------
        let urgentBills = [];
        if (this.bills && this.bills.length > 0) {
            urgentBills = this.bills.filter(bill => {
                const nextDate = bill.nextDueDate;
                if (!nextDate) return false;
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const target = new Date(nextDate);
                target.setHours(0, 0, 0, 0);
                const diffTime = target - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            });
        }

        if (urgentBills.length > 0) {
            // Sort by urgency
            urgentBills.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
            const bill = urgentBills[0];
            const remaining = this.getRemainingDays(bill.nextDueDate);
            const isOverdue = remaining.includes('LALU');

            // Sync check doesn't need ID check, it's instant
            if (this.currentRenderId === myRenderId) {
                this.renderAlertUI(container,
                    isOverdue ? 'bg-red' : 'bg-yellow',
                    isOverdue ? '#fff' : '#000',
                    isOverdue ? '⚠️ TERLEWAT' : '⚠️ JATUH TEMPO SEGERA',
                    `TAGIHAN ${bill.name} (${remaining})`,
                    this.formatCurrency(bill.amount)
                );
            }
            return;
        }

        // ---------------------------------------------------------
        // PRIORITY 2: Habit Warning (Spam Check)
        // ---------------------------------------------------------
        if (typeof window.getAllTransactions === 'function') {
            try {
                const txs = window.getAllTransactions();
                if (txs && txs.length >= 3) {
                    const last3 = txs.slice(0, 3);
                    const firstCat = last3[0].category;
                    // Check if category exists and is not exempt
                    if (firstCat && firstCat !== 'INCOME' && firstCat !== 'INVEST') {
                        const isSpam = last3.every(t => t.category === firstCat);
                        if (isSpam) {
                            if (this.currentRenderId === myRenderId) {
                                this.renderAlertUI(container, 'bg-orange', '#000', '🧐 POLISI JAJAN',
                                    `Kebanyakan ${firstCat}?`, "Jangan lupa nabung ya!");
                            }
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error("Spam check failed", e);
            }
        }

        // ---------------------------------------------------------
        // PRIORITY 3: Bitcoin Price (REMOVED)
        // User requested to keep it empty if P1 & P2 are not met.
        // ---------------------------------------------------------
        container.innerHTML = '';
    }

    renderAlertUI(container, bgClass, textColor, label, title, subtitle) {
        // ALWAYS CLEAR FIRST to prevent duplication/stacking
        container.innerHTML = '';

        const div = document.createElement('div');
        div.className = `${bgClass}`; // Removed animate-bounceIn

        // Ensure colors are applied even if CSS classes missing
        let bgColorCode = '#fff';
        if (bgClass === 'bg-red') bgColorCode = '#FF4D4D';
        else if (bgClass === 'bg-yellow') bgColorCode = '#FFDE00';
        else if (bgClass === 'bg-orange') bgColorCode = '#FF9F43';
        else if (bgClass === 'bg-blue') bgColorCode = '#54a0ff';

        // Override if using var
        if (bgClass === 'bg-orange') bgColorCode = '#FF9F43';

        div.style.cssText = `
            background: ${bgColorCode};
            color: ${textColor};
            padding: 15px 20px;
            border-bottom: 3px solid #000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 0 rgba(0,0,0,0.1);
        `;

        div.innerHTML = `
            <div style="flex: 1;">
                <p style="margin: 0; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; opacity: 0.8;">${label}</p>
                <p style="margin: 2px 0 0 0; font-weight: 900; font-size: 1rem;">${title}</p>
                <p style="margin: 0; font-size: 0.8rem; font-family: 'Courier New', monospace; font-weight: bold;">${subtitle}</p>
            </div>
            <button id="close-alert-btn" style="background: transparent; border: none; font-size: 1.5rem; font-weight: 900; cursor: pointer; padding: 0 0 0 15px; color: ${textColor};">×</button>
        `;

        container.appendChild(div);

        const closeBtn = document.getElementById('close-alert-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                container.innerHTML = '';
            };
        }
    }

    setupEventListeners() {
        // Expose alert update globally just in case
        window.updateBillAlert = () => this.renderBillAlert();
        setInterval(() => {
            const saveBtn = document.getElementById('save-bill-btn');
            const closeBtn = document.getElementById('close-bill-x');

            const payBtn = document.getElementById('pay-bill-btn');
            const deleteTodoBtn = document.getElementById('delete-todo-btn');
            const closeContextBtn = document.getElementById('close-todo-context-x');

            if (saveBtn && !saveBtn.onclick) {
                saveBtn.onclick = () => {
                    if (window.soundManager) window.soundManager.playClick();
                    this.addBill();
                };
            }
            if (closeBtn && !closeBtn.onclick) {
                closeBtn.onclick = () => {
                    document.body.classList.remove('modal-open');
                    document.getElementById('bill-modal').classList.remove('active');
                    if (window.resumePTR) window.resumePTR();
                    if (window.soundManager) window.soundManager.playClick();
                };
                // Background Click Close
                const modal = document.getElementById('bill-modal');
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.classList.remove('modal-open');
                        modal.classList.remove('active');
                        if (window.resumePTR) window.resumePTR();
                    }
                });
            }
            if (payBtn && !payBtn.onclick) {
                payBtn.onclick = () => {
                    if (window.soundManager) window.soundManager.playClick();
                    this.paySelectedBill();
                };
            }
            if (deleteTodoBtn && !deleteTodoBtn.onclick) {
                deleteTodoBtn.onclick = () => {
                    if (window.soundManager) window.soundManager.playClick();
                    if (this.selectedBillId) {
                        this.deleteBill(this.selectedBillId);
                        document.body.classList.remove('modal-open');
                        document.getElementById('todo-context-menu').classList.remove('active');
                        if (window.resumePTR) window.resumePTR();
                    }
                };
            }
            if (closeContextBtn && !closeContextBtn.onclick) {
                closeContextBtn.onclick = () => {
                    document.body.classList.remove('modal-open');
                    document.getElementById('todo-context-menu').classList.remove('active');
                    if (window.resumePTR) window.resumePTR();
                    if (window.soundManager) window.soundManager.playClick();
                };
                // Background Click Close
                const modal = document.getElementById('todo-context-menu');
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.classList.remove('modal-open');
                        modal.classList.remove('active');
                        if (window.resumePTR) window.resumePTR();
                    }
                });
            }
        }, 1000);
    }

    showModal() {
        const modal = document.getElementById('bill-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            if (window.pausePTR) window.pausePTR();
            if (window.soundManager) window.soundManager.playClick();

            // Set default date to TODAY to avoid "2005" issues
            const dateInput = document.getElementById('bill-date');
            if (dateInput && !dateInput.value) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                dateInput.value = `${year}-${month}-${day}`;
            }

            // Focus removed to prevent keyboard auto-open on mobile
        }
    }

    async addBill() {
        const nameInput = document.getElementById('bill-name');
        const amountInput = document.getElementById('bill-amount');
        const descInput = document.getElementById('bill-desc');
        const dateInput = document.getElementById('bill-date');
        const monthsInput = document.getElementById('bill-months');

        const name = nameInput.value.trim().toUpperCase();
        const amountRaw = amountInput.value.trim();
        const desc = descInput.value.trim().toUpperCase();
        const dateVal = dateInput.value; // YYYY-MM-DD
        const months = parseInt(monthsInput.value) || 1;

        if (!name || !amountRaw || !dateVal) {
            alert('Mohon isi semua data (Nama, Nominal, dan Tanggal)!');
            return;
        }

        // Clean amount
        const amount = parseFloat(amountRaw.replace(/\./g, '').replace(/,/g, ''));

        if (isNaN(amount)) {
            alert('Nominal tidak valid!');
            return;
        }

        const newBill = {
            name,
            amount,
            description: desc,
            nextDueDate: dateVal, // Store as string YYYY-MM-DD
            duration: months,
            createdAt: serverTimestamp(),
            status: 'active'
        };

        try {
            await addDoc(collection(db, this.collectionName), newBill);

            // Close input modal
            document.getElementById('bill-modal').classList.remove('active');

            // Reset inputs
            nameInput.value = '';
            amountInput.value = '';
            descInput.value = '';
            dateInput.value = '';
            monthsInput.value = '12';

            if (window.showAppModal) {
                window.showAppModal("BERHASIL!", `Jadwal To-Do <strong>${name}</strong> telah disimpan.`);
            } else if (window.soundManager) {
                window.soundManager.playSuccess();
            }
        } catch (err) {
            console.error("Error adding bill:", err);
            if (window.showAppModal) {
                window.showAppModal("ERROR", "Gagal menyimpan data ke Firebase.");
            }
        }
    }

    async paySelectedBill() {
        if (!this.selectedBillId) return;

        const bill = this.bills.find(b => b.id === this.selectedBillId);
        if (!bill) return;

        try {
            if (bill.duration > 1) {
                // Calculate next month's date
                const current = new Date(bill.nextDueDate);
                const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());

                // Handle month-end rollover (e.g. Jan 31 -> Feb 28/29)
                if (nextMonth.getDate() !== current.getDate()) {
                    nextMonth.setDate(0);
                }

                // construct string manually to avoid UTC timezone shift
                const year = nextMonth.getFullYear();
                const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
                const day = String(nextMonth.getDate()).padStart(2, '0');
                const nextDateStr = `${year}-${month}-${day}`;

                await updateDoc(doc(db, this.collectionName, this.selectedBillId), {
                    duration: bill.duration - 1,
                    nextDueDate: nextDateStr
                });

                if (window.showAppModal) {
                    window.showAppModal("BERHASIL!", `Tagihan <strong>${bill.name}</strong> berhasil dibayar.<br>Jatuh tempo berikutnya: <strong>${this.formatDate(nextDateStr)}</strong>`);
                } else if (window.soundManager) {
                    window.soundManager.playSuccess();
                }
            } else {
                // Last payment, remove from list
                await deleteDoc(doc(db, this.collectionName, this.selectedBillId));
                if (window.showAppModal) {
                    window.showAppModal("LUNAS!", `Selamat! Tagihan <strong>${bill.name}</strong> sudah lunas sepenuhnya.`);
                } else if (window.soundManager) {
                    window.soundManager.playSuccess();
                }
            }

            document.body.classList.remove('modal-open');
            document.getElementById('todo-context-menu').classList.remove('active');
            if (window.resumePTR) window.resumePTR();
            this.selectedBillId = null;
        } catch (err) {
            console.error("Error paying bill:", err);
            if (window.showAppModal) {
                window.showAppModal("ERROR", "Gagal update data di Firebase.");
            }
        }
    }

    async deleteBill(id) {
        const bill = this.bills.find(b => b.id === id);
        const billName = bill ? bill.name : "kegiatan";

        if (window.showAppConfirm) {
            window.showAppConfirm("KONFIRMASI HAPUS", `Apakah kamu yakin ingin menghapus <strong>${billName}</strong> dari list?`, async () => {
                try {
                    await deleteDoc(doc(db, this.collectionName, id));
                    if (window.showAppModal) {
                        window.showAppModal("BERHASIL", "Kegiatan berhasil dihapus.");
                    } else if (window.soundManager) {
                        window.soundManager.playClick();
                    }
                } catch (err) {
                    console.error("Error deleting bill:", err);
                }
            });
        } else {
            // Fallback to native confirm if helper not available
            if (confirm(`Hapus ${billName} dari list?`)) {
                try {
                    await deleteDoc(doc(db, this.collectionName, id));
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    formatCurrency(val) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    }

    formatDate(dateStr) {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    getRemainingDays(dateStr) {
        if (!dateStr) return "-";
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);

        const diffTime = target - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'HARI INI';
        if (diffDays < 0) return `${Math.abs(diffDays)} HARI LALU`;
        return `${diffDays} HARI LAGI`;
    }

    showContextMenu(id, e) {
        if (e) e.preventDefault();
        this.selectedBillId = id;
        const menu = document.getElementById('todo-context-menu');
        if (menu) {
            menu.classList.add('active');
            if (window.soundManager) window.soundManager.playClick();
        }
    }

    renderBills() {
        const container = document.getElementById('bills-list-container');
        if (!container) return;

        if (this.bills.length === 0) {
            container.innerHTML = `
                <div class="card" style="box-shadow: none; border: 3px solid #000;">
                    <div class="card-body text-center p-5">
                        <span style="font-size: 3rem; display: block; margin-bottom: 15px;">📋</span>
                        <p class="m-0" style="font-weight: 900;">BELUM ADA KEGIATAN</p>
                        <p class="opacity-70" style="font-size: 0.85rem; margin-top: 5px;">Klik tombol + untuk menambah list baru.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Sort bills by nextDueDate
        const sortedBills = [...this.bills].sort((a, b) => {
            return new Date(a.nextDueDate) - new Date(b.nextDueDate);
        });

        let html = '';
        sortedBills.forEach(bill => {
            const countdown = this.getRemainingDays(bill.nextDueDate);
            const isToday = countdown === 'HARI INI';
            const isOverdue = countdown.includes('LALU');

            html += `
                <div class="card mb-3 todo-item" data-id="${bill.id}" style="box-shadow: none; border: 3px solid #000; position: relative; cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;">
                    <div class="card-body p-3">
                        <div style="flex: 1;">
                            <p style="margin: 0; font-size: 0.7rem; font-weight: 900; color: ${isToday || isOverdue ? '#FF4D4D' : '#666'};">
                                ${isToday ? '⚠️ HARI INI' : '📅 ' + this.formatDate(bill.nextDueDate)} 
                                <span style="margin-left: 5px; background: ${isOverdue ? '#FF4D4D' : '#eee'}; padding: 2px 5px; border-radius: 4px; color: ${isOverdue ? '#fff' : '#000'};">${countdown}</span>
                            </p>
                            <h4 style="margin: 5px 0; font-weight: 900; letter-spacing: 0.5px;">${bill.name}</h4>
                            ${bill.description ? `<p style="margin: 0 0 8px 0; font-size: 0.85rem; opacity: 0.9; font-weight: 900; line-height: 1.2; color: #444;">${bill.description}</p>` : ''}
                            <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                <p style="margin: 0; font-family: 'Courier New', monospace; font-weight: 900; font-size: 1.1rem; color: #000;">
                                    ${this.formatCurrency(bill.amount)}
                                </p>
                                <span style="background: #000; color: white; font-size: 0.6rem; padding: 2px 6px; font-weight: 900; border-radius: 4px;">
                                    SISA ${bill.duration} BULAN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Setup long press and right click for each item
        const items = container.querySelectorAll('.todo-item');
        items.forEach(item => {
            const id = item.getAttribute('data-id');
            item.oncontextmenu = (e) => this.showContextMenu(id, e);
            item.ontouchstart = (e) => {
                this.longPressTimer = setTimeout(() => {
                    this.showContextMenu(id);
                }, 600);
            };
            item.ontouchend = () => clearTimeout(this.longPressTimer);
            item.ontouchmove = () => clearTimeout(this.longPressTimer);
        });
    }
}

// Initialize on load
const billManager = new BillManager();
window.billManager = billManager;
