import { useState, useEffect, useRef, useCallback } from "react";

// ─── GOOGLE FONTS ────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STORAGE_KEY_HISTORY = "hrdoc_history";
const STORAGE_KEY_PROFILE = "hrdoc_company_profile";

const LANG_OPTIONS = [
  { value: "id", label: "🇮🇩 Indonesia" },
  { value: "en", label: "🇺🇸 English" },
];

const SP_TYPES = ["SP-1 (Pertama)", "SP-2 (Kedua)", "SP-3 (Ketiga / PHK)"];

const DOC_TYPES = [
  {
    id: "mpp", label: "MPP", full: "Man Power Planning", icon: "👥",
    desc: "Perencanaan kebutuhan tenaga kerja tahunan", color: "#3B82F6", cat: "Perencanaan",
    fields: [
      { key: "divisi", label: "Divisi / Departemen", type: "text", placeholder: "Teknologi Informasi" },
      { key: "periode", label: "Periode Perencanaan", type: "text", placeholder: "Januari – Desember 2025" },
      { key: "jumlah_existing", label: "Jumlah Karyawan Existing", type: "number", placeholder: "50" },
      { key: "target_rekrutmen", label: "Target Rekrutmen", type: "number", placeholder: "10" },
      { key: "posisi", label: "Posisi yang Dibutuhkan", type: "textarea", placeholder: "Frontend Developer, Backend Developer, QA Engineer..." },
      { key: "alasan", label: "Justifikasi / Alasan", type: "textarea", placeholder: "Ekspansi bisnis, penggantian resign, proyek baru..." },
      { key: "anggaran", label: "Estimasi Anggaran Rekrutmen", type: "text", placeholder: "Rp 50.000.000" },
    ],
  },
  {
    id: "pks", label: "PKS", full: "Perjanjian Kerja Sama", icon: "🤝",
    desc: "Kontrak kerjasama antara dua pihak", color: "#8B5CF6", cat: "Legal",
    fields: [
      { key: "pihak_kedua", label: "Nama Pihak Kedua", type: "text", placeholder: "CV. Solusi Digital" },
      { key: "jabatan_pihak_kedua", label: "Jabatan / Jabatan Pihak Kedua", type: "text", placeholder: "Direktur" },
      { key: "jenis_kerjasama", label: "Jenis Kerjasama", type: "text", placeholder: "Penyediaan Jasa IT / Outsourcing" },
      { key: "nilai_kontrak", label: "Nilai Kontrak", type: "text", placeholder: "Rp 500.000.000" },
      { key: "durasi", label: "Durasi Perjanjian", type: "text", placeholder: "12 bulan (1 Jan – 31 Des 2025)" },
      { key: "lingkup", label: "Lingkup Pekerjaan", type: "textarea", placeholder: "Deskripsi detail pekerjaan yang disepakati..." },
      { key: "kewajiban", label: "Kewajiban & Hak Masing-masing Pihak", type: "textarea", placeholder: "Pihak pertama wajib..., Pihak kedua berhak..." },
      { key: "sanksi", label: "Sanksi & Penyelesaian Sengketa", type: "textarea", placeholder: "Denda keterlambatan, mediasi, pengadilan negeri..." },
    ],
  },
  {
    id: "sop", label: "SOP", full: "Standard Operating Procedure", icon: "📋",
    desc: "Prosedur standar operasional kerja", color: "#10B981", cat: "Operasional",
    fields: [
      { key: "departemen", label: "Departemen", type: "text", placeholder: "Human Resources" },
      { key: "judul_sop", label: "Judul SOP", type: "text", placeholder: "SOP Rekrutmen dan Seleksi Karyawan" },
      { key: "tujuan", label: "Tujuan SOP", type: "textarea", placeholder: "Menetapkan standar proses rekrutmen yang efektif..." },
      { key: "ruang_lingkup", label: "Ruang Lingkup", type: "textarea", placeholder: "Berlaku untuk semua proses rekrutmen di seluruh divisi..." },
      { key: "prosedur", label: "Langkah-langkah Prosedur", type: "textarea", placeholder: "1. Identifikasi kebutuhan\n2. Posting lowongan\n3. Seleksi CV..." },
      { key: "pihak_terkait", label: "Pihak Terkait", type: "text", placeholder: "HR Manager, Hiring Manager, Direksi" },
      { key: "dokumen_terkait", label: "Dokumen Terkait", type: "text", placeholder: "Form permintaan karyawan, checklist interview..." },
    ],
  },
  {
    id: "jd", label: "Job Desc", full: "Job Description", icon: "📝",
    desc: "Deskripsi pekerjaan dan tanggung jawab", color: "#F59E0B", cat: "Rekrutmen",
    fields: [
      { key: "posisi", label: "Nama Jabatan / Posisi", type: "text", placeholder: "Senior Frontend Developer" },
      { key: "departemen", label: "Departemen", type: "text", placeholder: "Engineering" },
      { key: "atasan", label: "Melapor Kepada", type: "text", placeholder: "Engineering Manager" },
      { key: "ringkasan", label: "Ringkasan Pekerjaan", type: "textarea", placeholder: "Bertanggung jawab atas pengembangan antarmuka pengguna..." },
      { key: "tugas", label: "Tugas & Tanggung Jawab Utama", type: "textarea", placeholder: "1. Merancang UI/UX\n2. Menulis kode React\n3. Code review..." },
      { key: "kualifikasi", label: "Kualifikasi & Persyaratan", type: "textarea", placeholder: "Min. S1 Informatika, 3 tahun pengalaman, mahir React..." },
      { key: "kompensasi", label: "Range Gaji / Benefit (opsional)", type: "text", placeholder: "Rp 8–12 jt / bulan + BPJS + bonus" },
    ],
  },
  {
    id: "kpi", label: "KPI", full: "Key Performance Indicator", icon: "📊",
    desc: "Indikator kinerja karyawan & tim", color: "#EF4444", cat: "Penilaian",
    fields: [
      { key: "nama", label: "Nama Karyawan / Tim", type: "text", placeholder: "Budi Santoso / Divisi Sales" },
      { key: "jabatan", label: "Jabatan", type: "text", placeholder: "Sales Manager" },
      { key: "periode", label: "Periode Penilaian", type: "text", placeholder: "Q1 2025 (Januari – Maret)" },
      { key: "target_bisnis", label: "Target Bisnis Utama", type: "textarea", placeholder: "Meningkatkan revenue 20%, acquire 50 klien baru..." },
      { key: "indikator", label: "Indikator Kinerja yang Diukur", type: "textarea", placeholder: "Revenue, jumlah klien baru, conversion rate, CSAT..." },
      { key: "bobot", label: "Catatan Bobot / Prioritas", type: "textarea", placeholder: "Revenue paling penting (40%), kepuasan pelanggan (30%)..." },
      { key: "target_angka", label: "Target Angka / Kuantitatif", type: "textarea", placeholder: "Revenue Rp 2 M, klien baru min 50, CSAT > 4.5/5..." },
    ],
  },
  {
    id: "kontrak", label: "Kontrak Kerja", full: "Perjanjian Kerja Karyawan", icon: "📄",
    desc: "PKWT / PKWTT antara perusahaan & karyawan", color: "#6366F1", cat: "Legal",
    fields: [
      { key: "nama_karyawan", label: "Nama Karyawan", type: "text", placeholder: "Budi Santoso" },
      { key: "nik", label: "NIK Karyawan", type: "text", placeholder: "3578xxxxxxxxxx" },
      { key: "posisi", label: "Posisi / Jabatan", type: "text", placeholder: "Software Engineer" },
      { key: "departemen", label: "Departemen", type: "text", placeholder: "Engineering" },
      { key: "jenis_kontrak", label: "Jenis Kontrak", type: "select", options: ["PKWT (Waktu Tertentu)", "PKWTT (Waktu Tidak Tertentu)", "Magang / Internship", "Freelance / Kontrak Lepas"] },
      { key: "gaji", label: "Gaji Pokok", type: "text", placeholder: "Rp 8.000.000 / bulan" },
      { key: "tunjangan", label: "Tunjangan & Benefit", type: "textarea", placeholder: "BPJS Kesehatan, BPJS TK, tunjangan makan, transport..." },
      { key: "durasi", label: "Durasi Kontrak", type: "text", placeholder: "1 tahun (1 Jan 2025 – 31 Des 2025)" },
      { key: "lokasi_kerja", label: "Lokasi Kerja", type: "text", placeholder: "Surabaya / Remote / Hybrid" },
    ],
  },
  {
    id: "sp", label: "Surat Peringatan", full: "Surat Peringatan Karyawan", icon: "⚠️",
    desc: "SP1, SP2, SP3 untuk pelanggaran karyawan", color: "#F97316", cat: "Disiplin",
    fields: [
      { key: "nama_karyawan", label: "Nama Karyawan", type: "text", placeholder: "Budi Santoso" },
      { key: "jabatan", label: "Jabatan / Posisi", type: "text", placeholder: "Staff Administrasi" },
      { key: "departemen", label: "Departemen", type: "text", placeholder: "Finance" },
      { key: "jenis_sp", label: "Jenis Surat Peringatan", type: "select", options: SP_TYPES },
      { key: "tanggal_pelanggaran", label: "Tanggal Kejadian Pelanggaran", type: "text", placeholder: "15 Januari 2025" },
      { key: "pelanggaran", label: "Uraian Pelanggaran", type: "textarea", placeholder: "Karyawan terlambat masuk kerja sebanyak 5 kali dalam sebulan tanpa keterangan yang sah..." },
      { key: "dampak", label: "Dampak Pelanggaran", type: "textarea", placeholder: "Mengganggu operasional tim, merugikan perusahaan..." },
      { key: "tindakan", label: "Tindakan Perbaikan yang Diminta", type: "textarea", placeholder: "Karyawan diwajibkan hadir tepat waktu, membuat surat pernyataan..." },
    ],
  },
  {
    id: "berita_acara", label: "Berita Acara", full: "Berita Acara Rapat / Kejadian", icon: "🗒️",
    desc: "Dokumentasi rapat atau kejadian penting", color: "#14B8A6", cat: "Administrasi",
    fields: [
      { key: "jenis", label: "Jenis Berita Acara", type: "text", placeholder: "Rapat Evaluasi Kinerja / Serah Terima Jabatan" },
      { key: "tanggal", label: "Tanggal & Waktu", type: "text", placeholder: "Senin, 20 Januari 2025, pukul 09.00 WIB" },
      { key: "tempat", label: "Tempat", type: "text", placeholder: "Ruang Rapat Lt. 3, Kantor Pusat Surabaya" },
      { key: "peserta", label: "Peserta / Pihak yang Hadir", type: "textarea", placeholder: "1. Direktur HR\n2. Manager Divisi A\n3. Karyawan yang bersangkutan" },
      { key: "agenda", label: "Agenda / Pokok Permasalahan", type: "textarea", placeholder: "1. Pembukaan\n2. Pembahasan evaluasi kinerja Q4\n3. Rencana tindak lanjut" },
      { key: "hasil", label: "Hasil / Kesimpulan", type: "textarea", placeholder: "Disepakati bahwa..., Diputuskan bahwa..." },
      { key: "tindak_lanjut", label: "Tindak Lanjut & PIC", type: "textarea", placeholder: "HR Manager akan menyiapkan dokumen mutasi paling lambat 25 Jan 2025" },
    ],
  },
  {
    id: "mutasi", label: "Surat Mutasi", full: "Surat Keputusan Mutasi / Promosi", icon: "🔄",
    desc: "SK mutasi, promosi, atau rotasi jabatan", color: "#EC4899", cat: "Administrasi",
    fields: [
      { key: "nama_karyawan", label: "Nama Karyawan", type: "text", placeholder: "Budi Santoso" },
      { key: "nik", label: "NIK / ID Karyawan", type: "text", placeholder: "EMP-2021-0045" },
      { key: "jenis", label: "Jenis SK", type: "select", options: ["Mutasi Jabatan", "Promosi Jabatan", "Rotasi Divisi", "Demosi", "Mutasi Lokasi Kerja"] },
      { key: "jabatan_lama", label: "Jabatan / Posisi Lama", type: "text", placeholder: "Junior Developer – Engineering" },
      { key: "jabatan_baru", label: "Jabatan / Posisi Baru", type: "text", placeholder: "Senior Developer – Product Team" },
      { key: "tanggal_efektif", label: "Tanggal Efektif", type: "text", placeholder: "1 Februari 2025" },
      { key: "alasan", label: "Alasan / Pertimbangan", type: "textarea", placeholder: "Berdasarkan hasil evaluasi kinerja dan kebutuhan organisasi..." },
      { key: "perubahan_gaji", label: "Perubahan Kompensasi (jika ada)", type: "text", placeholder: "Gaji baru Rp 12.000.000 / bulan" },
    ],
  },
  {
    id: "pkb", label: "PKB", full: "Peraturan Kerja Bersama", icon: "📜",
    desc: "Regulasi internal perusahaan & karyawan", color: "#84CC16", cat: "Legal",
    fields: [
      { key: "bidang_usaha", label: "Bidang Usaha Perusahaan", type: "text", placeholder: "Teknologi Informasi & Software Development" },
      { key: "jumlah_karyawan", label: "Jumlah Karyawan", type: "number", placeholder: "150" },
      { key: "jam_kerja", label: "Jam Kerja & Shift", type: "textarea", placeholder: "Senin–Jumat 08.00–17.00 WIB, istirahat 12.00–13.00 WIB..." },
      { key: "cuti", label: "Kebijakan Cuti & Izin", type: "textarea", placeholder: "Cuti tahunan 12 hari, cuti sakit, cuti melahirkan 3 bulan..." },
      { key: "kompensasi", label: "Struktur Kompensasi & Benefit", type: "textarea", placeholder: "Gaji pokok, THR, BPJS, tunjangan jabatan, bonus kinerja..." },
      { key: "tata_tertib", label: "Tata Tertib & Larangan", type: "textarea", placeholder: "Dilarang merokok di area kantor, larangan membawa senjata..." },
      { key: "sanksi", label: "Sanksi & Mekanisme Penyelesaian Keluhan", type: "textarea", placeholder: "Peringatan lisan, SP1, SP2, SP3 hingga PHK..." },
    ],
  },
];

