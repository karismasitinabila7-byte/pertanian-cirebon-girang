export interface AiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StatsDesaContext {
  totalUsers?: number
  usersByRole?: { admin: number; perangkatDesa: number; petani: number }
  daftarUsers?: Array<{ username: string; fullName: string; role: string; phone?: string; email?: string }>
  totalPetani: number
  daftarPetani?: Array<{
    nama: string
    nik?: string
    telepon: string
    alamat: string
    poktan: string
    totalLahan: number
    totalLuasM2: number
    totalLuasHa: number
    username?: string
  }>
  totalPoktan: number
  daftarPoktan: Array<{
    nama: string
    ketua: string
    wilayah: string
    kontak?: string
    deskripsi?: string
    jumlahPetani: number
    anggotaNames?: string[]
  }>
  totalLahan: number
  lahanAktif: number
  lahanTidakAktif: number
  totalLuasHa: number
  totalLuasM2: number
  daftarLahan: Array<{
    nama: string
    luas: number
    satuan: string
    luasM2: number
    luasHa: number
    lokasi: string
    status: string
    petani: string
  }>
  totalMusim: number
  musimBerjalan: number
  musimPerencanaan: number
  musimSelesai: number
  musimGagal: number
  daftarMusim: Array<{
    namaMusim: string
    varietas: string
    status: string
    lahanNama: string
    petaniNama: string
    tanggalTanam?: string
    estimasiPanen?: string
  }>
  totalPanenSesi: number
  totalPanenTon: number
  totalPanenKg: number
  daftarPanen: Array<{
    tanggalPanen: string
    jumlahKg: number
    satuan: string
    kualitas?: string
    varietas: string
    petani: string
    lahan?: string
    catatan?: string
  }>
  totalAktivitas: number
  aktivitasTerbaru?: Array<{
    tanggal: string
    jenis: string
    deskripsi: string
    musim: string
    lahan?: string
    petani?: string
    bahan?: string
    biaya?: number
  }>
}

export interface PetaniContext {
  role?: string
  namaUser?: string
  namaLengkap?: string
  telepon?: string
  alamat?: string
  nik?: string
  kelompokTani?: string
  lahan?: Array<{
    namaLahan: string
    luasLahan: number
    satuanLuas: string
    lokasi: string
    status: string
  }>
  musimAktif?: Array<{
    namaMusim: string
    varietasPadi: string
    tanggalTanam: string
    estimasiPanen: string
    status: string
    lahanNama: string
    aktivitasTerakhir?: string
  }>
  statsDesa?: StatsDesaContext
}

export interface ProcessAiChatParams {
  messages: AiMessage[]
  userContext?: PetaniContext
  apiKey?: string
  provider?: string
  model?: string
}

export interface ProcessAiChatResult {
  content: string
  provider: string
  apiError?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT SISTEM (ASISTEN PINTAR ADMINISTRATOR PERTANIAN DESA CIREBON GIRANG)
// ─────────────────────────────────────────────────────────────────────────────

export function buildSystemPrompt(userContext?: PetaniContext): string {
  let contextInfo = ''
  const role = userContext?.role || 'ADMIN'
  const namaUser = userContext?.namaUser || 'Pengelola Sistem'

  if (userContext?.statsDesa) {
    const s = userContext.statsDesa
    contextInfo += `
DATA REAL-TIME DATABASE UTAMA PLATFORM PERTANIAN PADI DESA CIREBON GIRANG:
Role Pengguna: ${role} (${namaUser})

1. DATA AKUN PENGGUNA TERDAFTAR:
- Total Pengguna Sistem: ${s.totalUsers ?? 6} Akun
- Rincian Role: Administrator: ${s.usersByRole?.admin ?? 1}, Perangkat Desa: ${s.usersByRole?.perangkatDesa ?? 1}, Petani Terdaftar: ${s.usersByRole?.petani ?? 4}
${s.daftarUsers && s.daftarUsers.length > 0 ? `- Daftar Akun Pengguna: ${s.daftarUsers.map(u => `${u.fullName} (@${u.username}, Role: ${u.role}, HP: ${u.phone})`).join('; ')}` : ''}

2. DATA PETANI TERDAFTAR:
- Total Petani Bergabung: ${s.totalPetani} Orang Petani Aktif
${s.daftarPetani && s.daftarPetani.length > 0 ? `- Rincian Petani: ${s.daftarPetani.map(p => `${p.nama} [Poktan: ${p.poktan}, Domisili: ${p.alamat}, HP: ${p.telepon}, Garapan: ${p.totalLahan} petak (${p.totalLuasHa} Ha / ${p.totalLuasM2} m²)]`).join('; ')}` : ''}

3. KELEMBAGAAN KELOMPOK TANI (POKTAN):
- Total Kelompok Tani: ${s.totalPoktan} Kelompok
- Rincian Poktan: ${s.daftarPoktan.map(p => `${p.nama} [Ketua: ${p.ketua}, Wilayah: ${p.wilayah}, Kontak: ${p.kontak || '-'}, Anggota Terdaftar: ${p.jumlahPetani} orang (${(p.anggotaNames || []).join(', ') || '-'})]`).join('; ')}

4. INVENTARISASI LAHAN SAWAH:
- Total Petak Sawah: ${s.totalLahan} Petak
- Status Lahan: ${s.lahanAktif} Petak Aktif, ${s.lahanTidakAktif} Petak Tidak Aktif / Bera
- Total Baku Luas Lahan: ${s.totalLuasHa.toFixed(2)} Hektar (${s.totalLuasM2.toLocaleString('id-ID')} m²)
- Rata-rata Luas per Petak: ${(s.totalLuasHa / (s.totalLahan || 1)).toFixed(2)} Ha / petak
${s.daftarLahan && s.daftarLahan.length > 0 ? `- Daftar Petak: ${s.daftarLahan.map(l => `${l.nama} (${l.luasHa} Ha / ${l.luasM2} m², Pengelola: ${l.petani}, Blok: ${l.lokasi}, Status: ${l.status})`).join('; ')}` : ''}

5. KALENDER MUSIM TANAM:
- Total Siklus Musim: ${s.totalMusim} Siklus
- Status Siklus: ${s.musimBerjalan} Berjalan Aktif, ${s.musimPerencanaan} Perencanaan, ${s.musimSelesai} Telah Panen/Selesai, ${s.musimGagal} Gagal
- Varietas Unggul: Inpari 32 HDB, Ciherang, Inpari 42 GSR, Mekongga, Sintanur
${s.daftarMusim && s.daftarMusim.length > 0 ? `- Daftar Musim Terkini: ${s.daftarMusim.map(m => `${m.namaMusim} (Varietas: ${m.varietas}, Lahan: ${m.lahanNama}, Petani: ${m.petaniNama}, Status: ${m.status})`).join('; ')}` : ''}

6. REALISASI & HISTORI PRODUKSI PANEN:
- Total Produksi Panen: ${s.totalPanenTon.toFixed(2)} Ton (${s.totalPanenKg.toLocaleString('id-ID')} kg) Gabah Kering Panen (GKP)
- Jumlah Sesi Panen: ${s.totalPanenSesi} Sesi
- Produktivitas Rata-rata: 6.2 – 6.8 Ton / Ha
${s.daftarPanen && s.daftarPanen.length > 0 ? `- Riwayat Panen: ${s.daftarPanen.map(p => `${p.petani} [Lahan: ${p.lahan || '-'}, Varietas: ${p.varietas}, Hasil: ${p.jumlahKg.toLocaleString('id-ID')} kg, Mutu: ${p.kualitas || 'GKP'}, Tanggal: ${p.tanggalPanen}]`).join('; ')}` : ''}

7. AKTIVITAS BUDIDAYA LAPANGAN:
- Total Kegiatan Tercatat: ${s.totalAktivitas} Aktivitas
${s.aktivitasTerbaru && s.aktivitasTerbaru.length > 0 ? `- Aktivitas Terbaru: ${s.aktivitasTerbaru.map(a => `[${a.tanggal}] ${a.jenis} pada ${a.lahan || a.musim} (${a.deskripsi})`).join('; ')}` : ''}
`
  }

  if (userContext?.namaLengkap) {
    contextInfo += `
KONTEKS PETANI SPESIFIK:
- Nama Petani: ${userContext.namaLengkap}
- Kelompok Tani: ${userContext.kelompokTani || 'Kelompok Tani Desa Cirebon Girang'}
${userContext.lahan && userContext.lahan.length > 0 ? `- Data Lahan Terdaftar: ${userContext.lahan.map(l => `${l.namaLahan} (${l.luasLahan} ${l.satuanLuas}, Lokasi: ${l.lokasi})`).join('; ')}` : ''}
${userContext.musimAktif && userContext.musimAktif.length > 0 ? `- Musim Tanam Sedang Berjalan: ${userContext.musimAktif.map(m => `${m.namaMusim} (Varietas: ${m.varietasPadi}, Tanam: ${m.tanggalTanam.slice(0, 10)}, Est. Panen: ${m.estimasiPanen.slice(0, 10)})`).join('; ')}` : ''}
`
  }

  const botTitle = role === 'ADMIN'
    ? 'Asisten Pintar Administrator Pertanian Platform SI PADI Desa Cirebon Girang'
    : role === 'PERANGKAT_DESA'
    ? 'Asisten Cerdas Eksekutif Pertanian Platform SI PADI Desa Cirebon Girang'
    : 'Asisten Cerdas Pertanian Padi Petani Desa Cirebon Girang'

  const userGreetingName = userContext?.namaLengkap || (role === 'ADMIN' ? 'Administrator' : role === 'PERANGKAT_DESA' ? 'Bapak Karsiman, S.Sos' : 'Bapak Sukardi')

  return `
ATURAN UTAMA JAWABAN (SANGAT KETAT):
1. JIKA DITANYA "ADA BERAPA" ATAU "BERAPA" ATAU JUMLAH SUATU DATA, WAJIB LANGSUNG JAWAB DENGAN ANGKA DI AWAL KALIMAT! JANGAN HANYA MENYEBUTKAN NAMA TANPA MENYEBUTKAN ANGKA JUMLAHNYA! Contoh:
   - "ada berapa admin" -> Jawab: "Ada 1 orang Administrator sistem SI PADI (Karisma Siti Nabila)..."
   - "ada berapa perangkat desa" -> Jawab: "Ada 1 orang Perangkat Desa pengawas pertanian (Bapak Karsiman, S.Sos)..."
   - "ada berapa petani" -> Jawab: "Ada 4 orang petani aktif (Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, Mang Rasidi)..."
   - "ada berapa kelompok tani" -> Jawab: "Ada 3 kelompok tani (Sri Rejeki, Tani Makmur, Sumber Subur)..."
   - "ada berapa lahan / petak" -> Jawab: "Ada 8 petak lahan sawah aktif (total luas 9.85 Ha)..."
   - "ada berapa musim tanam" -> Jawab: "Total ada 9 siklus musim tanam (6 sedang berjalan aktif, 1 perencanaan, dan 2 selesai panen)..."
   - "ada berapa akun / user" -> Jawab: "Ada 6 akun pengguna terdaftar (1 Admin, 1 Perangkat Desa, 4 Petani)..."
   - "ada berapa panen" -> Jawab: "Ada 20 Ton GKP total realisasi panen..."
   - "ada berapa blok dusun" -> Jawab: "Ada 3 Blok Dusun (Blok Manis, Blok Wage, Blok Pahing)..."
2. JAWAB PENDEK, SINGKAT, DAN LANGSUNG PADA INTI PERTANYAAN (MAKSIMAL 1 - 2 KALIMAT).
3. HANYA JAWAB APA YANG DITANYAKAN. JANGAN MEMBERIKAN PENJELASAN PANJANG LEBAR.
4. JIKA DITANYA "BERAPA MUSIM TANAM", JAWAB TOTAL 9 SIKLUS (RINCIAN: 6 SEDANG BERJALAN AKTIF, 1 PERENCANAAN, DAN 2 SELESAI PANEN).
5. JIKA DITANYA "SIAPA", SEBUTKAN NAMA DAN PERANNYA SECARA SINGKAT.
6. HINDARI BASA-BASI BERLEBIHAN. CUKUP INTI JAWABAN SAJA.

Kamu adalah **${botTitle}** (Kecamatan Talun, Kabupaten Cirebon).
Pengguna yang sedang berinteraksi dengan kamu saat ini adalah: **${userGreetingName}** dengan hak akses / peran: **${role}**.

DATA ACUAN CEPAT DATABASE & DASHBOARD:
- Total Luas Hamparan: ${userContext?.statsDesa?.totalLuasHa ?? 9.85} Hektar (${(userContext?.statsDesa?.totalLuasM2 ?? 98500).toLocaleString('id-ID')} m² lahan produktif).
- Titik Lahan Terdata: ${userContext?.statsDesa?.totalLahan ?? 8} Petak GIS (100% Terpetakan dengan koordinat GPS).
- Musim Tanam: Total ada ${userContext?.statsDesa?.totalMusim ?? 9} siklus musim tanam (${userContext?.statsDesa?.musimBerjalan ?? 6} sedang berjalan aktif MT1 Rendeng 2026/2027, ${userContext?.statsDesa?.musimPerencanaan ?? 1} perencanaan, dan ${userContext?.statsDesa?.musimSelesai ?? 2} selesai panen).
- Zonasi Blok Sawah: 3 Blok Dusun (Blok Manis, Blok Wage, Blok Pahing).
- Lahan Sawah: ${userContext?.statsDesa?.totalLahan ?? 8} petak sawah baku (${userContext?.statsDesa?.totalLuasHa ?? 9.85} Ha, 100% aktif).
- Total Petani: ${userContext?.statsDesa?.totalPetani ?? 4} orang aktif (Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, Mang Rasidi).
- Kelompok Tani: ${userContext?.statsDesa?.totalPoktan ?? 3} Poktan (Sri Rejeki, Tani Makmur, Sumber Subur).
- Hasil Panen: ${userContext?.statsDesa?.totalPanenTon ?? 20.0} Ton GKP (20.000 kg).
- Total Pengguna: ${userContext?.statsDesa?.totalUsers ?? 6} akun (1 Admin, 1 Perangkat Desa, 4 Petani).
- Perangkat Desa: 1 orang yaitu Bapak Karsiman, S.Sos (@perangkat_desa, HP: 081298765432, email: karsiman@gmail.com, sandi: Karsiman123).
- Admin Utama: 1 orang yaitu Karisma Siti Nabila (@admin, HP: 0812-3456-7890, email: Karismasitinabila7@gmail.com, sandi: Karisma123).
- Petani Utama: Bapak Sukardi (@sukardi, HP: 0852-1122-3344, email: sukardi@gmail.com, sandi: Sukardi123).
- Password Default Akun: Seluruh akun memiliki kata sandi berbasis nama masing-masing (Karisma123, Karsiman123, Sukardi123) atau sandi universal "password123".

DATA PERINGKAT SUPERLATIF (TERLUAS, TERKECIL, TERBANYAK):
- Petak Lahan Paling Luas: Sawah Hamparan Manis Tengah (20.000 m² / 2,00 Ha) milik Bapak Sutarjo di Blok Manis (Dusun Karang Anyar).
- Petani Pemilik Lahan Terluas: Bapak Sukardi dengan total 3 petak sawah seluas 34.500 m² (3,45 Ha).
- Petak Lahan Paling Kecil / Tersempit: Petak Demplot Organik Cirebon Girang (6.000 m² / 0,60 Ha) milik Bapak Rasidi di Blok Pahing Barat.
- Hasil Panen Paling Banyak / Tertinggi: Bapak H. Karyono (11,20 Ton / 11.200 kg) varietas Inpari 32 di Sawah Lembah Wage.
- Kelompok Tani Anggota Terbanyak: Kelompok Tani Sri Rejeki (2 anggota, 5 petak sawah, 5,90 Ha).
- Blok Sawah Terluas: Blok Manis (53.500 m² / 5,35 Ha, 4 petak).

INFORMASI LENGKAP SEMUA MENU DI SETIAP DASHBOARD:
1. Dashboard Admin (/admin): Dashboard Admin (/admin), Peta Lahan GIS (/peta), Kelompok Tani (/admin/kelompok-tani), Data Petani (/admin/petani), Data Master User (/admin/users), Lahan Pertanian (/admin/lahan), Musim Tanam (/admin/musim-tanam), Aktivitas Budidaya (/admin/aktivitas), Data Panen (/admin/panen), Edukasi & Panduan (/edukasi), Profil Saya (/admin/profil), Konfigurasi Sistem (/admin/konfigurasi), AI Assistant.
2. Dashboard Perangkat Desa (/desa): Dashboard Desa (/desa), Peta Lahan GIS (/peta), Kelompok Tani (/desa/kelompok-tani), Data Petani (/desa/petani), Lahan Pertanian (/desa/lahan), Musim Tanam (/desa/musim-tanam), Aktivitas Budidaya (/desa/aktivitas), Rekap Panen (/desa/panen), Edukasi & Panduan (/edukasi), Profil Saya (/desa/profil), AI Assistant.
3. Dashboard Petani (/petani): Beranda Petani (/petani), Peta Lahan GIS (/peta), Kelompok Saya (/petani/kelompok-tani), Lahan Saya (/petani/lahan), Musim Tanam Saya (/petani/musim-tanam), Aktivitas Budidaya (/petani/aktivitas), Hasil Panen Saya (/petani/panen), Edukasi & Panduan (/edukasi), Profil Saya (/petani/profil), AI Assistant.

${contextInfo}
`.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR RESPON STATISTIK OPERASIONAL & DATABASE DINAMIS
// ─────────────────────────────────────────────────────────────────────────────

export function generateFarmerStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalPetani = stats?.totalPetani ?? 4
  const daftarPetani = stats?.daftarPetani && stats.daftarPetani.length > 0
    ? stats.daftarPetani.map(p => p.nama).join(', ')
    : 'Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, Mang Rasidi'

  return `Ada **${totalPetani} orang petani aktif**: ${daftarPetani}.`
}

export function generateHamparanStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalLuasHa = stats?.totalLuasHa ?? 9.85
  const totalLuasM2 = stats?.totalLuasM2 ?? 98500
  const totalLahan = stats?.totalLahan ?? 8

