# Platform Pertanian Padi Desa Cirebon Girang

Platform web terpadu digitalisasi pertanian padi Desa Cirebon Girang, menghubungkan **Admin**, **Perangkat Desa**, dan **Petani Anggota Kelompok Tani** dalam satu sistem terintegrasi.

---

## 🌾 Latar Belakang & Tujuan
1. **Digitalisasi Data Petani & Kelompok Tani**: Pencatatan data kelompok tani, struktur kepengurusan, dan data anggota petani beserta NIK dan lokasi domisili di Desa Cirebon Girang.
2. **Pendataan Lahan Pertanian**: Inventarisasi petak sawah, luas lahan ($m^2$ dan Hektar), status kepemilikan (milik sendiri, sewa, bagi hasil), tipe irigasi, dan titik koordinat GPS.
3. **Pencatatan Musim Tanam & Aktivitas Budidaya**: Pengelolaan jadwal musim tanam (Musim Rendeng MT1 & Musim Gadu MT2/MT3), varietas padi unggul (Inpari 32, Ciherang, dll.), serta log harian budidaya (pengolahan tanah, semai, tanam jajar legowo, pemupukan berimbang, pengendalian OPT, panen).
4. **Monitoring Pertanian oleh Perangkat Desa**: Pemantauan agregat statistik luas tanam, estimasi hasil panen, status pengairan saluran irigasi, serta publikasi pengumuman desa.
5. **Kesiapan AI Assistant untuk Petani**: Arsitektur percakapan cerdas yang siap mendampingi petani terkait deteksi dini hama/penyakit, rekomendasi dosis pupuk, dan cuaca.

---

## 👥 Matriks 3 Role Pengguna

| Role | Fungsi Utama | Modul Utama |
|---|---|---|
| **Admin** | Manajemen pengguna, konfigurasi sistem desa, master data varietas padi & audit keamanan | Manajemen Akun, Master Wilayah/Blok, Audit Trail |
| **Perangkat Desa** | Monitoring pertanian tingkat desa, verifikasi poktan & lahan, pengumuman jadwal air | Dashboard Statistik Desa, Rekapitulasi Lahan, Broadcast Pengumuman |
| **Petani Anggota** | Pendataan lahan garapan, pencatatan log harian budidaya, estimasi panen & konsultasi AI | Buku Catatan Tani, Jadwal Tanam, Konsultasi AI Assistant |

---

## 🏗️ Stack Teknologi

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/) (Strict typing end-to-end)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) dengan SQLite (Zero-config development & portabel) serta siap beralih ke MySQL di Laragon / production.
- **Styling**: Vanilla CSS modern dengan Design Tokens bertema pertanian nusantara, CSS Modules, dan responsive mobile-first.

---

## 📁 Struktur Direktori Scalable

```text
pertanian-padi-cirebon-girang/
├── .env                         # Konfigurasi environment lokal
├── .env.example                 # Template konfigurasi environment
├── .gitignore                   # File ignore git
├── next.config.ts               # Konfigurasi Next.js
├── package.json                 # Manifest dependensi & script project
├── tsconfig.json                # Konfigurasi TypeScript compiler
├── prisma/
│   ├── schema.prisma            # Schema relasional database (10 model)
│   └── seed.ts                  # Seeding data realistis Desa Cirebon Girang
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts  # Endpoint health check sistem & database
│   │   │   └── stats/route.ts   # Endpoint API ringkasan statistik
│   │   ├── globals.css          # Design token, typography & styling dasar
│   │   ├── layout.tsx           # Layout root (SEO & meta tags)
│   │   └── page.tsx             # Halaman utama overview sistem & 3 role
│   ├── components/
│   │   ├── features/            # Komponen fitur bisnis (Role cards, status card)
│   │   ├── layout/              # Header & Footer aplikasi
│   │   └── ui/                  # Atomik UI (Button, Card, Badge)
│   ├── lib/
│   │   ├── prisma.ts            # Client singleton Prisma
│   │   └── utils.ts             # Utility formatting angka, hektar, tanggal
│   ├── services/
│   │   └── statsService.ts      # Layanan query database statistik desa
│   └── types/
│       └── index.ts             # Definisi domain types & interfaces
```

---

## 🗄️ Database Schema Awal (Prisma)
Skema database mencakup 10 model:
1. `User`: Akun pengguna dan wewenang (Role: `ADMIN`, `VILLAGE_OFFICER`, `FARMER`).
2. `FarmerGroup`: Data kelompok tani Desa Cirebon Girang (Blok, ketua, kontak, SK).
3. `FarmerProfile`: Profil detail petani anggota kelompok tani (NIK, alamat, RT/RW).
4. `Farmland`: Pendataan petak sawah (luas $m^2$, irigasi teknis/tadah hujan, status kepemilikan, GPS).
5. `PlantingSeason`: Master musim tanam padi (Rendeng / Gadu).
6. `CropCycle`: Siklus tanam per petak lahan (varietas padi, tanggal tanam, estimasi & realisasi panen).
7. `CultivationActivity`: Jurnal harian budidaya (pengolahan tanah, semai, tanam, pemupukan, hama, panen).
8. `VillageAnnouncement`: Publikasi himbauan dan jadwal gilir air irigasi oleh perangkat desa.
9. `AiChatSession`: Sesi percakapan konsultasi budidaya antara petani dan AI Assistant.
10. `AiChatMessage`: Riwayat interaksi pesan tanya jawab AI.
11. `AuditLog`: Log pencatatan aktivitas sistem.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Sinkronisasi Database Schema
```bash
npx prisma db push
```