const CATEGORIES = ["Semua", ...new Set(DOC_TYPES.map(d => d.cat))];

// ─── GEMINI API ───────────────────────────────────────────────────────────────
async function callGemini(apiKey, prompt, lang) {
  const langInstruction = lang === "en"
    ? "Write the entire document in professional English."
    : "Tulis seluruh dokumen dalam Bahasa Indonesia yang formal dan baku.";

  const systemContext = `You are an expert HR Document Specialist. ${langInstruction}
Rules:
- Create a complete, professional, production-ready HR document
- Include proper document number, date, headers, sections/articles
- Add all standard clauses relevant to Indonesian labor law (UU No. 13/2003) even if not mentioned
- Use proper formatting with numbered sections, subsections
- End with appropriate signature fields
- Be thorough and comprehensive`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemContext}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Gemini API error");
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── EXPORT TO TXT ────────────────────────────────────────────────────────────
function exportTxt(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename + ".txt"; a.click();
  URL.revokeObjectURL(url);
}

function exportHtml(content, title) {
  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:'Times New Roman',serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;color:#1a1a1a}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}h1{text-align:center}@media print{body{margin:0}}</style>
</head><body><pre>${content}</pre></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = title + ".html"; a.click();
  URL.revokeObjectURL(url);
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]"); } catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(h.slice(0, 50))); } catch {}
}
function loadProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE) || "{}"); } catch { return {}; }
}
function saveProfile(p) {
  try { localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(p)); } catch {}
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
  @keyframes shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .spin { animation: spin 1s linear infinite; display:inline-block; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d0d14; }
  ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
  input, textarea, select {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    color: #e2ddd6 !important;
    font-size: 13.5px !important;
    font-family: 'DM Sans', sans-serif !important;
    width: 100% !important;
    outline: none !important;
    transition: border-color 0.2s !important;
    resize: vertical;
  }
  input:focus, textarea:focus, select:focus { border-color: rgba(99,102,241,0.6) !important; }
  input::placeholder, textarea::placeholder { color: #3d3a35 !important; }
  select option { background: #1a1a28; color: #e2ddd6; }
  .doc-card:hover { transform: translateY(-3px); }
  .btn-primary { cursor:pointer; border:none; border-radius:10px; font-weight:700; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); filter: brightness(0.95); }
  .tab-btn { cursor:pointer; border:none; font-family:'DM Sans',sans-serif; transition:all 0.2s; border-radius:8px; }
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home"); // home | form | result | history | profile | apikey
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [lang, setLang] = useState("id");
  const [history, setHistory] = useState(loadHistory);
  const [profile, setProfile] = useState(loadProfile);
  const [profileDraft, setProfileDraft] = useState(loadProfile);
  const [catFilter, setCatFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeHistoryItem, setActiveHistoryItem] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const resultRef = useRef(null);

  const hasApiKey = !!apiKey;

  const filteredDocs = DOC_TYPES.filter(d => {
    const matchCat = catFilter === "Semua" || d.cat === catFilter;
    const matchSearch = search === "" || d.label.toLowerCase().includes(search.toLowerCase()) || d.full.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelectDoc = (doc) => {
    if (!hasApiKey) { setView("apikey"); return; }
    setSelectedDoc(doc);
    // Auto-fill from company profile
    const prefill = {};
    if (profile.nama) prefill.perusahaan = profile.nama;
    setFormData(prefill);
    setResult("");
    setError("");
    setView("form");
  };

  const handleGenerate = async () => {
    setLoading(true); setError(""); setResult("");
    const docPrompt = `Buatkan dokumen ${selectedDoc.full} (${selectedDoc.label}) yang lengkap dan profesional.\n\nInformasi Perusahaan:\n` +
      `Perusahaan: ${profile.nama || "-"}\nAlamat: ${profile.alamat || "-"}\nBidang Usaha: ${profile.bidang || "-"}\nPIC HR: ${profile.pic || "-"}\n\n` +
      `Detail Dokumen:\n` +
      selectedDoc.fields.map(f => `${f.label}: ${formData[f.key] || "(tidak diisi)"}`).join("\n") +
      `\n\nBuat dokumen LENGKAP, FORMAL, dan siap digunakan termasuk nomor dokumen, tanggal, semua pasal/klausul standar, dan kolom tanda tangan.`;

    try {
      const text = await callGemini(apiKey, docPrompt, lang);
      setResult(text);
      const newEntry = {
        id: Date.now(), docType: selectedDoc.id, docLabel: selectedDoc.label,
        docFull: selectedDoc.full, icon: selectedDoc.icon, color: selectedDoc.color,
        lang, content: text, formData: { ...formData },
        createdAt: new Date().toLocaleString("id-ID"),
      };
      const newHistory = [newEntry, ...history];
      setHistory(newHistory);
      saveHistory(newHistory);
      setView("result");
      setTimeout(() => resultRef.current?.scrollTo({ top: 0 }), 100);
    } catch (e) {
      setError(e.message || "Gagal generate. Periksa API key dan coba lagi.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = () => {
    setProfile(profileDraft);
    saveProfile(profileDraft);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKeyInput);
    setApiKey(apiKeyInput);
    setView("home");
  };

  const handleViewHistory = (item) => {
    setActiveHistoryItem(item);
    setResult(item.content);
    setSelectedDoc(DOC_TYPES.find(d => d.id === item.docType) || { label: item.docLabel, full: item.docFull, icon: item.icon, color: item.color });
    setView("result");
  };

  const handleDeleteHistory = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated); saveHistory(updated);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'DM Sans', sans-serif", color: "#e2ddd6" }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,18,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 58,
      }}>
        <button onClick={() => setView("home")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366F1, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
          }}>⚡</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: "#f0ece4", letterSpacing: "-0.3px" }}>
            HR<span style={{ color: "#6366F1" }}>DOC</span> <span style={{ fontSize: 11, color: "#4a4760", fontFamily: "'DM Mono', monospace", fontWeight: 400 }}>AI</span>
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { id: "home", label: "📄 Dokumen" },
            { id: "history", label: `🕐 Riwayat ${history.length > 0 ? `(${history.length})` : ""}` },
            { id: "profile", label: "🏢 Profil" },
          ].map(nav => (
            <button key={nav.id} className="tab-btn" onClick={() => setView(nav.id)} style={{
              padding: "5px 12px", fontSize: 12,
              background: view === nav.id ? "rgba(99,102,241,0.15)" : "transparent",
              color: view === nav.id ? "#818cf8" : "#6b6880",
              border: view === nav.id ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
            }}>{nav.label}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 6px" }} />
          {/* Lang toggle */}
          <button onClick={() => setLang(l => l === "id" ? "en" : "id")} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "#9a9680",
          }}>{lang === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}</button>
          {/* API Key */}
          <button onClick={() => { setApiKeyInput(apiKey); setView("apikey"); }} style={{
            background: hasApiKey ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${hasApiKey ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            borderRadius: 8, padding: "4px 10px", cursor: "pointer",
            fontSize: 11, color: hasApiKey ? "#34d399" : "#f87171",
            fontFamily: "'DM Mono', monospace",
          }}>{hasApiKey ? "● API Key" : "! Set API Key"}</button>
        </div>
      </nav>

      {/* ── VIEWS ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px" }}>

        {/* ═══ HOME ═══ */}
        {view === "home" && (
          <div className="fade-up">
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 48, paddingTop: 16 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 20, padding: "4px 14px", fontSize: 11,
                color: "#818cf8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20,
              }}>✦ Powered by Google Gemini AI</div>

              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
                lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16, color: "#f0ece4",
              }}>
                Dokumen HR Profesional<br />
                <span style={{ background: "linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  dalam Hitungan Detik
                </span>
              </h1>
              <p style={{ color: "#6b6880", fontSize: 15, maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
                Generate {DOC_TYPES.length} jenis dokumen HR — MPP, PKS, SOP, KPI, Kontrak, SP & lebih banyak lagi. Gratis dengan Google Gemini API.
              </p>
              {!hasApiKey && (
                <button className="btn-primary" onClick={() => setView("apikey")} style={{
                  marginTop: 24, padding: "12px 28px",
                  background: "linear-gradient(135deg, #6366F1, #3B82F6)",
                  color: "#fff", fontSize: 14, borderRadius: 10,
                }}>🔑 Setup Gemini API Key (Gratis)</button>
              )}
            </div>

            {/* Stats bar */}
            <div style={{
              display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap", justifyContent: "center",
            }}>
              {[
                { label: "Jenis Dokumen", value: DOC_TYPES.length },
                { label: "Dokumen Dibuat", value: history.length },
                { label: "Bahasa", value: "ID / EN" },
                { label: "AI Model", value: "Gemini 2.0" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "10px 20px", textAlign: "center", minWidth: 110,
                }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#818cf8" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#4a4760", marginTop: 2, letterSpacing: "0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter & Search */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text" placeholder="🔍 Cari dokumen..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ maxWidth: 220, height: 36 }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} className="tab-btn" onClick={() => setCatFilter(cat)} style={{
                    padding: "5px 12px", fontSize: 12,
                    background: catFilter === cat ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                    color: catFilter === cat ? "#818cf8" : "#6b6880",
                    border: `1px solid ${catFilter === cat ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Doc Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {filteredDocs.map((doc, i) => (
                <button key={doc.id} className="doc-card btn-primary" onClick={() => handleSelectDoc(doc)} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "22px", textAlign: "left",
                  animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                  position: "relative", overflow: "hidden", transition: "all 0.22s",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, ${doc.color}, transparent)`,
                  }} />
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{doc.icon}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: doc.color, fontFamily: "'Playfair Display', serif" }}>{doc.label}</span>
                    <span style={{ fontSize: 10, color: "#4a4760", fontFamily: "'DM Mono', monospace" }}>{doc.cat}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b6880", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{doc.full}</div>
                  <p style={{ color: "#5a5870", fontSize: 12, lineHeight: 1.5 }}>{doc.desc}</p>
                  <div style={{ marginTop: 14, fontSize: 11, color: doc.color, letterSpacing: "1px", textTransform: "uppercase" }}>
                    Generate →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ API KEY ═══ */}
        {view === "apikey" && (
          <div className="fade-up" style={{ maxWidth: 560, margin: "0 auto", paddingTop: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "36px 32px",
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔑</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#f0ece4" }}>
                Setup Google Gemini API Key
              </h2>
              <p style={{ color: "#6b6880", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                Gunakan Google Gemini API yang <strong style={{ color: "#34d399" }}>gratis</strong> (free tier tersedia). Dapatkan API key di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>aistudio.google.com</a>
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#6b6880", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
                  API Key
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={apiKeyVisible ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="AIza..."
                    style={{ paddingRight: "44px !important", fontFamily: "'DM Mono', monospace !important" }}
                  />
                  <button onClick={() => setApiKeyVisible(v => !v)} style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#6b6880", fontSize: 14,
                  }}>{apiKeyVisible ? "🙈" : "👁️"}</button>
                </div>
              </div>

              <div style={{
                background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#6ee7b7", marginBottom: 20, lineHeight: 1.7,
              }}>
                🔒 API key disimpan hanya di browser kamu (localStorage). Tidak dikirim ke server manapun selain Google Gemini.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" onClick={handleSaveApiKey} disabled={!apiKeyInput} style={{
                  flex: 1, padding: "12px",
                  background: apiKeyInput ? "linear-gradient(135deg, #6366F1, #3B82F6)" : "rgba(255,255,255,0.05)",
                  color: apiKeyInput ? "#fff" : "#4a4760", fontSize: 14,
                }}>💾 Simpan & Lanjutkan</button>
                {hasApiKey && (
                  <button className="btn-primary" onClick={() => setView("home")} style={{
                    padding: "12px 16px", background: "rgba(255,255,255,0.04)",
                    color: "#6b6880", fontSize: 14, border: "1px solid rgba(255,255,255,0.08)",
                  }}>Batal</button>
                )}
              </div>

              {hasApiKey && (
                <button onClick={() => { localStorage.removeItem("gemini_api_key"); setApiKey(""); setApiKeyInput(""); }} style={{
                  marginTop: 12, background: "none", border: "none", cursor: "pointer",
                  color: "#ef4444", fontSize: 12, width: "100%", textAlign: "center",
                }}>🗑️ Hapus API Key</button>
              )}
            </div>
          </div>
        )}

        {/* ═══ FORM ═══ */}
        {view === "form" && selectedDoc && (
          <div className="fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6880", fontSize: 20 }}>←</button>
              <div style={{ fontSize: 24 }}>{selectedDoc.icon}</div>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f0ece4", letterSpacing: "-0.3px" }}>
                  {selectedDoc.label}
                </h2>
                <div style={{ fontSize: 12, color: "#6b6880", fontFamily: "'DM Mono', monospace" }}>{selectedDoc.full}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#4a4760" }}>Bahasa:</span>
                {LANG_OPTIONS.map(l => (
                  <button key={l.value} className="tab-btn" onClick={() => setLang(l.value)} style={{
                    padding: "4px 10px", fontSize: 11,
                    background: lang === l.value ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                    color: lang === l.value ? "#818cf8" : "#6b6880",
                    border: `1px solid ${lang === l.value ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)"}`,
                  }}>{l.label}</button>
                ))}
              </div>
            </div>

            {/* Company profile banner if available */}
            {profile.nama && (
              <div style={{
                background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#818cf8", marginBottom: 20,
                display: "flex", gap: 8, alignItems: "center",
              }}>
                🏢 Auto-filled dari profil perusahaan: <strong>{profile.nama}</strong>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {selectedDoc.fields.map((field) => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: 11, color: "#6b6880", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 7, fontFamily: "'DM Mono', monospace" }}>
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea value={formData[field.key] || ""} onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} rows={3} />
                  ) : field.type === "select" ? (
                    <select value={formData[field.key] || ""} onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}>
                      <option value="">-- Pilih --</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={formData[field.key] || ""} onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                marginTop: 16, padding: "12px 16px", borderRadius: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", fontSize: 13,
              }}>{error}</div>
            )}

            <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{
              marginTop: 28, width: "100%", padding: "14px",
              background: loading ? "rgba(99,102,241,0.3)" : `linear-gradient(135deg, ${selectedDoc.color}, ${selectedDoc.color}bb)`,
              color: "#fff", fontSize: 15,
            }}>
              {loading ? <><span className="spin">⟳</span> &nbsp;Sedang Generate Dokumen AI...</> : `⚡ Generate ${selectedDoc.label}`}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#3a3850", marginTop: 10 }}>
              Semakin lengkap isian, semakin akurat dokumen yang dihasilkan
            </p>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {view === "result" && (
          <div className="fade-up">
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => { setView(selectedDoc ? "form" : "history"); setActiveHistoryItem(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6880", fontSize: 18 }}>←</button>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
                <span style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>
                  {selectedDoc?.label} berhasil di-generate
                </span>
              </div>
              {activeHistoryItem && (
                <span style={{ fontSize: 11, color: "#4a4760", fontFamily: "'DM Mono', monospace" }}>
                  {activeHistoryItem.createdAt} · {activeHistoryItem.lang === "en" ? "🇺🇸 English" : "🇮🇩 Indonesia"}
                </span>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={handleCopy} style={{
                  padding: "7px 14px", fontSize: 12,
                  background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                  color: copied ? "#34d399" : "#9a9680",
                  border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}>{copied ? "✓ Tersalin!" : "⎘ Copy"}</button>
                <button className="btn-primary" onClick={() => exportTxt(result, selectedDoc?.label + "_" + Date.now())} style={{
                  padding: "7px 14px", fontSize: 12,
                  background: "rgba(59,130,246,0.1)", color: "#60a5fa",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}>↓ TXT</button>
                <button className="btn-primary" onClick={() => exportHtml(result, selectedDoc?.label + "_" + Date.now())} style={{
                  padding: "7px 14px", fontSize: 12,
                  background: "rgba(139,92,246,0.1)", color: "#a78bfa",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}>↓ HTML</button>
                <button className="btn-primary" onClick={() => window.print()} style={{
                  padding: "7px 14px", fontSize: 12,
                  background: "rgba(16,185,129,0.1)", color: "#34d399",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}>🖨️ Print / PDF</button>
                {!activeHistoryItem && (
                  <button className="btn-primary" onClick={() => { setResult(""); setView("form"); }} style={{
                    padding: "7px 14px", fontSize: 12,
                    background: "rgba(255,255,255,0.04)", color: "#6b6880",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}>✏️ Edit</button>
                )}
              </div>
            </div>

            {/* Document display */}
            <div ref={resultRef} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "36px 44px", maxHeight: "65vh", overflowY: "auto",
            }}>
              <pre style={{
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                fontSize: 13, lineHeight: 1.9, color: "#c8c4bc",
                fontFamily: "'DM Mono', monospace",
              }}>{result}</pre>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={() => { setView("home"); setSelectedDoc(null); setResult(""); setActiveHistoryItem(null); }} style={{
                padding: "10px 20px", fontSize: 13,
                background: "rgba(99,102,241,0.1)", color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
              }}>← Buat Dokumen Lain</button>
            </div>
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {view === "history" && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f0ece4" }}>Riwayat Dokumen</h2>
                <p style={{ color: "#6b6880", fontSize: 13, marginTop: 4 }}>{history.length} dokumen tersimpan di browser</p>
              </div>
              {history.length > 0 && (
                <button className="btn-primary" onClick={() => { if (confirm("Hapus semua riwayat?")) { setHistory([]); saveHistory([]); } }} style={{
                  padding: "8px 14px", fontSize: 12,
                  background: "rgba(239,68,68,0.08)", color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}>🗑️ Hapus Semua</button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a4760" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ fontSize: 15 }}>Belum ada dokumen yang dibuat</p>
                <button className="btn-primary" onClick={() => setView("home")} style={{
                  marginTop: 16, padding: "10px 20px", fontSize: 13,
                  background: "rgba(99,102,241,0.15)", color: "#818cf8",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}>Buat Dokumen Pertama →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map((item, i) => (
                  <div key={item.id} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 16,
                    animation: `fadeUp 0.25s ease ${i * 0.03}s both`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: `${item.color}18`, border: `1px solid ${item.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                    }}>{item.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, color: "#d4d0c8", fontSize: 14 }}>{item.docLabel}</span>
                        <span style={{ fontSize: 10, color: "#4a4760", fontFamily: "'DM Mono', monospace" }}>{item.docFull}</span>
                        <span style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "1px 6px", color: "#6b6880" }}>
                          {item.lang === "en" ? "🇺🇸 EN" : "🇮🇩 ID"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#4a4760", fontFamily: "'DM Mono', monospace" }}>{item.createdAt}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="btn-primary" onClick={() => handleViewHistory(item)} style={{
                        padding: "6px 12px", fontSize: 12,
                        background: `${item.color}18`, color: item.color,
                        border: `1px solid ${item.color}30`,
                      }}>Lihat</button>
                      <button className="btn-primary" onClick={() => exportTxt(item.content, item.docLabel + "_" + item.id)} style={{
                        padding: "6px 10px", fontSize: 12,
                        background: "rgba(255,255,255,0.04)", color: "#6b6880",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}>↓</button>
                      <button className="btn-primary" onClick={() => handleDeleteHistory(item.id)} style={{
                        padding: "6px 10px", fontSize: 12,
                        background: "rgba(239,68,68,0.06)", color: "#f87171",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ COMPANY PROFILE ═══ */}
        {view === "profile" && (
          <div className="fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#f0ece4" }}>Profil Perusahaan</h2>
              <p style={{ color: "#6b6880", fontSize: 13, marginTop: 4 }}>
                Isi sekali, otomatis dipakai di semua dokumen yang kamu generate.
              </p>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "28px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { key: "nama", label: "Nama Perusahaan", placeholder: "PT. Maju Bersama Indonesia" },
                  { key: "alamat", label: "Alamat Lengkap", placeholder: "Jl. HR Muhammad No. 5, Surabaya 60253", textarea: true },
                  { key: "bidang", label: "Bidang Usaha", placeholder: "Teknologi Informasi & Software Development" },
                  { key: "npwp", label: "NPWP Perusahaan", placeholder: "01.234.567.8-901.000" },
                  { key: "pic", label: "Nama PIC / Direktur HR", placeholder: "Andi Wijaya, S.H., M.M." },
                  { key: "jabatan_pic", label: "Jabatan PIC", placeholder: "Human Resources Director" },
                  { key: "email", label: "Email HR", placeholder: "hr@majubersama.co.id" },
                  { key: "telp", label: "Nomor Telepon", placeholder: "+62 31 5678 9012" },
                  { key: "kota", label: "Kota", placeholder: "Surabaya" },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: 11, color: "#6b6880", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 7, fontFamily: "'DM Mono', monospace" }}>
                      {field.label}
                    </label>
                    {field.textarea ? (
                      <textarea value={profileDraft[field.key] || ""} onChange={e => setProfileDraft(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} rows={2} />
                    ) : (
                      <input type="text" value={profileDraft[field.key] || ""} onChange={e => setProfileDraft(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.placeholder} />
                    )}
                  </div>
                ))}
              </div>

              <button className="btn-primary" onClick={handleSaveProfile} style={{
                marginTop: 24, width: "100%", padding: "13px",
                background: profileSaved ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #6366F1, #3B82F6)",
                color: profileSaved ? "#34d399" : "#fff", fontSize: 14,
                border: profileSaved ? "1px solid rgba(16,185,129,0.3)" : "none",
              }}>
                {profileSaved ? "✓ Profil tersimpan!" : "💾 Simpan Profil Perusahaan"}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          pre { color: black !important; font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
}