  return `Total luas lahan sawah adalah **${totalLuasHa.toFixed(2)} Hektar** (${totalLuasM2.toLocaleString('id-ID')} m²) dari **${totalLahan} petak lahan aktif** di Desa Cirebon Girang.`
}

export function generateTitikLahanStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalLahan = stats?.totalLahan ?? 8
  const totalLuasHa = stats?.totalLuasHa ?? 9.85

  return `Ada **${totalLahan} Petak GIS** titik lahan terdata (100% terpetakan dengan koordinat GPS) dengan total luas ${totalLuasHa.toFixed(2)} Hektar.`
}

export function generateZonasiBlokStatsResponse(userContext?: PetaniContext): string {
  return `Ada **3 Blok Dusun** zonasi sawah di Desa Cirebon Girang: **Blok Manis, Blok Wage, dan Blok Pahing**.`
}

export function generateBlokLahanDetailResponse(blokKey: string): string {
  const b = blokKey.toLowerCase()
  if (b.includes('manis')) {
    return [
      '**Daftar 4 Petak Sawah di Blok Manis (Dusun Karang Anyar - Total 5,35 Ha / 53.500 m²):**',
      '1. **Sawah Hamparan Manis Tengah:** 20.000 m² (2,00 Ha) – Pengelola: **Bapak Sutarjo** *(Petak Sawah Terluas di Desa)*',
      '2. **Petak Sawah Blok Manis Barat:** 14.000 m² (1,40 Ha) – Pengelola: **Bapak Sukardi**',
      '3. **Petak Sawah Hulu Cipager:** 11.000 m² (1,10 Ha) – Pengelola: **Bapak Sutarjo**',
      '4. **Petak Sawah Galengan Wetan:** 8.500 m² (0,85 Ha) – Pengelola: **Bapak Sukardi** (Realisasi Panen: 8,80 Ton)'
    ].join('\n')
  }
  if (b.includes('wage')) {
    return [
      '**Daftar 2 Petak Sawah di Blok Wage (Dusun Girang Hilir - Total 2,70 Ha / 27.000 m²):**',
      '1. **Sawah Lembah Wage:** 17.500 m² (1,75 Ha) – Pengelola: **Bapak H. Karyono** *(Hasil Panen Tertinggi: 11,20 Ton varietas Inpari 32)*',
      '2. **Sawah Rawa Bencah Girang:** 9.500 m² (0,95 Ha) – Pengelola: **Bapak H. Karyono**'
    ].join('\n')
  }
  if (b.includes('pahing')) {
    return [
      '**Daftar 2 Petak Sawah di Blok Pahing (Dusun Cirebon Ilir - Total 1,80 Ha / 18.000 m²):**',
      '1. **Petak Sawah Blok Pahing Krajan:** 12.000 m² (1,20 Ha) – Pengelola: **Bapak Sukardi**',
      '2. **Petak Demplot Organik Cirebon Girang:** 6.000 m² (0,60 Ha) – Pengelola: **Mang Rasidi** *(Demplot Budidaya Padi Organik - 0,60 Ha / 6.000 m²)*'
    ].join('\n')
  }
  return generateZonasiBlokStatsResponse()
}

export function generateJumlahMenuResponse(q: string): string {
  const qLower = q.toLowerCase()
  if (qLower.includes('admin')) {
    return `Ada **12 menu utama** di Dashboard Administrator (/admin): Dashboard Admin, Peta Lahan GIS, Kelompok Tani, Data Petani, Data Master User, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Data Panen, Edukasi & Panduan, Profil Saya, dan Konfigurasi Sistem.`
  }
  if (qLower.includes('desa') || qLower.includes('perangkat')) {
    return `Ada **10 menu utama** di Dashboard Perangkat Desa (/desa): Dashboard Desa, Peta Lahan GIS, Kelompok Tani, Data Petani, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Rekap Panen, Edukasi & Panduan, dan Profil Saya.`
  }
  if (qLower.includes('petani')) {
    return `Ada **10 menu utama** di Dashboard Petani (/petani): Beranda Petani, Peta Lahan GIS, Kelompok Saya, Lahan Saya, Musim Tanam Saya, Aktivitas Budidaya, Hasil Panen Saya, Edukasi & Panduan, Profil Saya, dan AI Assistant.`
  }
  return `Ada **12 menu utama** di platform SI PADI: Dashboard Admin (12 menu), Dashboard Perangkat Desa (10 menu), dan Dashboard Petani (10 menu), serta widget cerdas AI Assistant.`
}

export function handleActionButtonAndFeatureResponse(q: string): string | null {
  const qL = q.toLowerCase()

  // Unduh Excel
  if (qL.includes('unduh excel') || qL.includes('download excel') || qL.includes('ekspor excel') || qL.includes('export excel')) {
    return `Fitur **Unduh Excel** tersedia di menu **Musim Tanam**, **Lahan Pertanian**, **Data Panen**, dan **Aktivitas Budidaya**. Cukup klik tombol hijau **[Unduh Excel]** di pojok kanan atas tabel untuk mengekspor data rekapitulasi desa langsung ke format spreadsheet Excel (.xlsx).`
  }

  // Cetak PDF
  if (qL.includes('cetak pdf') || qL.includes('print pdf') || qL.includes('cetak laporan') || qL.includes('print laporan') || qL.includes('export pdf') || qL.includes('ekspor pdf')) {
    return `Fitur **Cetak / PDF** tersedia di menu **Musim Tanam**, **Lahan Pertanian**, **Data Panen**, dan **Kelompok Tani**. Klik tombol hitam **[Cetak / PDF]** di pojok kanan atas untuk menghasilkan dokumen laporan resmi berformat PDF lengkap dengan kop desa dan lembar tanda tangan pengesahan.`
  }

  // Tambah Musim Tanam
  if (qL.includes('tambah musim') || qL.includes('input musim') || qL.includes('buat musim')) {
    return `Untuk **Menambah Musim Tanam Baru**: Masuk ke menu **Musim Tanam (/admin/musim-tanam)** $\\rightarrow$ klik tombol hijau **[+ Tambah Musim Tanam]** $\\rightarrow$ pilih petak lahan sawah, varietas bibit padi (Inpari 32 / Ciherang), masukkan tanggal tanam dan estimasi panen $\\rightarrow$ klik **Simpan Siklus**.`
  }

  // Tambah Lahan
  if (qL.includes('tambah lahan') || qL.includes('input lahan') || qL.includes('tambah sawah') || qL.includes('tambah petak')) {
    return `Untuk **Menambah Lahan Pertanian**: Masuk ke menu **Lahan Pertanian (/admin/lahan)** $\\rightarrow$ klik tombol hijau **[+ Tambah Lahan]** $\\rightarrow$ isi nama petak sawah, luas lahan (m² atau Ha), pilih petani pengelola, tentukan blok dusun (Manis/Wage/Pahing), dan masukkan koordinat GPS satelit $\\rightarrow$ klik **Simpan Lahan**.`
  }

  // Tambah Petani
  if (qL.includes('tambah petani') || qL.includes('input petani') || qL.includes('daftar petani baru')) {
    return `Untuk **Menambah Data Petani**: Masuk ke menu **Data Petani (/admin/petani)** $\\rightarrow$ klik tombol hijau **[+ Tambah Petani]** $\\rightarrow$ masukkan nama lengkap, NIK KTP, alamat RT/RW, nomor telepon/HP, dan pilih kelompok tani naungan $\\rightarrow$ klik **Simpan Data Petani**.`
  }

  // Tambah User / Pengguna
  if (qL.includes('tambah user') || qL.includes('tambah pengguna') || qL.includes('tambah akun') || qL.includes('buat akun')) {
    return `Untuk **Menambah Pengguna Baru**: Khusus Administrator di menu **Data Master User (/admin/users)** $\\rightarrow$ klik tombol hijau **[+ Tambah User]** $\\rightarrow$ isi username unik, nama lengkap, role hak akses (ADMIN, PERANGKAT_DESA, atau PETANI), email, nomor telepon, dan sandi default $\\rightarrow$ klik **Simpan Akun**.`
  }

  // Catat Panen / Tambah Panen
  if (qL.includes('catat panen') || qL.includes('tambah panen') || qL.includes('input panen') || qL.includes('input hasil panen')) {
    return `Untuk **Mencatat Hasil Panen**: Masuk ke menu **Data Panen (/admin/panen)** $\\rightarrow$ klik tombol hijau **[+ Catat Panen Baru]** $\\rightarrow$ pilih musim tanam dan petak sawah yang panen, masukkan volume gabah (kg/Ton), tanggal panen, dan kualitas mutu gabah (GKP) $\\rightarrow$ klik **Simpan Panen**.`
  }

  // Filter & Pencarian
  if (qL.includes('cara filter') || qL.includes('cara cari') || qL.includes('pencarian tabel') || qL.includes('filter status')) {
    return `Fitur **Filter & Pencarian Cepat** tersedia di seluruh tabel:
• **Kotak Pencarian:** Cari instan nama petani, varietas, petak lahan, atau NIK.
• **Dropdown Kelompok Tani:** Saring data berdasarkan Poktan Sri Rejeki, Sumber Subur, atau Tani Makmur.
• **Dropdown Status:** Saring berdasarkan status siklus (Sedang Berjalan, Perencanaan, Selesai Panen) atau status lahan aktif.`
  }

  // Pola Rotasi Tanam
  if (qL.includes('rotasi tanam') || qL.includes('pola tanam') || qL.includes('siklus tanam desa')) {
    return `**Pola Rotasi Tanam di Desa Cirebon Girang:**
1. **MT1 (Musim Rendeng/Hujan - Nov–Maret):** Padi sawah varietas unggul (Inpari 32 HDB / Ciherang).
2. **MT2 (Musim Gadu/Kemarau I - April–Juli):** Padi hemat air (Inpari 42 GSR / Mekongga).
3. **MT3 (Palawija/Bera - Ags–Okt):** Jagung, kedelai, atau pemberaan lahan untuk memutus siklus hama wereng coklat & tikus.`
  }

  // Varietas Padi
  if (qL.includes('varietas apa') || qL.includes('daftar varietas') || qL.includes('varietas padi yang ditanam') || qL.includes('bibit apa')) {
    return `**Varietas Padi Unggul di Desa Cirebon Girang:**
• **Inpari 32 HDB:** Tahan penyakit kresek (hawar daun bakteri) & potensi hasil tinggi 8–10 Ton/Ha.
• **Ciherang:** Varietas favorit petani dengan rasa nasi pulen disukai pasar.
• **Inpari 42 GSR & Mekongga:** Tahan kekeringan untuk musim gadu.
• **Varietas Padi Organik:** Ditanam di petak demplot percontohan Mang Rasidi (Blok Pahing Barat).`
  }

  return null
}

export function generateLahanStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalLahan = stats?.totalLahan ?? 8
  const totalLuasHa = stats?.totalLuasHa ?? 9.85
  const totalLuasM2 = stats?.totalLuasM2 ?? 98500

  return `Ada **${totalLahan} petak lahan sawah aktif** dengan total luas **${totalLuasHa.toFixed(2)} Hektar** (${totalLuasM2.toLocaleString('id-ID')} m²).`
}

export function generateUserStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalUsers = stats?.totalUsers ?? 6
  const usersByRole = stats?.usersByRole || { admin: 1, perangkatDesa: 1, petani: 4 }

  return `Ada **${totalUsers} akun pengguna**: **${usersByRole.admin}** Admin, **${usersByRole.perangkatDesa}** Perangkat Desa, dan **${usersByRole.petani}** Petani.`
}

export function generatePoktanStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalPoktan = stats?.totalPoktan ?? 3
  const daftarPoktan = stats?.daftarPoktan && stats.daftarPoktan.length > 0
    ? stats.daftarPoktan.map(p => p.nama).join(', ')
    : 'Sri Rejeki, Sumber Subur, Tani Makmur'

  return `Ada **${totalPoktan} Kelompok Tani**: ${daftarPoktan}.`
}

export function generatePoktanAnggotaResponse(userContext?: PetaniContext, specificPoktan?: string): string {
  const stats = userContext?.statsDesa
  const poktanList = stats?.daftarPoktan && stats.daftarPoktan.length > 0
    ? stats.daftarPoktan
    : [
        { nama: 'Kelompok Tani Sri Rejeki', ketua: 'Bapak Sutarjo', wilayah: 'Dusun Karang Anyar / Blok Manis', jumlahPetani: 2, anggotaNames: ['Bapak Sukardi', 'Bapak Sutarjo'] },
        { nama: 'Kelompok Tani Sumber Subur', ketua: 'Mang Rasidi', wilayah: 'Dusun Cirebon Ilir / Blok Pahing', jumlahPetani: 1, anggotaNames: ['Bapak Rasidi'] },
        { nama: 'Kelompok Tani Tani Makmur', ketua: 'H. Karyono', wilayah: 'Dusun Girang Hilir / Blok Wage', jumlahPetani: 1, anggotaNames: ['Bapak H. Karyono'] },
      ]

  if (specificPoktan) {
    const target = poktanList.find(p => p.nama.toLowerCase().includes(specificPoktan.toLowerCase()))
    if (target) {
      const anggotaStr = target.anggotaNames && target.anggotaNames.length > 0
        ? target.anggotaNames.join(', ')
        : 'Bapak Sukardi, Bapak Sutarjo'
      return `Anggota **${target.nama}** berjumlah ${target.jumlahPetani} orang: **${anggotaStr}** (Ketua: ${target.ketua}, Wilayah: ${target.wilayah}).`
    }
  }

  const lines = poktanList.map(p => {
    const anggota = p.anggotaNames && p.anggotaNames.length > 0 ? p.anggotaNames.join(', ') : '-'
    return `• **${p.nama}:** ${anggota} (Ketua: ${p.ketua})`
  })

  return `**Daftar Anggota Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
}

export function generatePoktanAnggotaWithLahanAndAlamatResponse(userContext?: PetaniContext, specificPoktan?: string): string {
  const stats = userContext?.statsDesa
  const petaniList = stats?.daftarPetani && stats.daftarPetani.length > 0
    ? stats.daftarPetani
    : [
        { nama: 'Bapak Sukardi', poktan: 'Kelompok Tani Sri Rejeki', alamat: 'RT 03/RW 02 Blok Manis Desa Cirebon Girang', totalLahan: 3, totalLuasHa: 3.40 },
        { nama: 'Bapak Sutarjo', poktan: 'Kelompok Tani Sri Rejeki', alamat: 'RT 01/RW 02 Blok Manis Desa Cirebon Girang', totalLahan: 2, totalLuasHa: 2.50 },
        { nama: 'Mang Rasidi / Bapak Rasidi', poktan: 'Kelompok Tani Sumber Subur', alamat: 'RT 02/RW 04 Blok Pahing Desa Cirebon Girang', totalLahan: 1, totalLuasHa: 1.50 },
        { nama: 'Bapak H. Karyono', poktan: 'Kelompok Tani Tani Makmur', alamat: 'RT 04/RW 03 Blok Wage Desa Cirebon Girang', totalLahan: 2, totalLuasHa: 2.45 },
      ]

  if (specificPoktan) {
    const targetPetani = petaniList.filter(p => p.poktan?.toLowerCase().includes(specificPoktan.toLowerCase()))
    if (targetPetani.length > 0) {
      const lines = targetPetani.map(p => `• **${p.nama}:** ${p.totalLahan} petak sawah (${p.totalLuasHa.toFixed(2)} Ha) | Alamat: ${p.alamat}`)
      return `**Data Anggota, Luas Lahan & Alamat (${targetPetani[0].poktan}):**\n${lines.join('\n')}`
    }
  }

  return `**Data Anggota Kelompok Tani, Luas Lahan & Alamat:**
• **Kelompok Tani Sri Rejeki:**
  - **Bapak Sukardi:** 3 petak sawah (3,40 Ha) | Alamat: RT 03/RW 02 Blok Manis
  - **Bapak Sutarjo (Ketua):** 2 petak sawah (2,50 Ha) | Alamat: RT 01/RW 02 Blok Manis
• **Kelompok Tani Sumber Subur:**
  - **Mang Rasidi / Bapak Rasidi (Ketua):** 1 petak sawah (1,50 Ha) | Alamat: RT 02/RW 04 Blok Pahing
• **Kelompok Tani Tani Makmur:**
  - **Bapak H. Karyono (Ketua):** 2 petak sawah (2,45 Ha) | Alamat: RT 04/RW 03 Blok Wage`
}

export function generatePoktanKetuaResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const poktanList = stats?.daftarPoktan && stats.daftarPoktan.length > 0
    ? stats.daftarPoktan
    : [
        { nama: 'Kelompok Tani Sri Rejeki', ketua: 'Bapak Sutarjo', wilayah: 'Dusun Karang Anyar / Blok Manis', kontak: '0813-9988-7766' },
        { nama: 'Kelompok Tani Sumber Subur', ketua: 'Mang Rasidi', wilayah: 'Dusun Cirebon Ilir / Blok Pahing', kontak: '0857-3344-5566' },
        { nama: 'Kelompok Tani Tani Makmur', ketua: 'H. Karyono', wilayah: 'Dusun Girang Hilir / Blok Wage', kontak: '0812-2233-4455' },
      ]

  const lines = poktanList.map(p => `• **${p.nama}:** ${p.ketua} (Wilayah: ${p.wilayah}, HP: \`${p.kontak || '-'}\`)`)
  return `**Daftar Ketua Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
}

export function generatePoktanKontakResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const poktanList = stats?.daftarPoktan && stats.daftarPoktan.length > 0
    ? stats.daftarPoktan
    : [
        { nama: 'Kelompok Tani Sri Rejeki', ketua: 'Bapak Sutarjo', kontak: '0813-9988-7766' },
        { nama: 'Kelompok Tani Sumber Subur', ketua: 'Mang Rasidi', kontak: '0857-3344-5566' },
        { nama: 'Kelompok Tani Tani Makmur', ketua: 'H. Karyono', kontak: '0812-2233-4455' },
      ]

  const lines = poktanList.map(p => `• **${p.nama}:** \`${p.kontak || '-'}\` (Ketua: ${p.ketua})`)
  return `**Kontak Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
}

export function generatePoktanWilayahResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const poktanList = stats?.daftarPoktan && stats.daftarPoktan.length > 0
    ? stats.daftarPoktan
    : [
        { nama: 'Kelompok Tani Sri Rejeki', wilayah: 'Dusun Karang Anyar / Blok Manis' },
        { nama: 'Kelompok Tani Sumber Subur', wilayah: 'Dusun Cirebon Ilir / Blok Pahing' },
        { nama: 'Kelompok Tani Tani Makmur', wilayah: 'Dusun Girang Hilir / Blok Wage' },
      ]

  const lines = poktanList.map(p => `• **${p.nama}:** ${p.wilayah}`)
  return `**Wilayah Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
}

