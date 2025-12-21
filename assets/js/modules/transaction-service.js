/**
 * Transaction Service Module
 * Handles Database Logic
 */

import { db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, fetchAssetPrices } from "../api.js";

let incomeData = [];
let expensesData = [];
let assetPrices = { bitcoin: 0, ethereum: 0, zerebro: 0 };
let onDataChangeCallback = null;

export function initTransactionService(onDataChange) {
    onDataChangeCallback = onDataChange;

    console.log('🔗 Connecting to Firestore...');

    // Real-time listeners
    const qIncome = query(collection(db, "income"), orderBy("createdAt", "desc"));
    const qExpenses = query(collection(db, "expenses"), orderBy("createdAt", "desc"));

    onSnapshot(qIncome, (snapshot) => {
        console.log(`📥 Income Update: ${snapshot.docs.length} docs`);
        incomeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        processData();
    }, (err) => console.error("❌ Income Listen Error", err));

    onSnapshot(qExpenses, (snapshot) => {
        console.log(`📤 Expense Update: ${snapshot.docs.length} docs`);
        expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        processData();
    }, (err) => console.error("❌ Expense Listen Error", err));

    // Asset Prices
    updateAssetPrices();
    setInterval(updateAssetPrices, 60000);
}

async function updateAssetPrices() {
    const data = await fetchAssetPrices();
    if (data) {
        assetPrices.bitcoin = data.bitcoin?.idr || 0;
        assetPrices.ethereum = data.ethereum?.idr || 0;
        assetPrices.zerebro = data.zerebro?.idr || 0;
        processData();
    }
}
window.forceUpdateAssets = updateAssetPrices;

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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper for safe date parsing
    const getDate = (item) => (item.createdAt && typeof item.createdAt.toDate === 'function') ? item.createdAt.toDate() : new Date();

    const allTransactions = [...incomeData, ...expensesData].sort((a, b) => getDate(b) - getDate(a));

    allTransactions.forEach((item) => {
        const itemDate = getDate(item);
        const isThisMonth = itemDate >= startOfMonth;

        if (item.cat === 'INCOME') {
            totalIncome += item.amount;
            totalBalance += item.amount;
            if (isThisMonth) monthlyIncome += item.amount;
        } else if (item.cat === 'INVEST' || item.cat === 'BITCOIN') {
            const price = assetPrices[item.asset || 'bitcoin'] || 0;
            totalInvestIDR += Math.round(item.amount * price);
        } else {
            totalExpense += item.amount;
            totalBalance -= item.amount;
            if (isThisMonth) monthlyExpense += item.amount;

            // Sum Categories
            if (!categorySums[item.cat]) categorySums[item.cat] = 0;
            categorySums[item.cat] += item.amount;
        }
    });

    const cashBalance = totalIncome - totalExpense;
    const finalTotalValue = cashBalance + totalInvestIDR;

    onDataChangeCallback({
        allTransactions,
        cashBalance,
        finalTotalValue,
        totalExpense,
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
    await updateDoc(doc(db, collectionName, id), docData);
}

export async function deleteTransaction(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
}
