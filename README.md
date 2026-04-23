# ⚡ HRDOC AI

> Generator dokumen HR berbasis AI — buat dokumen HR yang profesional dan siap pakai dalam hitungan detik.

Dibuat oleh **Alfi Syahr Nur Widenky**

---

## ✨ Fitur

- **13 jenis dokumen HR** yang bisa di-generate otomatis dengan AI
- **Bilingual** — output tersedia dalam Bahasa Indonesia & English
- **Profil Perusahaan** — isi sekali, otomatis terpakai di semua dokumen
- **Riwayat dokumen** — tersimpan lokal, bisa dilihat & di-export ulang
- **Export** ke `.txt` dan `.html` siap cetak
- **Dark mode UI** dengan desain modern

---

## 📄 Dokumen yang Tersedia

| Kategori | Dokumen |
|---|---|
| Perencanaan | MPP (Man Power Planning) |
| Rekrutmen | Job Description |
| Legal | PKS, Kontrak Kerja, PKB |
| Operasional | SOP |
| Penilaian | KPI, Performance Appraisal |
| Disiplin | Surat Peringatan (SP1/SP2/SP3) |
| Administrasi | Berita Acara, Surat Mutasi/Promosi, Checklist Onboarding, Checklist Offboarding |
| Pengembangan | TNA (Training Needs Analysis) |

---

## 🚀 Cara Pakai

### 1. Clone repo

```bash
git clone https://github.com/username/hrdoc-ai.git
cd hrdoc-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Jalankan

```bash
npm run dev
```

### 4. Setup API Key

- Buka app di browser
- Klik ikon kunci 🔑 di navbar
- Masukkan **Gemini API Key** kamu ([dapatkan di sini](https://aistudio.google.com/app/apikey))
- Simpan — siap digunakan!

---

## 🛠️ Tech Stack

- **React** — UI framework
- **Google Gemini 2.0 Flash** — AI engine untuk generate dokumen
- **localStorage** — penyimpanan riwayat & profil perusahaan
- **Vanilla CSS-in-JS** — styling tanpa library tambahan
- **Google Fonts** — Playfair Display, DM Sans, DM Mono

---

## 📁 Struktur Project

```
hrdoc-ai/
├── hr-doc-ai.jsx   # Komponen utama (single-file app)
└── README.md
```

---

## ⚙️ Konfigurasi

Semua konfigurasi ada di bagian atas file `hr-doc-ai.jsx`:

```js
const STORAGE_KEY_HISTORY = "hrdoc_history";      // key localStorage riwayat
const STORAGE_KEY_PROFILE = "hrdoc_company_profile"; // key localStorage profil
```

Untuk menambah jenis dokumen baru, cukup tambahkan objek baru ke array `DOC_TYPES`.

---

## 📝 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

<p align="center">Crafted with ♥ by <strong>Alfi Syahr Nur Widenky</strong></p>