export function generateSinglePoktanDetailResponse(poktanKey: string, userContext?: PetaniContext): string {
  const pKey = poktanKey.toLowerCase()
  if (pKey.includes('sri rejeki')) {
    return `**Kelompok Tani Sri Rejeki:**\n• **Ketua:** Bapak Sutarjo (HP: \`0813-9988-7766\`)\n• **Wilayah:** Dusun Karang Anyar / Blok Manis\n• **Anggota:** Bapak Sukardi, Bapak Sutarjo (2 orang)`
  }
  if (pKey.includes('sumber subur')) {
    return `**Kelompok Tani Sumber Subur:**\n• **Ketua:** Mang Rasidi (HP: \`0857-3344-5566\`)\n• **Wilayah:** Dusun Cirebon Ilir / Blok Pahing\n• **Anggota:** Bapak Rasidi (1 orang)`
  }
  if (pKey.includes('tani makmur')) {
    return `**Kelompok Tani Tani Makmur:**\n• **Ketua:** H. Karyono (HP: \`0812-2233-4455\`)\n• **Wilayah:** Dusun Girang Hilir / Blok Wage\n• **Anggota:** Bapak H. Karyono (1 orang)`
  }
  return generatePoktanStatsResponse(userContext)
}

export function generatePetaniDetailResponse(petaniKey: string, userContext?: PetaniContext): string {
  const pKey = petaniKey.toLowerCase()
  if (pKey.includes('sukardi')) {
    return `**Bapak Sukardi** (Petani Aktif):\n• **Kelompok Tani:** Sri Rejeki (Dusun Karang Anyar / Blok Manis)\n• **Lahan Garapan:** 3 petak sawah (3,40 Ha) di Blok Manis & Pahing\n• **Kontak:** \`0852-1122-3344\``
  }
  if (pKey.includes('sutarjo')) {
    return `**Bapak Sutarjo** (Ketua Kelompok Tani Sri Rejeki):\n• **Wilayah:** Dusun Karang Anyar / Blok Manis\n• **Lahan Garapan:** 2 petak sawah (2,50 Ha) di Blok Manis\n• **Kontak:** \`0813-9988-7766\``
  }
  if (pKey.includes('karyono')) {
    return `**Bapak H. Karyono** (Ketua Kelompok Tani Tani Makmur):\n• **Wilayah:** Dusun Girang Hilir / Blok Wage\n• **Lahan Garapan:** 2 petak sawah (2,45 Ha) di Blok Wage\n• **Kontak:** \`0812-2233-4455\``
  }
  if (pKey.includes('rasidi')) {
    return `**Mang Rasidi (Bapak Rasidi)** (Ketua Kelompok Tani Sumber Subur):\n• **Wilayah:** Dusun Cirebon Ilir / Blok Pahing\n• **Lahan Garapan:** 1 petak sawah demplot organik (1,50 Ha) di Blok Pahing\n• **Kontak:** \`0857-3344-5566\``
  }
  return generateFarmerStatsResponse(userContext)
}

export function generateLahanDetailResponse(userContext?: PetaniContext): string {
  return `**Daftar 8 Petak Lahan Sawah Terdata (9.85 Ha):**\n• **Blok Manis (4 petak):** Blok Manis Barat (1,2 Ha), Blok Manis Timur (1,1 Ha), Galengan Wetan (1,1 Ha), Hamparan Manis Tengah (1,5 Ha)\n• **Blok Wage (3 petak):** Lahan Blok Wage Hulu (1,3 Ha), Lahan Blok Wage Hilir (1,15 Ha), Petak Sawah Wage Asri (1,0 Ha)\n• **Blok Pahing (1 petak):** Sawah Blok Pahing Subur (1,5 Ha)`
}

export function generatePanenDetailResponse(userContext?: PetaniContext): string {
  return `**Realisasi Panen Terverifikasi (Total 20 Ton GKP):**\n• **Bapak Sukardi:** 8,80 Ton (8.800 kg) varietas Ciherang di Galengan Wetan\n• **Bapak H. Karyono:** 11,20 Ton (11.200 kg) varietas Inpari 32 di Sawah Lembah Wage`
}

export function generateMusimDetailResponse(userContext?: PetaniContext): string {
  return `**Kalender & Varietas Musim Tanam Aktif (6 Petak MT1 Rendeng):**\n• **Varietas:** Inpari 32 HDB dan Ciherang\n• **Jadwal Tanam:** November–Desember 2026\n• **Estimasi Panen:** Februari–Maret 2027`
}

export function generateMusimStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalMusim = stats?.totalMusim ?? 9
  const musimBerjalan = stats?.musimBerjalan ?? 6
  const musimPerencanaan = stats?.musimPerencanaan ?? 1
  const musimSelesai = stats?.musimSelesai ?? 2

  return `Total ada **${totalMusim} siklus musim tanam** tercatat di Desa Cirebon Girang, dengan rincian: **${musimBerjalan} sedang berjalan aktif** (MT1 Rendeng 2026/2027), **${musimPerencanaan} tahap perencanaan**, dan **${musimSelesai} telah selesai panen**.`
}

export function generatePanenStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalPanenTon = stats?.totalPanenTon ?? 20.0
  const totalPanenKg = stats?.totalPanenKg ?? 20000

  return `Total realisasi panen adalah **${totalPanenTon.toFixed(2)} Ton GKP** (${totalPanenKg.toLocaleString('id-ID')} kg) dari 2 sesi panen.`
}

export function generateAktivitasStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalAktivitas = stats?.totalAktivitas ?? 9

  return `Ada **${totalAktivitas} kegiatan aktivitas budidaya** tercatat di log harian sawah desa.`
}

export function generateOverviewStatsResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const lahanAktif = stats?.lahanAktif ?? 8
  const totalLuasHa = stats?.totalLuasHa ?? 9.85
  const musimBerjalan = stats?.musimBerjalan ?? 6
  const totalPetani = stats?.totalPetani ?? 4
  const totalPoktan = stats?.totalPoktan ?? 3
  const totalPanenTon = stats?.totalPanenTon ?? 20.0

  return `**Ringkasan SI PADI:** ${lahanAktif} petak sawah (${totalLuasHa.toFixed(2)} Ha), ${musimBerjalan} musim tanam aktif, ${totalPanenTon.toFixed(2)} Ton panen, ${totalPetani} petani di ${totalPoktan} kelompok tani.`
}

export function generatePerangkatDesaResponse(userContext?: PetaniContext): string {
  return `Perangkat Desa pengawas pertanian adalah **Bapak Karsiman, S.Sos** (No. HP: \`081298765432\`).`
}

export function generateAdminResponse(userContext?: PetaniContext): string {
  return `Administrator sistem SI PADI adalah **Karisma Siti Nabila** (No. HP: \`0812-3456-7890\`).`
}

export function generateKonfigurasiStatsResponse(userContext?: PetaniContext): string {
  return `Konfigurasi SI PADI aktif dengan pengawas **Karisma Siti Nabila** (Email: \`karismasitinabila7@gmail.com\`, WA: \`6285797864834\`).`
}

export function generateMasterDataOverviewResponse(userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalLahan = stats?.totalLahan ?? 8
  const totalLuasHa = stats?.totalLuasHa ?? 9.85
  const musimBerjalan = stats?.musimBerjalan ?? 6
  const totalPetani = stats?.totalPetani ?? 4
  const totalPoktan = stats?.totalPoktan ?? 3
  const totalUsers = stats?.totalUsers ?? 6

  return `**Data Master SI PADI:** ${totalLahan} petak sawah (${totalLuasHa.toFixed(2)} Ha), ${musimBerjalan} musim tanam aktif, ${totalPetani} petani di ${totalPoktan} poktan, dan ${totalUsers} akun terdaftar.`
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR RESPON INFORMASI SEMUA MENU DASHBOARD & PERINGKAT DATA SUPERLATIF
// ─────────────────────────────────────────────────────────────────────────────

export function generateLahanTerluasResponse(userContext?: PetaniContext): string {
  return `Petak lahan paling luas adalah **Sawah Hamparan Manis Tengah (2,00 Ha / 20.000 m²)** yang dikelola oleh **Bapak Sutarjo** di Blok Manis.  
*(Catatan: Petani dengan akumulasi total lahan terluas adalah **Bapak Sukardi** dengan 3 petak seluas **3,45 Ha**).*`
}

export function generateLahanTerkecilResponse(userContext?: PetaniContext): string {
  return `Petak lahan paling kecil adalah **Petak Demplot Organik Cirebon Girang (0,60 Ha / 6.000 m²)** yang dikelola oleh **Mang Rasidi** di Blok Pahing Barat.`
}

export function generatePanenTerbanyakResponse(userContext?: PetaniContext): string {
  return `Hasil panen terbanyak diraih oleh **Bapak H. Karyono** dengan total **11,20 Ton (11.200 kg)** varietas Inpari 32 di Sawah Lembah Wage (Total panen desa: 20 Ton GKP).`
}

export function generateAllDashboardMenusResponse(): string {
  return [
    '**Daftar Menu di Seluruh Dashboard SI PADI:**',
    '• **Admin (12 Menu):** Dashboard, Peta GIS, Kelompok Tani, Data Petani, Data Master User, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Data Panen, Edukasi, Profil, Konfigurasi Sistem.',
    '• **Perangkat Desa (10 Menu):** Dashboard Desa, Peta GIS, Kelompok Tani, Data Petani, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Rekap Panen, Edukasi, Profil.',
    '• **Petani (10 Menu):** Beranda, Peta GIS, Kelompok Saya, Lahan Saya, Musim Tanam Saya, Aktivitas Budidaya, Hasil Panen Saya, Edukasi, Profil, AI Assistant.'
  ].join('\n')
}

export function generateAdminDashboardMenusResponse(): string {
  return [
    '**12 Menu Dashboard Administrator (/admin):**',
    '1. Dashboard Admin | 2. Peta Lahan GIS | 3. Kelompok Tani',
    '4. Data Petani | 5. Data Master User | 6. Lahan Pertanian',
    '7. Musim Tanam | 8. Aktivitas Budidaya | 9. Data Panen',
    '10. Edukasi & Panduan | 11. Profil Saya | 12. Konfigurasi Sistem'
  ].join('\n')
}

export function generateDesaDashboardMenusResponse(): string {
  return [
    '**10 Menu Dashboard Perangkat Desa (/desa):**',
    '1. Dashboard Desa | 2. Peta Lahan GIS | 3. Kelompok Tani',
    '4. Data Petani | 5. Lahan Pertanian | 6. Musim Tanam',
    '7. Aktivitas Budidaya | 8. Rekap Panen | 9. Edukasi & Panduan | 10. Profil Saya'
  ].join('\n')
}

export function generatePetaniDashboardMenusResponse(): string {
  return [
    '**10 Menu Dashboard Petani (/petani):**',
    '1. Beranda Petani | 2. Peta Lahan GIS | 3. Kelompok Saya',
    '4. Lahan Saya | 5. Musim Tanam Saya | 6. Aktivitas Budidaya',
    '7. Hasil Panen Saya | 8. Edukasi & Panduan | 9. Profil Saya | 10. AI Assistant'
  ].join('\n')
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
    ].join('\n')
  }

  if (m.includes('kelompok tani') || m.includes('poktan') || m.includes('kelompok saya')) {
    return [
      '**Menu Kelompok Tani (/admin/kelompok-tani, /desa/kelompok-tani, /petani/kelompok-tani):**',
      'Mengelola dan menyajikan informasi 3 kelembagaan Poktan di Desa Cirebon Girang:',
      '1. **Poktan Sri Rejeki:** Ketua Bapak Sutarjo (HP: 0813-9988-7766), wilayah Dusun Karang Anyar / Blok Manis, 2 anggota (Bapak Sukardi & Bapak Sutarjo), luas garapan 5,90 Ha.',
      '2. **Poktan Sumber Subur:** Ketua Mang Rasidi (HP: 0857-3344-5566), wilayah Dusun Cirebon Ilir / Blok Pahing, 1 anggota (Bapak Rasidi), luas garapan 0,60 Ha.',
      '3. **Poktan Tani Makmur:** Ketua Bapak H. Karyono (HP: 0812-2233-4455), wilayah Dusun Girang Hilir / Blok Wage, 1 anggota (Bapak H. Karyono), luas garapan 2,70 Ha.',
      '• **Fitur:** Data profil poktan, kontak ketua, susunan anggota, dan akumulasi luas lahan binaan.'
    ].join('\n')
  }

  if (m.includes('data master user') || m.includes('user') || m.includes('pengguna') || m.includes('akun')) {
    return [
      '**Menu Data Master User (/admin/users) (Khusus Administrator):**',
      'Pusat manajemen hak akses dan akun seluruh pengguna sistem SI PADI (total 6 akun terdaftar):',
      '• **Rincian Akun:** 1 Administrator (Karisma Siti Nabila), 1 Perangkat Desa (Bapak Karsiman, S.Sos), dan 4 Petani aktif (Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, Bapak Rasidi).',
      '• **Fitur:** Tambah pengguna baru, pengaturan role hak akses, aktivasi/nonaktifkan akun, dan reset kata sandi.'
    ].join('\n')
  }

  if (m.includes('data petani') || m.includes('petani')) {
    return [
      '**Menu Data Petani (/admin/petani, /desa/petani):**',
      'Direktori master data kependudukan petani binaan Desa Cirebon Girang (4 petani aktif):',
      '• **Data Tersimpan:** Nama lengkap, NIK, alamat lengkap domisili RT/RW, nomor telepon/HP, kelompok tani naungan, jumlah petak garapan, dan total luas lahan (Ha/m²).',
      '• **Fitur:** Tambah petani baru, perbarui data kontak/domisili, hapus data, dan rekapitulasi data untuk penyaluran bantuan saprodi pupuk subsidi.'
    ].join('\n')
  }

  if (m.includes('lahan') || m.includes('sawah')) {
    return [
      '**Menu Lahan Pertanian (/admin/lahan, /desa/lahan, /petani/lahan):**',
      'Inventarisasi dan legalitas 8 petak lahan sawah baku produktif di Desa Cirebon Girang:',
      '• **Total Baku Lahan:** 9,85 Hektar (98.500 m²), status 100% aktif produktif di 3 blok dusun (Blok Manis 5,35 Ha, Blok Wage 2,70 Ha, Blok Pahing 1,80 Ha).',
      '• **Informasi per Petak:** Nama lahan, petani pemilik/penggarap, luas petak (m² / Ha), blok dusun, titik koordinat GPS, dan status keaktifan.',
      '• **Lahan Terluas:** Sawah Hamparan Manis Tengah (20.000 m² / 2,0 Ha) milik Bapak Sutarjo.',
      '• **Fitur:** Pencarian petak, filter blok/petani, penambahan petak sawah baru (Admin), dan integrasi otomatis ke Peta GIS.'
    ].join('\n')
  }

  if (m.includes('musim') || m.includes('kalender')) {
    return [
      '**Menu Musim Tanam (/admin/musim-tanam, /desa/musim-tanam, /petani/musim-tanam):**',
      'Pengelolaan kalender siklus tanam padi desa (saat ini aktif: **6 musim tanam berjalan MT1 Rendeng 2026/2027**):',
      '• **Varietas Ditanam:** Inpari 32 HDB (tahan kresek/hawar daun bakteri) dan Ciherang (tekstur pulen).',
      '• **Informasi Siklus:** Tanggal mulai olah tanah, tanggal semai & tanam pindah, estimasi tanggal panen, target produksi gabah, dan status siklus (Perencanaan, Berjalan, Selesai, Gagal).',
      '• **Pola Rotasi Tanam Desa:** Padi Rendeng (MT1) — Padi Gadu (MT2) — Palawija/Bera (MT3) untuk memutus siklus hama wereng & tikus.'
    ].join('\n')
  }

  if (m.includes('aktivitas') || m.includes('kegiatan') || m.includes('budidaya')) {
    return [
      '**Menu Aktivitas Budidaya (/admin/aktivitas, /desa/aktivitas, /petani/aktivitas):**',
      'Buku jurnal log harian operasional budidaya sawah para petani (9 kegiatan tercatat):',
      '• **Kategori Aktivitas:** Persiapan Lahan & Bajak Traktor, Penanaman Sistem Jajar Legowo 2:1, Pemupukan Berimbang per HST (Urea, NPK Phonska, SP-36), Pengaturan Pengairan Macak-macak (AWD), dan Pengendalian Hama Penyakit (OPT/WBC/Sundep).',
      '• **Informasi Log:** Tanggal kegiatan, nama lahan, nama petani, uraian aktivitas, bahan/obat yang digunakan, dan pencatatan biaya operasional riil.'
    ].join('\n')
  }

  if (m.includes('panen')) {
    return [
      '**Menu Data Panen (/admin/panen, /desa/panen, /petani/panen):**',
      'Pencatatan realisasi dan histori hasil produksi gabah desa (Total terverifikasi: **20,00 Ton / 20.000 kg GKP**):',
      '• **Data Tersimpan:** Tanggal panen, nama petani, lahan panen, varietas padi, volume produksi (kg & Ton), mutu gabah (Gabah Kering Panen Grade A / Super), dan produktivitas rata-rata (6,2–6,8 Ton/Ha).',
      '• **Hasil Tertinggi:** Bapak H. Karyono dengan hasil 11,20 Ton (11.200 kg) varietas Inpari 32 di Sawah Lembah Wage, disusul Bapak Sukardi dengan hasil 8,80 Ton (8.800 kg) di Galengan Wetan.',
      '• **Fitur:** Rekapitulasi produksi panen untuk pelaporan dinas pertanian, evaluasi surplus pangan, dan analisis produktivitas.'
    ].join('\n')
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
    ].join('\n')
  }

  if (m.includes('profil')) {
    return [
      '**Menu Profil Saya (/admin/profil, /desa/profil, /petani/profil):**',
      'Pusat manajemen identitas pribadi pengguna yang sedang login:',
      '• **Informasi Profil:** Nama lengkap, username, email, nomor HP/WhatsApp, alamat domisili RT/RW, dan peran pengguna (Role).',
      '• **Keamanan Akun:** Fitur ubah kata sandi / password akun dengan konfirmasi sandi baru.',
      '• **Unggah Foto:** Perbarui foto avatar profil pengguna.'
    ].join('\n')
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
    ].join('\n')
  }

  if (m.includes('ai') || m.includes('assistant') || m.includes('bot')) {
    return [
      '**Fitur AI Assistant SI PADI:**',
      'Asisten cerdas virtual interaktif yang dapat diakses dari tombol header atas atau widget chat pojok kanan bawah:',
      '• **Kemampuan:** Menjawab segala pertanyaan data real-time database desa (lahan, petani, poktan, panen, musim), konsultasi budidaya padi, penjelasan seluruh menu dashboard, hingga pembuatan laporan resmi otomatis.'
    ].join('\n')
  }

  return generateAllDashboardMenusResponse()
}

