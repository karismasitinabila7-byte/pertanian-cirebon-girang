# SI PADI: Sistem Informasi Pertanian & Manajemen Budidaya Padi Desa Cirebon Girang

[![CI/CD Pipeline SI PADI](https://github.com/karismasitinabila7-byte/pertanian-cirebon-girang/actions/workflows/ci.yml/badge.svg)](https://github.com/karismasitinabila7-byte/pertanian-cirebon-girang/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel%20Live-15803d?logo=vercel)](https://pertanian-cirebon-girang.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v20%20LTS-339933?logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-000000?logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-TiDB%20Cloud%20MySQL-00758F?logo=mysql)](https://tidbcloud.com)

> **Tugas Proyek Akhir Mandiri (OBE Rubric Compliant)**  
> **Mata Kuliah:** Rekayasa Perangkat Lunak (TIKB2503021) — 4 SKS (Semester 3)  
> **Dosen Pengampu:** Yudhistira Arie Wijaya, M.Kom., CDS.  
> **Program Studi:** S1 Teknik Informatika — STMIK IKMI Cirebon  
> **Sifat Pengerjaan:** Mandiri / Perorangan (100% Individual Ownership & Full-Stack Build)

---

## 👤 Identitas Mahasiswa & Tim Proyek
* **Nama Mahasiswa:** Karisma Siti Nabila
* **NIM:** 41257113
* **Kelas:** TI-KIP-1B-2025
* **Program Studi:** S1 Teknik Informatika (Semester 3)
* **Kelompok:** Mandiri (Group Topic Theme with Individual Full-App Build)
* **Tema Topik Kelompok:** Public Service & Smart Agriculture AI (Pemberdayaan Pertanian Pedesaan Cerdas)
* **Tautan Repositori GitHub:** [github.com/karismasitinabila7-byte/pertanian-cirebon-girang](https://github.com/karismasitinabila7-byte/pertanian-cirebon-girang)
* **Tautan Aplikasi Live (Production):** [pertanian-cirebon-girang.vercel.app](https://pertanian-cirebon-girang.vercel.app)
* **Tautan Prototipe Desain UI/UX Figma:** [Figma Design - UI/UX SI PADI Cirebon Girang](https://www.figma.com/design/8AF5m0pwNQzAPUyDyXRyns/UI-UX-SI-PADI---Karisma-Siti-Nabila--TI-KIP-1B-2025-?node-id=0-1)

---

## 📺 Tautan Presentasi Video Proyek (YouTube Resmi)
Sesuai dengan ketentuan standar kualitas presentasi (Bab III Panduan Dosen: *Screen recording* 1080p + *Webcam* wajah aktif di pojok layar secara penuh):

* 🎬 **Tautan Video Presentasi Lengkap (YouTube):**  
  👉 **[https://youtu.be/oErlB_yAZME](https://youtu.be/oErlB_yAZME)** *(Durasi: 30 Menit 48 Detik | 1080p Full HD)*

### Navigasi Bab & Segmen Evaluasi Video:
1. **Video Progres 1: PRD & Konsep Aplikasi (Bobot 20%):**  
   🔗 [Tonton Bab Progres 1 (00:00 - 05:20)](https://youtu.be/oErlB_yAZME?t=0)  
   *Membahas: Identifikasi masalah riil Desa Cirebon Girang, Value Proposition, Spesifikasi Kebutuhan Fungsional (FR-01 s/d FR-08) & Non-Fungsional (NFR), serta peran strategis AI.*
2. **Video Progres 2: Pemodelan UML, Arsitektur & ERD (Bobot 30%):**  
   🔗 [Tonton Bab Progres 2 (05:20 - 16:06)](https://youtu.be/oErlB_yAZME?t=320)  
   *Membahas: Bedah 4 Diagram UML Utama (Use Case 14 fungsi, Activity Diagram, Class Diagram SOLID-compliant, Sequence Diagram), ERD 13 tabel relasional, dan arsitektur Next.js Clean Architecture.*
3. **Video Final: Live Demo Web, EWS, GIS & AI (Bobot 50%):**  
   🔗 [Tonton Bab Live Demo & Evaluasi (16:06 - 30:48)](https://youtu.be/oErlB_yAZME?t=966)  
   *Membahas: Elevator Pitch, Live Demo 3 Dashboard (Admin, Perangkat Desa, Petani), EWS Jadwal Tanam, Peta Lahan WebGIS Leaflet, Konsultasi Diagnosis Hama Gemini AI, refleksi pembelajaran RPL, dan penutup.*

---

## 🌾 Deskripsi Aplikasi & Peran Fitur AI Utama
**SI PADI** adalah platform komprehensif terpadu untuk digitalisasi pendataan lahan sawah (6,00 Ha), jadwal musim tanam, rekapitulasi panen kelompok tani, dan konsultasi cerdas agrikultur di Desa Cirebon Girang, Kecamatan Talun, Kabupaten Cirebon.

### Fitur Utama Sistem:
1. **Role-Based Access Control (RBAC 3 Role):**
   * **Administrator (12 Menu):** Dashboard Admin, Peta GIS, Kelompok Tani, Data Petani, Data Master User, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Data Panen, Edukasi & Panduan, Profil Saya, dan Konfigurasi Sistem.
   * **Perangkat Desa (10 Menu):** Dashboard Desa, Peta GIS, Kelompok Tani, Data Petani, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Rekap Panen, Edukasi & Panduan, Profil Saya.
   * **Petani Binaan (10 Menu):** Beranda Petani, Peta GIS, Kelompok Saya, Lahan Saya, Musim Tanam Saya, Aktivitas Budidaya, Hasil Panen Saya, Edukasi & Panduan, Profil Saya, dan AI Assistant.
2. **Peta Spasial GIS (Leaflet.js):** Pemetaan interaktif koordinat poligon petak sawah satelit (OpenStreetMap & Esri) dengan tooltip dinamis luas lahan, pengelola, dan varietas padi.
3. **Early Warning System (EWS) Multi-Saluran:** Pemantauan otomatis umur Hari Setelah Tanam (HST) untuk jadwal pemupukan berimbang dan peringatan cuaca Open-Meteo via **WhatsApp Gateway (Fonnte)** dan **Email SMTP (Nodemailer)**.
4. **Registrasi Mandiri Petani & Dual-Channel OTP:** Pendaftaran petani dengan kode OTP 6 digit yang dikirim simultan ke WhatsApp dan Email dengan masa berlaku 5 menit.
5. **Certified Official Village Reporting:** Penerbitan dokumen laporan resmi ber-Kop Kantor Kuwu dengan tanda tangan pengesahan asli Kuwu Bapak Karsiman, S.Sos.

### Arsitektur Kecerdasan Artifisial (Hybrid RAG):
* **Dynamic Real-Time Context Injection:** Backend menginjeksi data agregat termutakhir dari basis data MySQL TiDB Cloud (jumlah akun, petani, kelompok tani, petak sawah, musim tanam, panen) ke dalam prompt model **Google Gemini 3.0 Flash** / **OpenAI GPT-4o-mini**, mencegah halusinasi.
* **Deterministic Local Agronomy Engine (0 ms Latency):** Beroperasi sebagai fallback instan jika kuota API habis, menegakkan aturan semantik ketat:
  * Pertanyaan **"Berapa"** $\rightarrow$ dijawab langsung angka kuantitatif ringkas tanpa membocorkan data pribadi.
  * Pertanyaan **"Siapa"** $\rightarrow$ dijawab langsung nama subjek spesifik.
  * Menjawab **15 topik pertanyaan penguji sidang / dosen** seputar arsitektur web, SDLC, keamanan, dan testing.

---

## 🛠️ Stack Teknologi & Arsitektur
* **Framework:** Next.js 15 (App Router, Server Components & Server Actions)
* **User Interface:** React 19, Tailwind CSS, Lucide React, Leaflet.js
* **Bahasa:** TypeScript 5 (Strict Mode)
* **ORM & Database:** Prisma ORM 6 dengan MySQL di **TiDB Cloud Serverless**
* **Keamanan:** Stateless JWT via `jose` (HttpOnly Secure Cookies), `bcryptjs` salt 10, Parameterized Queries (Anti-SQLi)
* **Kecerdasan Buatan:** Google Gemini API (gemini-3.0-flash) + Local Rule-Based Engine
* **Testing & DevOps:** Node.js Native Test Runner (`node:test`), GitHub Actions CI/CD Pipeline

---

## 📁 Berkas Dokumen Laporan Resmi (Tersimpan di `docs/`)
1. **Laporan Akhir Terintegrasi (PDF Tunggal):** `docs/Laporan_Akhir_RPL_SI_PADI_STMIK_IKMI.pdf` (Gabungan PRD IEEE 830, SDD 4 Diagram UML & ERD, Konstruksi Kode, Testing, dan CI/CD).
2. **Naskah Script Presentasi Video (PDF & Markdown):** `docs/Naskah_Script_Presentasi_Video_SI_PADI.pdf` dan `docs/Naskah_Script_Presentasi_Video_SI_PADI.md`.
3. **Diagram Visual Asli:**
   * `docs/UseCase_SI_PADI_Cirebon_Girang.png`
   * `docs/ERD_SI_PADI_Cirebon_Girang.png`
   * `docs/PRD_SI_PADI_Cirebon_Girang.png`

---

## 🚀 Petunjuk Instalasi & Menjalankan Proyek (Setup Instruction)

### 1. Prasyarat Sistem
* Node.js v20 LTS atau lebih baru
* npm v10 atau lebih baru
* Git

### 2. Kloning Repositori
```bash
git clone https://github.com/karismasitinabila7-byte/pertanian-cirebon-girang.git
cd pertanian-cirebon-girang
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables (`.env`)
Salin atau buat berkas `.env` pada direktori root:
```env
DATABASE_URL="mysql://<user>:<password>@<host>:4000/db_si_padi?sslaccept=strict"
JWT_SECRET="kunci_rahasia_jwt_minimal_32_karakter_acak"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Integrasi AI (Opsional - Sistem memiliki Super Engine Lokal otomatis)
GEMINI_API_KEY="AIzaSy..."
AI_PROVIDER="gemini"
AI_GEMINI_MODEL="gemini-3.0-flash"

# Integrasi Notifikasi (Opsional)
FONNTE_TOKEN="token_api_fonnte_anda"
SMTP_USER="email_pengirim@gmail.com"
SMTP_PASS="app_password_gmail"
```

### 5. Sinkronisasi Skema Basis Data
```bash
npx prisma generate
npx prisma db push
```

### 6. Menjalankan Skrip Unit Testing Otomatis
```bash
npm test
```
*Hasil yang diharapkan: 6 Unit Tests berjalan sukses (Pass: 6, Fail: 0).*

### 7. Menjalankan Server Pengembangan Lokal
```bash
npm run dev
```
Buka peramban pada `http://localhost:3000`.

### 8. Akun Default Pengujian
* **Administrator:** `karismasitinabila7@gmail.com` | Sandi: `Karisma123`
* **Perangkat Desa (Kuwu):** `karsiman@gmail.com` | Sandi: `Karisman123`
* **Petani (Poktan Sri Rejeki):** `sukardi@gmail.com` | Sandi: `Sukardi123`
