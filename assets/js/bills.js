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
            this.updateGlobalMarquee();
        });
    }

    updateGlobalMarquee() {
        const marqueeEl = document.getElementById('marquee-content');
        if (!marqueeEl) return;

        if (this.bills.length === 0) {
            marqueeEl.innerText = "BELUM ADA JADWAL KEGIATAN MAUPUN TAGIHAN.";
            return;
        }

        // Sort by date
        const sorted = [...this.bills].sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

        const messages = sorted.map(bill => {
            const nextDate = bill.nextDueDate;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const target = new Date(nextDate);
            target.setHours(0, 0, 0, 0);

            const diffTime = target - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let dateInfo = "";
            if (diffDays === 0) {
                dateInfo = "HARI INI";
            } else if (diffDays > 0 && diffDays <= 7) {
                dateInfo = `AKAN JATUH TEMPO DALAM ${diffDays} HARI`;
            } else if (diffDays < 0) {
                dateInfo = `${Math.abs(diffDays)} HARI TERLEWAT`;
            } else {
                dateInfo = `PADA ${this.formatDate(nextDate)}`;
            }

            return `TAGIHAN ${bill.name} SEBESAR ${this.formatCurrency(bill.amount)} ${dateInfo}`;
        });

        marqueeEl.innerText = messages.join(" • ");
    }

    setupEventListeners() {
        // Expose marquee update globally just in case
        window.updateTodoMarquee = () => this.updateGlobalMarquee();
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
                    document.getElementById('bill-modal').classList.remove('active');
                    if (window.soundManager) window.soundManager.playClick();
                };
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
                        document.getElementById('todo-context-menu').classList.remove('active');
                    }
                };
            }
            if (closeContextBtn && !closeContextBtn.onclick) {
                closeContextBtn.onclick = () => {
                    document.getElementById('todo-context-menu').classList.remove('active');
                    if (window.soundManager) window.soundManager.playClick();
                };
            }
        }, 1000);
    }

    showModal() {
        const modal = document.getElementById('bill-modal');
        if (modal) {
            modal.classList.add('active');
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

            document.getElementById('todo-context-menu').classList.remove('active');
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