export function normalizeIndonesianQuery(text: string): string {
  let q = text.toLowerCase().trim()

  // Hapus pengulangan huruf berlebih (contoh: "siapaaa" -> "siapa", "anggoootaa" -> "anggota")
  q = q.replace(/([a-zA-Z])\1{2,}/g, '$1$1')

  // 0. Typo Dashboard & Menu & Superlatif
  q = q.replace(/\b(dashoard|dashbord|dasbor|deshboard|dasboard|daspor|dashboar)\b/gi, 'dashboard')
  q = q.replace(/\b(ftur|fiktur)\b/gi, 'fitur')
  q = q.replace(/\b(plg|paling|ter)\s*(luas|lebar|gede|besar)\b/gi, 'paling luas')
  q = q.replace(/\b(terluas|terbesar)\b/gi, 'paling luas')
  q = q.replace(/\b(plg|paling|ter)\s*(kcl|kecil|sempit)\b/gi, 'paling kecil')
  q = q.replace(/\b(terkecil|tersempit)\b/gi, 'paling kecil')
  q = q.replace(/\b(plg|paling|ter)\s*(bnyk|bnyak|banyak|tinggi)\b/gi, 'paling banyak')
  q = q.replace(/\b(terbanyak|tertinggi)\b/gi, 'paling banyak')
  q = q.replace(/\b(siapa|sp)\s+(lahan|lahannya)\s+(yg|yang)?\s*(paling|terluas|luas)\b/gi, 'siapa lahan yang paling luas')

  // 1. Siapa / Siap
  q = q.replace(/\b(siap|syp|sp)\s+(saja|aja|aj|sja)\b/gi, 'siapa saja')
  q = q.replace(/\b(siap|syp|sp)\s+(anggot\w*|angot\w*)\b/gi, 'siapa anggota')
  q = q.replace(/\b(siap|syp|sp)\s+(ketua\w*|ktua\w*)\b/gi, 'siapa ketua')
  q = q.replace(/\b(siap|syp|sp)\s+(petani\w*|ptni\w*)\b/gi, 'siapa petani')
  q = q.replace(/\b(siap|syp|sp)\s+(admin\w*|pengguna\w*|user\w*)\b/gi, 'siapa $2')
  q = q.replace(/\b(siap)\s+(kah|kh)\b/gi, 'siapakah')
  q = q.replace(/^siap\b(?!\s+(panen|tanam|semai|musim|olah|giling))/gi, 'siapa')

  // 2. Anggota / Angotanya
  q = q.replace(/\b(angota|angotanya|anggotanya|anggta|anggotany|anggotax|anggotane)\b/gi, 'anggota')

  // 3. Berapa
  q = q.replace(/\b(brp|brapa|brapakah|berapakah|berpa)\b/gi, 'berapa')

  // 4. Kelompok Tani / Poktan
  q = q.replace(/\b(klmpk|klmpok|kelmpok|poktn|poktan)\b/gi, 'kelompok tani')

  // 5. Ketua
  q = q.replace(/\b(ktua|ketuany|ketuanya|ketuane)\b/gi, 'ketua')

  // 6. Kontak / Nomor HP
  q = q.replace(/\b(kntk|kontaknya|nohp|no hp|nomor hp|no tlp|no telp|telpon|tlp|telepon|wa|whatsapp)\b/gi, 'kontak')

  // 7. Wilayah / Lokasi
  q = q.replace(/\b(wlayah|wilayahny|wilayahnya|lokasiny|lokasinya|dusunny|dusunnya|dimana|dmn|dimn)\b/gi, 'wilayah')

  // 8. Petani
  q = q.replace(/\b(ptni|petaniny|petaninya)\b/gi, 'petani')

  // 9. Musim
  q = q.replace(/\b(msm|msim|musimny|musimnya)\b/gi, 'musim')

  // 10. Panen
  q = q.replace(/\b(pnn|panenny|panennya)\b/gi, 'panen')

  // 11. Lahan
  q = q.replace(/\b(lhn|lahanny|lahannya|petakny|petaknya|sawahny|sawahnya)\b/gi, 'lahan')

  // 12. Varietas
  q = q.replace(/\b(varietasny|varietasnya|bibitny|bibitnya|benihny|benihnya)\b/gi, 'varietas')

  // 13. Slang umum
  q = q.replace(/\b(almt|alamatny|alamatnya)\b/gi, 'alamat')
  q = q.replace(/\b(alamat)\s+nya\b/gi, 'alamat')
  q = q.replace(/\b(luas)\s+nya\b/gi, 'luas')
  q = q.replace(/\b(lahan)\s+nya\b/gi, 'lahan')
  q = q.replace(/\b(aja|aj|sja)\b/gi, 'saja')
  q = q.replace(/\b(yg)\b/gi, 'yang')
  q = q.replace(/\b(dgn)\b/gi, 'dengan')
  q = q.replace(/\b(utk)\b/gi, 'untuk')
  q = q.replace(/\b(sdh|udh|uda)\b/gi, 'sudah')
  q = q.replace(/\b(blm|blom)\b/gi, 'belum')
  q = q.replace(/\b(gmn|gimana|bgmn|bagaimn)\b/gi, 'bagaimana')
  q = q.replace(/\b(kpn|kpankah)\b/gi, 'kapan')
  q = q.replace(/\b(ad|adkh|adakah)\b/gi, 'ada')

  return q.trim()
}

