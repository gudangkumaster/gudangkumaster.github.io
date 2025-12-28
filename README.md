# 💰 GUDANGDUIT: NEO-BRUTALISM FINANCE

> **"Financial Tracking, But Make It Raw & Interactive."**

![Status](https://img.shields.io/badge/STYLE-NEOBRUTALISM-black?style=for-the-badge&logo=css3&logoColor=white)
![Status](https://img.shields.io/badge/AI-GEMINI_FLASH-FFDE00?style=for-the-badge&logo=google&logoColor=black)
![Status](https://img.shields.io/badge/INTERACTION-HAPTIC_&_SOUND-FF4D4D?style=for-the-badge&logo=rss&logoColor=white)

---

## 🚧 WHAT IS THIS?

**GudangDuit** adalah aplikasi pencatat keuangan dengan gaya **Neo-Brutalism**.
Tanpa gradien halus, tanpa shadow lembut. Semuanya **TEBAL, KONTRAS, dan JUJUR**.

Dibangun dengan **Vanilla JS** murni untuk performa maksimal, terintegrasi dengan **Firebase Firestore** untuk data realtime, dan **Google Gemini AI** untuk scan struk otomatis.

---

## 🔥 NEW INTERACTIVE FEATURES

### 1. 🚨 Smart Contextual Alert (Jumbotron)
Alert pintar di halaman utama yang **hanya muncul jika penting**. Tidak ada spam.
**Logika Prioritas:**
1.  🔴 **URGENT BILLS**: Jika ada tagihan H-7 atau Terlewat → *Background Merah/Kuning.*
2.  🟠 **SPAM WARNING**: Jika Anda jajan kategori yang sama 3x berturut-turut → *"Polisi Jajan" menegur Anda.*
3.  ⚪ **EMPTY STATE**: Jika aman, alert menghilang (bersih).

> **Customization:** Bisa dimatikan total via **Settings > Home Appearance**.

### 2. ⬇️ Physics-Based Pull-To-Refresh
Bukan sekadar icon muter. Rasakan interaksinya:
- **Push Down**: Menarik layar akan **mendorong** seluruh konten ke bawah (bukan menimpa).
- **Over-Pull Warning**: Tarik terlalu kencang? Background jadi **MERAH** dengan pesan **"WOAH! SANTAI BOSS!"** 🛑
- **Haptic Feedback**: Getaran halus saat refresh berhasil.

### 3. 🤖 Gemini AI Scanner (Secure)
Scan struk belanjaan Anda, AI akan otomatis:
- Mendeteksi Nama Merchant (PT/CV).
- Mendeteksi Total Harga.
- Menentukan Kategori (FOOD, TRANSPORT, dll).
> **Security:** API Key disimpan lokal di browser Anda. Sekarang input terproteksi (masking) dan bisa dihapus kapan saja.

### 4. 🔊 Sound Packs & Lofi Mode
Bosan sunyi? Nyalakan **Sound Effects** di Settings.
- **Click Sounds**: Classic, Pop, Bubble, Retro.
- **Alert Sounds**: Success, Chaching (Duit!), Hi Dog.
- **Lofi BGM**: Musik latar santai agar tidak stres melihat pengeluaran.

---

## 🛠️ TECH STACK

| COMPONENT | TECH | NOTE |
|-----------|------|------|
| **Core** | HTML5 / CSS3 | Raw power. No framework overhead. |
| **Logic** | Vanilla JS (ES6+) | Modular architecture (MVC-ish). |
| **Backend** | Firebase Firestore | Realtime database syncing. |
| **AI** | Google Gemini 1.5 | Multimodal vision & reasoning. |
| **style** | Neo-Brutalism | 3px Borders. Hard Shadows. Bold Type. |

---

## 🎨 DESIGN SYSTEM

Our design philosophy is simple:
1.  **Borders**: `3px solid black`. Always.
2.  **Shadows**: `Hard Offset`. No blurs.
3.  **Colors**:
    -   🟨 `#FFDE00` (Warning/Main)
    -   🟦 `#23A6F0` (Info)
    -   🟥 `#FF4D4D` (Urgent/Danger)
    -   🟧 `#FF9F43` (Alert/Spam)
    -   🟣 `#A388EE` (Accents)

---

## 🚀 CARA PAKAI (LOCAL)

1.  **Clone Repo**:
    ```bash
    git clone https://github.com/nadya/gudangduit-neo.git
    ```
2.  **Serve It (Wajib pakai Server)**:
    Karena kebijakan CORS ES6 Modules, jangan buka file langsung.
    ```bash
    npx serve .
    ```
3.  **Setup API Key**:
    - Buka menu **Settings**.
    - Masukkan **Gemini API Key** Anda untuk fitur Scanner.
    - (Firebase Config sudah tertanam di `api.js`, ganti jika punya project sendiri).

---

## 🛡️ "NUCLEAR" PTR LOGIC

Kami mengatasi konflik antara **Pull-To-Refresh** vs **Modal** dengan "Nuclear Lifecycle":
- **Modal Open** = `pausePTR()` (Mematikan fungsi refresh agar tidak scroll tidak sengaja).
- **Modal Close** = `resumePTR()` (Menghidupkan kembali fungsi refresh).

---

**Made with 💻, ☕, and 3px Borders.**