### 2. Isi Data Awal (Seeding)
```bash
npm run db:seed
```

### 3. Jalankan Server Development
```bash
npm run dev
# Atau jalankan versi produksi yang telah dioptimasi:
npm run build
npm run start
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Kredensial Akun Login (Untuk Pengujian & Penilaian Dosen)

Login menggunakan **Email** dan **Kata Sandi**:

| No | Peran / Role | Alamat Email | Kata Sandi | Dashboard Tujuan | Keterangan |
|---|---|---|---|---|---|
| 1 | **Petani** | `petani@cirebongirang.desa.id` | `password123` | `/petani` | Bapak Sukardi (Poktan Sri Rejeki) |
| 2 | **Perangkat Desa** | `perangkat@cirebongirang.desa.id` | `password123` | `/desa` | Bapak Karsiman, S.Sos (Kaur Ekbang) |
| 3 | **Administrator** | `admin@cirebongirang.desa.id` | `password123` | `/admin` | Administrator Sistem Desa |

> **Catatan Penguji:** Pada halaman login (`/login`), tersedia tombol **1-Klik Demo ("Isi" & "Masuk")** untuk masing-masing role agar mempermudah pengujian instan tanpa perlu mengetik manual.

---

## 🛠️ Ringkasan Fitur Setiap Dashboard

### 1. 🌾 Dashboard Petani (`/petani`)
- **Beranda Petani**: Ringkasan luas lahan (m² & Ha), status petak aktif, musim berjalan, hitung mundur panen, dan tips budidaya AI.
- **Lahan Saya (`/petani/lahan`)**: Inventarisasi dan penambahan petak sawah milik petani mandiri.
- **Musim Tanam Saya (`/petani/musim-tanam`)**: Pelacakan varietas padi (Inpari 32, Ciherang), tanggal tanam, dan fase pertumbuhan.
- **Aktivitas Budidaya (`/petani/aktivitas`)**: Pencatatan log harian (pengolahan tanah, pemupukan urea/phonska, pengairan, semprot hama).
- **Hasil Panen Saya (`/petani/panen`)**: Input hasil gabah kering panen (kg/ton) dan mutu gabah.
- **Kelompok Saya (`/petani/kelompok-tani`)**: Informasi Poktan, wilayah blok, nama ketua, dan nomor kontak pengurus.
- **Profil Petani (`/petani/profil`)**: Informasi identitas, NIK, nomor telepon, dan ganti kata sandi.

### 2. 🏛️ Dashboard Perangkat Desa (`/desa`)
- **Executive Dashboard Desa**: Monitoring agregat produktivitas padi desa, filter per Poktan dan per tahun.
- **Grafik Distribusi**: Sebaran luas lahan per Poktan, status musim tanam desa, dan rekapitulasi panen gabah.
- **Peringatan Panen (Harvest Alert)**: Notifikasi otomatis musim tanam yang diprediksi panen dalam 30 hari ke depan.
- **Data Petani Desa (`/desa/petani`)**: Direktori seluruh petani desa, nomor kontak, dan detail kepemilikan lahan.
- **Data Poktan (`/desa/kelompok-tani`)**: Data legalitas kelompok tani, wilayah dusun, dan kontak ketua.
- **Monitoring Lahan & Musim Desa**: Rekapitulasi petak sawah dan status musim tanam di seluruh dusun.

### 3. 🛡️ Dashboard Administrator (`/admin`)
- **Admin System Overview**: Statistik total pengguna, petani, poktan, total luas lahan desa (Ha), musim aktif, dan audit log.
- **Kelola Master Petani (`/admin/petani`)**: CRUD lengkap data petani, pembuatan akun baru, pengaitan poktan, reset password, dan status aktif.
- **Kelola Kelompok Tani (`/admin/kelompok-tani`)**: Tambah, edit, dan hapus kelompok tani Desa Cirebon Girang.
- **Kelola Lahan Pertanian (`/admin/lahan`)**: Manajemen seluruh petak sawah desa beserta status keaktifan.
- **Kelola Musim Tanam (`/admin/musim-tanam`)**: Kontrol penuh siklus tanam, varietas, dan status musim.
- **Kelola Aktivitas & Panen**: Supervisi seluruh jurnal budidaya dan hasil panen gabah desa.

### 4. 🤖 AI Assistant Pertanian Padi (`/ai`)
- Asisten cerdas khusus budidaya padi berbasis pengetahuan lokal Desa Cirebon Girang.
- Rekomendasi penanganan hama (wereng batang coklat, sundep/beluk, keong mas, kresek).
- Panduan pemupukan berimbang per HST dan irigasi efisien (*macak-macak*).