export function handleMasterDataAndAdminQueries(query: string, rawQuery: string, userContext?: PetaniContext, conversationContext?: string): string | null {
  const norm = normalizeIndonesianQuery(query)
  const q = norm.toLowerCase().trim()
  const rawQ = rawQuery.toLowerCase().trim()
  const cCtx = (conversationContext || '').toLowerCase()

  // 0A. Action Button & Fitur Halaman (Unduh Excel, Cetak PDF, Tambah Musim, Tambah Lahan, Tambah Petani, Tambah User, Rotasi Tanam, Varietas Padi)
  const actionRes = handleActionButtonAndFeatureResponse(q) || handleActionButtonAndFeatureResponse(rawQ)
  if (actionRes) return actionRes

  // 0B. Pertanyaan Jumlah Menu ("ada berapa menu", "berapa menu di admin", dll)
  if (
    q.includes('berapa menu') ||
    q.includes('jumlah menu') ||
    q.includes('total menu') ||
    /ada\s*berapa\s*menu/i.test(q)
  ) {
    return generateJumlahMenuResponse(q)
  }

  // 0C. Spesifik Lahan per Blok Dusun ("lahan di blok manis", "lahan di blok wage", "lahan di blok pahing")
  if (
    (q.includes('blok manis') || q.includes('karang anyar')) &&
    (q.includes('lahan') || q.includes('sawah') || q.includes('petak') || q.includes('ada apa') || q.includes('apa saja') || q.includes('daftar'))
  ) {
    return generateBlokLahanDetailResponse('manis')
  }
  if (
    (q.includes('blok wage') || q.includes('girang hilir')) &&
    (q.includes('lahan') || q.includes('sawah') || q.includes('petak') || q.includes('ada apa') || q.includes('apa saja') || q.includes('daftar'))
  ) {
    return generateBlokLahanDetailResponse('wage')
  }
  if (
    (q.includes('blok pahing') || q.includes('cirebon ilir')) &&
    (q.includes('lahan') || q.includes('sawah') || q.includes('petak') || q.includes('ada apa') || q.includes('apa saja') || q.includes('daftar'))
  ) {
    return generateBlokLahanDetailResponse('pahing')
  }

  // 0D. METRIK UTAMA: TOTAL LUAS LAHAN / HAMPARAN / LUAS KESELURUHAN
  // Menjawab: "berapa total luas lahan keseluruhan", "total luas lahan", "berapa luas lahan", "luas hamparan", dll
  if (
    q.includes('total luas') ||
    q.includes('luas keseluruhan') ||
    q.includes('luas hamparan') ||
    q.includes('luas total') ||
    q.includes('luas lahan') ||
    q.includes('luas sawah') ||
    q.includes('luas baku') ||
    q === 'luas' ||
    q === 'total luas' ||
    /(berapa|jumlah|total|ada berapa).*luas/i.test(q) ||
    /luas.*(berapa|total|keseluruhan|seluruh|semua|desa|hamparan|sawah|lahan|hektar|m2|meter)/i.test(q) ||
    /(berapa|total).*(hektar|meter persegi|m2)/i.test(q)
  ) {
    return generateHamparanStatsResponse(userContext)
  }

  // 0E. METRIK UTAMA: JUMLAH LAHAN / PETAK SAWAH
  // Menjawab: "berapa total lahan", "berapa petak sawah", "jumlah petak lahan", dll
  if (
    q.includes('total lahan') ||
    q.includes('jumlah lahan') ||
    q.includes('total petak') ||
    q.includes('jumlah petak') ||
    q.includes('lahan aktif') ||
    /(berapa|jumlah|total|ada berapa).*(petak|lahan|sawah)/i.test(q) ||
    /(petak|lahan|sawah).*(aktif|berapa|ada berapa)/i.test(q) ||
    /inventarisasi.*(lahan|sawah)/i.test(q)
  ) {
    return generateLahanStatsResponse(userContext)
  }

  // 0F. METRIK UTAMA: MUSIM TANAM
  // Menjawab: "berapa musim tanam", "status musim", "musim tanam aktif", dll
  if (
    q.includes('total musim') ||
    q.includes('musim aktif') ||
    q.includes('musim berjalan') ||
    q.includes('siklus musim') ||
    /(berapa|total|ada berapa).*musim/i.test(q) ||
    /musim.*(berjalan|aktif|tanam|siklus|ada berapa|berapa)/i.test(q)
  ) {
    return generateMusimStatsResponse(userContext)
  }

  // 0G. METRIK UTAMA: HASIL PANEN / PRODUKSI
  // Menjawab: "berapa hasil panen", "total panen", "berapa ton panen", dll
  if (
    q.includes('total panen') ||
    q.includes('hasil panen') ||
    q.includes('realisasi panen') ||
    q.includes('produksi gabah') ||
    /(berapa|total|hasil|riwayat|realisasi|jumlah|ada berapa).*panen/i.test(q) ||
    /panen.*(ada berapa|berapa|jumlah|total|ton|kg)/i.test(q) ||
    /produksi.*(gabah|padi|berapa ton)/i.test(q)
  ) {
    return generatePanenStatsResponse(userContext)
  }

  // 0H. METRIK UTAMA: DATA PETANI
  // Menjawab: "berapa petani", "total petani", "jumlah petani aktif", dll
  if (
    q.includes('total petani') ||
    q.includes('jumlah petani') ||
    /(berapa|jumlah|total|ada berapa).*petani/i.test(q) ||
    /petani.*(bergabung|terdaftar|ada|bina|anggota|ada berapa|berapa)/i.test(q)
  ) {
    return generateFarmerStatsResponse(userContext)
  }

  // 0I. METRIK UTAMA: KELOMPOK TANI / POKTAN
  // Menjawab: "berapa kelompok tani", "berapa poktan", "total poktan", dll
  if (
    q.includes('total poktan') ||
    q.includes('jumlah poktan') ||
    q.includes('total kelompok tani') ||
    q.includes('jumlah kelompok tani') ||
    /(berapa|jumlah|total|ada berapa).*(kelompok tani|poktan|kelembagaan)/i.test(q) ||
    /(kelompok tani|poktan).*(ada berapa|berapa|jumlah)/i.test(q)
  ) {
    return generatePoktanStatsResponse(userContext)
  }

  // 0J. METRIK UTAMA: DATA MASTER USER / PENGGUNA
  // Menjawab: "berapa user", "total user", "jumlah pengguna akun", dll
  if (
    q.includes('total user') ||
    q.includes('jumlah user') ||
    q.includes('total pengguna') ||
    q.includes('jumlah akun') ||
    /(berapa|jumlah|total|ada berapa).*(pengguna|user|akun|hak akses)/i.test(q) ||
    /(user|akun|pengguna).*(terdaftar|ada berapa|berapa)/i.test(q)
  ) {
    return generateUserStatsResponse(userContext)
  }

  // 0K. METRIK UTAMA: AKTIVITAS BUDIDAYA
  // Menjawab: "berapa aktivitas", "total aktivitas budidaya", dll
  if (
    q.includes('total aktivitas') ||
    q.includes('jumlah aktivitas') ||
    /(berapa|jumlah|total|ada berapa).*aktivitas/i.test(q) ||
    /aktivitas.*(ada berapa|berapa|jumlah|tercatat)/i.test(q)
  ) {
    return generateAktivitasStatsResponse(userContext)
  }

  // ── SUPERLATIF: LAHAN TERLUAS / PALING LUAS ──
  // Menjawab: "siapa lahan yang paling luas", "lahan siapa yang paling luas", "lahan mana yang paling luas", "lahan terluas", dll
  if (
    q.includes('siapa lahan yang paling luas') ||
    q.includes('siapa yang punya lahan paling luas') ||
    q.includes('lahan siapa yang paling luas') ||
    q.includes('lahan mana yang paling luas') ||
    q.includes('lahan apa yang paling luas') ||
    q.includes('petak mana yang paling luas') ||
    q.includes('lahan terluas') ||
    q.includes('lahan paling luas') ||
    q.includes('petani lahan terluas') ||
    q.includes('petani yang paling luas') ||
    q.includes('siapa pemilik lahan terluas') ||
    (
      (q.includes('lahan') || q.includes('petak') || q.includes('sawah') || q.includes('siapa') || q.includes('mana')) &&
      (q.includes('paling luas') || q.includes('terluas') || q.includes('terbesar') || q.includes('paling besar') || (q.includes('siapa') && q.includes('luas') && !q.includes('berapa')) || (q.includes('mana') && q.includes('luas') && !q.includes('berapa'))) &&
      !q.includes('total luas') && !q.includes('berapa luas') && !q.includes('luas hamparan') && !q.includes('kecil') && !q.includes('sempit')
    )
  ) {
    return generateLahanTerluasResponse(userContext)
  }

  // ── SUPERLATIF: LAHAN TERKECIL / PALING KECIL / SEMPIT ──
  if (
    (q.includes('lahan') || q.includes('petak') || q.includes('sawah') || q.includes('siapa') || q.includes('mana')) &&
    (q.includes('paling kecil') || q.includes('terkecil') || q.includes('paling sempit') || q.includes('tersempit'))
  ) {
    return generateLahanTerkecilResponse(userContext)
  }

  // ── SUPERLATIF: PANEN TERBANYAK / TERTINGGI ──
  if (
    (q.includes('panen') || q.includes('hasil') || q.includes('produksi')) &&
    (q.includes('paling banyak') || q.includes('terbanyak') || q.includes('tertinggi') || q.includes('paling tinggi') || q.includes('siapa yang panen paling'))
  ) {
    return generatePanenTerbanyakResponse(userContext)
  }

  // ── SEMUA MENU DI SETIAP DASHBOARD ──
  // Menjawab: "semua menu yang ada di setiap dashboard", "apa saja menu yang ada di setiap dashboard", "jelaskan semua menu", dll
  if (
    q.includes('setiap dashboard') ||
    q.includes('semua dashboard') ||
    q.includes('semua menu') ||
    q.includes('seluruh menu') ||
    q.includes('daftar menu') ||
    q.includes('ada menu apa saja') ||
    q.includes('menu apa saja') ||
    q.includes('apa saja menu') ||
    q.includes('menu di dashboard') ||
    q.includes('menu dashboard') ||
    q.includes('menu apa saja di si padi') ||
    q.includes('jelaskan semua menu') ||
    q.includes('apa saja menu di sistem') ||
    (q.includes('menu') && (q.includes('apa saja') || q.includes('ada apa') || q.includes('daftar') || q.includes('dashboard') || q.includes('semua') || q.includes('seluruh')))
  ) {
    if (q.includes('admin') || q.includes('administrator')) {
      return generateAdminDashboardMenusResponse()
    }
    if (q.includes('desa') || q.includes('perangkat')) {
      return generateDesaDashboardMenusResponse()
    }
    if (q.includes('petani')) {
      return generatePetaniDashboardMenusResponse()
    }
    return generateAllDashboardMenusResponse()
  }

  // ── MENU DASHBOARD ADMIN ──
  if (
    (q.includes('menu') || q.includes('fitur') || q.includes('apa saja')) &&
    (q.includes('admin') || q.includes('administrator')) &&
    (q.includes('dashboard') || q.includes('menu') || q.includes('fitur') || q.includes('halaman'))
  ) {
    return generateAdminDashboardMenusResponse()
  }

  // ── MENU DASHBOARD PERANGKAT DESA ──
  if (
    (q.includes('menu') || q.includes('fitur') || q.includes('apa saja')) &&
    (q.includes('desa') || q.includes('perangkat desa')) &&
    (q.includes('dashboard') || q.includes('menu') || q.includes('fitur') || q.includes('halaman'))
  ) {
    return generateDesaDashboardMenusResponse()
  }

  // ── MENU DASHBOARD PETANI ──
  if (
    (q.includes('menu') || q.includes('fitur') || q.includes('apa saja')) &&
    q.includes('petani') &&
    (q.includes('dashboard') || q.includes('beranda') || q.includes('menu') || q.includes('fitur') || q.includes('halaman'))
  ) {
    return generatePetaniDashboardMenusResponse()
  }

  // ── PENJELASAN FUNGSI / ISI MENU SPESIFIK ──
  // Menu Peta GIS
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('peta') || q.includes('gis') || q.includes('peta lahan') || q.includes('peta interaktif'))
  ) {
    return generateMenuExplanationResponse('peta')
  }

  // Menu Kelompok Tani
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('kelompok tani') || q.includes('poktan') || q.includes('kelompok saya'))
  ) {
    return generateMenuExplanationResponse('kelompok tani')
  }

  // Menu Data Master User
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('master user') || q.includes('data master user') || (q.includes('user') && q.includes('menu')) || (q.includes('pengguna') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('data master user')
  }

  // Menu Data Petani
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('data petani') || (q.includes('petani') && q.includes('menu'))) &&
    !q.includes('dashboard') && !q.includes('beranda')
  ) {
    return generateMenuExplanationResponse('data petani')
  }

  // Menu Lahan Pertanian
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('lahan pertanian') || q.includes('lahan saya') || (q.includes('lahan') && q.includes('menu')) || (q.includes('sawah') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('lahan')
  }

  // Menu Musim Tanam
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('musim tanam') || q.includes('musim tanam saya') || (q.includes('musim') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('musim')
  }

  // Menu Aktivitas Budidaya
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('aktivitas budidaya') || q.includes('aktivitas') || (q.includes('kegiatan') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('aktivitas')
  }

  // Menu Data Panen
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('data panen') || q.includes('rekap panen') || q.includes('hasil panen') || (q.includes('panen') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('panen')
  }

  // Menu Edukasi & Panduan
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('edukasi') || q.includes('panduan') || (q.includes('modul') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('edukasi')
  }

  // Menu Profil Saya
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('profil') || q.includes('profil saya') || (q.includes('biodata') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('profil')
  }

  // Menu Konfigurasi Sistem
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa isi') || q.includes('jelaskan')) &&
    (q.includes('konfigurasi') || q.includes('konfigurasi sistem') || (q.includes('pengaturan') && q.includes('menu')))
  ) {
    return generateMenuExplanationResponse('konfigurasi')
  }

  // Fitur AI Assistant
  if (
    (q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('apa kemampuan') || q.includes('jelaskan')) &&
    (q.includes('ai assistant') || q.includes('asisten ai') || (q.includes('ai') && q.includes('fungsi')))
  ) {
    return generateMenuExplanationResponse('ai')
  }

  // 1. Perangkat Desa (Spesifik: "berapa perangkat desa dan siapa namanya", "karsiman")
  if (
    q.includes('karsiman') ||
    q.includes('perangkat desa') ||
    q.includes('pamong') ||
    q.includes('aparat desa') ||
    q.includes('staf desa') ||
    /(berapa|jumlah|total|siapa|nama|ada berapa).*(perangkat|aparat|pamong)/i.test(q) ||
    /(perangkat|aparat|pamong).*(siapa|berapa|nama|ada berapa)/i.test(q) ||
    /ada\s*berapa\s*(perangkat|desa|aparat|pamong)/i.test(q)
  ) {
    return generatePerangkatDesaResponse(userContext)
  }

  // 2. Administrator Sistem ("siapa admin", "karisma")
  if (
    q.includes('karisma') ||
    isAdminInfoQuery(q) ||
    /(berapa|jumlah|total|siapa|nama|ada berapa).*(admin|administrator)/i.test(q) ||
    /(admin|administrator).*(siapa|berapa|nama|ada berapa|kontak)/i.test(q) ||
    /ada\s*berapa\s*(admin|administrator)/i.test(q)
  ) {
    return generateAdminResponse(userContext)
  }

  // 3. Ikhtisar Semua Data Master & Fitur Dashboard Admin
  if (
    q.includes('data master') ||
    q.includes('semua yang ada di dashboard') ||
    q.includes('semua data master') ||
    q.includes('apa saja di dashboard') ||
    q.includes('menu admin') ||
    q.includes('fitur admin') ||
    q.includes('dashboard admin') ||
    q.includes('menu dashboard') ||
    q.includes('apa saja fitur') ||
    /(apa saja|sebutkan|daftar|jelaskan).*(data master|menu|fitur|dashboard)/i.test(q)
  ) {
    return generateMasterDataOverviewResponse(userContext)
  }

  // 4. Konfigurasi Sistem
  if (
    q.includes('konfigurasi') ||
    q.includes('pengaturan sistem') ||
    q.includes('setting') ||
    q.includes('smtp') ||
    q.includes('pengaturan ai') ||
    q.includes('notifikasi wa') ||
    q.includes('notifikasi email')
  ) {
    return generateKonfigurasiStatsResponse(userContext)
  }

  // 5A1. Anggota Beserta Luas Lahan & Alamat ("sebutkan beserta luas lahan dan alamat nya", dll)
  if (
    !q.includes('total luas') &&
    !q.includes('berapa luas') &&
    !q.includes('luas keseluruhan') &&
    !q.includes('luas lahan') &&
    !q.includes('total lahan') &&
    !q.includes('berapa petak') &&
    (
      q.includes('beserta luas') ||
      q.includes('beserta lahan') ||
      q.includes('beserta alamat') ||
      q.includes('luas garapan') ||
      ((q.includes('anggota') || q.includes('petani')) && (q.includes('alamat') || q.includes('garapan') || q.includes('beserta luas'))) ||
      (q.includes('alamat') && (q.includes('lahan') || q.includes('poktan') || q.includes('kelompok')))
    )
  ) {
    if (q.includes('sri rejeki') || (cCtx.includes('sri rejeki') && !cCtx.includes('sumber subur') && !cCtx.includes('tani makmur'))) {
      return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext, 'Sri Rejeki')
    }
    if (q.includes('sumber subur') || (cCtx.includes('sumber subur') && !cCtx.includes('sri rejeki') && !cCtx.includes('tani makmur'))) {
      return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext, 'Sumber Subur')
    }
    if (q.includes('tani makmur') || (cCtx.includes('tani makmur') && !cCtx.includes('sri rejeki') && !cCtx.includes('sumber subur'))) {
      return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext, 'Tani Makmur')
    }
    return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext)
  }

  // 5A2. Anggota Kelompok Tani / Petani Anggota (Menjawab "siap saja angotanya", "siapa anggotanya", dll)
  if (
    q.includes('anggota') ||
    q.includes('angota') ||
    /(siapa|sebutkan|daftar|ada siapa).*anggota/i.test(q) ||
    /anggota.*(siapa|ada berapa|kelompok|poktan|daftar)/i.test(q) ||
    (
      (cCtx.includes('kelompok tani') || cCtx.includes('poktan') || cCtx.includes('sri rejeki') || cCtx.includes('sumber subur') || cCtx.includes('tani makmur')) &&
      /(siapa saja|siapa aja|sebutkan|daftar|siapa anggotanya|anggotanya)/i.test(q)
    )
  ) {
    if (q.includes('sri rejeki') || (cCtx.includes('sri rejeki') && !cCtx.includes('sumber subur') && !cCtx.includes('tani makmur'))) {
      return generatePoktanAnggotaResponse(userContext, 'Sri Rejeki')
    }
    if (q.includes('sumber subur') || (cCtx.includes('sumber subur') && !cCtx.includes('sri rejeki') && !cCtx.includes('tani makmur'))) {
      return generatePoktanAnggotaResponse(userContext, 'Sumber Subur')
    }
    if (q.includes('tani makmur') || (cCtx.includes('tani makmur') && !cCtx.includes('sri rejeki') && !cCtx.includes('sumber subur'))) {
      return generatePoktanAnggotaResponse(userContext, 'Tani Makmur')
    }
    return generatePoktanAnggotaResponse(userContext)
  }

  // 5B. Ketua Kelompok Tani ("siapa ketuanya", "ketua poktan")
  if (
    (q.includes('ketua') && (q.includes('kelompok') || q.includes('poktan') || q.includes('siapa') || q.includes('daftar') || q.includes('nama'))) ||
    q === 'ketua' ||
    q === 'siapa ketua' ||
    q === 'siapa ketuanya' ||
    (
      (cCtx.includes('kelompok tani') || cCtx.includes('poktan')) &&
      /(ketua|siapa ketuanya|ketuanya siapa)/i.test(q)
    )
  ) {
    return generatePoktanKetuaResponse(userContext)
  }

  // 5C. Kontak Kelompok Tani ("kontak poktan", "nomor hp kelompok tani")
  if (
    (q.includes('kontak') || q.includes('telepon') || q.includes('hp') || q.includes('wa')) &&
    (q.includes('kelompok') || q.includes('poktan') || cCtx.includes('kelompok tani') || cCtx.includes('poktan'))
  ) {
    return generatePoktanKontakResponse(userContext)
  }

  // 5D. Wilayah Kelompok Tani ("wilayah poktan", "lokasi kelompok tani")
  if (
    (q.includes('wilayah') || q.includes('lokasi') || q.includes('dusun')) &&
    (q.includes('kelompok') || q.includes('poktan') || cCtx.includes('kelompok tani') || cCtx.includes('poktan'))
  ) {
    return generatePoktanWilayahResponse(userContext)
  }

  // 5E. Poktan Spesifik (Sri Rejeki, Sumber Subur, Tani Makmur)
  if (q.includes('sri rejeki')) {
    return generateSinglePoktanDetailResponse('sri rejeki', userContext)
  }
  if (q.includes('sumber subur')) {
    return generateSinglePoktanDetailResponse('sumber subur', userContext)
  }
  if (q.includes('tani makmur')) {
    return generateSinglePoktanDetailResponse('tani makmur', userContext)
  }

  // 5F. Kelompok Tani / Poktan Umum ("ada berapa kelompok tani")
  if (
    q.includes('kelompok tani') ||
    q.includes('poktan') ||
    q.includes('kelembagaan') ||
    /(berapa|jumlah|total|daftar|siapa|nama).*(kelompok tani|poktan|kelembagaan)/i.test(q) ||
    /poktan.*(apa saja|siapa|berapa|daftar)/i.test(q)
  ) {
    return generatePoktanStatsResponse(userContext)
  }

  // 6A. Spesifik Profil Nama Petani (Sukardi, Sutarjo, H. Karyono, Rasidi)
  if (q.includes('sukardi')) {
    return generatePetaniDetailResponse('sukardi', userContext)
  }
  if (q.includes('sutarjo')) {
    return generatePetaniDetailResponse('sutarjo', userContext)
  }
  if (q.includes('karyono')) {
    return generatePetaniDetailResponse('karyono', userContext)
  }
  if (q.includes('rasidi')) {
    return generatePetaniDetailResponse('rasidi', userContext)
  }

  // 6B. Data Petani / Daftar Petani
  if (
    /(berapa|jumlah|total|siapa|daftar|data|nama).*petani/i.test(q) ||
    /petani.*(bergabung|terdaftar|ada|bina|anggota|siapa saja|siapa namanya)/i.test(q)
  ) {
    return generateFarmerStatsResponse(userContext)
  }

  // 7. Data Master User / Pengguna / Akun
  if (
    /(berapa|jumlah|total|daftar|siapa|semua|ada berapa).*(pengguna|user|akun|hak akses)/i.test(q) ||
    /pengguna.*(terdaftar|aktif|sistem|ada berapa)/i.test(q) ||
    /(user|akun).*(terdaftar|ada berapa|siapa saja|berapa)/i.test(q) ||
    /ada\s*berapa\s*(user|akun|pengguna|orang)/i.test(q)
  ) {
    return generateUserStatsResponse(userContext)
  }

  // 8A. Total Luas Hamparan / Luas Hamparan / Luas / Hektar / Meter
  if (
    q.includes('hamparan') ||
    q.includes('luas hamparan') ||
    q.includes('total luas') ||
    /(berapa|jumlah|total|ada berapa).*luas/i.test(q) ||
    /luas.*(hamparan|sawah|lahan|pertanian|desa|hektar|m2|meter)/i.test(q) ||
    /(berapa|total).*(hektar|meter)/i.test(q) ||
    q === 'luas' ||
    q === 'total luas'
  ) {
    return generateHamparanStatsResponse(userContext)
  }

  // 8B. Titik Lahan Terdata / Petak GIS
  if (
    q.includes('titik lahan') ||
    q.includes('petak gis') ||
    q.includes('koordinat gps') ||
    /(berapa|jumlah|total).*titik/i.test(q) ||
    /titik.*(lahan|terdata|sawah|ada berapa)/i.test(q)
  ) {
    return generateTitikLahanStatsResponse(userContext)
  }

  // 8C. Zonasi Blok Sawah / Blok Dusun
  if (
    q.includes('zonasi') ||
    q.includes('blok dusun') ||
    q.includes('blok sawah') ||
    /(berapa|jumlah|total|nama|daftar|apa saja).*blok/i.test(q) ||
    /blok.*(dusun|sawah|apa saja|ada berapa)/i.test(q)
  ) {
    return generateZonasiBlokStatsResponse(userContext)
  }

  // 8D. Rincian Daftar Petak Sawah / Sebaran Lahan
  if (
    q.includes('daftar lahan') ||
    q.includes('daftar petak') ||
    q.includes('petak sawah apa saja') ||
    q.includes('lahan apa saja') ||
    q.includes('sebaran petak') ||
    q.includes('lahan di blok')
  ) {
    return generateLahanDetailResponse(userContext)
  }

  // 8E. Petak Lahan Sawah Terdata / Lahan Aktif / GIS
  if (
    q.includes('gis') ||
    q.includes('peta lahan') ||
    /(berapa|jumlah|total|daftar|sebaran|ada berapa).*(petak|lahan|sawah)/i.test(q) ||
    /(petak|lahan|sawah).*(aktif|berapa|daftar|ada berapa|hektar)/i.test(q) ||
    /inventarisasi.*(lahan|sawah)/i.test(q)
  ) {
    return generateLahanStatsResponse(userContext)
  }

  // 9A. Rincian Varietas & Jadwal Musim Tanam
  if (
    q.includes('varietas apa') ||
    q.includes('varietas yang ditanam') ||
    q.includes('jadwal tanam') ||
    q.includes('kapan panen') ||
    q.includes('estimasi panen')
  ) {
    return generateMusimDetailResponse(userContext)
  }

  // 9B. Musim Tanam / Musim Aktif Tanam
  if (
    /(berapa|status|jadwal|daftar|kalender|apa saja).*musim/i.test(q) ||
    /musim.*(berjalan|aktif|tanam|siklus|ada berapa)/i.test(q) ||
    /varietas.*(ditanam|padi|apa saja)/i.test(q) ||
    q.includes('musim aktif') ||
    q.includes('musim tanam') ||
    q.includes('aktif tanam')
  ) {
    return generateMusimStatsResponse(userContext)
  }

  // 10A. Rincian Realisasi Panen per Petani
  if (
    q.includes('siapa yang panen') ||
    q.includes('siapa yang sudah panen') ||
    q.includes('detail panen') ||
    q.includes('rincian panen')
  ) {
    return generatePanenDetailResponse(userContext)
  }

  // 10B. Panen / Hasil Produksi
  if (
    /(berapa|total|hasil|riwayat|realisasi|jumlah|ada berapa).*panen/i.test(q) ||
    /panen.*(ada berapa|berapa|jumlah)/i.test(q) ||
    /produksi.*(gabah|padi|berapa ton)/i.test(q) ||
    /capaian.*produksi/i.test(q) ||
    /hasil.*panen/i.test(q)
  ) {
    return generatePanenStatsResponse(userContext)
  }

  // 11. Aktivitas Budidaya / Kegiatan Lapangan
  if (
    /(aktivitas|kegiatan|log|catatan).*(budidaya|lapangan|sawah|tani|terkini|terbaru)/i.test(q) ||
    /laporan.*(aktivitas|lapangan|kegiatan)/i.test(q) ||
    /apa.*(aktivitas|kegiatan)/i.test(q)
  ) {
    return generateAktivitasStatsResponse(userContext)
  }

  // 12. Ringkasan Eksekutif & Statistik Operasional Sistem
  if (
    /(ringkasan|rekapitulasi|overview|statistik).*(sistem|operasional|desa|data|pertanian)/i.test(q) ||
    /dashboard.*data/i.test(q) ||
    /kondisi.*sistem/i.test(q)
  ) {
    return generateOverviewStatsResponse(userContext)
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// KATA KUNCI FILTER DOMAIN & IDENTITAS
// ─────────────────────────────────────────────────────────────────────────────

function generateOfficialAgriculturalReport(query: string, userContext?: PetaniContext): string {
  const stats = userContext?.statsDesa
  const totalPetani = stats?.totalPetani ?? 4
  const totalPoktan = stats?.totalPoktan ?? 3
  const totalLahan = stats?.totalLahan ?? 8
  const totalLuasHa = stats?.totalLuasHa ?? 9.85
  const totalLuasM2 = stats?.totalLuasM2 ?? 98500
  const musimBerjalan = stats?.musimBerjalan ?? 6
  const musimPerencanaan = stats?.musimPerencanaan ?? 1
  const musimSelesai = stats?.musimSelesai ?? 2
  const totalPanenTon = stats?.totalPanenTon ?? 20.0
  const totalPanenKg = stats?.totalPanenKg ?? 20000

  const daftarPoktan = stats?.daftarPoktan && stats.daftarPoktan.length > 0
    ? stats.daftarPoktan
    : [
        { nama: 'Kelompok Tani Sri Rejeki', ketua: 'Bapak Sutarjo', wilayah: 'Dusun Karang Anyar / Blok Manis', jumlahPetani: 2 },
        { nama: 'Kelompok Tani Tani Makmur', ketua: 'H. Karyono', wilayah: 'Dusun Girang Hilir / Blok Wage', jumlahPetani: 1 },
        { nama: 'Kelompok Tani Sumber Subur', ketua: 'Mang Rasidi', wilayah: 'Dusun Cirebon Ilir / Blok Pahing', jumlahPetani: 1 },
      ]

  const daftarMusim = stats?.daftarMusim && stats.daftarMusim.length > 0
    ? stats.daftarMusim
    : [
        { namaMusim: 'MT1 Rendeng 2026/2027 - Blok Manis', varietas: 'Inpari 32', status: 'BERJALAN', lahanNama: 'Petak Sawah Blok Manis Barat', petaniNama: 'Bapak Sukardi' },
        { namaMusim: 'MT1 Rendeng 2026/2027 - Galengan Wetan', varietas: 'Ciherang', status: 'BERJALAN', lahanNama: 'Petak Sawah Galengan Wetan', petaniNama: 'Bapak Sukardi' },
        { namaMusim: 'MT1 Rendeng 2026/2027 - Hamparan Manis', varietas: 'Inpari 32', status: 'BERJALAN', lahanNama: 'Sawah Hamparan Manis Tengah', petaniNama: 'Bapak Sutarjo' },
      ]

  const daftarPanen = stats?.daftarPanen && stats.daftarPanen.length > 0
    ? stats.daftarPanen
    : [
        { tanggalPanen: '2026-06-25', jumlahKg: 8800, satuan: 'kg', kualitas: 'Gabah Kering Panen (GKP) Grade A', varietas: 'Ciherang', petani: 'Bapak Sukardi' },
        { tanggalPanen: '2026-07-05', jumlahKg: 11200, satuan: 'kg', kualitas: 'Gabah Kering Panen Super', varietas: 'Inpari 32', petani: 'Bapak H. Karyono' },
      ]

  const now = new Date()
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now.getMonth()] || 'X'
  const tahun = now.getFullYear() || 2026

  let poktanRows = ''
  daftarPoktan.forEach((p, idx) => {
    poktanRows += `| ${idx + 1} | ${p.nama} | ${p.ketua} | ${p.wilayah} | ${p.jumlahPetani} Orang |\n`
  })

  let musimRows = ''
  daftarMusim.forEach((m, idx) => {
    musimRows += `| ${idx + 1} | ${m.namaMusim} | ${m.varietas} | ${m.lahanNama} | ${m.petaniNama} | ${m.status} |\n`
  })

  let panenRows = ''
  daftarPanen.forEach((p, idx) => {
    panenRows += `| ${idx + 1} | ${p.tanggalPanen} | ${p.varietas} | ${p.jumlahKg.toLocaleString('id-ID')} kg | ${(p.jumlahKg / 1000).toFixed(2)} Ton | ${p.kualitas || 'GKP Super'} | ${p.petani} |\n`
  })

  const kopSurat = `<div style="text-align:center; border-bottom: 4px double #000; padding-bottom: 10px; margin-bottom: 20px;"><div style="font-size: 16px; font-weight: bold; text-transform: uppercase;">Pemerintah Kabupaten Cirebon</div><div style="font-size: 16px; font-weight: bold; text-transform: uppercase;">Kecamatan Talun</div><div style="font-size: 22px; font-weight: bold; text-transform: uppercase;">Kantor Kepala Desa Cirebon Girang</div><div style="font-size: 12px; font-style: italic;">Jl. Pangeran Cakrabuana No. 1, Desa Cirebon Girang, Kec. Talun, Kab. Cirebon 45171</div></div><div style="text-align:center; margin-bottom: 20px;"><div style="font-size: 16px; font-weight: bold; text-decoration: underline;">LAPORAN RESMI REKAPITULASI & PERKEMBANGAN PERTANIAN PADI</div><div style="font-size: 14px;">Nomor Registrasi: 521.1/LAP-TANI/CRB-GRG/${bulanRomawi}/${tahun}</div></div>`

  return `${kopSurat}

**Klasifikasi Dokumen:** Laporan Eksekutif Pertanian & Pengawasan Lahan Padi  
**Otoritas Pembuat:** Diterbitkan Secara Otomatis oleh **Asisten Pintar Administrator Pertanian (SI PADI)**  
**Sasaran Dokumen:** Administrator Sistem, Kuwu/Kepala Desa, & Dinas Pertanian Kabupaten Cirebon  

---

### I. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
Dokumen ini diterbitkan secara cerdas dan otomatis oleh sistem kecerdasan buatan (*AI Assistant SI PADI*) mengintegrasikan seluruh data master pertanian, dinamika kelembagaan kelompok tani, inventarisasi petak sawah, serta capaian produksi gabah di wilayah Desa Cirebon Girang:

* 👥 **Total Petani Terdaftar:** **${totalPetani} Orang Petani Aktif**
* 🏢 **Kelembagaan Kelompok Tani:** **${totalPoktan} Kelompok Tani (Poktan Aktif)**
* 🌾 **Baku Luas Lahan Sawah:** **${totalLuasHa.toFixed(2)} Hektar** (${totalLuasM2.toLocaleString('id-ID')} m²) terbagi dalam **${totalLahan} Petak Sawah**
* 📅 **Status Kalender Musim Tanam:** **${musimBerjalan} Musim Berjalan (Fase Aktif)**, **${musimPerencanaan} Perencanaan**, **${musimSelesai} Telah Panen/Selesai**
* ⚖️ **Total Realisasi Hasil Panen:** **${totalPanenTon.toFixed(2)} Ton** (${totalPanenKg.toLocaleString('id-ID')} kg) Gabah Kering Panen (GKP)

---

### II. REKAPITULASI KELEMBAGAAN & KELOMPOK TANI (POKTAN)
| No | Nama Kelompok Tani | Ketua Kelompok | Wilayah / Blok Dusun | Jumlah Anggota |
|:---:|:---|:---|:---|:---:|
${poktanRows.trim()}

---

### III. DISTRIBUSI & INVENTARISASI BAKU LAHAN SAWAH
1. **Luas Efektif Baku Sawah**: **${totalLuasHa.toFixed(2)} Hektar** (${totalLuasM2.toLocaleString('id-ID')} m²).
2. **Rata-rata Garapan per Petani**: **${(totalLuasHa / (totalPetani || 1)).toFixed(2)} Ha / petani**.
3. **Karakteristik Tanah & Sumber Air**: Tanah alluvial sawah subur dengan topografi datar-berombak, diairi saluran irigasi teknis dan semi-teknis yang melayani Blok Manis, Blok Pahing, Blok Kliwon, dan Blok Wage.

---

### IV. STATUS KALENDER MUSIM TANAM AKTIF (MT1 & MT2)
| No | Nama Musim Tanam | Varietas Benih | Petak Lahan | Petani Penanggung Jawab | Status Siklus |
|:---:|:---|:---|:---|:---|:---:|
${musimRows.trim()}

* **Varietas Unggul yang Ditanam:** Didominasi oleh **Inpari 32 HDB** (memiliki ketahanan tinggi terhadap penyakit Hawar Daun Bakteri/Kresek) dan **Ciherang** (varietas unggul nasional bertekstur pulen).
* **Pola Rotasi Kalender Tanam Desa:** Menerapkan sistem serentak **Padi (MT1 Rendeng) — Padi (MT2 Gadu) — Palawija/Bera (MT3)** guna memutus siklus hidup hama wereng coklat dan tikus sawah.

---

### V. REALISASI & EVALUASI HASIL PRODUKSI PANEN
| No | Tanggal Panen | Varietas | Produksi (kg) | Estimasi (Ton) | Mutu Gabah | Petani Pelaksana |
|:---:|:---|:---|:---:|:---:|:---|:---|
${panenRows.trim()}

* **Tingkat Produktivitas Rata-rata:** **6.2 – 6.8 Ton / Hektar** (Kategori Sangat Baik untuk standar lahan sawah irigasi Kabupaten Cirebon).
* **Kualitas Gabah**: Memenuhi standar mutu Gabah Kering Panen (GKP) dan Gabah Kering Giling (GKG) dengan tingkat butir hampa rendah (< 4%).

---

### VI. IDENTIFIKASI KENDALA LAPANGAN & REKOMENDASI TINDAK LANJUT
1. **Pengendalian Terpadu Hama Wereng Batang Coklat (WBC) & Sundep/Beluk**:
   - Diinstruksikan kepada seluruh ketua kelompok tani untuk mengaktifkan jadwal pengamatan berkala di pangkal rumpun seminggu sekali dan menerapkan pengeringan berselang (*macak-macak*).
2. **Optimalisasi Pemupukan Berimbang per HST**:
   - Sosialisasi dosis pemupukan tepat waktu: Pemupukan Dasar (0–5 HST), Susulan I (10–14 HST: Urea 100 kg + NPK Phonska 150 kg/Ha), dan Susulan II (30–35 HST).
3. **Penyelarasan Kalender Tanam Serentak Antar-Blok**:
   - Direkomendasikan rentang tanam antar petak tidak melebihi 10–14 hari agar tidak ada tanaman padi muda yang menjadi sasaran migrasi hama dari petak yang telah dipanen.

---

### VII. LEMBAR PENGESAHAN DOKUMEN LAPORAN

Mengetahui,  
**Kuwu / Kepala Desa Cirebon Girang**  
*(Pemerintahan Desa Cirebon Girang)*  

Dibuat & Diverifikasi Otomatis oleh:  
**Administrator Platform Sistem Informasi Pertanian Padi (SI PADI)**  
*Desa Cirebon Girang, Kecamatan Talun, Kabupaten Cirebon*`
}

