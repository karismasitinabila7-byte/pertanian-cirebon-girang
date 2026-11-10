const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/services/aiService.ts');
let code = fs.readFileSync(targetFile, 'utf8');

const startMarker = '// ─────────────────────────────────────────────────────────────────────────────\n// GENERATOR RESPON INFORMASI SEMUA MENU DASHBOARD & PERINGKAT DATA SUPERLATIF';
const endMarker = 'export function normalizeIndonesianQuery(text: string): string {';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('MARKERS NOT FOUND', startIndex, endIndex);
  process.exit(1);
}

const replacement = `// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR RESPON INFORMASI SEMUA MENU DASHBOARD & PERINGKAT DATA SUPERLATIF
// ─────────────────────────────────────────────────────────────────────────────

export function generateLahanTerluasResponse(userContext?: PetaniContext): string {
  return [
    'Petak lahan sawah yang paling luas adalah **Sawah Hamparan Manis Tengah** dengan luas **20.000 m² (2,00 Hektar)** yang dikelola oleh **Bapak Sutarjo** di Blok Manis (Dusun Karang Anyar).',
    '',
    '**Peringkat 8 Petak Sawah Terluas di Desa Cirebon Girang:**',
    '1. **Sawah Hamparan Manis Tengah:** **20.000 m² (2,00 Ha)** – Pengelola: **Bapak Sutarjo** (Blok Manis) *(Lahan Terluas)*',
    '2. **Sawah Lembah Wage:** **17.500 m² (1,75 Ha)** – Pengelola: **Bapak H. Karyono** (Blok Wage)',
    '3. **Petak Sawah Blok Manis Barat:** **14.000 m² (1,40 Ha)** – Pengelola: **Bapak Sukardi** (Blok Manis)',
    '4. **Petak Sawah Blok Pahing Krajan:** **12.000 m² (1,20 Ha)** – Pengelola: **Bapak Sukardi** (Blok Pahing)',
    '5. **Petak Sawah Hulu Cipager:** **11.000 m² (1,10 Ha)** – Pengelola: **Bapak Sutarjo** (Blok Manis)',
    '6. **Sawah Rawa Bencah Girang:** **9.500 m² (0,95 Ha)** – Pengelola: **Bapak H. Karyono** (Blok Wage)',
    '7. **Petak Sawah Galengan Wetan:** **8.500 m² (0,85 Ha)** – Pengelola: **Bapak Sukardi** (Blok Manis)',
    '8. **Petak Demplot Organik Cirebon Girang:** **6.000 m² (0,60 Ha)** – Pengelola: **Bapak Rasidi** (Blok Pahing) *(Lahan Terkecil)*',
    '',
    '💡 **Catatan:** Petani dengan **akumulasi total lahan garapan terluas** adalah **Bapak Sukardi** dengan total **34.500 m² (3,45 Ha)** dari 3 petak sawah binaan (Manis Barat, Pahing Krajan, dan Galengan Wetan).'
  ].join('\\n')
}

export function generateLahanTerkecilResponse(userContext?: PetaniContext): string {
  return 'Petak lahan sawah yang paling kecil (tersempit) adalah **Petak Demplot Organik Cirebon Girang** dengan luas **6.000 m² (0,60 Hektar)** yang dikelola oleh **Bapak Rasidi** di Blok Pahing Barat RT 01 (Kelompok Tani Sumber Subur). Lahan ini difungsikan khusus sebagai demplot percontohan budidaya padi organik.'
}

export function generatePanenTerbanyakResponse(userContext?: PetaniContext): string {
  return [
    'Hasil panen terbanyak diraih oleh **Bapak H. Karyono** dengan total produksi **11,20 Ton (11.200 kg)** varietas Inpari 32 di Sawah Lembah Wage (Blok Wage).',
    '',
    'Disusul oleh **Bapak Sukardi** dengan hasil **8,80 Ton (8.800 kg)** varietas Ciherang di Petak Sawah Galengan Wetan (Blok Manis). Total realisasi panen gabah desa yang telah terverifikasi adalah **20,00 Ton GKP**.'
  ].join('\\n')
}

export function generateAllDashboardMenusResponse(): string {
  return [
    '**Daftar Lengkap Semua Menu di Setiap Dashboard SI PADI:**',
    '',
    '📌 **1. Dashboard Administrator (/admin):**',
    '• **Dashboard Admin (/admin):** Ringkasan metrik statistik operasional (8 petak sawah, 9,85 Ha, 6 MT aktif, 20 Ton panen, 3 poktan, 4 petani) & pintasan cepat.',
    '• **Peta Lahan GIS (/peta):** Peta interaktif geospasial 8 petak sawah desa berbasis koordinat GPS poligon & filter 3 blok dusun.',
    '• **Kelompok Tani (/admin/kelompok-tani):** Manajemen 3 kelembagaan poktan (Sri Rejeki, Sumber Subur, Tani Makmur), pengurus, & kontak.',
    '• **Data Petani (/admin/petani):** Master data kependudukan 4 petani binaan desa, NIK, alamat RT/RW, nomor HP, & luas garapan.',
    '• **Data Master User (/admin/users):** Manajemen 6 akun pengguna sistem (Admin, Perangkat Desa, Petani), role, aktivasi, & reset kata sandi.',
    '• **Lahan Pertanian (/admin/lahan):** Inventarisasi 8 petak sawah (9,85 Ha), nama petak, pengelola, blok, luas (m²/Ha), & titik koordinat.',
    '• **Musim Tanam (/admin/musim-tanam):** Kalender siklus tanam (6 petak aktif MT1 Rendeng 2026/2027), varietas Inpari 32 & Ciherang, jadwal tanam & estimasi panen.',
    '• **Aktivitas Budidaya (/admin/aktivitas):** Jurnal log harian sawah (olah tanah, tandur legowo, pemupukan per HST, pengairan, semprot hama) & catatan biaya.',
    '• **Data Panen (/admin/panen):** Pencatatan dan evaluasi produksi panen gabah desa (Total 20 Ton GKP), produktivitas Ton/Ha, mutu, & varietas.',
    '• **Edukasi & Panduan (/edukasi):** Pustaka teknis budidaya padi, dosis pupuk berimbang per HST, pengendalian hama OPT, penyakit kresek, & jajar legowo.',
    '• **Profil Saya (/admin/profil):** Pengaturan data diri akun administrator & formulir ganti kata sandi.',
    '• **Konfigurasi Sistem (/admin/konfigurasi):** Parameter AI Assistant, integrasi WhatsApp Gateway, SMTP email, & backup sistem.',
    '• **AI Assistant (Widget Chat):** Konsultasi cerdas data pertanian desa & budidaya padi interaktif 24/7.',
    '',
    '🏛️ **2. Dashboard Perangkat Desa (/desa):**',
    '• **Dashboard Desa (/desa):** Panel eksekutif pengawasan ketahanan pangan desa, hamparan 9,85 Ha, 6 musim aktif, & capaian panen.',
    '• **Peta Lahan GIS (/peta):** Visualisasi spasial peta sawah desa untuk monitoring tata ruang & batas blok produktif.',
    '• **Kelompok Tani (/desa/kelompok-tani):** Monitoring data kelembagaan 3 kelompok tani desa & verifikasi anggota poktan.',
    '• **Data Petani (/desa/petani):** Direktori petani desa untuk penyaluran bantuan saprodi pupuk subsidi & program ketahanan pangan.',
    '• **Lahan Pertanian (/desa/lahan):** Pengawasan legalitas, status garapan, dan luas petak sawah warga desa.',
    '• **Musim Tanam (/desa/musim-tanam):** Kalender tanam terpadu desa untuk sinkronisasi irigasi teknis & jadwal tanam serentak.',
    '• **Aktivitas Budidaya (/desa/aktivitas):** Monitoring catatan berkala perkembangan tahapan pertumbuhan padi warga.',
    '• **Rekap Panen (/desa/panen):** Rekapitulasi laporan panen gabah desa untuk laporan ke dinas pertanian/kecamatan.',
    '• **Edukasi & Panduan (/edukasi):** Referensi pedoman teknis penyuluhan pertanian padi sawah.',
    '• **Profil Saya (/desa/profil):** Biodata akun perangkat desa (Bapak Karsiman, S.Sos), kontak, & ganti kata sandi.',
    '• **AI Assistant (Widget Chat):** Asisten analitik data pertanian desa & konsultasi operasional.',
    '',
    '🌾 **3. Dashboard Petani (/petani):**',
    '• **Beranda Petani (/petani):** Panel personal petani menampilkan sawah garapan pribadi, musim tanam aktif, agenda kegiatan terdekat, & cuaca.',
    '• **Peta Lahan GIS (/peta):** Menampilkan posisi petak sawah milik sendiri di peta satelit interaktif desa.',
    '• **Kelompok Saya (/petani/kelompok-tani):** Informasi kelompok tani naungan, kontak ketua poktan, jadwal musyawarah, & rekan poktan.',
    '• **Lahan Saya (/petani/lahan):** Rincian petak sawah yang digarap (nama petak, luas m²/Ha, lokasi blok, & status aktif).',
    '• **Musim Tanam Saya (/petani/musim-tanam):** Tracking tahapan siklus padi yang sedang ditanam, umur padi (HST), varietas, & hitung mundur panen.',
    '• **Aktivitas Budidaya (/petani/aktivitas):** Jurnal harian petani mencatat olah tanah, pemupukan, semprot hama, & catatan pengeluaran biaya.',
    '• **Hasil Panen Saya (/petani/panen):** Riwayat panen pribadi dari musim ke musim & total tonase gabah diperoleh.',
    '• **Edukasi & Panduan (/edukasi):** Panduan praktis bertani padi (takaran pupuk berimbang, cara basmi wereng/sundep, jajar legowo).',
    '• **Profil Saya (/petani/profil):** Data profil petani, NIK, nomor HP/WA, domisili, foto profil, & ubah kata sandi login.',
    '• **AI Assistant (Widget Chat):** Konsultasi kendala hama, dosis pupuk Urea/NPK per HST, penyakit padi, & data sawah.'
  ].join('\\n')
}

export function generateAdminDashboardMenusResponse(): string {
  return [
    '**Daftar Menu Dashboard Administrator (/admin):**',
    '1. **Dashboard Admin (/admin):** Ringkasan metrik statistik operasional (8 petak sawah / 9,85 Ha, 6 MT aktif, 20 Ton panen, 3 poktan, 4 petani) & pintasan cepat.',
    '2. **Peta Lahan GIS (/peta):** Peta interaktif poligon satelit 8 petak sawah dengan koordinat GPS & filter 3 blok dusun.',
    '3. **Kelompok Tani (/admin/kelompok-tani):** Manajemen 3 kelembagaan poktan (Sri Rejeki, Sumber Subur, Tani Makmur) & anggota.',
    '4. **Data Petani (/admin/petani):** Direktori master data 4 petani binaan desa, NIK, alamat RT/RW, nomor HP/WA, dan luas garapan.',
    '5. **Data Master User (/admin/users):** Pengelolaan 6 akun pengguna sistem (Admin, Perangkat Desa, Petani), role, aktivasi, & reset sandi.',
    '6. **Lahan Pertanian (/admin/lahan):** Inventarisasi 8 petak sawah (9,85 Ha), nama petak, pemilik, blok, luas (m²/Ha), status aktif, & koordinat.',
    '7. **Musim Tanam (/admin/musim-tanam):** Kalender siklus tanam (6 petak aktif MT1 Rendeng 2026/2027), varietas Inpari 32 & Ciherang, jadwal tanam & estimasi panen.',
    '8. **Aktivitas Budidaya (/admin/aktivitas):** Jurnal log harian sawah (olah tanah, tanam jajar legowo, pemupukan per HST, pengairan, semprot hama) & biaya.',
    '9. **Data Panen (/admin/panen):** Pencatatan dan evaluasi produksi panen gabah desa (Total 20 Ton GKP), produktivitas Ton/Ha, mutu, & varietas.',
    '10. **Edukasi & Panduan (/edukasi):** Pustaka teknis budidaya padi, dosis pupuk berimbang, pengendalian hama OPT, & jajar legowo.',
    '11. **Profil Saya (/admin/profil):** Pengaturan data diri akun administrator & formulir ganti kata sandi.',
    '12. **Konfigurasi Sistem (/admin/konfigurasi):** Parameter AI Assistant, integrasi WhatsApp Gateway notifikasi, SMTP email, & backup sistem.',
    '13. **AI Assistant (Widget Chat):** Asisten pintar konsultasi data pertanian & budidaya padi sawah 24/7.'
  ].join('\\n')
}

export function generateDesaDashboardMenusResponse(): string {
  return [
    '**Daftar Menu Dashboard Perangkat Desa (/desa):**',
    '1. **Dashboard Desa (/desa):** Panel monitoring eksekutif ketahanan pangan desa, hamparan sawah 9,85 Ha, 6 musim aktif, & capaian 20 Ton panen.',
    '2. **Peta Lahan GIS (/peta):** Visualisasi geospasial peta sawah desa untuk monitoring tata ruang sawah & batas blok produktif.',
    '3. **Kelompok Tani (/desa/kelompok-tani):** Monitoring data kelembagaan 3 kelompok tani desa & verifikasi anggota poktan.',
    '4. **Data Petani (/desa/petani):** Direktori kependudukan petani desa untuk penyaluran bantuan saprodi pupuk subsidi & program ketahanan pangan.',
    '5. **Lahan Pertanian (/desa/lahan):** Pengawasan legalitas, status garapan, dan luas petak sawah warga desa.',
    '6. **Musim Tanam (/desa/musim-tanam):** Kalender tanam terpadu desa untuk sinkronisasi saluran irigasi teknis & tanam serentak.',
    '7. **Aktivitas Budidaya (/desa/aktivitas):** Monitoring catatan berkala perkembangan tahapan pertumbuhan padi warga.',
    '8. **Rekap Panen (/desa/panen):** Rekapitulasi laporan hasil panen gabah desa untuk laporan ke dinas pertanian/kecamatan.',
    '9. **Edukasi & Panduan (/edukasi):** Rujukan pedoman teknis penyuluhan pertanian padi sawah.',
    '10. **Profil Saya (/desa/profil):** Biodata akun perangkat desa (Bapak Karsiman, S.Sos), kontak, & ganti kata sandi.',
    '11. **AI Assistant (Widget Chat):** Konsultasi analitik data pertanian desa & operasional.'
  ].join('\\n')
}

export function generatePetaniDashboardMenusResponse(): string {
  return [
    '**Daftar Menu Dashboard Petani (/petani):**',
    '1. **Beranda Petani (/petani):** Panel personal petani menampilkan sawah garapan pribadi, musim tanam aktif, agenda kegiatan terdekat, & cuaca.',
    '2. **Peta Lahan GIS (/peta):** Menampilkan posisi petak sawah milik sendiri di peta satelit interaktif desa.',
    '3. **Kelompok Saya (/petani/kelompok-tani):** Informasi kelompok tani naungan, kontak ketua poktan, jadwal musyawarah, & rekan sekelompok.',
    '4. **Lahan Saya (/petani/lahan):** Rincian petak sawah yang digarap (nama petak, luas m²/Ha, lokasi blok, & status aktif).',
    '5. **Musim Tanam Saya (/petani/musim-tanam):** Tracking tahapan siklus padi yang sedang ditanam, umur padi (HST), varietas, & hitung mundur panen.',
    '6. **Aktivitas Budidaya (/petani/aktivitas):** Jurnal harian petani mencatat olah tanah, pemupukan, semprot hama, & catatan pengeluaran biaya.',
    '7. **Hasil Panen Saya (/petani/panen):** Riwayat panen pribadi dari musim ke musim & total tonase gabah diperoleh.',
    '8. **Edukasi & Panduan (/edukasi):** Panduan praktis bertani padi (takaran pupuk berimbang, cara basmi wereng/sundep, jajar legowo).',
    '9. **Profil Saya (/petani/profil):** Data profil petani, NIK, nomor HP/WA, domisili, foto profil, & ubah kata sandi login.',
    '10. **AI Assistant (Widget Chat):** Konsultasi kendala hama, dosis pupuk Urea/NPK per HST, penyakit padi, & data sawah.'
  ].join('\\n')
}

export function generateMenuExplanationResponse(menuKey: string): string {
  const m = menuKey.toLowerCase()
  if (m.includes('peta') || m.includes('gis')) {
    return [
      '**Menu Peta Lahan GIS (/peta):**',
      'Peta interaktif geospasial berbasis satelit digital (Leaflet / OpenStreetMap) yang memetakan seluruh lahan sawah Desa Cirebon Girang:',
      '• **Fitur Utama:** Pemetaan batas poligon 8 petak sawah dengan koordinat GPS akurat 100%.',
      '• **Filter & Layer:** Filter berdasarkan blok dusun (Blok Manis, Blok Wage, Blok Pahing), kelompok tani, dan status lahan (Aktif/Bera).',
      '• **Popup Interaktif:** Klik pada setiap petak sawah untuk melihat nama lahan, luas (m² & Ha), pengelola/petani, dan varietas padi yang sedang ditanam.',
      '• **Akses:** Terbuka untuk Administrator, Perangkat Desa, dan Petani.'
    ].join('\\n')
  }

  if (m.includes('kelompok tani') || m.includes('poktan') || m.includes('kelompok saya')) {
    return [
      '**Menu Kelompok Tani (/admin/kelompok-tani, /desa/kelompok-tani, /petani/kelompok-tani):**',
      'Mengelola dan menyajikan informasi 3 kelembagaan Poktan di Desa Cirebon Girang:',
      '1. **Poktan Sri Rejeki:** Ketua Bapak Sutarjo (HP: 0813-9988-7766), wilayah Dusun Karang Anyar / Blok Manis, 2 anggota (Bapak Sukardi & Bapak Sutarjo), luas garapan 5,90 Ha.',
      '2. **Poktan Sumber Subur:** Ketua Mang Rasidi (HP: 0857-3344-5566), wilayah Dusun Cirebon Ilir / Blok Pahing, 1 anggota (Bapak Rasidi), luas garapan 0,60 Ha.',
      '3. **Poktan Tani Makmur:** Ketua Bapak H. Karyono (HP: 0812-2233-4455), wilayah Dusun Girang Hilir / Blok Wage, 1 anggota (Bapak H. Karyono), luas garapan 2,70 Ha.',
      '• **Fitur:** Data profil poktan, kontak ketua, susunan anggota, dan akumulasi luas lahan binaan.'
    ].join('\\n')
  }

  if (m.includes('data master user') || m.includes('user') || m.includes('pengguna') || m.includes('akun')) {
    return [
      '**Menu Data Master User (/admin/users) (Khusus Administrator):**',
      'Pusat manajemen hak akses dan akun seluruh pengguna sistem SI PADI (total 6 akun terdaftar):',
      '• **Rincian Akun:** 1 Administrator (Karisma Siti Nabila), 1 Perangkat Desa (Bapak Karsiman, S.Sos), dan 4 Petani aktif (Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, Bapak Rasidi).',
      '• **Fitur:** Tambah pengguna baru, pengaturan role hak akses, aktivasi/nonaktifkan akun, dan reset kata sandi.'
    ].join('\\n')
  }

  if (m.includes('data petani') || m.includes('petani')) {
    return [
      '**Menu Data Petani (/admin/petani, /desa/petani):**',
      'Direktori master data kependudukan petani binaan Desa Cirebon Girang (4 petani aktif):',
      '• **Data Tersimpan:** Nama lengkap, NIK, alamat lengkap domisili RT/RW, nomor telepon/HP, kelompok tani naungan, jumlah petak garapan, dan total luas lahan (Ha/m²).',
      '• **Fitur:** Tambah petani baru, perbarui data kontak/domisili, hapus data, dan rekapitulasi data untuk penyaluran bantuan saprodi pupuk subsidi.'
    ].join('\\n')
  }

  if (m.includes('lahan') || m.includes('sawah')) {
    return [
      '**Menu Lahan Pertanian (/admin/lahan, /desa/lahan, /petani/lahan):**',
      'Inventarisasi dan legalitas 8 petak lahan sawah baku produktif di Desa Cirebon Girang:',
      '• **Total Baku Lahan:** 9,85 Hektar (98.500 m²), status 100% aktif produktif di 3 blok dusun (Blok Manis 5,35 Ha, Blok Wage 2,70 Ha, Blok Pahing 1,80 Ha).',
      '• **Informasi per Petak:** Nama lahan, petani pemilik/penggarap, luas petak (m² / Ha), blok dusun, titik koordinat GPS, dan status keaktifan.',
      '• **Lahan Terluas:** Sawah Hamparan Manis Tengah (20.000 m² / 2,0 Ha) milik Bapak Sutarjo.',
      '• **Fitur:** Pencarian petak, filter blok/petani, penambahan petak sawah baru (Admin), dan integrasi otomatis ke Peta GIS.'
    ].join('\\n')
  }

  if (m.includes('musim') || m.includes('kalender')) {
    return [
      '**Menu Musim Tanam (/admin/musim-tanam, /desa/musim-tanam, /petani/musim-tanam):**',
      'Pengelolaan kalender siklus tanam padi desa (saat ini aktif: **6 musim tanam berjalan MT1 Rendeng 2026/2027**):',
      '• **Varietas Ditanam:** Inpari 32 HDB (tahan kresek/hawar daun bakteri) dan Ciherang (tekstur pulen).',
      '• **Informasi Siklus:** Tanggal mulai olah tanah, tanggal semai & tanam pindah, estimasi tanggal panen, target produksi gabah, dan status siklus (Perencanaan, Berjalan, Selesai, Gagal).',
      '• **Pola Rotasi Tanam Desa:** Padi Rendeng (MT1) — Padi Gadu (MT2) — Palawija/Bera (MT3) untuk memutus siklus hama wereng & tikus.'
    ].join('\\n')
  }

  if (m.includes('aktivitas') || m.includes('kegiatan') || m.includes('budidaya')) {
    return [
      '**Menu Aktivitas Budidaya (/admin/aktivitas, /desa/aktivitas, /petani/aktivitas):**',
      'Buku jurnal log harian operasional budidaya sawah para petani (9 kegiatan tercatat):',
      '• **Kategori Aktivitas:** Persiapan Lahan & Bajak Traktor, Penanaman Sistem Jajar Legowo 2:1, Pemupukan Berimbang per HST (Urea, NPK Phonska, SP-36), Pengaturan Pengairan Macak-macak (AWD), dan Pengendalian Hama Penyakit (OPT/WBC/Sundep).',
      '• **Informasi Log:** Tanggal kegiatan, nama lahan, nama petani, uraian aktivitas, bahan/obat yang digunakan, dan pencatatan biaya operasional riil.'
    ].join('\\n')
  }

  if (m.includes('panen')) {
    return [
      '**Menu Data Panen (/admin/panen, /desa/panen, /petani/panen):**',
      'Pencatatan realisasi dan histori hasil produksi gabah desa (Total terverifikasi: **20,00 Ton / 20.000 kg GKP**):',
      '• **Data Tersimpan:** Tanggal panen, nama petani, lahan panen, varietas padi, volume produksi (kg & Ton), mutu gabah (Gabah Kering Panen Grade A / Super), dan produktivitas rata-rata (6,2–6,8 Ton/Ha).',
      '• **Hasil Tertinggi:** Bapak H. Karyono dengan hasil 11,20 Ton (11.200 kg) varietas Inpari 32 di Sawah Lembah Wage, disusul Bapak Sukardi dengan hasil 8,80 Ton (8.800 kg) di Galengan Wetan.',
      '• **Fitur:** Rekapitulasi produksi panen untuk pelaporan dinas pertanian, evaluasi surplus pangan, dan analisis produktivitas.'
    ].join('\\n')
  }

  if (m.includes('edukasi') || m.includes('panduan') || m.includes('modul')) {
    return [
      '**Menu Edukasi & Panduan (/edukasi):**',
      'Pusat perpustakaan digital panduan agronomi praktis budidaya padi sawah:',
      '• **Modul Tersedia:**',
      '  1. *Pengolahan Tanah & Persemaian:* SOP bajak singkal, seleksi benih air garam, dan persemaian dapog umur 15–18 HSS.',
      '  2. *Sistem Tanam Jajar Legowo 2:1:* Peningkatan populasi rumpun dan efek tanaman pinggir.',
      '  3. *Manajemen Pemupukan Berimbang:* Dosis pupuk dasar (0–5 HST), susulan I (10–14 HST), dan susulan II (30–35 HST).',
      '  4. *Pengendalian Hama Terpadu (PHT):* Pengendalian wereng coklat (WBC), penggerek batang (sundep/beluk), tikus sawah, keong mas, dan walang sangit.',
      '  5. *Pengendalian Penyakit:* Solusi penyakit kresek dan jamur blas potong leher.',
      '  6. *Manajemen Pengairan Macak-macak (AWD):* Penghematan air dan perangsang anakan produktif.'
    ].join('\\n')
  }

  if (m.includes('profil')) {
    return [
      '**Menu Profil Saya (/admin/profil, /desa/profil, /petani/profil):**',
      'Pusat manajemen identitas pribadi pengguna yang sedang login:',
      '• **Informasi Profil:** Nama lengkap, username, email, nomor HP/WhatsApp, alamat domisili RT/RW, dan peran pengguna (Role).',
      '• **Keamanan Akun:** Fitur ubah kata sandi / password akun dengan konfirmasi sandi baru.',
      '• **Unggah Foto:** Perbarui foto avatar profil pengguna.'
    ].join('\\n')
  }

  if (m.includes('konfigurasi') || m.includes('pengaturan')) {
    return [
      '**Menu Konfigurasi Sistem (/admin/konfigurasi) (Khusus Administrator):**',
      'Pengaturan teknis dan integrasi platform SI PADI:',
      '• **Identitas Platform:** Nama sistem, deskripsi desa, dan nama penanggung jawab (Karisma Siti Nabila).',
      '• **Kecerdasan Buatan (AI Assistant):** Pengaturan provider (Gemini / OpenAI), model AI, dan API Key.',
      '• **WhatsApp Gateway:** Konfigurasi nomor pengirim bot/broadcast (6285797864834) untuk peringatan dini hama & jadwal tanam.',
      '• **Notifikasi Email (SMTP):** Integrasi email server (smtp.gmail.com, port 587) ke target karismasitinabila7@gmail.com.',
      '• **Cadangan Data:** Pemeliharaan database MySQL Laragon.'
    ].join('\\n')
  }

  if (m.includes('ai') || m.includes('assistant') || m.includes('bot')) {
    return [
      '**Fitur AI Assistant SI PADI:**',
      'Asisten cerdas virtual interaktif yang dapat diakses dari tombol header atas atau widget chat pojok kanan bawah:',
      '• **Kemampuan:** Menjawab segala pertanyaan data real-time database desa (lahan, petani, poktan, panen, musim), konsultasi budidaya padi, penjelasan seluruh menu dashboard, hingga pembuatan laporan resmi otomatis.'
    ].join('\\n')
  }

  return generateAllDashboardMenusResponse()
}

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync(targetFile, code, 'utf8');
console.log('REWRITE_COMPLETED_SAFELY');
