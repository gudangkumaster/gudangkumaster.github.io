// Firebase & Core Logic (Reusable API)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8kFvtagX4Sh7QxYfbaWg-EA_wrnMqIS8",
    authDomain: "gudangku-b2f1c.firebaseapp.com",
    projectId: "gudangku-b2f1c",
    storageBucket: "gudangku-b2f1c.firebasestorage.app",
    messagingSenderId: "831244468806",
    appId: "1:831244468806:web:f204afb499683bac1f4047",
    measurementId: "G-9C92GS7CWT"
};

// Initialize
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics can fail due to adblockers, don't let it crash the app
try {
    getAnalytics(app);
    console.log("📊 Firebase Analytics initialized");
} catch (e) {
    console.warn("⚠️ Firebase Analytics failed to initialize:", e.message);
}

console.log("🔥 Firebase / Firestore connected successfully");

// Export Firestore utilities
export { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc };

// CoinGecko API fetching
export async function fetchAssetPrices(assetIds = 'bitcoin,ethereum,zerebro') {
    try {
        console.log('📡 Calling CoinGecko API...');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${assetIds}&vs_currencies=idr&include_24hr_change=true`);

        if (!response.ok) {
            console.error('❌ CoinGecko API error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        console.log('✅ CoinGecko response:', data);
        return data;
    } catch (err) {
        console.error("❌ Error fetching asset prices:", err);
        return null;
    }
}
// Multi-Source Indonesian News API (Berita Indo)
export async function fetchIndoNews() {
    const sources = [
        'https://berita-indo-api-next.vercel.app/api/cnbc-news/market',
        'https://berita-indo-api-next.vercel.app/api/cnn-news/ekonomi',
        'https://berita-indo-api-next.vercel.app/api/republika-news/ekonomi'
    ];

    try {
        const fetchPromises = sources.map(url => fetch(url).then(res => res.json()));
        const results = await Promise.all(fetchPromises);

        // Flatten all news data into one array
        let allNews = [];
        results.forEach(res => {
            if (res.data) allNews = [...allNews, ...res.data];
        });

        return allNews;
    } catch (err) {
        console.error("Error fetching multi-source news:", err);
        return [];
    }
}

// Image compression helper
async function compressImage(file, maxSizeKB = 200) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions (max 1920px width)
                const maxWidth = 1920;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Try different quality levels to get under maxSizeKB
                let quality = 0.9;
                const tryCompress = () => {
                    canvas.toBlob((blob) => {
                        const sizeKB = blob.size / 1024;
                        if (sizeKB <= maxSizeKB || quality <= 0.1) {
                            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        } else {
                            quality -= 0.1;
                            tryCompress();
                        }
                    }, 'image/jpeg', quality);
                };
                tryCompress();
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Gemini AI Receipt Scanner
const GEMINI_API_KEY = 'AIzaSyD6out1E3U6uvip-4__mpolzUP62NKx0R4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export async function scanReceiptWithGemini(imageFile) {
    try {
        // Compress image first
        const compressedFile = await compressImage(imageFile, 200);
        console.log(`Image compressed: ${(imageFile.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);

        // Convert image to base64
        const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
        });

        // Prepare Gemini API request
        const prompt = `Analyze this receipt image and extract transaction details.
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "amount": <number>,
  "description": "<merchant or item name>",
  "category": "<one of: FOOD, BILLS, SHOPPING, LEISURE, TRANSPORT, HEALTH, EDUCATION, INCOME>"
}

Rules:
- amount must be a number (no currency symbols, no commas)
- description should be the COMPLETE merchant/company name as shown on receipt (uppercase, include PT./CV./UD. if present)
- category must match one of: FOOD, BILLS, SHOPPING, LEISURE, TRANSPORT, HEALTH, EDUCATION, INCOME
- IMPORTANT: If you see account number "1280681209" as the DESTINATION/RECEIVING account (Ke/To/Penerima), this is an INCOMING TRANSFER, set category to "INCOME" and description to the sender name or "TRANSFER MASUK"
- If unclear, use best judgment based on receipt content`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: compressedFile.type,
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text;

        // Parse JSON from response (remove markdown if present)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const result = JSON.parse(jsonMatch[0]);

        // Validate result
        if (!result.amount || !result.description || !result.category) {
            throw new Error('Invalid response structure');
        }

        return {
            amount: parseFloat(result.amount),
            description: result.description.toUpperCase(),
            category: result.category.toUpperCase()
        };

    } catch (err) {
        console.error("Error scanning receipt with Gemini:", err);
        throw err;
    }
}