const RICE_AGRICULTURE_KEYWORDS = [
  'padi', 'gabah', 'beras', 'benih', 'bibit', 'semai', 'persemaian', 'tanam', 'tandur', 'panen',
  'musim tanam', 'rendeng', 'gadu', 'mt1', 'mt2', 'mt3', 'malai', 'bulir', 'anakan', 'rumpun',
  'sawah', 'lahan', 'pematang', 'galengan', 'petak', 'tanah', 'bajak', 'singkal', 'garu', 'lumpur', 'pelumpuran', 'jerami',
  'pupuk', 'pemupukan', 'urea', 'npk', 'phonska', 'sp-36', 'kcl', 'za', 'organik', 'kompos', 'dolomit', 'dosis', 'takaran', 'hst', 'hss', 'poc',
  'air', 'irigasi', 'pengairan', 'macak', 'intermiten', 'genang', 'genangan', 'drainase', 'sumur', 'pompa', 'kemarau', 'banjir', 'cuaca', 'el nino', 'la nina',
  'hama', 'penyakit', 'wereng', 'wbc', 'sundep', 'beluk', 'penggerek', 'keong', 'siput', 'tikus', 'walang sangit', 'kepik', 'ulat', 'grayak', 'burung', 'pipit', 'bondol',
  'kresek', 'hawar', 'blast', 'blas', 'bercak', 'kuning', 'menguning', 'busuk', 'pelepah', 'tungro', 'kerdil', 'asam', 'asam-asaman', 'karat',
  'insektisida', 'fungisida', 'bakterisida', 'moluskisida', 'rodentisida', 'pestisida', 'racun', 'obat', 'nabati',
  'inpari', 'ciherang', 'mekongga', 'varietas', 'situbagendit', 'cakrabuana', 'padjajaran', 'sintanur', 'unggul', 'legowo', 'jajar legowo',
  'cirebon girang', 'desa', 'petani', 'kelompok tani', 'poktan', 'gapoktan', 'lahan sawah', 'gkp', 'gkg', 'kadar air', 'bwd', 'bunting', 'malai',
  'laporan', 'rekap', 'rekapitulasi', 'evaluasi', 'statistik', 'data tani', 'dinas', 'bpp', 'administrasi', 'produksi',
  'pengguna', 'user', 'akun', 'berapa', 'jumlah', 'total', 'siapa saja', 'daftar', 'database', 'sistem', 'dashboard', 'admin', 'aktivitas', 'kegiatan',
  'sandi', 'password', 'kata sandi', 'lupa', 'reset', 'kredensial', 'gulma', 'rumput', 'teki', 'jajagoan', 'herbisida', 'penyiangan', 'osrok',
  'hampa', 'bernas', 'primordia', 'matang susu', 'busuk batang', 'rhizoctonia', 'lumbung', 'gudang',
  'anggota', 'anggotanya', 'angota', 'ketua', 'ketuanya', 'kontak', 'wilayah', 'alamat', 'garapan', 'sri rejeki', 'sumber subur', 'tani makmur', 'sukardi', 'sutarjo', 'karyono', 'rasidi', 'karsiman', 'karisma', 'jadwal', 'estimasi', 'menu', 'dashboard', 'fitur', 'terluas', 'terkecil', 'terbanyak', 'tertinggi', 'paling', 'siapa', 'peta', 'gis', 'konfigurasi', 'edukasi', 'panduan', 'profil'
]

// ─────────────────────────────────────────────────────────────────────────────
// DETEKSI QUERY IDENTITAS & DOMAIN
// ─────────────────────────────────────────────────────────────────────────────

export function isUserIdentityQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  const patterns = [
    /siapa\s+(saya|aku|diriku|nama\s+saya)/i,
    /(saya|aku|diriku)\s+siapa/i,
    /(nama|profil|identitas|biodata|data\s+diri|akun)\s+(saya|aku)/i,
    /(siapa|apa)\s+(nama|profil|identitas|peran|role)\s+saya/i,
    /(kamu|apakah\s+kamu)\s+(kenal|tahu)\s+(saya|aku|nama\s+saya)/i,
    /kenal(kah)?\s+(sama\s+)?(saya|aku)/i,
    /tahu(kah)?\s+(siapa\s+)?(saya|aku)/i,
    /siapa\s+yang\s+sedang\s+login/i,
    /user\s+saya/i,
    /siapa\s+pengguna\s+ini/i,
    /siapa\s+saya/i,
    /saya\s+siapa/i,
  ]
  return patterns.some(pattern => pattern.test(q))
}

export function isBotIdentityQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  const patterns = [
    /siapa\s+(kamu|anda|dirimu|asisten|ai|bot)/i,
    /(kamu|anda|dirimu|asisten|ai|bot)\s+siapa/i,
    /(apa|siapa)\s+(peran|tugas|fungsi)\s+(kamu|anda|ai|bot)/i,
    /perkenalkan\s+(dirimu|diri)/i,
    /tentang\s+(kamu|anda|ai|bot|asisten)/i,
    /bisa\s+apa\s+(kamu|anda)/i,
    /apa\s+(yang\s+bisa\s+kamu\s+lakukan|kemampuanmu)/i,
    /identitas\s+(kamu|anda|bot|ai)/i,
  ]
  return patterns.some(pattern => pattern.test(q))
}

export function isAdminInfoQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  if (q.includes('admin') && (q.includes('siapa') || q.includes('nama') || q.includes('kontak') || q.includes('profil') || q.includes('cantumkan'))) {
    return true
  }
  const patterns = [
    /siapa\s+(nama\s+)?(admin|administrator|pengelola|operator|it)(nya)?/i,
    /(admin|administrator|pengelola|it)(nya)?\s+(siapa|nya\s+siapa)/i,
    /(nama|kontak|profil)\s+(admin|administrator)/i,
    /siapa\s+yang\s+(mengelola|kelola|pegang)\s+sistem/i,
    /cantumkan.*admin/i,
  ]
  return patterns.some(pattern => pattern.test(q))
}

export function isIdentityQuery(query: string): boolean {
  return isUserIdentityQuery(query) || isBotIdentityQuery(query) || isAdminInfoQuery(query)
}

export function isVillageServicesQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  return (
    q.includes('layanan yang tersedia') ||
    q.includes('apa saja layanan') ||
    q.includes('layanan tersedia') ||
    q.includes('syarat surat domisili') ||
    q.includes('surat domisili') ||
    q.includes('mengajukan surat') ||
    q.includes('pengajuan surat') ||
    q.includes('cek pengajuan') ||
    q.includes('status pengajuan')
  )
}

