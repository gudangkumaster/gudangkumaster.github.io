# 💰 NEO-FIN: BRUTALISM TRACKER

> **"FINANCE APP BUT MAKE IT RAW."**

![Status](https://img.shields.io/badge/STYLE-NEOBRUTALISM-black?style=for-the-badge&logo=css3&logoColor=white)
![Status](https://img.shields.io/badge/AI-GEMINI_FLASH-FFDE00?style=for-the-badge&logo=google&logoColor=black)
![Status](https://img.shields.io/badge/VIBE-LOFI_CHILL-FF90E8?style=for-the-badge&logo=apple-music&logoColor=black)

---

## 🚧 WHAT IS THIS?

This isn't your boring, corporate blue finance tracker. This is **NEO-FIN**. 
It uses **hard shadows**, **bold borders**, and **high-contrast colors** to force you to look at your spending habits. 

Built with **Vanilla JS** because frameworks are for people who like loading spinners.

---

## 🔥 KILLER FEATURES

### 🤖 Gemini AI Receipt Scanner
Stop typing manually. Snap a photo of your receipt, and our integrated **Google Gemini 1.5 Flash** model extracts:
- Items list
- Total price
- Date & Merchant
*...all in seconds.*

### 🎵 Chill Mode (BGM)
Focus on your finances with built-in **Lofi Beats**. 
- Random shuffle logic
- Persistence across reloads
- Toggle in Settings (because consent matters)

### 📊 Brutal Analytics
- **Dynamic Charts**: Visualise your financial ruin (or success).
- **In-Your-Face Budgeting**: Progress bars that judge you when you hit 90%.

### ⚡ Performance Features
- **PWA Ready**: Works offline-ish.
- **Nuclear PTR**: Custom Pull-To-Refresh logic that actually behaves.
- **Smart Caching**: Cache API integration for heavy assets (audio/models).

---

## 🛠️ TECH STACK

| COMPONENT | TECH | WHY? |
|-----------|------|------|
| **Core** | HTML5 / CSS3 | Raw power. No compilation. |
| **Logic** | Vanilla JS (ES6+) | Blazing fast DOM manipulation. |
| **Backend** | Firebase Firestore | Realtime database syncing. |
| **AI** | Google Gemini API | Multimodal vision & reasoning. |
| **Design** | Hand-coded CSS | Neobrutalism requires soul. |

---

## 🎨 DESIGN SYSTEM

Our design philosophy is simple:
1.  **Borders**: `3px solid black`. Always.
2.  **Shadows**: `8px 8px 0px 0px`. Hard. Default.
3.  **Colors**:
    -   🟨 `#FFDE00` (Warning/Main)
    -   🟦 `#23A6F0` (Primary)
    -   🟥 `#FF4D4D` (Danger)
    -   🟩 `#00F0B5` (Success)
    -   👿 `#A388EE` (Purple Accents)

---

## 🚀 HOW TO RUN

1.  **Clone it**:
    ```bash
    git clone https://github.com/nadya/neofin-brutal.git
    ```
2.  **Open it**:
    Just open `index.html` in your browser. Or serve it:
    ```bash
    npx serve .
    ```
3.  **Configure API**:
    Make sure `api.js` has your Firebase config. (It's hidden, don't steal it).

---

## 🛡️ "NUCLEAR OPTION" PTR

We solved the infamous Pull-To-Refresh vs Modal conflict by implementing a **Nuclear Lifecycle**:
- **Modal Open** = `pausePTR()` (Destroys the library instance).
- **Modal Close** = `resumePTR()` (Reincarnates the library).

*Scroll safely, friends.*

---

**Made with 💻 and ☕ by Gudangku Team.**

