/**
 * Scanner Module
 * Handles Gemini AI Receipt Scanning
 */

import { scanReceiptWithGemini } from "../api.js";
import { showModal } from "./modals.js";
import { addTransaction } from "./transaction-service.js"; // Direct save

let currentScanFile = null;

export function initScanner() {
    const scanBtn = document.getElementById('scan-trigger');
    const scanOptionsModal = document.getElementById('scan-options-modal');
    const useCameraBtn = document.getElementById('use-camera');
    const useFileBtn = document.getElementById('use-file');
    const fileInput = document.getElementById('receipt-file-input');
    const cameraInput = document.getElementById('camera-capture-input');
    const cancelScanBtn = document.getElementById('cancel-scan');

    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playClick();
            scanOptionsModal.classList.add('active');
        });
    }

    if (useCameraBtn) {
        useCameraBtn.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playClick(); // Was 'scan'
            cameraInput.click();
        });
    }

    if (useFileBtn) {
        useFileBtn.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playClick(); // Was 'scan'
            fileInput.click();
        });
    }

    // Input Change handlers
    if (cameraInput) {
        cameraInput.addEventListener('change', (e) => handleFileSelect(e));
    }
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFileSelect(e));
    }

    if (cancelScanBtn) {
        cancelScanBtn.addEventListener('click', () => {
            document.getElementById('scanner-modal').classList.remove('active');
        });
    }
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        currentScanFile = e.target.files[0];
        startScanProcess();
    }
}

function startScanProcess() {
    const scannerModal = document.getElementById('scanner-modal');
    const scanOptionsModal = document.getElementById('scan-options-modal');
    const scanPreview = document.getElementById('scan-preview');
    const scanTitle = document.getElementById('scan-title');
    const scanStatus = document.getElementById('scan-status');
    const scanLoader = document.getElementById('scan-loader');
    const scanBar = document.getElementById('scan-bar');

    // UI Reset
    scanOptionsModal.classList.remove('active');
    scannerModal.classList.add('active');

    // Preview
    if (currentScanFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            scanPreview.src = e.target.result;
            scanPreview.style.display = 'block';
        };
        reader.readAsDataURL(currentScanFile);
    }

    // Animation Phase 1
    scanTitle.innerText = 'SEDANG MEMINDAI...';
    scanStatus.innerText = 'Memproses gambar...';
    scanBar.style.display = 'block';
    scanLoader.style.display = 'none';

    setTimeout(async () => {
        if (!currentScanFile) {
            scannerModal.classList.remove('active');
            showModal("ERROR", "Tidak ada gambar yang dipilih!");
            return;
        }

        // Animation Phase 2 (AI)
        scanTitle.innerText = 'MENGANALISIS DENGAN AI';
        scanStatus.innerText = 'Gemini sedang membaca struk...';
        scanBar.style.display = 'none';
        scanLoader.style.display = 'block';

        try {
            const result = await scanReceiptWithGemini(currentScanFile);
            processScanResult(result);
            scannerModal.classList.remove('active');
        } catch (error) {
            console.error("Scan error:", error);
            scannerModal.classList.remove('active');
            if (window.soundManager) window.soundManager.playError();
            showModal("SCAN GAGAL", "Gagal memindai struk. Silakan coba lagi atau input manual.");
        }
    }, 2000);
}

async function processScanResult(result) {
    // Determine background class
    let bgClass = "bg-yellow";
    if (result.category === "INCOME") bgClass = "bg-green";
    else if (result.category === "FOOD") bgClass = "bg-yellow";
    else if (result.category === "BILLS") bgClass = "bg-pink";
    else if (result.category === "SHOPPING") bgClass = "bg-orange";
    else if (result.category === "LEISURE") bgClass = "bg-purple";
    else if (result.category === "TRANSPORT") bgClass = "bg-blue";
    else if (result.category === "HEALTH") bgClass = "bg-cyan";
    else if (result.category === "EDUCATION") bgClass = "bg-white";

    const newDoc = {
        amount: result.amount,
        desc: result.description,
        cat: result.category,
        bg: bgClass
    };

    // Save directly via service
    try {
        await addTransaction(newDoc);
        if (window.soundManager) window.soundManager.playSuccess();

        showModal(
            "SCAN BERHASIL",
            `Berhasil memindai struk:<br><strong>${result.description}</strong><br>Rp ${result.amount.toLocaleString()}<br>Kategori: ${result.category}`
        );
    } catch (e) {
        showModal("ERROR", "Gagal menyimpan hasil scan.");
    }

    // Cleanup
    currentScanFile = null;
    const scanPreview = document.getElementById('scan-preview');
    if (scanPreview) {
        scanPreview.style.display = 'none';
        scanPreview.src = '';
    }
}