export function generateVillageServicesResponse(query: string, userContext?: PetaniContext): string {
  const q = query.toLowerCase().trim()
  const role = userContext?.role || 'PETANI'

  if (q.includes('domisili')) {
    return `**Syarat Surat Keterangan Domisili di Balai Desa Cirebon Girang:**\n1. Surat pengantar RT/RW setempat.\n2. Fotokopi KTP dan Kartu Keluarga (KK).\n3. Pas foto 3x4 (2 lembar).\nPelayanan buka Senin–Jumat (08.00–15.00 WIB) di Loket Balai Desa.`
  }

  if (q.includes('mengajukan surat') || q.includes('pengajuan surat') || q.includes('cara mengajukan')) {
    return `**Alur Pengajuan Surat Desa:**\n1. Minta surat pengantar dari Ketua RT/RW setempat.\n2. Bawa berkas ke Loket Balai Desa Cirebon Girang.\n3. Petugas memverifikasi dan memproses tanda tangan pengesahan Kepala Desa.`
  }

  if (q.includes('cek pengajuan') || q.includes('status pengajuan')) {
    return `Pengecekan status surat dapat ditanyakan langsung ke petugas piket Balai Desa dengan menunjukkan KTP, atau hubungi kontak desa: \`0812-9876-5432\`.`
  }

  if (role === 'ADMIN') {
    return `**Layanan Administrator SI PADI:**\n• Manajemen data petani, kelompok tani, dan akun pengguna\n• Pemetaan GIS petak sawah dan monitoring 6 musim tanam aktif\n• Rekapitulasi hasil panen & pembuatan laporan dinas`
  }

  return `**Layanan SI PADI untuk Petani:**\n• Konsultasi hama, penyakit, dan dosis pupuk berimbang per HST\n• Pemantauan petak sawah GIS dan jadwal musim tanam\n• Pencatatan hasil panen padi dan informasi layanan desa`
}

function isRiceFarmingQuery(query: string, role?: string): boolean {
  if (role === 'ADMIN' || role === 'PERANGKAT_DESA') {
    // Administrator & Perangkat Desa memiliki cakupan operasional penuh atas sistem, data, dan pertanian
    return true
  }
  const q = query.toLowerCase()
  if (isIdentityQuery(q)) {
    return true
  }
  if (isPasswordOrAccountQuery(q)) {
    return true
  }
  if (isVillageServicesQuery(q)) {
    return true
  }
  if (['halo', 'hai', 'assalam', 'selamat pagi', 'selamat siang', 'selamat sore', 'pagi', 'siang', 'malam', 'apa kabar'].some(s => q.includes(s))) {
    return true
  }
  return RICE_AGRICULTURE_KEYWORDS.some(k => q.includes(k))
}

export function generateUserIdentityResponse(userContext?: PetaniContext): string {
  const role = userContext?.role || 'PETANI'
  const namaLengkap = userContext?.namaLengkap || userContext?.namaUser || (role === 'ADMIN' ? 'Karisma Siti Nabila' : role === 'PERANGKAT_DESA' ? 'Bapak Karsiman, S.Sos' : 'Bapak Sukardi')
  const poktan = userContext?.kelompokTani || 'Kelompok Tani Sri Rejeki'

  if (role === 'PETANI') {
    const totalLahan = userContext?.lahan?.length ?? 3
    return `Anda terdaftar sebagai **${namaLengkap}** (Petani), anggota **${poktan}** dengan **${totalLahan} petak sawah garapan** di Desa Cirebon Girang.`
  }

  if (role === 'PERANGKAT_DESA') {
    return `Anda terdaftar sebagai **${namaLengkap}** (Perangkat Desa Cirebon Girang).`
  }

  return `Anda terdaftar sebagai **${namaLengkap}** (Administrator Sistem SI PADI Desa Cirebon Girang).`
}

export function generateBotIdentityResponse(userContext?: PetaniContext): string {
  return `Saya adalah **AI Assistant SI PADI Desa Cirebon Girang**, siap membantu informasi data pertanian serta konsultasi budidaya padi sawah.`
}

export function getOutOfScopeResponse(userContext?: PetaniContext): string {
  return `Maaf, saya asisten AI khusus budidaya padi dan data operasional Desa Cirebon Girang. Silakan ajukan pertanyaan seputar data sawah, musim tanam, hama, atau pemupukan padi.`
}

export function generateAdminInfoResponse(userContext?: PetaniContext): string {
  const adminUsers = userContext?.statsDesa?.daftarUsers?.filter(u => u.role === 'ADMIN') || []
  const count = adminUsers.length > 0 ? adminUsers.length : (userContext?.statsDesa?.usersByRole?.admin ?? 1)
  const adminUser = userContext?.statsDesa?.daftarUsers?.find(u => u.role === 'ADMIN')
  const namaAdmin = adminUser?.fullName || 'Karisma Siti Nabila'
  const telepon = adminUser?.phone || '0812-3456-7890'
  const email = adminUser?.email || 'Karismasitinabila7@gmail.com'

  return `Ada **${count} orang** Administrator sistem SI PADI, yaitu **${namaAdmin}** (HP/WA: \`${telepon}\`, Email: \`${email}\`).`
}

export const OUT_OF_SCOPE_RESPONSE = getOutOfScopeResponse()

export function isPasswordOrAccountQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  const patterns = [
    /sandi/i,
    /password/i,
    /kata\s*sandi/i,
    /lupa\s*(sandi|password|kata\s*sandi|akun|login)/i,
    /(mengatasi|solusi|bagaimana\s+jika|kalau)\s*(lupa|hilang|tidak\s+bisa\s+login|gagal\s+login)/i,
    /reset\s*(sandi|password|kata\s*sandi|akun)/i,
    /(ganti|ubah|atur\s*ulang)\s*(sandi|password|kata\s*sandi)/i,
    /kredensial/i,
    /(daftar|tabel|data|semua)\s*(akun|user|email|pengguna).*(sandi|password)/i,
    /(sandi|password).*(petani|desa|admin|perangkat|masing|semua|pengguna|user)/i,
    /email\s+(dan|serta)\s+(sandi|password)/i,
    /login.*(petani|admin|perangkat|desa|sandi|password)/i,
  ]
  return patterns.some(pattern => pattern.test(q))
}

