/**
 * Transaction Service Module
 * Handles Database Logic
 * ES Module Format
 */

import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, serverTimestamp, fetchAssetPrices, query } from '../api.js';

let incomeData = [];
let expensesData = [];
let assetPrices = { bitcoin: 0, ethereum: 0, zerebro: 0 };
let onDataChangeCallback = null;

export function initTransactionService(onDataChange) {
    if (onDataChange) {
        onDataChangeCallback = onDataChange;
    }

    console.log('🔗 Connecting to Firestore...');

    // Real-time listeners
    const incomeRef = query(collection(db, "income"), orderBy("createdAt", "desc"));
    onSnapshot(incomeRef, (snapshot) => {
        console.log(`📥 Income Update: ${snapshot.docs.length} docs`);
        incomeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        processData();
    }, (err) => {
        console.error("❌ Income Listen Error", err);
        if (window.showModal) window.showModal("ERROR", "Gagal memuat data Transaksi (Income). Cek koneksi internet.");
    });

    const expenseRef = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    onSnapshot(expenseRef, (snapshot) => {
        console.log(`📤 Expense Update: ${snapshot.docs.length} docs`);
        expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        processData();
    }, (err) => {
        console.error("❌ Expense Listen Error", err);
        if (window.showModal) window.showModal("ERROR", "Gagal memuat data Transaksi (Expense). Cek koneksi internet.");
    });

    // Asset Prices
    updateAssetPrices();
    setInterval(updateAssetPrices, 60000);
}

export async function updateAssetPrices() {
    const data = await fetchAssetPrices();
    if (data) {
        assetPrices.bitcoin = data.bitcoin?.idr || 0;
        assetPrices.ethereum = data.ethereum?.idr || 0;
        assetPrices.zerebro = data.zerebro?.idr || 0;
        processData();
    }
}

// Calculate totals and notify UI
function processData() {
    if (!onDataChangeCallback) return;

    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestIDR = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const categorySums = {}; // Will populate dynamically

    const now = new Date();
    // Salary Cycle: 25th of Previous Month to 24th of Current Month
    // Example: Today is Jan 10. Cycle is Dec 25 - Jan 24.
    // Example: Today is Jan 26. Cycle is Jan 25 - Feb 24.

    let cycleStart, cycleEnd;

    if (now.getDate() >= 25) {
        // We are in the "Next Month's" cycle (e.g., Jan 26 belongs to Feb report)
        cycleStart = new Date(now.getFullYear(), now.getMonth(), 25);
        cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 24, 23, 59, 59);
    } else {
        // We are in the "Current Month's" cycle (e.g., Jan 10 belongs to Jan report, started Dec 25)
        cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, 25);
        cycleEnd = new Date(now.getFullYear(), now.getMonth(), 24, 23, 59, 59);
    }

    // Helper for safe date parsing
    const getDate = (item) => (item.createdAt && typeof item.createdAt.toDate === 'function') ? item.createdAt.toDate() : new Date();

    const allTransactions = [...incomeData, ...expensesData].sort((a, b) => getDate(b) - getDate(a));

    allTransactions.forEach((item) => {
        const itemDate = getDate(item);
        // Check if item is within current salary cycle
        const isThisCycle = itemDate >= cycleStart && itemDate <= cycleEnd;

        if (item.cat === 'INCOME') {
            totalIncome += item.amount;
            totalBalance += item.amount;
            if (isThisCycle) monthlyIncome += item.amount;
        } else if (item.cat === 'INVEST' || item.cat === 'BITCOIN') {
            const price = assetPrices[item.asset || 'bitcoin'] || 0;
            // Legacy support: if coinAmount missing, use amount (old behavior)
            const qty = (item.coinAmount !== undefined) ? item.coinAmount : item.amount;
            totalInvestIDR += Math.round(qty * price);

            // Deduct from Cash (Treat as Expense)
            totalExpense += item.amount;
            totalBalance -= item.amount;
            if (isThisCycle) monthlyExpense += item.amount;

            // Add to Category Sums (so it shows in charts/budget)
            if (isThisCycle) {
                if (!categorySums[item.cat]) categorySums[item.cat] = 0;
                categorySums[item.cat] += item.amount;
            }
        } else {
            totalExpense += item.amount;
            totalBalance -= item.amount;
            if (isThisCycle) monthlyExpense += item.amount;

            // Sum Categories if in cycle
            if (isThisCycle) {
                if (!categorySums[item.cat]) categorySums[item.cat] = 0;
                categorySums[item.cat] += item.amount;
            }
        }
    });

    const cashBalance = totalIncome - totalExpense;
    const finalTotalValue = cashBalance + totalInvestIDR;

    onDataChangeCallback({
        allTransactions,
        cashBalance,
        finalTotalValue,
        totalExpense, // All Time (kept for reference)
        monthlyExpense, // New: For Dashboard
        monthlyIncome,  // New: For Dashboard if needed
        totalInvest: totalInvestIDR,
        categorySums
    });
}

export async function addTransaction(docData) {
    const collectionName = (docData.cat === 'INCOME' || docData.cat === 'INVEST' || docData.cat === 'BITCOIN') ? 'income' : 'expenses';
    docData.createdAt = serverTimestamp();
    await addDoc(collection(db, collectionName), docData);
}

export async function updateTransaction(collectionName, id, docData) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, docData);
}

export async function deleteTransaction(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
}

// Helper to re-export useful imports if needed, or just keep them internal
// import { query } from '../api.js'; // Removed redundant import