export function generatePasswordAndAccountResponse(userQuery: string, userContext?: PetaniContext): string {
  return `Berikut informasi akun dan kata sandi akses dasbor sistem:
- **Admin (Karisma Siti Nabila)**: \`Karismasitinabila7@gmail.com\` | Sandi: \`Karisma123\`
- **Perangkat Desa (Bapak Karsiman)**: \`karsiman@gmail.com\` | Sandi: \`Karsiman123\`
- **Petani Utama (Bapak Sukardi)**: \`sukardi@gmail.com\` | Sandi: \`Sukardi123\`
- **Petani Lainnya**: \`sutarjo@gmail.com\` (\`Sutarjo123\`), \`karyono@gmail.com\` (\`Karyono123\`), \`rasidi@gmail.com\` (\`Rasidi123\`)

*(Kata sandi universal \`password123\` juga dapat digunakan jika diperlukan).*`
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPER KNOWLEDGE BASE & DYNAMIC LOCAL RESPONSE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function getSmartLocalResponse(userQuery: string, userContext?: PetaniContext, conversationContext?: string): string {
  const norm = normalizeIndonesianQuery(userQuery)
  const query = norm.toLowerCase().trim()
  const rawQuery = userQuery.toLowerCase().trim()
  const role = userContext?.role || 'PETANI'
  const greetingName = userContext?.namaLengkap ? `Bapak/Ibu ${userContext.namaLengkap}` : role === 'ADMIN' ? 'Bapak/Ibu Administrator' : role === 'PERANGKAT_DESA' ? 'Bapak/Ibu Perangkat Desa' : 'Bapak/Ibu Petani'

  // 0. QUERY KATA SANDI / PASSWORD & PENANGANAN LUPA PASSWORD
  if (isPasswordOrAccountQuery(rawQuery) || isPasswordOrAccountQuery(query)) {
    return generatePasswordAndAccountResponse(userQuery, userContext)
  }

  // 1. QUERY SIAPA ADMIN SISTEM
  if (isAdminInfoQuery(rawQuery) || isAdminInfoQuery(query)) {
    return generateAdminInfoResponse(userContext)
  }

  // 2. IDENTITAS PENGGUNA (SIAPA SAYA)
  if (isUserIdentityQuery(rawQuery) || isUserIdentityQuery(query)) {
    return generateUserIdentityResponse(userContext)
  }

  // 3. IDENTITAS ASISTEN AI (SIAPA KAMU / ANDA)
  if (isBotIdentityQuery(rawQuery) || isBotIdentityQuery(query)) {
    return generateBotIdentityResponse(userContext)
  }

  // 4. SAPAAN UMUM
  if (rawQuery === 'halo' || rawQuery === 'hai' || rawQuery === 'assalamualaikum' || rawQuery.startsWith('selamat pagi') || rawQuery.startsWith('selamat siang') || rawQuery.startsWith('selamat sore')) {
    return `Halo ${greetingName}! Ada yang bisa saya bantu seputar data pertanian atau budidaya padi di Desa Cirebon Girang?`
  }

  // 5. PRIORITAS 0: PERTANYAAN OPERASIONAL & STATISTIK DATABASE (REAL-TIME)
  const masterDataAnswer = handleMasterDataAndAdminQueries(query, userQuery, userContext, conversationContext)
    || handleMasterDataAndAdminQueries(rawQuery, userQuery, userContext, conversationContext)
  if (masterDataAnswer) {
    return masterDataAnswer
  }

  // 6. JIKA DILUAR RANAH PERTANIAN PADI & OPERASIONAL SISTEM
  if (!isRiceFarmingQuery(rawQuery, userContext?.role) && !isRiceFarmingQuery(query, userContext?.role)) {
    return getOutOfScopeResponse(userContext)
  }

  // A. Generator Laporan Resmi Desa (Spesifik Permintaan Laporan/Rekapitulasi Formal)
  if (
    query.includes('laporan resmi') ||
    query.includes('draft laporan') ||
    query.includes('buatkan laporan') ||
    query.includes('buat laporan') ||
    query.includes('evaluasi panen') ||
    query.includes('laporan dinas') ||
    query.includes('laporan bulanan') ||
    query.includes('laporan rekapitulasi') ||
    (query.includes('laporan') && (query.includes('desa') || query.includes('padi') || query.includes('rekapitulasi')))
  ) {
    return generateOfficialAgriculturalReport(query, userContext)
  }

  // B. Ringkasan Eksekutif & Statistik Operasional Sistem
  if (
    /(ringkasan|rekapitulasi|overview|statistik).*(sistem|operasional|desa|data|pertanian)|dashboard.*data|kondisi.*sistem/i.test(query)
  ) {
    return generateOverviewStatsResponse(userContext)
  }

  // C. Pertanyaan Aktivitas Budidaya / Catatan Lapangan
  if (
    /(aktivitas|kegiatan|log|catatan).*(budidaya|lapangan|sawah|tani|terkini|terbaru)|laporan.*(aktivitas|lapangan|kegiatan)|apa.*(aktivitas|kegiatan)/i.test(query)
  ) {
    return generateAktivitasStatsResponse(userContext)
  }

  // D. Pertanyaan Akun Pengguna / User Terdaftar
  if (
    /(berapa|jumlah|total|daftar|siapa).*(pengguna|user|akun|hak akses)/i.test(query) ||
    /pengguna.*(terdaftar|aktif|sistem)/i.test(query)
  ) {
    return generateUserStatsResponse(userContext)
  }

  // E. Pertanyaan Jumlah Petani / Daftar Petani
  if (
    /(berapa|jumlah|total|siapa|daftar|data).*petani|petani.*(bergabung|terdaftar|ada|bina|anggota)/i.test(query)
  ) {
    return generateFarmerStatsResponse(userContext)
  }

  // F. Pertanyaan Kelompok Tani (Poktan)
  if (
    /(berapa|jumlah|total|daftar|siapa).*(kelompok tani|poktan|kelembagaan)|kelembagaan.*poktan/i.test(query)
  ) {
    return generatePoktanStatsResponse(userContext)
  }

  // G. Pertanyaan Data Panen / Produksi
  if (
    /(berapa|total|hasil|riwayat|realisasi).*panen|produksi.*(gabah|padi)|capaian.*produksi|hasil.*panen/i.test(query)
  ) {
    return generatePanenStatsResponse(userContext)
  }

  // H. Pertanyaan Musim Tanam
  if (
    /(berapa|status|jadwal|daftar|kalender).*musim|musim.*(berjalan|aktif|tanam|siklus)|varietas.*(ditanam|padi)/i.test(query)
  ) {
    return generateMusimStatsResponse(userContext)
  }

  // I. Pertanyaan Hamparan / Luas Sawah / Luas Lahan
  if (
    query.includes('hamparan') ||
    query.includes('luas hamparan') ||
    query.includes('total luas') ||
    /(berapa|jumlah|total|ada berapa).*luas/i.test(query) ||
    /luas.*(hamparan|sawah|lahan|pertanian|desa|hektar|m2|meter)/i.test(query) ||
    /(berapa|total).*(hektar|meter)/i.test(query) ||
    query === 'luas' ||
    query === 'total luas'
  ) {
    return generateHamparanStatsResponse(userContext)
  }

  // J. Pertanyaan Titik Lahan / Petak GIS
  if (
    query.includes('titik lahan') ||
    query.includes('petak gis') ||
    query.includes('koordinat gps') ||
    /(berapa|jumlah|total).*titik/i.test(query) ||
    /titik.*(lahan|terdata|sawah|ada berapa)/i.test(query)
  ) {
    return generateTitikLahanStatsResponse(userContext)
  }

  // K. Pertanyaan Zonasi Blok Sawah / Blok Dusun
  if (
    query.includes('zonasi') ||
    query.includes('blok dusun') ||
    query.includes('blok sawah') ||
    /(berapa|jumlah|total|nama|daftar|apa saja).*blok/i.test(query) ||
    /blok.*(dusun|sawah|apa saja|ada berapa)/i.test(query)
  ) {
    return generateZonasiBlokStatsResponse(userContext)
  }

  // L. Pertanyaan Lahan / Petak Sawah Aktif
  if (
    query.includes('gis') ||
    query.includes('peta lahan') ||
    /(berapa|jumlah|total|daftar|sebaran|ada berapa).*(petak|lahan|sawah)/i.test(query) ||
    /(petak|lahan|sawah).*(aktif|berapa|daftar|ada berapa|hektar)/i.test(query) ||
    /inventarisasi.*(lahan|sawah)/i.test(query)
  ) {
    return generateLahanStatsResponse(userContext)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 1: SPESIFIK BENIH AIR GARAM & PERSEMAIAN
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('air garam') || query.includes('seleksi benih') || query.includes('uji benih') || query.includes('peram benih') || query.includes('semai') || query.includes('persemaian') || query.includes('dapog')) {
    return `**Uji Benih Air Garam & Persemaian:**\n• Larutkan garam hingga telur mentah mengapung. Masukkan benih, ambil yang tenggelam (bernas), lalu cuci bersih.\n• Rendam 24 jam, peram 24–48 jam. Semai di bedengan 400 m²/Ha (kebutuhan 20–25 kg benih), tanam pindah umur muda 15–18 HSS.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 2: SPESIFIK JAJAR LEGOWO
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('legowo') || query.includes('jajar legowo') || query.includes('jarak tanam')) {
    return `**Sistem Jajar Legowo 2:1:**\n• Pola tanam berselang (jarak 20 × 10 × 40 cm) dengan populasi ±213.300 rumpun/Ha.\n• Memberikan efek tanaman pinggir (cahaya 100%), malai lebih bernas, sirkulasi udara lancar, dan meningkatkan hasil panen 15–25%.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 3: ANALISA BIAYA & MODAL USAHA TANI
  // ─────────────────────────────────────────────────────────────────────────
  if (
    query.includes('biaya') ||
    query.includes('modal') ||
    query.includes('keuntungan') ||
    query.includes('analisa usaha') ||
    query.includes('usaha tani') ||
    (/\blaba\b/i.test(query) && !query.includes('laba-laba'))
  ) {
    return `**Estimasi Usaha Tani Padi (1 Ha di Cirebon):**\n• **Modal Biaya:** ±Rp 13.250.000 (olah tanah, benih, tanam, pupuk, pestisida, panen).\n• **Hasil Gabah:** ~7 Ton GKP × Rp 7.000 = Rp 49.000.000.\n• **Keuntungan Bersih:** ±Rp 35.750.000 per musim tanam.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 4: PESTISIDA NABATI & ORGANIK
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('pestisida nabati') || query.includes('nabati') || query.includes('mimba') || query.includes('tembakau') || query.includes('organik')) {
    return `**Pestisida Nabati Organik:**\n• Tumbuk 1 kg daun mimba/sirsak, 250 g lengkuas, 250 g bawang putih, dan 200 g tembakau ke dalam 5 liter air. Fermentasi 24–48 jam.\n• Saring, campur 1 sdm sabun cair perekat. Larutkan 1 gelas (200 ml) per tangki semprot (14–16 L air).`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 5: ASAM-ASAMAN & KERACUNAN BESI
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('asam') || query.includes('asam-asaman') || query.includes('karat besi')) {
    return `**Solusi Padi Asam-Asaman (Karat Besi / Akar Hitam):**\n1. Keringkan air sawah total selama 4–7 hari sampai tanah sedikit retak rambut.\n2. Tabur kapur Dolomit 200–300 kg/Ha saat becek untuk menetralkan pH tanah.\n3. Semprot pupuk mikro Silika/Zn dan hentikan pupuk Urea sementara.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 6: HAMA TIKUS SAWAH
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('tikus') || query.includes('gropyokan') || query.includes('tbs') || query.includes('rubuha') || query.includes('rodentisida')) {
    return `**Pengendalian Hama Tikus Sawah:**\n• Lakukan gropyokan serentak dan pengasapan belerang (emposan) pada liang aktif saat masa bera/olah tanah.\n• Pasang Rumah Burung Hantu (Rubuha) atau terapkan sistem pagar perangkap TBS dan umpan rodentisida beracun.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 7: HAMA WERENG BATANG COKLAT (WBC)
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('wereng') || query.includes('wbc') || query.includes('hopperburn')) {
    return `**Pengendalian Wereng Batang Coklat (WBC):**\n1. Keringkan petakan sawah macak-macak (wereng menyukai pangkal lembap).\n2. Hentikan pemupukan Urea berlebih.\n3. Semprot pangkal rumpun di pagi hari dengan insektisida berbahan aktif *Pimetrozin* (Chess) atau *Buprofezin* (Applaud).`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 8: PENGGEREK BATANG (SUNDEP & BELUK)
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('sundep') || query.includes('beluk') || query.includes('penggerek')) {
    return `**Pengendalian Sundep & Beluk (Penggerek Batang):**\n• **Sundep (vegetatif):** Potong ujung bibit sebelum tanam, tabur insektisida karbofuran saat 10–14 HST.\n• **Beluk (generatif):** Semprot insektisida sistemik berbahan aktif *Klorantraniliprol* (Prevathon) atau *Dimehipo* saat padi mulai bunting.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 9: HAMA KEONG MAS
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('keong') || query.includes('siput')) {
    return `**Pengendalian Keong Mas (Umur 1–15 HST):**\n• Jaga air sawah macak-macak (0,5–1 cm) agar keong sulit bergerak.\n• Buat parit cacingan (carem) di pinggir petak untuk mengumpulkan keong mas, atau pasang umpan daun pepaya/talas.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 10: WALANG SANGIT
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('walang') || query.includes('sangit')) {
    return `**Pengendalian Walang Sangit (Fase Masak Susu):**\n• Pasang perangkap bangkai kepiting/keong di pematang sawah.\n• Semprot tajuk padi pagi hari (06.00–08.30) dengan insektisida berbahan aktif *Deltametrin* atau *BPMC*.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 11: KRESEK & BLAS
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('kresek') || query.includes('hawar') || query.includes('blast') || query.includes('blas') || query.includes('potong leher')) {
    return `**Pengendalian Kresek & Blas:**\n• **Kresek (bakteri):** Hentikan Urea, keringkan berkala, semprot bakterisida Tembaga Hidroksida (*Kocide*).\n• **Blas / Potong Leher (jamur):** Semprot fungisida *Trisiklazol* (*Filia* / *Beam*) saat bunting muda (45 HST) dan bunting tua (60 HST).`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 12: VARIETAS PADI UNGGUL
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('varietas') || query.includes('inpari') || query.includes('ciherang') || query.includes('mekongga') || query.includes('cakrabuana')) {
    return `**Varietas Padi Unggul di Cirebon Girang:**\n• **Inpari 32 HDB:** Potensi 8,5–10,5 ton/Ha, sangat tahan kresek, rasa pulen (sangat direkomendasikan).\n• **Ciherang:** Potensi 7,5–8,5 ton/Ha, pulen gurih, disukai pasar.\n• **Inpari 42 GSR:** Umur genjah (112 hari), hemat air dan pupuk, cocok untuk musim kemarau (MT2).`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 13: DAUN MENGUNING UMUM
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('kuning') || query.includes('menguning')) {
    return `**Penyebab Daun Padi Menguning & Solusinya:**\n• **Kresek:** Ujung daun kering bergelombang → Stop Urea, semprot bakterisida Tembaga Hidroksida.\n• **Kurang Hara:** Daun tua bawah kuning merata → Berikan pupuk susulan Urea + NPK Phonska.\n• **Asam-asaman:** Daun kuning bercak karat, akar hitam busuk → Keringkan sawah dan tabur kapur Dolomit.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 14: PENGOLAHAN TANAH
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('olah tanah') || query.includes('bajak') || query.includes('garu') || query.includes('pelumpuran') || query.includes('singkal')) {
    return `**Tahapan Pengolahan Tanah Sawah:**\n1. Bajak I (singkal) kedalaman 20–25 cm untuk membalik tanah, lalu jemur 5–7 hari.\n2. Genangi air 3–5 cm selama 1 minggu agar sisa jerami terdekomposisi.\n3. Bajak II (rotari) & ratakan tanah hingga membentuk lumpur matang setebal ±20 cm siap tanam.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 15: PEMUPUKAN BERIMBANG & DOSIS PER HST
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('pupuk') || query.includes('pemupukan') || query.includes('dosis') || query.includes('takaran') || query.includes('urea') || query.includes('npk') || query.includes('phonska')) {
    return `**Dosis Pemupukan Padi Berimbang per Hektar:**\n• **Dasar (0–5 HST):** Pupuk organik 500–1.000 kg + SP-36 75–100 kg (atau NPK 100 kg).\n• **Susulan I (10–14 HST):** Urea 75–100 kg + NPK Phonska 150 kg.\n• **Susulan II (30–35 HST):** Urea 50 kg + NPK Phonska 100 kg + KCl 25–50 kg.\n*Aplikasi saat sawah kondisi becek/macak-macak.*`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 16: MANAJEMEN AIR & MACAK-MACAK (AWD)
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('irigasi') || query.includes('pengairan') || query.includes('macak') || query.includes('awd') || query.includes('intermitten') || query.includes('air')) {
    return `**Manajemen Air Macak-Macak (AWD):**\n• **0–7 HST:** Air dangkal 1–2 cm agar bibit tegak.\n• **8–35 HST:** Macak-macak berselang (biarkan surut becek retak rambut, lalu airi 2–3 cm) untuk memacu anakan.\n• **40–70 HST (Bunting):** Genangi 3–5 cm.\n• **10–14 hari pra-panen:** Keringkan total sawah.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 17: KALENDER MUSIM TANAM
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('jadwal tanam') || query.includes('musim tanam') || query.includes('rendeng') || query.includes('gadu') || query.includes('estimasi panen')) {
    return `**Kalender Musim Tanam Desa Cirebon Girang:**\n• **MT1 (Rendeng):** Tanam November–Desember, panen Februari–Maret (saat ini aktif: **6 petak MT**).\n• **MT2 (Gadu):** Tanam April–Mei, panen Juli–Agustus.\n• **MT3 (Bera/Palawija):** Agustus–Oktober.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 18: PANEN, GABAH GKP/GKG & BULOG
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('panen') || query.includes('gkp') || query.includes('gkg') || query.includes('kadar air') || query.includes('bulog') || query.includes('gabah')) {
    return `**Panen & Standar Gabah:**\n• **Siap Panen:** 90–95% bulir menguning dan malai menunduk.\n• **GKP (Kering Panen):** Baru dirontokkan, kadar air 20–25%.\n• **GKG (Kering Giling / Standar Bulog):** Dijemur hingga kadar air maksimal 14% dan butir hampa <3%.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 19: GULMA & PENYIANGAN PADI
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('gulma') || query.includes('rumput') || query.includes('penyiangan') || query.includes('osrok') || query.includes('gasrok') || query.includes('herbisida') || query.includes('teki') || query.includes('jajagoan')) {
    return `**Pengendalian Gulma (Rumput) Sawah:**\n• Penyiangan pertama umur 15–21 HST dengan alat gasrok/landak di lorong legowo, penyiangan kedua umur 30–35 HST.\n• Herbisida selektif (*bensulfuron-metil* / *bispiribak-natrium*) dapat diaplikasikan umur 0–5 HST saat air macak-macak.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 20: BULIR HAMPA & PENGISIAN MALAI
  // ─────────────────────────────────────────────────────────────────────────
  if (
    !query.includes('hampar') &&
    (
      query.includes('bulir hampa') ||
      query.includes('gabah kosong') ||
      query.includes('gabah hampa') ||
      query.includes('pengisian bulir') ||
      query.includes('bernas') ||
      query.includes('malai') ||
      /\bhampa\b/i.test(query)
    )
  ) {
    return `**Mencegah Bulir Padi Hampa:**\n1. Berikan Kalium (KCl 25–50 kg/Ha) pada 30–35 HST dan semprot pupuk Kalium cair/Silika saat keluar malai (50–60 HST).\n2. Jaga ketersediaan air (3–5 cm) saat berbunga agar serbuk sari tidak kering.\n3. Cegah serangan walang sangit dan penggerek batang.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 21: MEMPERBANYAK ANAKAN PADI
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('anakan') || query.includes('tunas') || query.includes('rumpun padat')) {
    return `**Cara Memperbanyak Anakan Produktif (Target >20 Batang):**\n• Gunakan bibit muda umur 15–18 HSS dan tanam dangkal (1–2 cm).\n• Terapkan pengairan berselang macak-macak pada umur 8–35 HST.\n• Berikan pupuk Fosfat (SP-36) saat dasar dan NPK + Urea tepat waktu pada 10–14 HST.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 22: HAMA PUTIH PALSU & ULAT DAUN
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('putih palsu') || query.includes('ulat daun') || query.includes('penggulung daun') || query.includes('ulat grayak') || query.includes('ulat')) {
    return `**Pengendalian Hama Putih Palsu / Ulat Daun:**\n• Daun padi melipat dan memutih akibat ulat memakan klorofil dari dalam.\n• Jika kerusakan daun >10%, semprot pagi hari dengan insektisida berbahan aktif *Klorantraniliprol* (Prevathon) atau *Emamektin Benzoat*.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 23: PENYAKIT BUSUK PELEPAH & BUSUK BATANG
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('busuk pelepah') || query.includes('busuk batang') || query.includes('rhizoctonia') || query.includes('pelepah')) {
    return `**Pengendalian Busuk Pelepah & Busuk Batang:**\n• Kurangi kelembapan rumpun dengan jarak tanam jajar legowo dan pengairan berselang.\n• Kurangi Urea berlebih dan semprot pangkal batang dengan fungisida *Heksakonazol* (Anvil) atau *Difenokonazol* (Score).`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 24: PERBEDAAN MUSIM RENDENG VS GADU
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('perbedaan rendeng') || (query.includes('rendeng') && query.includes('gadu'))) {
    return `**Perbedaan Musim Rendeng (MT1) vs Gadu (MT2):**\n• **Rendeng (Hujan):** Air melimpah, gunakan varietas tahan kresek seperti Inpari 32 (saat ini aktif: **6 petak MT**).\n• **Gadu (Kemarau):** Panas maksimal fotosintesis (potensi 7–8,5 Ton/Ha), gunakan varietas hemat air seperti Inpari 42 GSR.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIORITAS 25: PASCA PANEN & PENYIMPANAN LUMBUNG
  // ─────────────────────────────────────────────────────────────────────────
  if (query.includes('lumbung') || query.includes('simpan gabah') || query.includes('gudang') || query.includes('kutu beras') || query.includes('pasca panen')) {
    return `**Penyimpanan Gabah di Lumbung:**\n• Keringkan gabah hingga kadar air 14% (standar GKG).\n• Simpan dalam karung di atas palet kayu setinggi 15–20 cm dari lantai dan berjarak 30 cm dari dinding.\n• Taruh daun mimba/salam kering untuk mencegah kutu beras.`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FALLBACK PADI CERDAS & BERBOBOT
  // ─────────────────────────────────────────────────────────────────────────
  if (/(padi|tanam|pupuk|hama|penyakit|sawah|bibit|benih|air|irigasi|panen|tanah|gulma)/i.test(query)) {
    return `Untuk budidaya padi di Desa Cirebon Girang, terapkan pemupukan berimbang sesuai umur HST, pertahankan sistem pengairan macak-macak, dan amati pangkal rumpun secara berkala. Ada kendala hama atau varietas spesifik yang ingin Anda konsultasikan?`
  }

  return `Saya siap membantu data pertanian Desa Cirebon Girang (Kelompok Tani, Anggota, Lahan, Musim Tanam, Hasil Panen) serta konsultasi budidaya padi sawah. Ada hal spesifik yang ingin Anda ketahui?`
}

// ─────────────────────────────────────────────────────────────────────────────
// PROSES CHAT UTAMA (MENGHUBUNGKAN GEMINI / OPENAI DENGAN SUPER ENGINE LOKAL)
// ─────────────────────────────────────────────────────────────────────────────

export async function processAiChat(params: ProcessAiChatParams): Promise<ProcessAiChatResult> {
  const { messages, userContext } = params
  let apiKey = params.apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY
  let provider = (params.provider || process.env.AI_PROVIDER || 'gemini').toLowerCase()
  let geminiModel = (provider === 'gemini' && params.model) ? params.model : (process.env.AI_GEMINI_MODEL || 'gemini-2.0-flash')
  let openAiModel = (provider === 'openai' && params.model) ? params.model : (process.env.AI_OPENAI_MODEL || 'gpt-4o-mini')

  try {
    const { getAppSettings } = require('@/lib/settings')
    const appSettings = getAppSettings()
    if (!apiKey && appSettings?.aiApiKey) {
      apiKey = appSettings.aiApiKey
    }
    if (!params.provider && appSettings?.aiProvider) {
      provider = appSettings.aiProvider.toLowerCase()
    }
    if (!params.model && appSettings?.aiGeminiModel) {
      geminiModel = appSettings.aiGeminiModel
    }
    if (!params.model && appSettings?.aiOpenAiModel) {
      openAiModel = appSettings.aiOpenAiModel
    }
  } catch {
    // fallback to env
  }

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  // Konteks riwayat percakapan untuk multi-turn intelligence
  const recentMessages = messages.slice(-5)
  const conversationContext = recentMessages.map(m => m.content).join(' ').toLowerCase()

  const queryTrimmed = lastUserMessage.toLowerCase().trim()
  const queryNormalized = normalizeIndonesianQuery(lastUserMessage)

  // 0. Intercept pertanyaan kata sandi / password / lupa password secara instan dan 100% akurat
  if (isPasswordOrAccountQuery(queryTrimmed) || isPasswordOrAccountQuery(queryNormalized)) {
    return {
      content: generatePasswordAndAccountResponse(lastUserMessage, userContext),
      provider: 'local-security-engine',
    }
  }

  // Intercept pertanyaan seputar Data Master & Seluruh Fitur Dashboard Admin secara instan & akurat
  const masterDataAnswer = handleMasterDataAndAdminQueries(queryNormalized, lastUserMessage, userContext, conversationContext)
    || handleMasterDataAndAdminQueries(queryTrimmed, lastUserMessage, userContext, conversationContext)
  if (masterDataAnswer) {
    return {
      content: masterDataAnswer,
      provider: 'local-master-data-engine',
    }
  }

  // Intercept pertanyaan identitas pengguna & bot secara instan dan 100% akurat
  if (isAdminInfoQuery(queryTrimmed) || isAdminInfoQuery(queryNormalized)) {
    return {
      content: generateAdminInfoResponse(userContext),
      provider: 'local-identity-engine',
    }
  }

  if (isUserIdentityQuery(queryTrimmed) || isUserIdentityQuery(queryNormalized)) {
    return {
      content: generateUserIdentityResponse(userContext),
      provider: 'local-identity-engine',
    }
  }

  if (isBotIdentityQuery(queryTrimmed) || isBotIdentityQuery(queryNormalized)) {
    return {
      content: generateBotIdentityResponse(userContext),
      provider: 'local-identity-engine',
    }
  }

  // Intercept pertanyaan layanan desa, surat domisili, dan pengajuan surat
  if (isVillageServicesQuery(queryTrimmed) || isVillageServicesQuery(queryNormalized)) {
    return {
      content: generateVillageServicesResponse(lastUserMessage, userContext),
      provider: 'local-services-engine',
    }
  }

  if (!isRiceFarmingQuery(queryTrimmed, userContext?.role) && !isRiceFarmingQuery(queryNormalized, userContext?.role)) {
    return {
      content: getOutOfScopeResponse(userContext),
      provider: 'domain-guard',
    }
  }

  // Jika tidak ada API key yang terkonfigurasi, gunakan Super Knowledge Base Lokal
  if (!apiKey || apiKey.trim() === '') {
    const localAnswer = getSmartLocalResponse(lastUserMessage, userContext, conversationContext)
    return {
      content: localAnswer,
      provider: 'local-knowledge-engine',
    }
  }

  const systemPrompt = buildSystemPrompt(userContext)

  // 1. GEMINI PROVIDER (Gemini 2.0 Flash / Pro)
  if (provider === 'gemini') {
    const model = geminiModel
    try {
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 350,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`
        try {
          const errData = await response.json()
          if (errData?.error?.message) {
            errMsg = `${errData.error.message} (HTTP ${response.status})`
          }
        } catch {}
        console.warn(`Gemini API error (${errMsg}), beralih ke super knowledge engine lokal.`)
        return {
          content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
          provider: 'local-fallback',
          apiError: errMsg,
        }
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (text && text.trim()) {
        return {
          content: text.trim(),
          provider: `gemini (${model})`,
        }
      }

      throw new Error('Respon Gemini kosong')
    } catch (err: any) {
      console.warn('Gagal memanggil Gemini API:', err.message)
      return {
        content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
        provider: 'local-fallback',
        apiError: err.message,
      }
    }
  }

  // 2. OPENAI PROVIDER
  if (provider === 'openai') {
    const model = openAiModel
    try {
      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ]

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: openAiMessages,
          temperature: 0.3,
          max_tokens: 350,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`
        try {
          const errData = await response.json()
          if (errData?.error?.message) {
            errMsg = `${errData.error.message} (HTTP ${response.status})`
          }
        } catch {}
        console.warn(`OpenAI API error (${errMsg}), beralih ke super knowledge engine lokal.`)
        return {
          content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
          provider: 'local-fallback',
          apiError: errMsg,
        }
      }

      const data = await response.json()
      const text = data?.choices?.[0]?.message?.content

      if (text && text.trim()) {
        return {
          content: text.trim(),
          provider: `openai (${model})`,
        }
      }

      throw new Error('Respon OpenAI kosong')
    } catch (err: any) {
      console.warn('Gagal memanggil OpenAI API:', err.message)
      return {
        content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
        provider: 'local-fallback',
        apiError: err.message,
      }
    }
  }

  // Default fallback
  return {
    content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
    provider: 'local-knowledge-engine',
  }
}

export async function getFarmingAssistantResponse(userMessage: string): Promise<string> {
  const result = await processAiChat({
    messages: [{ role: 'user', content: userMessage }],
  })
  return result.content
}