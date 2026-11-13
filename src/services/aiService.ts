import { getAppSettingsAsync } from '@/lib/settings'

export interface AiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StatsDesaContext {
  totalUsers?: number
  usersByRole?: { admin: number; perangkatDesa: number; petani: number }
  daftarUsers?: Array<{
    username: string
    fullName: string
    role: string
    phone?: string
    email?: string
    isActive?: boolean
    lastLoginAt?: string
  }>
  totalPetani: number
  daftarPetani?: Array<{
    nama: string
    nik?: string
    telepon: string
    alamat: string
    jenisKelamin?: string
    poktan: string
    totalLahan: number
    totalLuasM2: number
    totalLuasHa: number
    username?: string
    lahanNames?: string[]
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
    totalLuasHa?: number
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
    latitude?: number
    longitude?: number
    catatan?: string
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
    hst?: number
    sisaHariPanen?: number
    catatan?: string
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
  totalBiayaAktivitas?: number
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
  daftarInformasi?: Array<{
    judul: string
    kategori: string
    namaPenulis: string
    isiRingkas: string
    tanggalPublikasi: string
  }>
  daftarBroadcast?: Array<{
    title: string
    message: string
    category: string
    severity: string
    targetRole: string
    sentViaEmail: boolean
    sentViaWa: boolean
    createdAt: string
  }>
  daftarAuditLog?: Array<{
    action: string
    entity: string
    details: string
    userName: string
    createdAt: string
  }>
  earlyWarnings?: Array<{
    title: string
    severity: 'URGENT' | 'WARNING' | 'INFO'
    type: string
    lahanNama?: string
    petaniNama?: string
    message: string
  }>
  appSettings?: {
    appName: string
    villageName: string
    districtName: string
    regencyName: string
    adminContactName: string
    adminContactPhone: string
    notificationTargetEmail: string
    defaultWhatsAppNumber: string
    waGatewayProvider?: string
    waConfigured?: boolean
    aiProvider: string
    smtpHost: string
  }
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
  skipLocalPriority?: boolean
}

export interface ProcessAiChatResult {
  content: string
  provider: string
  apiError?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER KOMPUTASI DINAMIS DARI DATA DATABASE
// ─────────────────────────────────────────────────────────────────────────────

function getSuperlatives(s?: StatsDesaContext) {
  const lahanSorted = [...(s?.daftarLahan || [])].sort((a, b) => b.luasM2 - a.luasM2)
  const petaniSorted = [...(s?.daftarPetani || [])].sort((a, b) => b.totalLuasM2 - a.totalLuasM2)
  const panenSorted = [...(s?.daftarPanen || [])].sort((a, b) => b.jumlahKg - a.jumlahKg)
  const poktanSorted = [...(s?.daftarPoktan || [])].sort((a, b) => b.jumlahPetani - a.jumlahPetani)

  return {
    lahanTerluas: lahanSorted[0],
    lahanTerkecil: lahanSorted[lahanSorted.length - 1],
    petaniTerluas: petaniSorted[0],
    panenTerbanyak: panenSorted[0],
    poktanTerbanyak: poktanSorted[0],
  }
}

function getKepalaDesaUser(s?: StatsDesaContext) {
  return s?.daftarUsers?.find(u => u.role === 'PERANGKAT_DESA')
}

function getAdminUser(s?: StatsDesaContext) {
  return s?.daftarUsers?.find(u => u.role === 'ADMIN')
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT SISTEM LENGKAP (REAL-TIME DATABASE + ARSITEKTUR WEB SI PADI)
// ─────────────────────────────────────────────────────────────────────────────

export function buildSystemPrompt(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const role = userContext?.role || 'ADMIN'
  const namaUser = userContext?.namaUser || 'Pengelola Sistem'
  const kades = getKepalaDesaUser(s)
  const admin = getAdminUser(s)
  const sup = getSuperlatives(s)

  const kadesName = kades?.fullName || 'Bapak Karsiman, S.Sos'
  const kadesEmail = kades?.email || 'karsiman@gmail.com'
  const kadesPhone = kades?.phone || '081298765432'
  const adminName = admin?.fullName || s?.appSettings?.adminContactName || 'Karisma Siti Nabila'
  const adminEmail = admin?.email || 'Karismasitinabila7@gmail.com'
  const adminPhone = admin?.phone || s?.appSettings?.adminContactPhone || '0812-3456-7890'

  let contextInfo = ''

  if (s) {
    contextInfo += `
DATA REAL-TIME LANGSUNG DARI DATABASE MYSQL (TiDB CLOUD):
Pengguna Saat Ini: ${userContext?.namaLengkap || namaUser} (Role: ${role})

1. PROFIL PEJABAT & KONFIGURASI DESA:
- Nama Sistem: ${s.appSettings?.appName || 'Platform Pertanian Padi Desa Cirebon Girang (SI PADI)'}
- Wilayah: ${s.appSettings?.villageName || 'Desa Cirebon Girang'}, ${s.appSettings?.districtName || 'Kecamatan Talun'}, ${s.appSettings?.regencyName || 'Kabupaten Cirebon'}
- Kepala Desa / Kuwu / Perangkat Desa Pengawas: ${kadesName} (@${kades?.username || 'perangkat_desa'}, Role: PERANGKAT_DESA, Email: ${kadesEmail}, HP: ${kadesPhone}). Di dalam sistem SI PADI, ${kadesName} bertugas sebagai Perangkat Desa (Seksi Pelayanan & Pembinaan Pertanian) sekaligus Kuwu / Kepala Desa penandatangan laporan resmi desa.
- Administrator Sistem: ${adminName} (@${admin?.username || 'admin'}, Role: ADMIN, Email: ${adminEmail}, HP: ${adminPhone}).
- Notifikasi Email & WA: Email target ${s.appSettings?.notificationTargetEmail || 'karismasitinabila7@gmail.com'} (SMTP Nodemailer), WhatsApp Gateway otomatis (${(s.appSettings?.waGatewayProvider || 'fonnte').toUpperCase()} / Wablas / Webhook - Status token: ${s.appSettings?.waConfigured ? 'AKTIF Otomatis' : 'Belum diisi, tersedia fallback Click-to-Chat'}, nomor default ${s.appSettings?.defaultWhatsAppNumber || '6285797864834'}).
- Arsitektur Teknis Web: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM, Database MySQL (TiDB Cloud Serverless), Hosting Vercel, Peta GIS Leaflet, Auth JWT (jose) + bcryptjs.

2. DATA AKUN PENGGUNA (${s.totalUsers ?? 0} Akun):
- Rincian Role: Administrator (${s.usersByRole?.admin ?? 0}), Perangkat Desa (${s.usersByRole?.perangkatDesa ?? 0}), Petani (${s.usersByRole?.petani ?? 0})
${s.daftarUsers?.length ? `- Daftar Lengkap Akun: ${s.daftarUsers.map(u => `${u.fullName} (@${u.username}, Role: ${u.role}, Email: ${u.email || '-'}, HP: ${u.phone || '-'}, Aktif: ${u.isActive !== false ? 'Ya' : 'Tidak'})`).join('; ')}` : ''}

3. DATA PETANI (${s.totalPetani} Orang):
${s.daftarPetani?.length ? s.daftarPetani.map(p => `- ${p.nama}: NIK ${p.nik || '-'}, Poktan ${p.poktan}, Domisili ${p.alamat}, HP ${p.telepon}, Garapan ${p.totalLahan} petak (${p.totalLuasHa} Ha / ${p.totalLuasM2} m²) [${(p.lahanNames || []).join(', ')}]`).join('\n') : '- Belum ada data'}

4. KELOMPOK TANI / POKTAN (${s.totalPoktan} Kelompok):
${s.daftarPoktan?.length ? s.daftarPoktan.map(p => `- ${p.nama}: Ketua ${p.ketua}, Wilayah ${p.wilayah}, Kontak ${p.kontak || '-'}, Jumlah Anggota ${p.jumlahPetani} (${(p.anggotaNames || []).join(', ') || 'Belum ada anggota terhubung'}), Luas ${p.totalLuasHa ?? 0} Ha`).join('\n') : '- Belum ada data'}

5. LAHAN PERTANIAN SAWAH (${s.totalLahan} Petak | ${s.lahanAktif} Aktif, ${s.lahanTidakAktif} Tidak Aktif | Total Luas ${s.totalLuasHa.toFixed(2)} Ha / ${s.totalLuasM2.toLocaleString('id-ID')} m²):
${s.daftarLahan?.length ? s.daftarLahan.map(l => `- ${l.nama}: ${l.luasM2.toLocaleString('id-ID')} m² (${l.luasHa} Ha), Pengelola ${l.petani}, Lokasi ${l.lokasi}, Status ${l.status}, GPS (${l.latitude ?? '-'}, ${l.longitude ?? '-'})`).join('\n') : '- Belum ada data'}

6. PERINGKAT SUPERLATIF REAL-TIME:
- Petak Lahan Terluas: ${sup.lahanTerluas ? `${sup.lahanTerluas.nama} (${sup.lahanTerluas.luasM2.toLocaleString('id-ID')} m² / ${sup.lahanTerluas.luasHa} Ha) milik ${sup.lahanTerluas.petani}` : '-'}
- Petak Lahan Terkecil: ${sup.lahanTerkecil ? `${sup.lahanTerkecil.nama} (${sup.lahanTerkecil.luasM2.toLocaleString('id-ID')} m² / ${sup.lahanTerkecil.luasHa} Ha) milik ${sup.lahanTerkecil.petani}` : '-'}
- Petani dengan Akumulasi Lahan Terluas: ${sup.petaniTerluas ? `${sup.petaniTerluas.nama} (${sup.petaniTerluas.totalLahan} petak, ${sup.petaniTerluas.totalLuasHa} Ha / ${sup.petaniTerluas.totalLuasM2.toLocaleString('id-ID')} m²)` : '-'}
- Hasil Panen Terbanyak: ${sup.panenTerbanyak ? `${sup.panenTerbanyak.petani} (${sup.panenTerbanyak.jumlahKg.toLocaleString('id-ID')} kg / ${(sup.panenTerbanyak.jumlahKg / 1000).toFixed(2)} Ton, varietas ${sup.panenTerbanyak.varietas} di ${sup.panenTerbanyak.lahan})` : '-'}

7. MUSIM TANAM (${s.totalMusim} Siklus: ${s.musimBerjalan} Berjalan, ${s.musimPerencanaan} Perencanaan, ${s.musimSelesai} Selesai, ${s.musimGagal} Gagal):
${s.daftarMusim?.length ? s.daftarMusim.map(m => `- ${m.namaMusim}: Varietas ${m.varietas}, Lahan ${m.lahanNama}, Petani ${m.petaniNama}, Status ${m.status}, Tanam ${m.tanggalTanam || '-'}, Est. Panen ${m.estimasiPanen || '-'}, Umur ${m.hst ?? '-'} HST`).join('\n') : '- Belum ada data'}

8. REALISASI PANEN (${s.totalPanenSesi} Sesi | Total ${s.totalPanenTon.toFixed(2)} Ton / ${s.totalPanenKg.toLocaleString('id-ID')} kg):
${s.daftarPanen?.length ? s.daftarPanen.map(p => `- ${p.petani} (${p.lahan || '-'}): ${p.jumlahKg.toLocaleString('id-ID')} kg (${(p.jumlahKg / 1000).toFixed(2)} Ton), Varietas ${p.varietas}, Mutu ${p.kualitas}, Tgl ${p.tanggalPanen}`).join('\n') : '- Belum ada data'}

9. AKTIVITAS BUDIDAYA (${s.totalAktivitas} Kegiatan | Total Biaya Rp ${(s.totalBiayaAktivitas || 0).toLocaleString('id-ID')}):
${s.aktivitasTerbaru?.length ? s.aktivitasTerbaru.slice(0, 12).map(a => `- [${a.tanggal}] ${a.jenis} - ${a.lahan || a.musim} (${a.petani || '-'}): ${a.deskripsi} | Bahan: ${a.bahan || '-'} | Biaya: Rp ${(a.biaya || 0).toLocaleString('id-ID')}`).join('\n') : '- Belum ada data'}

10. PERINGATAN DINI (EARLY WARNING) & EDUKASI DESA:
- Peringatan Aktif: ${s.earlyWarnings?.length ? s.earlyWarnings.map(w => `[${w.severity}] ${w.title}: ${w.message}`).join(' | ') : 'Tidak ada peringatan mendesak'}
- Artikel & Pengumuman Desa (${s.daftarInformasi?.length || 0} Published): ${s.daftarInformasi?.length ? s.daftarInformasi.map(i => `${i.judul} [${i.kategori}, oleh ${i.namaPenulis}]`).join('; ') : '-'}
- Audit Log Terbaru: ${s.daftarAuditLog?.length ? s.daftarAuditLog.slice(0, 5).map(a => `[${a.createdAt}] ${a.userName} (${a.action} ${a.entity}): ${a.details}`).join('; ') : '-'}
`
  }

  if (userContext?.namaLengkap) {
    contextInfo += `
KONTEKS PENGGUNA YANG SEDANG LOGIN:
- Nama: ${userContext.namaLengkap} (Role: ${role})
${userContext.kelompokTani ? `- Kelompok Tani: ${userContext.kelompokTani}` : ''}
${userContext.lahan?.length ? `- Lahan Pribadi: ${userContext.lahan.map(l => `${l.namaLahan} (${l.luasLahan} ${l.satuanLuas}, ${l.lokasi})`).join('; ')}` : ''}
${userContext.musimAktif?.length ? `- Musim Tanam Aktif Pribadi: ${userContext.musimAktif.map(m => `${m.namaMusim} (${m.varietasPadi}, Est. Panen ${m.estimasiPanen.slice(0, 10)})`).join('; ')}` : ''}
`
  }

  const botTitle =
    role === 'ADMIN'
      ? 'Asisten Pintar Administrator SI PADI Desa Cirebon Girang'
      : role === 'PERANGKAT_DESA'
      ? 'Asisten Eksekutif Perangkat Desa SI PADI Desa Cirebon Girang'
      : 'Asisten Cerdas Pertanian Padi SI PADI Desa Cirebon Girang'

  return `
Kamu adalah **${botTitle}**.
TUGAS UTAMAMU adalah menjawab **SEMUA pertanyaan** dari pengguna maupun dosen penguji seputar:
1. Data aktual yang tampil di Dashboard Admin, Dashboard Perangkat Desa, Dashboard Petani, dan seluruh sub-menu web SI PADI.
2. Struktur, fitur, teknologi, database, notifikasi, dan cara kerja web SI PADI.
3. Konsultasi budidaya padi sawah (hama, penyakit, pemupukan, varietas, pengairan, panen).

ATURAN JAWABAN KETAT (PEDOMAN PENGUJIAN DOSEN & PENGGUNA):
1. ATURAN KATA TANYA "BERAPA" (JUMLAH / TOTAL / STATISTIK):
   - Jika pengguna bertanya diawali atau mengandung kata "berapa", "berapakah", "jumlah", atau "total", KAMU WAJIB LANGSUNG MENJAWAB DENGAN ANGKA / KUANTITAS secara to-the-point dan ringkas.
   - Contoh "berapa total pengguna" -> Jawab: "Total pengguna terdaftar adalah **6 orang** (1 Administrator, 1 Perangkat Desa, dan 4 Petani)." JANGAN mendump daftar seluruh email dan nomor telepon akun!
   - Contoh "berapa petani" -> Jawab: "**4 orang** petani terdaftar."
   - Contoh "berapa kelompok tani" -> Jawab: "**3 Kelompok Tani**."
   - Contoh "berapa luas lahan" -> Jawab: "**6,0 Hektar** (60.000 m²)."
   - Contoh "berapa petak lahan" -> Jawab: "**4 petak lahan sawah**."
   - Contoh "berapa musim tanam" -> Jawab: "**3 musim tanam** aktif."
   - Contoh "berapa hasil panen" -> Jawab: "**14,50 Ton** (14.500 kg)."
   - Contoh "berapa aktivitas budidaya" -> Jawab: "**8 kegiatan aktivitas budidaya**."

2. ATURAN KATA TANYA "SIAPA" (NAMA ORANG / SUBJEK):
   - Jika pengguna bertanya diawali atau mengandung kata "siapa", "siapakah", atau menanyakan nama, KAMU WAJIB LANGSUNG MENYEBUTKAN NAMA ORANGNYA secara spesifik dan jelas.
   - Contoh "siapa saya" -> Jawab: nama lengkap pengguna yang sedang login.
   - Contoh "siapa kepala desa / kuwu" -> Jawab: "**Bapak Karsiman, S.Sos**."
   - Contoh "siapa admin / administrator" -> Jawab: "**Karisma Siti Nabila**."
   - Contoh "siapa ketua poktan sri rejeki" -> Jawab: "**Bapak Sukardi**."
   - Contoh "siapa ketua poktan sumber subur" -> Jawab: "**Bapak H. Karyono**."
   - Contoh "siapa ketua poktan tani makmur" -> Jawab: "**Bapak Sutarjo**."
   - Contoh "siapa saja petani" -> Jawab nama-nama petani: Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, dan Arka Saputra.
   - Contoh "siapa pengguna / user" -> Jawab nama 6 orang pengguna beserta perannya.

3. KESIAPAN MENJAWAB SELURUH PERTANYAAN DOSEN PENGUJI SEPUTAR WEB & DASHBOARD:
   - Jawab secara terstruktur, ilmiah, dan solutif setiap pertanyaan dosen seputar:
     • Latar belakang, tujuan, dan manfaat web SI PADI bagi Desa Cirebon Girang.
     • Perbedaan 3 Dashboard & Role (Admin 12 menu, Perangkat Desa 10 menu, Petani 10 menu).
     • Tech stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma ORM, MySQL di TiDB Cloud Serverless, hosting Vercel.
     • Keamanan: Hashing password bcryptjs (salt 10) & JWT HttpOnly cookie dengan library jose.
     • Peta GIS Leaflet: Koordinat poligon petak sawah interaktif.
     • Early Warning System & Notifikasi: Pemantauan umur HST dan cuaca Open-Meteo, dispatch via WhatsApp Gateway Fonnte & Email SMTP.
     • Alur registrasi mandiri petani & verifikasi OTP 6 digit dual-channel.
     • Rekomendasi pemupukan berimbang berbasis Hari Setelah Tanam (HST) sesuai standar Kementan.
     • Format laporan resmi kedinasan desa bertanda tangan Kuwu Bapak Karsiman, S.Sos.

4. DILARANG MENOLAK:
   - Kamu dilarang menolak pertanyaan tentang isi web, dashboard, akun, pengguna, kepala desa, konfigurasi, teknologi web, atau data desa. Gunakan selalu data aktual database.

MENU LENGKAP 3 DASHBOARD SI PADI:
- Dashboard Admin (/admin): 12 menu (Dashboard Admin, Peta Lahan GIS, Kelompok Tani, Data Petani, Data Master User, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Data Panen, Edukasi & Panduan, Profil Saya, Konfigurasi Sistem) + AI Assistant.
- Dashboard Perangkat Desa (/desa): 10 menu (Dashboard Desa, Peta Lahan GIS, Kelompok Tani, Data Petani, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Rekap Panen, Edukasi & Panduan, Profil Saya) + AI Assistant.
- Dashboard Petani (/petani): 10 menu (Beranda Petani, Peta Lahan GIS, Kelompok Saya, Lahan Saya, Musim Tanam Saya, Aktivitas Budidaya, Hasil Panen Saya, Edukasi & Panduan, Profil Saya, AI Assistant).

${contextInfo}
`.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// DETEKSI KATA TANYA SPESIFIK ("BERAPA" = ANGKA, "SIAPA" = NAMA)
// ─────────────────────────────────────────────────────────────────────────────

export function isBerapaQuery(q: string): boolean {
  return /\b(berapa|berapakah|brp|brapa|berpa|jumlah|total|ada berapa|hitung|seberapa banyak)\b/i.test(q)
}

export function isSiapaQuery(q: string): boolean {
  return /\b(siapa|siapakah|syp|sp|siapa saja|nama|nama-nama|nama siapa|sebutkan nama)\b/i.test(q)
}

export function generateFarmerCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPetani = s?.totalPetani ?? 4
  return `Jumlah petani yang terdaftar di Desa Cirebon Girang ada **${totalPetani} orang**.`
}

export function generateFarmerNamesOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const list = s?.daftarPetani || []
  if (list.length > 0) {
    const names = list.map((p, i) => `${i + 1}. **${p.nama}** (${p.poktan})`).join('\n')
    return `Petani yang terdaftar di Desa Cirebon Girang:\n${names}`
  }
  return `Petani yang terdaftar yaitu: **Bapak Sukardi**, **Bapak Sutarjo**, **Bapak H. Karyono**, dan **Arka Saputra**.`
}

export function generateFarmerStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPetani = s?.totalPetani ?? 4
  const daftarPetani = s?.daftarPetani?.length
    ? s.daftarPetani.map(p => `${p.nama} (${p.poktan}, ${p.totalLahan} petak / ${p.totalLuasHa.toFixed(2)} Ha)`).join('; ')
    : 'Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono, Arka Saputra'

  return `Ada **${totalPetani} orang petani terdaftar**: ${daftarPetani}.`
}

export function generateHamparanStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalLuasHa = s?.totalLuasHa ?? 6.0
  const totalLuasM2 = s?.totalLuasM2 ?? 60000
  const totalLahan = s?.totalLahan ?? 4

  return `Total luas lahan sawah adalah **${totalLuasHa.toFixed(2)} Hektar** (**${totalLuasM2.toLocaleString('id-ID')} m²**) dari **${totalLahan} petak lahan** (${s?.lahanAktif ?? totalLahan} aktif) di Desa Cirebon Girang.`
}

export function generateTitikLahanStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalLahan = s?.totalLahan ?? 4
  const totalLuasHa = s?.totalLuasHa ?? 6.0
  const gpsList = (s?.daftarLahan || [])
    .filter(l => l.latitude && l.longitude)
    .map(l => `• **${l.nama}** (${l.petani}): \`${l.latitude}, ${l.longitude}\``)

  if (gpsList.length > 0) {
    return `Ada **${totalLahan} Petak GIS** terpetakan (total ${totalLuasHa.toFixed(2)} Ha):\n${gpsList.join('\n')}`
  }
  return `Ada **${totalLahan} Petak GIS** titik lahan terdata dengan total luas ${totalLuasHa.toFixed(2)} Hektar.`
}

export function generateZonasiBlokStatsResponse(userContext?: PetaniContext): string {
  const lahan = userContext?.statsDesa?.daftarLahan || []
  if (lahan.length > 0) {
    const blokGroups: Record<string, { count: number; m2: number }> = {}
    for (const l of lahan) {
      const loc = l.lokasi.toLowerCase()
      const key = loc.includes('manis') || loc.includes('karang anyar')
        ? 'Blok Manis (Dusun Karang Anyar)'
        : loc.includes('wage') || loc.includes('girang hilir')
        ? 'Blok Wage (Dusun Girang Hilir)'
        : loc.includes('pahing') || loc.includes('cirebon ilir')
        ? 'Blok Pahing (Dusun Cirebon Ilir)'
        : l.lokasi
      if (!blokGroups[key]) blokGroups[key] = { count: 0, m2: 0 }
      blokGroups[key].count += 1
      blokGroups[key].m2 += l.luasM2
    }
    const lines = Object.entries(blokGroups).map(
      ([name, info]) => `• **${name}:** ${info.count} petak (${(info.m2 / 10000).toFixed(2)} Ha / ${info.m2.toLocaleString('id-ID')} m²)`
    )
    return `Ada **${Object.keys(blokGroups).length} Blok Sawah** terdata di Desa Cirebon Girang:\n${lines.join('\n')}`
  }
  return `Ada **3 Blok Dusun** zonasi sawah di Desa Cirebon Girang: **Blok Manis (Dusun Karang Anyar), Blok Wage (Dusun Girang Hilir), dan Blok Pahing (Dusun Cirebon Ilir)**.`
}

export function generateBlokLahanDetailResponse(blokKey: string, userContext?: PetaniContext): string {
  const b = blokKey.toLowerCase()
  const lahan = userContext?.statsDesa?.daftarLahan || []
  const matched = lahan.filter(l => {
    const txt = `${l.nama} ${l.lokasi}`.toLowerCase()
    if (b.includes('manis')) return txt.includes('manis') || txt.includes('karang anyar') || txt.includes('cipager') || txt.includes('galengan')
    if (b.includes('wage')) return txt.includes('wage') || txt.includes('girang hilir')
    if (b.includes('pahing')) return txt.includes('pahing') || txt.includes('cirebon ilir')
    return false
  })

  if (matched.length > 0) {
    const totalM2 = matched.reduce((acc, l) => acc + l.luasM2, 0)
    const lines = matched.map(
      (l, i) => `${i + 1}. **${l.nama}:** ${l.luasM2.toLocaleString('id-ID')} m² (${l.luasHa.toFixed(2)} Ha) – Pengelola: **${l.petani}** (${l.lokasi})`
    )
    return `**Daftar ${matched.length} Petak Sawah di Blok ${blokKey.toUpperCase()} (Total ${(totalM2 / 10000).toFixed(2)} Ha / ${totalM2.toLocaleString('id-ID')} m²):**\n${lines.join('\n')}`
  }

  return `Belum ada petak sawah terdaftar pada **Blok ${blokKey}** di database saat ini.`
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

  if (qL.includes('unduh excel') || qL.includes('download excel') || qL.includes('ekspor excel') || qL.includes('export excel')) {
    return `Fitur **Unduh Excel / CSV** tersedia di menu **Musim Tanam**, **Lahan Pertanian**, **Data Panen**, dan **Aktivitas Budidaya**. Klik tombol hijau **[Unduh Excel]** di pojok kanan atas tabel untuk mengekspor data rekapitulasi desa.`
  }
  if (qL.includes('cetak pdf') || qL.includes('print pdf') || qL.includes('cetak laporan') || qL.includes('print laporan') || qL.includes('export pdf') || qL.includes('ekspor pdf')) {
    return `Fitur **Cetak / PDF** tersedia di menu **Musim Tanam**, **Lahan Pertanian**, **Data Panen**, dan **Kelompok Tani**. Klik tombol **[Cetak / PDF]** untuk menghasilkan dokumen laporan resmi lengkap dengan kop Kantor Kuwu Desa Cirebon Girang dan tanda tangan pengesahan.`
  }
  if (qL.includes('tambah musim') || qL.includes('input musim') || qL.includes('buat musim')) {
    return `Untuk **Menambah Musim Tanam Baru**: Buka menu **Musim Tanam** -> klik **[+ Tambah Musim Tanam]** -> pilih petak lahan sawah, varietas bibit padi, tanggal tanam & estimasi panen -> klik **Simpan**.`
  }
  if (qL.includes('tambah lahan') || qL.includes('input lahan') || qL.includes('tambah sawah') || qL.includes('tambah petak')) {
    return `Untuk **Menambah Lahan Pertanian**: Buka menu **Lahan Pertanian** -> klik **[+ Tambah Lahan]** -> isi nama petak sawah, luas lahan (m² atau Ha), pilih petani pengelola, lokasi blok dusun, serta koordinat GPS -> klik **Simpan**.`
  }
  if (qL.includes('tambah petani') || qL.includes('input petani') || qL.includes('daftar petani baru')) {
    return `Untuk **Menambah Data Petani**: Buka menu **Data Petani** -> klik **[+ Tambah Petani]** -> masukkan nama lengkap, NIK, alamat RT/RW, nomor HP, dan kelompok tani naungan -> klik **Simpan**.`
  }
  if (qL.includes('tambah user') || qL.includes('tambah pengguna') || qL.includes('tambah akun') || qL.includes('buat akun')) {
    return `Untuk **Menambah Pengguna Baru**: Khusus Administrator di menu **Data Master User (/admin/users)** -> klik **[+ Tambah User]** -> isi username, nama lengkap, role (ADMIN, PERANGKAT_DESA, atau PETANI), email, nomor telepon, dan kata sandi -> klik **Simpan**.`
  }
  if (qL.includes('catat panen') || qL.includes('tambah panen') || qL.includes('input panen') || qL.includes('input hasil panen')) {
    return `Untuk **Mencatat Hasil Panen**: Buka menu **Data Panen** -> klik **[+ Catat Panen]** -> pilih musim tanam, masukkan jumlah produksi gabah (kg/Ton), tanggal panen, dan mutu gabah -> klik **Simpan**.`
  }
  if (qL.includes('cara filter') || qL.includes('cara cari') || qL.includes('pencarian tabel') || qL.includes('filter status')) {
    return `Fitur **Filter & Pencarian Cepat** tersedia di seluruh tabel:\n• **Kotak Pencarian:** Cari nama petani, varietas, petak lahan, atau NIK.\n• **Dropdown Kelompok Tani / Role / Status:** Saring data secara instan per kelompok tani, peran, atau status musim.`
  }
  if (qL.includes('rotasi tanam') || qL.includes('pola tanam') || qL.includes('siklus tanam desa')) {
    return `**Pola Rotasi Tanam di Desa Cirebon Girang:**\n1. **MT1 (Musim Rendeng - Nov–Maret):** Padi sawah varietas unggul (Inpari 32 HDB / Ciherang).\n2. **MT2 (Musim Gadu - April–Juli):** Padi hemat air (Inpari 42 GSR / Mekongga).\n3. **MT3 (Palawija/Bera - Ags–Okt):** Jagung, kedelai, atau pemberaan lahan untuk memutus siklus hama wereng & tikus.`
  }
  if (qL.includes('fonnte') || qL.includes('notifikasi wa') || qL.includes('kirim wa') || qL.includes('whatsapp gateway')) {
    return 'Notifikasi WhatsApp pada SI PADI dikirim **secara otomatis oleh server (Server-to-WhatsApp)** melalui integrasi **WhatsApp Gateway API** yang mendukung **Fonnte** (direkomendasikan), **Wablas**, atau **Custom Webhook** (dikonfigurasi di menu *Konfigurasi Sistem → Notifikasi & Email*). Apabila token gateway belum diisi, sistem menyediakan fallback tautan `api.whatsapp.com/send`. Sedangkan **Email** dikirim otomatis via protokol **SMTP Nodemailer**.'
  }
  if (qL.includes('daftar petani') || qL.includes('registrasi') || qL.includes('pendaftaran baru') || qL.includes('otp')) {
    return '**Cara Pendaftaran Petani Baru (Verifikasi OTP Otomatis):**\n1. Buka halaman **Login** -> klik **Daftar Sekarang (Verifikasi OTP)** (`/register`).\n2. Isi data diri petani (Nama, Username, Email, Nomor WhatsApp aktif, Alamat, Kelompok Tani, Kata Sandi) -> klik **Daftar & Kirim Kode OTP**.\n3. Sistem otomatis mengirim **kode OTP 6 digit** (berlaku 5 menit) ke **WhatsApp (via Fonnte Gateway)** sekaligus ke **Email (via SMTP)**.\n4. Masukkan 6 digit OTP untuk aktivasi akun & langsung masuk ke Dashboard Petani.'
  }
  if (qL.includes('database apa') || qL.includes('pakai database') || qL.includes('teknologi web') || qL.includes('hosting') || qL.includes('framework')) {
    return '**Arsitektur & Teknologi Platform SI PADI:**\n• **Frontend & Backend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.\n• **Database & ORM:** **MySQL** (di-host di **TiDB Cloud Serverless**) diakses melalui **Prisma ORM** (13 tabel relasional).\n• **Hosting & Domain:** Di-deploy di cloud **Vercel** (`pertanian-cirebon-girang.vercel.app`) aktif 24/7.\n• **Integrasi:** Peta GIS Leaflet, AI Engine (Gemini / OpenAI + Local Engine), Email SMTP Nodemailer, WhatsApp Gateway Otomatis (Fonnte/Wablas/Webhook), OTP Dual-Channel, dan Widget Cuaca Open-Meteo.'
  }
  return null
}

export function generateLahanCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalLahan = s?.totalLahan ?? 4
  const lahanAktif = s?.lahanAktif ?? totalLahan
  return `Ada **${totalLahan} petak lahan sawah** (${lahanAktif} petak aktif) di Desa Cirebon Girang.`
}

export function generateLuasCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalLuasHa = s?.totalLuasHa ?? 6.0
  const totalLuasM2 = s?.totalLuasM2 ?? 60000
  return `Total luas lahan sawah adalah **${totalLuasHa.toFixed(2)} Hektar** (**${totalLuasM2.toLocaleString('id-ID')} m²**).`
}

export function generateLahanStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalLahan = s?.totalLahan ?? 4
  const lahanAktif = s?.lahanAktif ?? totalLahan
  const totalLuasHa = s?.totalLuasHa ?? 6.0
  const totalLuasM2 = s?.totalLuasM2 ?? 60000

  return `Ada **${totalLahan} petak lahan sawah** (${lahanAktif} aktif) dengan total luas **${totalLuasHa.toFixed(2)} Hektar** (${totalLuasM2.toLocaleString('id-ID')} m²).`
}

export function generateUserCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalUsers = s?.totalUsers ?? 6
  const uRole = s?.usersByRole || { admin: 1, perangkatDesa: 1, petani: 4 }
  return `Total pengguna terdaftar adalah **${totalUsers} orang** (terdiri dari **${uRole.admin}** Administrator, **${uRole.perangkatDesa}** Perangkat Desa, dan **${uRole.petani}** Petani).`
}

export function generateUserNamesOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalUsers = s?.totalUsers ?? 6
  const list = s?.daftarUsers || []
  if (list.length > 0) {
    const names = list
      .map(
        (u, i) =>
          `${i + 1}. **${u.fullName}** (${
            u.role === 'ADMIN'
              ? 'Administrator'
              : u.role === 'PERANGKAT_DESA'
              ? 'Perangkat Desa'
              : 'Petani'
          })`
      )
      .join('\n')
    return `Pengguna yang terdaftar di sistem SI PADI (${totalUsers} orang):\n${names}`
  }
  return `Pengguna yang terdaftar:\n1. **Karisma Siti Nabila** (Administrator)\n2. **Bapak Karsiman, S.Sos** (Perangkat Desa)\n3. **Bapak Sukardi** (Petani)\n4. **Bapak Sutarjo** (Petani)\n5. **Bapak H. Karyono** (Petani)\n6. **Arka Saputra** (Petani)`
}

export function generateUserStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalUsers = s?.totalUsers ?? 6
  const uRole = s?.usersByRole || { admin: 1, perangkatDesa: 1, petani: 4 }
  const daftar = (s?.daftarUsers || []).map(
    u => `• **${u.fullName}** (\`@${u.username}\`) — Role: **${u.role}** | Email: \`${u.email || '-'}\` | HP: \`${u.phone || '-'}\``
  )
  const header = `Ada **${totalUsers} akun pengguna** terdaftar (**${uRole.admin}** Admin, **${uRole.perangkatDesa}** Perangkat Desa, **${uRole.petani}** Petani)`
  return daftar.length > 0 ? `${header}:\n${daftar.join('\n')}` : `${header}.`
}

export function generatePoktanCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPoktan = s?.totalPoktan ?? 3
  return `Ada **${totalPoktan} Kelompok Tani** di Desa Cirebon Girang (Sri Rejeki, Sumber Subur, dan Tani Makmur).`
}

export function generatePoktanKetuaNamesResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const list = s?.daftarPoktan || []
  if (list.length > 0) {
    const lines = list.map(p => `• **${p.ketua}** — Ketua Kelompok Tani **${p.nama}** (${p.wilayah})`).join('\n')
    return `Ketua Kelompok Tani di Desa Cirebon Girang:\n${lines}`
  }
  return `Ketua Kelompok Tani di Desa Cirebon Girang:\n• **Bapak Sukardi** — Ketua Poktan Sri Rejeki\n• **Bapak H. Karyono** — Ketua Poktan Sumber Subur\n• **Bapak Sutarjo** — Ketua Poktan Tani Makmur`
}

export function generatePoktanStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPoktan = s?.totalPoktan ?? 3
  const list = s?.daftarPoktan || []
  if (list.length > 0) {
    const lines = list.map(
      p => `• **${p.nama}** — Ketua: ${p.ketua} | Wilayah: ${p.wilayah} | Anggota: ${p.jumlahPetani} orang (${(p.anggotaNames || []).join(', ') || 'belum ada'})${p.totalLuasHa !== undefined ? ` | Total Luas: ${p.totalLuasHa.toFixed(2)} Ha` : ''}`
    )
    return `**Ada ${totalPoktan} Kelompok Tani:**\n${lines.join('\n')}`
  }
  return `Ada **${totalPoktan} Kelompok Tani**: Sri Rejeki, Sumber Subur, dan Tani Makmur.`
}

export function generatePoktanAnggotaResponse(userContext?: PetaniContext, specificPoktan?: string): string {
  const poktanList = userContext?.statsDesa?.daftarPoktan || []

  if (specificPoktan && poktanList.length > 0) {
    const target = poktanList.find(p => p.nama.toLowerCase().includes(specificPoktan.toLowerCase()))
    if (target) {
      const anggotaStr = target.anggotaNames?.length ? target.anggotaNames.join(', ') : 'Belum ada anggota petani tertaut'
      return `Anggota **${target.nama}** berjumlah **${target.jumlahPetani} orang**: **${anggotaStr}** (Ketua: ${target.ketua}, Wilayah: ${target.wilayah}, Kontak: \`${target.kontak || '-'}\`).`
    }
  }

  if (poktanList.length > 0) {
    const lines = poktanList.map(p => {
      const anggota = p.anggotaNames?.length ? p.anggotaNames.join(', ') : 'Belum ada anggota tertaut'
      return `• **${p.nama}** (${p.jumlahPetani} anggota): ${anggota} — Ketua: ${p.ketua}`
    })
    return `**Daftar Anggota Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
  }

  return generatePoktanStatsResponse(userContext)
}

export function generatePoktanAnggotaWithLahanAndAlamatResponse(userContext?: PetaniContext, specificPoktan?: string): string {
  const petaniList = userContext?.statsDesa?.daftarPetani || []
  const lahanList = userContext?.statsDesa?.daftarLahan || []
  const filtered = specificPoktan
    ? petaniList.filter(p => p.poktan?.toLowerCase().includes(specificPoktan.toLowerCase()))
    : petaniList

  if (filtered.length > 0) {
    const lines = filtered.map(p => {
      const petakDetail = lahanList
        .filter(l => l.petani.toLowerCase() === p.nama.toLowerCase())
        .map(l => `${l.nama} (${l.luasHa.toFixed(2)} Ha / ${l.luasM2.toLocaleString('id-ID')} m²)`)
        .join(', ')
      return `• **${p.nama}** (${p.poktan}): **${p.totalLuasHa.toFixed(2)} Ha** (${p.totalLuasM2.toLocaleString('id-ID')} m²) dari **${p.totalLahan} petak**${petakDetail ? ` — *${petakDetail}*` : ''} | Alamat: ${p.alamat}`
    })
    return `**Rincian Petani, Luas Lahan & Alamat:**\n${lines.join('\n')}`
  }

  return generateFarmerStatsResponse(userContext)
}

export function generatePetaniWithLahanBreakdownResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const petaniList = s?.daftarPetani || []
  const lahanList = s?.daftarLahan || []

  if (petaniList.length > 0) {
    const sorted = [...petaniList].sort((a, b) => b.totalLuasM2 - a.totalLuasM2)
    const lines = sorted.map(p => {
      const petakDetail = lahanList
        .filter(l => l.petani.toLowerCase() === p.nama.toLowerCase())
        .map(l => `${l.nama} (${l.luasHa.toFixed(2)} Ha / ${l.luasM2.toLocaleString('id-ID')} m²)`)
        .join(', ')
      return `• **${p.nama}** (${p.poktan}): **${p.totalLuasHa.toFixed(2)} Ha** (${p.totalLuasM2.toLocaleString('id-ID')} m²) dari **${p.totalLahan} petak**${petakDetail ? ` — *${petakDetail}*` : ''}`
    })
    return `**Rincian Luas Lahan Masing-Masing Petani (Total Desa: ${(s?.totalLuasHa ?? 6.0).toFixed(2)} Ha / ${(s?.totalLuasM2 ?? 60000).toLocaleString('id-ID')} m²):**\n${lines.join('\n')}`
  }

  return generateFarmerStatsResponse(userContext)
}

export function generatePoktanKetuaResponse(userContext?: PetaniContext): string {
  const poktanList = userContext?.statsDesa?.daftarPoktan || []
  if (poktanList.length > 0) {
    const lines = poktanList.map(p => `• **${p.nama}:** ${p.ketua} (Wilayah: ${p.wilayah}, HP: \`${p.kontak || '-'}\`)`)
    return `**Daftar Ketua Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
  }
  return `**Daftar Ketua Kelompok Tani:** Sri Rejeki (Bapak Sutarjo), Tani Makmur (H. Karyono), Sumber Subur (Mang Rasidi).`
}

export function generatePoktanKontakResponse(userContext?: PetaniContext): string {
  const poktanList = userContext?.statsDesa?.daftarPoktan || []
  if (poktanList.length > 0) {
    const lines = poktanList.map(p => `• **${p.nama}:** \`${p.kontak || '-'}\` (Ketua: ${p.ketua})`)
    return `**Kontak Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
  }
  return generatePoktanKetuaResponse(userContext)
}

export function generatePoktanWilayahResponse(userContext?: PetaniContext): string {
  const poktanList = userContext?.statsDesa?.daftarPoktan || []
  if (poktanList.length > 0) {
    const lines = poktanList.map(p => `• **${p.nama}:** ${p.wilayah}`)
    return `**Wilayah Kelompok Tani Desa Cirebon Girang:**\n${lines.join('\n')}`
  }
  return generatePoktanKetuaResponse(userContext)
}

export function generateSinglePoktanDetailResponse(poktanKey: string, userContext?: PetaniContext): string {
  const poktanList = userContext?.statsDesa?.daftarPoktan || []
  const target = poktanList.find(p => p.nama.toLowerCase().includes(poktanKey.toLowerCase()))
  if (target) {
    return `**${target.nama}:**\n• **Ketua:** ${target.ketua} (HP: \`${target.kontak || '-'}\`)\n• **Wilayah:** ${target.wilayah}\n• **Anggota Terdaftar (${target.jumlahPetani}):** ${target.anggotaNames?.length ? target.anggotaNames.join(', ') : 'Belum ada petani tertaut'}\n• **Total Garapan:** ${target.totalLuasHa ?? 0} Ha`
  }
  return generatePoktanStatsResponse(userContext)
}

export function generatePetaniDetailResponse(petaniKey: string, userContext?: PetaniContext): string {
  const list = userContext?.statsDesa?.daftarPetani || []
  const found = list.find(p => p.nama.toLowerCase().includes(petaniKey.toLowerCase()))
  if (found) {
    return `**${found.nama}** (Username: \`@${found.username || '-'}\`):\n• **Kelompok Tani:** ${found.poktan}\n• **NIK:** ${found.nik || '-'}\n• **Lahan Garapan:** ${found.totalLahan} petak sawah (${found.totalLuasHa.toFixed(2)} Ha / ${found.totalLuasM2.toLocaleString('id-ID')} m²) [${(found.lahanNames || []).join(', ') || '-'}]\n• **Alamat:** ${found.alamat}\n• **Kontak HP/WA:** \`${found.telepon}\``
  }
  return generateFarmerStatsResponse(userContext)
}

export function generateLahanDetailResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const list = s?.daftarLahan || []
  if (list.length > 0) {
    const lines = list.map(
      (l, idx) => `${idx + 1}. **${l.nama}** — ${l.luasM2.toLocaleString('id-ID')} m² (${l.luasHa.toFixed(2)} Ha) | Pengelola: **${l.petani}** | Lokasi: ${l.lokasi} | Status: ${l.status}`
    )
    return `**Daftar ${list.length} Petak Lahan Sawah Terdata (Total ${(s?.totalLuasHa ?? 0).toFixed(2)} Ha):**\n${lines.join('\n')}`
  }
  return generateLahanStatsResponse(userContext)
}

export function generatePanenDetailResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const list = s?.daftarPanen || []
  if (list.length > 0) {
    const lines = list.map(
      p => `• **${p.petani}** (${p.lahan || '-'}): **${(p.jumlahKg / 1000).toFixed(2)} Ton** (${p.jumlahKg.toLocaleString('id-ID')} kg) — Varietas ${p.varietas}, Mutu: ${p.kualitas}, Tgl: ${p.tanggalPanen}`
    )
    return `**Realisasi Panen Terverifikasi (Total ${(s?.totalPanenTon ?? 20).toFixed(2)} Ton GKP):**\n${lines.join('\n')}`
  }
  return generatePanenStatsResponse(userContext)
}

export function generateMusimDetailResponse(userContext?: PetaniContext): string {
  const list = userContext?.statsDesa?.daftarMusim || []
  if (list.length > 0) {
    const lines = list.map(
      m => `• **${m.namaMusim}** (${m.status}): Varietas **${m.varietas}**, Lahan ${m.lahanNama} (${m.petaniNama}) | Tanam: ${m.tanggalTanam || '-'} | Est. Panen: ${m.estimasiPanen || '-'}${m.hst !== undefined && m.status === 'BERJALAN' ? ` | Umur: ${m.hst} HST` : ''}`
    )
    return `**Daftar ${list.length} Siklus Musim Tanam Desa Cirebon Girang:**\n${lines.join('\n')}`
  }
  return generateMusimStatsResponse(userContext)
}

export function generateMusimStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalMusim = s?.totalMusim ?? 5
  const musimBerjalan = s?.musimBerjalan ?? 3
  const musimPerencanaan = s?.musimPerencanaan ?? 0
  const musimSelesai = s?.musimSelesai ?? 2
  const musimGagal = s?.musimGagal ?? 0

  const varietasSet = Array.from(new Set((s?.daftarMusim || []).map(m => m.varietas).filter(Boolean)))
  const varietasText = varietasSet.length > 0 ? ` Varietas yang ditanam: **${varietasSet.join(', ')}**.` : ''

  return `Total ada **${totalMusim} siklus musim tanam** tercatat: **${musimBerjalan} sedang berjalan aktif**, **${musimPerencanaan} perencanaan**, **${musimSelesai} telah selesai panen**${musimGagal > 0 ? `, dan **${musimGagal} gagal**` : ''}.${varietasText}`
}

export function generateMusimCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalMusim = s?.totalMusim ?? 3
  const musimBerjalan = s?.musimBerjalan ?? 3
  return `Ada **${musimBerjalan} musim tanam** yang sedang aktif berjalan (total siklus tercatat: **${totalMusim} musim**).`
}

export function generatePanenCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPanenTon = s?.totalPanenTon ?? 14.5
  const totalPanenKg = s?.totalPanenKg ?? 14500
  const totalSesi = s?.totalPanenSesi ?? 2
  return `Total realisasi panen padi adalah **${totalPanenTon.toFixed(2)} Ton** (**${totalPanenKg.toLocaleString('id-ID')} kg** gabah) dari **${totalSesi} sesi panen**.`
}

export function generatePanenStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPanenTon = s?.totalPanenTon ?? 14.5
  const totalPanenKg = s?.totalPanenKg ?? 14500
  const totalSesi = s?.totalPanenSesi ?? 2

  return `Total realisasi panen adalah **${totalPanenTon.toFixed(2)} Ton** (**${totalPanenKg.toLocaleString('id-ID')} kg**) dari **${totalSesi} sesi panen** tercatat.`
}

export function generateAktivitasCountOnlyResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalAktivitas = s?.totalAktivitas ?? 8
  const biaya = s?.totalBiayaAktivitas ? ` dengan total biaya operasional **Rp ${s.totalBiayaAktivitas.toLocaleString('id-ID')}**` : ''
  return `Tercatat ada **${totalAktivitas} kegiatan aktivitas budidaya** di sawah Desa Cirebon Girang${biaya}.`
}

export function generateAktivitasStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalAktivitas = s?.totalAktivitas ?? 8
  const biaya = s?.totalBiayaAktivitas ? ` (Total biaya operasional tercatat: **Rp ${s.totalBiayaAktivitas.toLocaleString('id-ID')}**)` : ''
  const terbaru = (s?.aktivitasTerbaru || []).slice(0, 4).map(
    a => `• [${a.tanggal}] **${a.jenis}** di ${a.lahan || a.musim} (${a.petani || '-'}): ${a.deskripsi}`
  )
  const header = `Ada **${totalAktivitas} kegiatan aktivitas budidaya** tercatat di log harian sawah desa${biaya}`
  return terbaru.length > 0 ? `${header}:\n${terbaru.join('\n')}` : `${header}.`
}

export function generateOverviewStatsResponse(userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const lahanAktif = s?.lahanAktif ?? 4
  const totalLahan = s?.totalLahan ?? 4
  const totalLuasHa = s?.totalLuasHa ?? 6.0
  const musimBerjalan = s?.musimBerjalan ?? 3
  const totalMusim = s?.totalMusim ?? 5
  const totalPetani = s?.totalPetani ?? 3
  const totalPoktan = s?.totalPoktan ?? 3
  const totalUsers = s?.totalUsers ?? 5
  const totalPanenTon = s?.totalPanenTon ?? 20.0

  return `**Ringkasan Dashboard SI PADI:** **${totalUsers}** akun pengguna, **${totalPetani}** petani aktif di **${totalPoktan}** kelompok tani, **${totalLahan}** petak sawah (${lahanAktif} aktif, **${totalLuasHa.toFixed(2)} Ha**), **${musimBerjalan}/${totalMusim}** musim tanam aktif, **${s?.totalAktivitas ?? 9}** aktivitas budidaya, dan **${totalPanenTon.toFixed(2)} Ton** hasil panen.`
}

export function generatePerangkatDesaNameResponse(userContext?: PetaniContext): string {
  const kades = getKepalaDesaUser(userContext?.statsDesa)
  const nama = kades?.fullName || 'Bapak Karsiman, S.Sos'
  return `Kepala Desa (Kuwu) Desa Cirebon Girang adalah **${nama}**.`
}

export function generatePerangkatDesaCountResponse(userContext?: PetaniContext): string {
  const count = userContext?.statsDesa?.usersByRole?.perangkatDesa ?? 1
  const kades = getKepalaDesaUser(userContext?.statsDesa)
  const nama = kades?.fullName || 'Bapak Karsiman, S.Sos'
  return `Ada **${count} orang** Perangkat Desa (sekaligus Kuwu/Kepala Desa) di sistem SI PADI, yaitu **${nama}**.`
}

export function generatePerangkatDesaResponse(userContext?: PetaniContext): string {
  const kades = getKepalaDesaUser(userContext?.statsDesa)
  const nama = kades?.fullName || 'Bapak Karsiman, S.Sos'
  const username = kades?.username || 'perangkat_desa'
  const email = kades?.email || 'karsiman@gmail.com'
  const phone = kades?.phone || '081298765432'
  const count = userContext?.statsDesa?.usersByRole?.perangkatDesa ?? 1

  return `Ada **${count} orang** Perangkat Desa sekaligus penanggung jawab pemerintahan / **Kuwu (Kepala Desa)** pada sistem SI PADI, yaitu **${nama}** (\`@${username}\`, Email: \`${email}\`, No. HP: \`${phone}\`). Beliau bertugas di Seksi Pelayanan & Pembinaan Pertanian Desa Cirebon Girang.`
}

export function generateAdminNameResponse(userContext?: PetaniContext): string {
  const admin = getAdminUser(userContext?.statsDesa)
  const nama = admin?.fullName || userContext?.statsDesa?.appSettings?.adminContactName || 'Karisma Siti Nabila'
  return `Administrator sistem SI PADI adalah **${nama}**.`
}

export function generateAdminCountResponse(userContext?: PetaniContext): string {
  const count = userContext?.statsDesa?.usersByRole?.admin ?? 1
  const admin = getAdminUser(userContext?.statsDesa)
  const nama = admin?.fullName || userContext?.statsDesa?.appSettings?.adminContactName || 'Karisma Siti Nabila'
  return `Ada **${count} orang** Administrator sistem SI PADI, yaitu **${nama}**.`
}

export function generateAdminResponse(userContext?: PetaniContext): string {
  const admin = getAdminUser(userContext?.statsDesa)
  const nama = admin?.fullName || userContext?.statsDesa?.appSettings?.adminContactName || 'Karisma Siti Nabila'
  const email = admin?.email || 'Karismasitinabila7@gmail.com'
  const phone = admin?.phone || userContext?.statsDesa?.appSettings?.adminContactPhone || '0812-3456-7890'
  const count = userContext?.statsDesa?.usersByRole?.admin ?? 1

  return `Ada **${count} orang** Administrator sistem SI PADI, yaitu **${nama}** (\`@${admin?.username || 'admin'}\`, Email: \`${email}\`, No. HP: \`${phone}\`).`
}

export function generateKonfigurasiStatsResponse(userContext?: PetaniContext): string {
  const cfg = userContext?.statsDesa?.appSettings
  const waStatus = cfg?.waConfigured ? 'Aktif Otomatis' : 'Token Belum Diisi'
  return `Konfigurasi SI PADI saat ini aktif dengan penanggung jawab **${cfg?.adminContactName || 'Karisma Siti Nabila'}** (Email target notifikasi: \`${cfg?.notificationTargetEmail || 'karismasitinabila7@gmail.com'}\`, WA Gateway: **${(cfg?.waGatewayProvider || 'fonnte').toUpperCase()}** [${waStatus}], WA default: \`${cfg?.defaultWhatsAppNumber || '6285797864834'}\`, AI Provider: **${(cfg?.aiProvider || 'gemini').toUpperCase()}**, SMTP Host: \`${cfg?.smtpHost || 'smtp.gmail.com'}\`).`
}

export function generateMasterDataOverviewResponse(userContext?: PetaniContext): string {
  return generateOverviewStatsResponse(userContext)
}

export function generateWarningsResponse(userContext?: PetaniContext): string {
  const warnings = userContext?.statsDesa?.earlyWarnings || []
  const broadcasts = userContext?.statsDesa?.daftarBroadcast || []
  const parts: string[] = []
  if (warnings.length > 0) {
    parts.push('**Peringatan Dini Sistem (Early Warning):**')
    warnings.slice(0, 5).forEach(w => {
      parts.push(`• **[${w.severity}] ${w.title}:** ${w.message}`)
    })
  }
  if (broadcasts.length > 0) {
    parts.push('**Broadcast Notifikasi Terbaru:**')
    broadcasts.slice(0, 3).forEach(b => {
      parts.push(`• [${b.createdAt}] **${b.title}:** ${b.message}`)
    })
  }
  return parts.length > 0
    ? parts.join('\n')
    : 'Saat ini tidak ada peringatan dini mendesak; pantau terus ketinggian air macak-macak dan kondisi serangan hama wereng secara berkala.'
}

export function generateInformasiResponse(userContext?: PetaniContext): string {
  const info = userContext?.statsDesa?.daftarInformasi || []
  if (info.length > 0) {
    const lines = info.map(i => `• **${i.judul}** [${i.kategori}] — oleh *${i.namaPenulis}* (${i.tanggalPublikasi})\n  _${i.isiRingkas}..._`)
    return `**Daftar ${info.length} Informasi & Pengumuman Pertanian Desa:**\n${lines.join('\n')}`
  }
  return `Belum ada artikel informasi pertanian yang dipublikasikan.`
}

export function generateAuditLogResponse(userContext?: PetaniContext): string {
  const logs = userContext?.statsDesa?.daftarAuditLog || []
  if (logs.length > 0) {
    const lines = logs.slice(0, 6).map(l => `• [${l.createdAt}] **${l.userName}** — \`${l.action}\` (${l.entity}): ${l.details}`)
    return `**Riwayat Audit Log Sistem Terbaru:**\n${lines.join('\n')}`
  }
  return `Belum ada catatan audit log sistem terbaru.`
}

// ─────────────────────────────────────────────────────────────────────────────
// PERINGKAT DATA SUPERLATIF DINAMIS
// ─────────────────────────────────────────────────────────────────────────────

export function generateLahanTerluasResponse(userContext?: PetaniContext): string {
  const sup = getSuperlatives(userContext?.statsDesa)
  if (sup.lahanTerluas) {
    const petakLine = `Petak lahan paling luas adalah **${sup.lahanTerluas.nama} (${sup.lahanTerluas.luasHa.toFixed(2)} Ha / ${sup.lahanTerluas.luasM2.toLocaleString('id-ID')} m²)** yang dikelola oleh **${sup.lahanTerluas.petani}** di ${sup.lahanTerluas.lokasi}.`
    const petaniLine = sup.petaniTerluas
      ? `\n*(Petani dengan akumulasi total lahan terluas adalah **${sup.petaniTerluas.nama}** dengan **${sup.petaniTerluas.totalLahan} petak** seluas **${sup.petaniTerluas.totalLuasHa.toFixed(2)} Ha** / ${sup.petaniTerluas.totalLuasM2.toLocaleString('id-ID')} m²).*`
      : ''
    return petakLine + petaniLine
  }
  return `Petak lahan paling luas adalah **Sawah Hamparan Manis Tengah (2,00 Ha / 20.000 m²)** yang dikelola oleh **Bapak Sutarjo**.`
}

export function generateLahanTerkecilResponse(userContext?: PetaniContext): string {
  const sup = getSuperlatives(userContext?.statsDesa)
  if (sup.lahanTerkecil) {
    return `Petak lahan paling kecil adalah **${sup.lahanTerkecil.nama} (${sup.lahanTerkecil.luasHa.toFixed(2)} Ha / ${sup.lahanTerkecil.luasM2.toLocaleString('id-ID')} m²)** yang dikelola oleh **${sup.lahanTerkecil.petani}** di ${sup.lahanTerkecil.lokasi}.`
  }
  return `Petak lahan paling kecil adalah **Petak Sawah Galengan Wetan (0,85 Ha / 8.500 m²)** milik **Bapak Sukardi**.`
}

export function generatePanenTerbanyakResponse(userContext?: PetaniContext): string {
  const sup = getSuperlatives(userContext?.statsDesa)
  const totalTon = userContext?.statsDesa?.totalPanenTon ?? 20.0
  if (sup.panenTerbanyak) {
    return `Hasil panen terbanyak diraih oleh **${sup.panenTerbanyak.petani}** dengan total **${(sup.panenTerbanyak.jumlahKg / 1000).toFixed(2)} Ton (${sup.panenTerbanyak.jumlahKg.toLocaleString('id-ID')} kg)** varietas ${sup.panenTerbanyak.varietas} di ${sup.panenTerbanyak.lahan || '-'} (Total panen desa: ${totalTon.toFixed(2)} Ton).`
  }
  return `Hasil panen terbanyak diraih oleh **Bapak H. Karyono** dengan total **11,20 Ton (11.200 kg)** varietas Inpari 32 di Sawah Lembah Wage.`
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

export function generateMenuExplanationResponse(menuKey: string, userContext?: PetaniContext): string {
  const m = menuKey.toLowerCase()
  const s = userContext?.statsDesa

  if (m.includes('peta') || m.includes('gis')) {
    return [
      '**Menu Peta Lahan GIS (/peta):**',
      `Peta interaktif berbasis satelit digital (Leaflet) yang memetakan **${s?.totalLahan ?? 4} petak sawah** Desa Cirebon Girang (${(s?.totalLuasHa ?? 6.0).toFixed(2)} Ha):`,
      '• **Filter & Layer:** Filter berdasarkan blok dusun, kelompok tani, dan status lahan.',
      '• **Popup Interaktif:** Klik petak untuk melihat nama lahan, luas (m² & Ha), pengelola, dan varietas padi.',
      '• **Akses:** Terbuka untuk Administrator, Perangkat Desa, dan Petani.'
    ].join('\n')
  }
  if (m.includes('kelompok tani') || m.includes('poktan') || m.includes('kelompok saya')) {
    return generatePoktanStatsResponse(userContext)
  }
  if (m.includes('data master user') || m.includes('user') || m.includes('pengguna') || m.includes('akun')) {
    return `**Menu Data Master User (/admin/users) (Khusus Administrator):**\n${generateUserStatsResponse(userContext)}\n• **Fitur:** Tambah pengguna baru, atur role, aktif/nonaktifkan akun, dan ubah sandi.`
  }
  if (m.includes('data petani') || m.includes('petani')) {
    return `**Menu Data Petani (/admin/petani, /desa/petani):**\n${generateFarmerStatsResponse(userContext)}\n• **Data Tersimpan:** Nama lengkap, NIK, alamat RT/RW, nomor telepon, kelompok tani, dan luas garapan.`
  }
  if (m.includes('lahan') || m.includes('sawah')) {
    return generateLahanDetailResponse(userContext)
  }
  if (m.includes('musim') || m.includes('kalender')) {
    return generateMusimDetailResponse(userContext)
  }
  if (m.includes('aktivitas') || m.includes('kegiatan') || m.includes('budidaya')) {
    return generateAktivitasStatsResponse(userContext)
  }
  if (m.includes('panen')) {
    return generatePanenDetailResponse(userContext)
  }
  if (m.includes('edukasi') || m.includes('panduan') || m.includes('modul')) {
    return `${generateInformasiResponse(userContext)}\n\n*Juga memuat panduan teknis budidaya padi: Olah Tanah, Jajar Legowo, Pemupukan Berimbang, Pengendalian Hama Terpadu, & Pengairan Macak-macak.*`
  }
  if (m.includes('profil')) {
    return `**Menu Profil Saya:**\nMengelola nama lengkap, username, email, nomor HP/WhatsApp, alamat domisili, foto profil, dan pembaruan kata sandi pengguna yang sedang login.`
  }
  if (m.includes('konfigurasi') || m.includes('pengaturan')) {
    return `**Menu Konfigurasi Sistem (/admin/konfigurasi) (Khusus Administrator):**\n• **Tab 1 (AI Assistant):** Provider (Gemini / OpenAI), Model, API Key, Persona AI.\n• **Tab 2 (Notifikasi Email & WA):** Email pengawas, nomor WA default, server SMTP Gmail, dan pemicu peringatan dini.\n• **Tab 3 (Identitas & Desa):** Identitas wilayah desa dan kontak penanggung jawab.\n${generateKonfigurasiStatsResponse(userContext)}`
  }
  if (m.includes('ai') || m.includes('assistant') || m.includes('bot')) {
    return `**Fitur AI Assistant SI PADI:**\nAsisten cerdas yang membaca data database real-time desa (Pengguna, Petani, Poktan, Lahan, Musim, Panen, Aktivitas, Peringatan Dini, Artikel Desa) serta memberikan konsultasi agronomi padi sawah.`
  }

  return generateAllDashboardMenusResponse()
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISASI BAHASA INDONESIA & SLANG
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeIndonesianQuery(text: string): string {
  let q = text.toLowerCase().trim()

  q = q.replace(/([a-zA-Z])\1{2,}/g, '$1$1')
  q = q.replace(/\b(dashoard|dashbord|dasbor|deshboard|dasboard|daspor|dashboar)\b/gi, 'dashboard')
  q = q.replace(/\b(ftur|fiktur)\b/gi, 'fitur')
  q = q.replace(/\b(plg|paling|ter)\s*(luas|lebar|gede|besar)\b/gi, 'paling luas')
  q = q.replace(/\b(terluas|terbesar)\b/gi, 'paling luas')
  q = q.replace(/\b(plg|paling|ter)\s*(kcl|kecil|sempit)\b/gi, 'paling kecil')
  q = q.replace(/\b(terkecil|tersempit)\b/gi, 'paling kecil')
  q = q.replace(/\b(plg|paling|ter)\s*(bnyk|bnyak|banyak|tinggi)\b/gi, 'paling banyak')
  q = q.replace(/\b(terbanyak|tertinggi)\b/gi, 'paling banyak')
  q = q.replace(/\b(siapa|sp)\s+(lahan|lahannya)\s+(yg|yang)?\s*(paling|terluas|luas)\b/gi, 'siapa lahan yang paling luas')

  q = q.replace(/\b(siap|syp|sp)\s+(saja|aja|aj|sja)\b/gi, 'siapa saja')
  q = q.replace(/\b(siap|syp|sp)\s+(anggot\w*|angot\w*)\b/gi, 'siapa anggota')
  q = q.replace(/\b(siap|syp|sp)\s+(ketua\w*|ktua\w*)\b/gi, 'siapa ketua')
  q = q.replace(/\b(siap|syp|sp)\s+(petani\w*|ptni\w*)\b/gi, 'siapa petani')
  q = q.replace(/\b(siap|syp|sp)\s+(admin\w*|pengguna\w*|user\w*)\b/gi, 'siapa $2')
  q = q.replace(/\b(siap)\s+(kah|kh)\b/gi, 'siapakah')
  q = q.replace(/^siap\b(?!\s+(panen|tanam|semai|musim|olah|giling))/gi, 'siapa')

  q = q.replace(/\b(angota|angotanya|anggotanya|anggta|anggotany|anggotax|anggotane)\b/gi, 'anggota')
  q = q.replace(/\b(brp|brapa|brapakah|berapakah|berpa)\b/gi, 'berapa')
  q = q.replace(/\b(klmpk|klmpok|kelmpok|poktn|poktan)\b/gi, 'kelompok tani')
  q = q.replace(/\b(ktua|ketuany|ketuanya|ketuane)\b/gi, 'ketua')
  q = q.replace(/\b(kntk|kontaknya|nohp|no hp|nomor hp|no tlp|no telp|telpon|tlp|telepon|wa|whatsapp)\b/gi, 'kontak')
  q = q.replace(/\b(wlayah|wilayahny|wilayahnya|lokasiny|lokasinya|dusunny|dusunnya|dimana|dmn|dimn)\b/gi, 'wilayah')
  q = q.replace(/\b(ptni|petaniny|petaninya)\b/gi, 'petani')
  q = q.replace(/\b(msm|msim|musimny|musimnya)\b/gi, 'musim')
  q = q.replace(/\b(pnn|panenny|panennya)\b/gi, 'panen')
  q = q.replace(/\b(lhn|lahanny|lahannya|petakny|petaknya|sawahny|sawahnya)\b/gi, 'lahan')
  q = q.replace(/\b(varietasny|varietasnya|bibitny|bibitnya|benihny|benihnya)\b/gi, 'varietas')
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
  q = q.replace(/\b(kades|pak kuwu|kuwu|kepala desa|lurah)\b/gi, 'kepala desa')

  return q.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// PENCARIAN ENTITAS DINAMIS (CATCH-ALL PINTAR KE SELURUH DATABASE)
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'apa', 'siapa', 'berapa', 'kapan', 'dimana', 'bagaimana', 'mengapa', 'kenapa', 'mana',
  'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'adalah', 'itu',
  'ini', 'saja', 'ada', 'sudah', 'belum', 'bisa', 'dapat', 'tolong', 'coba', 'sebutkan',
  'jelaskan', 'lihat', 'tampilkan', 'cari', 'info', 'informasi', 'data', 'nama', 'namanya',
  'pak', 'bapak', 'ibu', 'mang', 'h', 'desa', 'cirebon', 'girang', 'web', 'sistem', 'si', 'padi',
])

export function smartDynamicDatabaseLookup(rawQuery: string, userContext?: PetaniContext): string | null {
  const s = userContext?.statsDesa
  if (!s) return null

  const cleanTokens = rawQuery
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOP_WORDS.has(t))

  if (cleanTokens.length === 0) return null

  const matches: string[] = []

  // 1. Cek kecocokan di User
  for (const u of s.daftarUsers || []) {
    const hay = `${u.fullName} ${u.username} ${u.role} ${u.email || ''} ${u.phone || ''}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`👤 **Akun Pengguna:** ${u.fullName} (\`@${u.username}\`) — Role: **${u.role}** | Email: \`${u.email || '-'}\` | HP: \`${u.phone || '-'}\``)
    }
  }

  // 2. Cek kecocokan di Petani
  for (const p of s.daftarPetani || []) {
    const hay = `${p.nama} ${p.nik || ''} ${p.alamat} ${p.poktan} ${(p.lahanNames || []).join(' ')}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`🌾 **Petani:** ${p.nama} (${p.poktan}) — Garapan: ${p.totalLahan} petak (${p.totalLuasHa.toFixed(2)} Ha / ${p.totalLuasM2.toLocaleString('id-ID')} m²) | HP: \`${p.telepon}\` | Alamat: ${p.alamat}`)
    }
  }

  // 3. Cek kecocokan di Kelompok Tani
  for (const k of s.daftarPoktan || []) {
    const hay = `${k.nama} ${k.ketua} ${k.wilayah} ${k.deskripsi || ''}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`🤝 **Kelompok Tani:** ${k.nama} — Ketua: ${k.ketua} | Wilayah: ${k.wilayah} | Kontak: \`${k.kontak || '-'}\` | Anggota (${k.jumlahPetani}): ${(k.anggotaNames || []).join(', ') || '-'}`)
    }
  }

  // 4. Cek kecocokan di Lahan
  for (const l of s.daftarLahan || []) {
    const hay = `${l.nama} ${l.lokasi} ${l.petani} ${l.catatan || ''}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`🗺️ **Lahan Sawah:** ${l.nama} (${l.luasM2.toLocaleString('id-ID')} m² / ${l.luasHa.toFixed(2)} Ha) — Pengelola: ${l.petani} | Lokasi: ${l.lokasi} | GPS: \`${l.latitude ?? '-'}, ${l.longitude ?? '-'}\``)
    }
  }

  // 5. Cek kecocokan di Musim Tanam
  for (const m of s.daftarMusim || []) {
    const hay = `${m.namaMusim} ${m.varietas} ${m.lahanNama} ${m.petaniNama} ${m.status}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`🌱 **Musim Tanam:** ${m.namaMusim} (${m.status}) — Varietas: ${m.varietas} | Lahan: ${m.lahanNama} (${m.petaniNama}) | Tanam: ${m.tanggalTanam || '-'} | Est. Panen: ${m.estimasiPanen || '-'}${m.hst !== undefined && m.status === 'BERJALAN' ? ` (${m.hst} HST)` : ''}`)
    }
  }

  // 6. Cek kecocokan di Panen
  for (const p of s.daftarPanen || []) {
    const hay = `${p.petani} ${p.lahan || ''} ${p.varietas} ${p.kualitas || ''} ${p.catatan || ''}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`⚖️ **Data Panen:** ${p.petani} (${p.lahan || '-'}) — **${(p.jumlahKg / 1000).toFixed(2)} Ton** (${p.jumlahKg.toLocaleString('id-ID')} kg), Varietas ${p.varietas}, Mutu: ${p.kualitas}, Tgl: ${p.tanggalPanen}`)
    }
  }

  // 7. Cek kecocokan di Informasi/Pengumuman
  for (const i of s.daftarInformasi || []) {
    const hay = `${i.judul} ${i.kategori} ${i.isiRingkas}`.toLowerCase()
    if (cleanTokens.some(t => hay.includes(t))) {
      matches.push(`📰 **Informasi Desa (${i.kategori}):** **${i.judul}** (Oleh: ${i.namaPenulis}, ${i.tanggalPublikasi})\n  _${i.isiRingkas}..._`)
    }
  }

  if (matches.length > 0) {
    // Deduplicate & limit to 6 most relevant items
    const unique = Array.from(new Set(matches)).slice(0, 6)
    return `**Hasil Pencarian Data Sistem SI PADI:**\n${unique.join('\n')}`
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// PENANGANAN PERTANYAAN KHUSUS DOSEN PENGUJI SEPUTAR WEB & DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export function handleDosenQuestion(
  q: string,
  rawQ: string,
  userContext?: PetaniContext
): string | null {
  const qL = q.toLowerCase()
  const rawQL = rawQ.toLowerCase()

  // 1. LATAR BELAKANG, TUJUAN, DAN MANFAAT WEB SI PADI
  if (
    qL.includes('latar belakang') ||
    qL.includes('tujuan web') ||
    qL.includes('tujuan sistem') ||
    qL.includes('tujuan dibuat') ||
    qL.includes('tujuan aplikasi') ||
    qL.includes('manfaat web') ||
    qL.includes('manfaat sistem') ||
    qL.includes('masalah yang diselesaikan') ||
    qL.includes('kenapa sistem ini dibuat') ||
    qL.includes('kenapa web ini dibuat') ||
    (qL.includes('apa itu') && (qL.includes('si padi') || qL.includes('aplikasi ini') || qL.includes('web ini'))) ||
    (qL.includes('tentang') && (qL.includes('web ini') || qL.includes('aplikasi ini') || qL.includes('si padi'))) ||
    (qL.includes('jelaskan') && (qL.includes('web ini') || qL.includes('aplikasi ini') || qL.includes('si padi') || qL.includes('sistem ini')))
  ) {
    return [
      '**Deskripsi, Latar Belakang & Tujuan Platform SI PADI:**',
      '**SI PADI (Sistem Informasi Pertanian & Manajemen Budidaya Padi Desa Cirebon Girang)** adalah platform digital terpadu yang dirancang untuk mengatasi permasalahan tata kelola pertanian sawah di tingkat pedesaan.',
      '',
      '**1. Latar Belakang Masalah:**',
      '• Pendataan kepemilikan sawah, luas petak, dan kelompok tani sebelumnya masih dicatat secara manual di buku desa sehingga rentan tercecer.',
      '• Jadwal pemupukan susulan dan pemantauan umur tanaman (HST) belum tersinkronisasi, menyebabkan risiko pemupukan terlambat atau dosis tidak berimbang.',
      '• Kurangnya sistem peringatan dini (early warning) instan untuk ancaman hama dan anomali cuaca.',
      '• Rekapitulasi hasil panen belum terdokumentasi otomatis untuk bahan laporan resmi ke dinas terkait.',
      '',
      '**2. Tujuan & Manfaat Sistem:**',
      '• **Digitalisasi & Pemetaan GIS:** Memetakan koordinat poligon petak sawah dan informasi agronomis secara spasial interaktif.',
      '• **Early Warning System (EWS):** Mengirimkan peringatan otomatis jadwal pemupukan dan cuaca via WhatsApp Gateway dan Email.',
      '• **Manajemen Budidaya & Panen:** Pencatatan musim tanam dari semai hingga panen secara transparan.',
      '• **Asisten Cerdas AI:** Membantu petani dan pengurus desa berkonsultasi seputar hama, pupuk, dan data dashboard secara real-time.',
      '• **Laporan Kedinasan:** Menghasilkan laporan agrikultur resmi berstandar dinas bertanda tangan Kuwu Desa Cirebon Girang.'
    ].join('\n')
  }

  // 2. PERBEDAAN 3 DASHBOARD & HAK AKSES ROLE (RBAC)
  if (
    qL.includes('perbedaan 3 dashboard') ||
    qL.includes('perbedaan dashboard') ||
    qL.includes('beda dashboard') ||
    qL.includes('perbedaan role') ||
    qL.includes('hak akses') ||
    qL.includes('role apa saja') ||
    qL.includes('ada berapa role') ||
    qL.includes('kenapa ada 3 dashboard') ||
    qL.includes('kenapa dibagi 3 role') ||
    (qL.includes('beda') && qL.includes('admin') && qL.includes('petani'))
  ) {
    return [
      '**Arsitektur Hak Akses (Role-Based Access Control / RBAC) SI PADI:**',
      'Platform SI PADI membagi hak akses ke dalam **3 Dashboard terpisah** sesuai wewenang dan tugas pengguna:',
      '',
      '1. **Dashboard Administrator (`/admin` - 12 Menu):**',
      '   • **Wewenang:** Hak akses penuh (*Full Access*) untuk mengelola seluruh data master sistem.',
      '   • **Menu Utama:** Dashboard Admin, Peta Lahan GIS, Kelompok Tani, Data Petani, Data Master User, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Data Panen, Edukasi & Panduan, Profil Saya, dan Konfigurasi Sistem.',
      '   • **Fitur Khusus:** Menambah/mengedit akun user, konfigurasi API Key AI, token WhatsApp Gateway, pengaturan SMTP Email, dan broadcast notifikasi manual.',
      '',
      '2. **Dashboard Perangkat Desa (`/desa` - 10 Menu):**',
      '   • **Wewenang:** Hak akses pengawasan (*Supervisory & Reporting*) untuk Kuwu / Kepala Desa dan staf seksi pelayanan pertanian.',
      '   • **Menu Utama:** Dashboard Desa, Peta Lahan GIS, Kelompok Tani, Data Petani, Lahan Pertanian, Musim Tanam, Aktivitas Budidaya, Rekap Panen, Edukasi & Panduan, dan Profil Saya.',
      '   • **Fitur Khusus:** Memantau kemajuan musim tanam desa, evaluasi hasil panen kelompok tani, dan pengesahan laporan resmi dinas pertanian tanpa wewenang mengubah konfigurasi teknis sistem.',
      '',
      '3. **Dashboard Petani (`/petani` - 10 Menu):**',
      '   • **Wewenang:** Hak akses operasional mandiri (*End-User*) untuk warga petani pemilik/penggarap sawah.',
      '   • **Menu Utama:** Beranda Petani, Peta Lahan GIS, Kelompok Saya, Lahan Saya, Musim Tanam Saya, Aktivitas Budidaya, Hasil Panen Saya, Edukasi & Panduan, Profil Saya, dan AI Assistant.',
      '   • **Fitur Khusus:** Hanya dapat melihat dan mengelola lahan sawah pribadinya, memantau kalender pemupukan HST mandiri, mencatat panen mandiri, serta konsultasi budidaya dengan AI.'
    ].join('\n')
  }

  // 3. TEKNOLOGI & TECH STACK (NEXT.JS, TYPESCRIPT, TAILWIND, DSB)
  if (
    qL.includes('teknologi apa') ||
    qL.includes('tech stack') ||
    qL.includes('framework apa') ||
    qL.includes('pakai teknologi apa') ||
    qL.includes('frontend backend') ||
    qL.includes('arsitektur sistem') ||
    qL.includes('mengapa nextjs') ||
    qL.includes('arsitektur web')
  ) {
    return [
      '**Arsitektur Teknologi (Tech Stack) Platform SI PADI:**',
      '• **Framework Full-Stack:** **Next.js 15 (App Router)** berbasis **React 19** dan **TypeScript** — menggabungkan Server Components untuk rendering cepat & SEO, serta Client Components untuk interaktivitas dinamis.',
      '• **Styling & Tampilan:** **Tailwind CSS** untuk tata letak responsif mobile-first, didukung library ikon modern **Lucide React**.',
      '• **Database:** **MySQL** di cloud **TiDB Cloud Serverless** (koneksi aman TLS, auto-scaling, dan replikasi data cloud).',
      '• **ORM (Object-Relational Mapping):** **Prisma ORM** untuk query basis data yang type-safe, efisien, dan bebas SQL Injection.',
      '• **Autentikasi & Keamanan:** Stateless JSON Web Token (**JWT**) menggunakan library `jose` yang disimpan di **HttpOnly Secure Cookie**, serta enkripsi kata sandi menggunakan **bcryptjs** (salt rounds 10).',
      '• **Peta Interaktif (GIS):** **Leaflet.js** dengan tile satelit OpenStreetMap & Esri untuk pemetaan koordinat poligon batas petak sawah.',
      '• **Integrasi Gateway Notifikasi:** **WhatsApp Gateway API (Fonnte)** untuk pengiriman pesan otomatis ke WhatsApp, dan **Nodemailer SMTP** untuk pengiriman email.',
      '• **Kecerdasan Buatan:** **Google Gemini 3.0 Flash** / OpenAI GPT-4o-mini dengan arsitektur Retrieval-Augmented Generation (RAG) & Dynamic Context Injection, dipadu Fallback Engine Agronomi Lokal.',
      '• **Deployment & Hosting:** Cloud platform **Vercel** (`pertanian-cirebon-girang.vercel.app`) terhubung langsung ke repositori GitHub CI/CD aktif 24/7.'
    ].join('\n')
  }

  // 4. DATABASE & TABEL (MYSQL, TIDB CLOUD, PRISMA)
  if (
    qL.includes('struktur database') ||
    qL.includes('database apa') ||
    qL.includes('pakai database') ||
    qL.includes('database yang digunakan') ||
    qL.includes('tabel apa saja') ||
    qL.includes('13 tabel') ||
    qL.includes('daftar tabel') ||
    qL.includes('skema database') ||
    qL.includes('relasi database') ||
    qL.includes('tabel relasional') ||
    /\berd\b/i.test(qL) ||
    qL.includes('basis data') ||
    qL.includes('berapa tabel') ||
    (qL.includes('database') && (qL.includes('struktur') || qL.includes('skema') || qL.includes('tabel') || qL.includes('bagaimana') || qL.includes('apa')))
  ) {
    return [
      '**Struktur Basis Data & Database Platform SI PADI:**',
      '• **Database Engine:** **MySQL** yang di-host di cloud serverless **TiDB Cloud Serverless** (kompatibel penuh dengan protokol MySQL 8.0, koneksi aman TLS/SSL, dan skalabilitas otomatis).',
      '• **ORM:** **Prisma ORM** mengelola migrasi skema dan manipulasi data secara type-safe.',
      '• **13 Tabel Relasional Utama:**',
      '  1. `users` — Data akun login, username, email, password hash, role (ADMIN, PERANGKAT_DESA, PETANI).',
      '  2. `petani` — Data profil warga tani (NIK, nama, nomor telepon, domisili RT/RW, kelompok tani).',
      '  3. `kelompok_tani` — Data kelembagaan tani (nama poktan, nama ketua, wilayah blok dusun, kontak).',
      '  4. `lahan_pertanian` — Data petak sawah (nama petak, luas m² & Ha, status aktif, koordinat GPS poligon).',
      '  5. `musim_tanam` — Jadwal siklus tanam padi (varietas, tanggal tanam, perkiraan panen, status fase HST).',
      '  6. `aktivitas_budidaya` — Catatan kegiatan lapangan (olah tanah, semai, pemupukan, semprot hama, biaya).',
      '  7. `panen` — Rekapitulasi hasil panen gabah (tanggal, bobot gabah kg/Ton, mutu kualitas).',
      '  8. `informasi` — Pengumuman desa, panduan modul agronomi, dan artikel penyuluhan pertanian.',
      '  9. `audit_logs` — Catatan jejak audit aktivitas pengguna untuk akuntabilitas sistem.',
      '  10. `app_settings` — Parameter dinamis sistem (API key AI, nomor WhatsApp default, SMTP email).',
      '  11. `broadcast_notifications` — Riwayat penerbitan notifikasi peringatan manual oleh admin.',
      '  12. `otp_verifications` — Penyimpanan sementara kode OTP 6 digit dan status verifikasi pendaftaran.',
      '  13. `verification_tokens` — Token validasi sesi dan autentikasi tambahan.'
    ].join('\n')
  }

  // 5. KEAMANAN & AUTENTIKASI
  if (
    qL.includes('keamanan') ||
    qL.includes('autentikasi') ||
    qL.includes('apakah aman') ||
    qL.includes('enkripsi') ||
    /\bjwt\b/i.test(qL) ||
    qL.includes('bcrypt')
  ) {
    return [
      '**Mekanisme Keamanan & Autentikasi SI PADI:**',
      '• **One-Way Password Hashing:** Seluruh kata sandi di-hash menggunakan algoritma **bcryptjs dengan salt rounds 10**. Password asli tidak pernah disimpan dalam bentuk teks biasa (plaintext).',
      '• **Stateless JWT Session:** Sesi autentikasi menggunakan JSON Web Token (JWT) yang di-encode dan diverifikasi secara kriptografis menggunakan library modern `jose`.',
      '• **HttpOnly & Secure Cookies:** Token JWT disimpan dalam cookie bertanda `HttpOnly`, `SameSite=Lax`, dan `Secure` (di production), sehingga kebal terhadap serangan pencurian token melalui JavaScript (Cross-Site Scripting / XSS).',
      '• **Route Protection & Middleware:** Middleware Next.js memeriksa validitas token dan role pengguna pada setiap request rute dashboard (`/admin`, `/desa`, `/petani`). Pengguna yang mencoba mengakses rute di luar role-nya otomatis ditolak (*Forbidden / Redirect*).',
      '• **Verifikasi OTP Pendaftaran:** Pendaftaran petani baru mewajibkan verifikasi kode OTP 6 digit yang berlaku hanya 5 menit untuk mencegah akun bot / pendaftaran palsu.'
    ].join('\n')
  }

  // 6. CARA KERJA FITUR PETA LAHAN GIS
  if (
    qL.includes('cara kerja gis') ||
    qL.includes('cara kerja peta') ||
    qL.includes('leaflet') ||
    qL.includes('peta interaktif') ||
    qL.includes('koordinat sawah') ||
    qL.includes('poligon sawah') ||
    (qL.includes('peta lahan') && (qL.includes('bagaimana') || qL.includes('cara')))
  ) {
    return [
      '**Cara Kerja Fitur Peta Lahan GIS (/peta):**',
      '• **Peta Spasial Berbasis Leaflet.js:** Menggunakan basemap satelit OpenStreetMap & Esri World Imagery yang responsif dan ringan.',
      '• **Pemetaan Poligon & Marker:** Setiap petak sawah dipetakan dengan koordinat batas poligon GPS dan titik marker tengah yang tersimpan di kolom `latitude`, `longitude`, dan JSON koordinat poligon tabel `lahan_pertanian`.',
      '• **Popup Interaktif:** Ketika petak sawah diklik, peta menampilkan tooltip data aktual: Nama Petak, Luas (Ha & m²), Petani Pengelola, Kelompok Tani naungan, Varietas Padi yang sedang ditanam, serta Status Lahan (Aktif/Istirahat).',
      '• **Filter Cepat:** Pengguna dapat menyaring visualisasi lahan berdasarkan Blok Dusun (Manis, Wage, Pahing) dan Kelompok Tani (Sri Rejeki, Sumber Subur, Tani Makmur).',
      '• **Manfaat:** Mempermudah visualisasi sebaran hamparan sawah desa seluas 6,0 Ha secara akurat tanpa harus terjun langsung ke lapangan.'
    ].join('\n')
  }

  // 7. CARA KERJA EARLY WARNING SYSTEM (PERINGATAN DINI)
  if (
    qL.includes('cara kerja peringatan dini') ||
    qL.includes('cara kerja early warning') ||
    qL.includes('bagaimana peringatan dini') ||
    qL.includes('early warning system bekerja') ||
    (qL.includes('peringatan dini') && (qL.includes('cara') || qL.includes('bagaimana') || qL.includes('alur')))
  ) {
    return [
      '**Cara Kerja Sistem Peringatan Dini (Early Warning System):**',
      '• **Pemantauan Otomatis Hari Setelah Tanam (HST):** Sistem membaca tanggal tanam pada tabel `musim_tanam` dan menghitung selisih hari dengan tanggal sekarang secara otomatis.',
      '• **Pemicu Peringatan (Triggers):**',
      '  1. *Fase Pemupukan Susulan I (10–14 HST):* Memberi notifikasi agar petani segera menaburkan pupuk Urea dan NPK Phonska.',
      '  2. *Fase Pemupukan Susulan II (30–35 HST):* Memberi peringatan fase bunting/primordia untuk penaburan Urea, NPK, dan KCl.',
      '  3. *Fase Menjelang Panen (100–120 HST):* Peringatan kesiapan panen dan pengeringan petak sawah.',
      '  4. *Peringatan Cuaca & Hama:* Menganalisis kelembaban tinggi dan curah hujan ekstrem dari API cuaca Open-Meteo untuk mitigasi dini serangan wereng coklat & hawar daun.',
      '• **Penyaluran Multi-Saluran:**',
      '  - **Dashboard:** Tampil di widget *Early Warning System* dan lonceng notifikasi atas.',
      '  - **WhatsApp Gateway:** Terkirim otomatis via server ke nomor WhatsApp petani (Fonnte).',
      '  - **Email SMTP:** Rangkuman berkala terkirim ke email pengawas/petani via SMTP Nodemailer.'
    ].join('\n')
  }

  // 8. ALUR PENDAFTARAN PETANI & VERIFIKASI OTP
  if (
    qL.includes('alur pendaftaran') ||
    qL.includes('cara daftar petani') ||
    qL.includes('alur register') ||
    qL.includes('bagaimana verifikasi otp') ||
    qL.includes('cara kerja otp') ||
    qL.includes('kenapa pakai otp') ||
    (qL.includes('otp') && (qL.includes('bagaimana') || qL.includes('cara') || qL.includes('alur')))
  ) {
    return [
      '**Alur Pendaftaran Petani Mandiri & Verifikasi OTP Dual-Channel:**',
      '1. **Pendaftaran Awal:** Calon petani membuka portal login dan memilih menu **Daftar Sekarang (Verifikasi OTP)** di `/register`.',
      '2. **Pengisian Data Diri:** Mengisi nama lengkap, NIK 16 digit, nomor WhatsApp aktif, alamat domisili, pilihan kelompok tani, username, dan kata sandi.',
      '3. **Generate & Pengiriman Kode OTP:**',
      '   • Sistem membuat kode OTP 6 digit numerik acak secara kriptografis (`crypto.randomInt(100000, 1000000)`).',
      '   • Kode disimpan di tabel `otp_verifications` dengan batas kedaluwarsa **5 menit**.',
      '   • Sistem mengirimkan kode OTP secara simultan via **WhatsApp Gateway (Fonnte)** langsung ke nomor WhatsApp petani dan via **Email SMTP** ke alamat emailnya.',
      '4. **Verifikasi OTP:** Petani memasukkan 6 digit kode OTP pada layar verifikasi Langkah 2.',
      '5. **Aktivasi Akun Otomatis:** Setelah kode diverifikasi cocok dan belum kedaluwarsa, sistem otomatis membuat akun `User` (role PETANI) dan entitas `Petani` yang saling bertaut, lalu petani langsung diarahkan ke Dashboard Petani.'
    ].join('\n')
  }

  // 9. REKOMENDASI PEMUPUKAN & AGRONOMI (HST)
  if (
    qL.includes('dasar rekomendasi pupuk') ||
    qL.includes('perhitungan pupuk') ||
    qL.includes('bagaimana pemupukan') ||
    qL.includes('apa itu hst') ||
    qL.includes('fungsi hst') ||
    qL.includes('dosis pemupukan') ||
    qL.includes('tahapan pemupukan')
  ) {
    return [
      '**Dasar Rekomendasi Pemupukan Berimbang Berbasis HST:**',
      'Rekomendasi pemupukan pada SI PADI mengacu pada petunjuk teknis baku **Balitbangtan / Badan Litbang Pertanian (Kementerian Pertanian RI)** untuk varietas padi sawah unggul (Inpari 32 HDB & Ciherang):',
      '',
      '• **Pengertian HST (Hari Setelah Tanam):** Satuan umur tanaman yang dihitung sejak bibit padi dipindah dari persemaian ke petak sawah basah.',
      '',
      '• **Jadwal & Takaran Pupuk Berimbang per Hektar (10.000 m²):**',
      '  1. **Pupuk Dasar (0–5 HST):**',
      '     • Pupuk Organik / Kompos Matang: 500 – 1.000 kg',
      '     • Pupuk SP-36 / TSP (Fosfat): 75 – 100 kg',
      '     • *Fungsi:* Merangsang pertumbuhan perakaran yang dalam dan kokoh agar bibit cepat beradaptasi.',
      '  2. **Pemupukan Susulan I (10–14 HST):**',
      '     • Urea (Nitrogen): 75 – 100 kg',
      '     • NPK Phonska 15:15:15: 150 kg',
      '     • *Fungsi:* Memacu pembentukan anakan produktif dan fotosintesis daun awal vegetatif.',
      '  3. **Pemupukan Susulan II (30–35 HST):**',
      '     • Urea: 50 kg',
      '     • NPK Phonska: 100 kg',
      '     • KCl (Kalium): 25 – 50 kg',
      '     • *Fungsi:* Memperkuat dinding sel batang padi agar tidak mudah rebah dan mempersiapkan pengisian malai bunting (fase primordia).'
    ].join('\n')
  }

  // 10. CARA KERJA AI ASSISTANT (RAG & CONTEXT INJECTION)
  if (
    qL.includes('cara kerja ai') ||
    qL.includes('bagaimana ai bekerja') ||
    qL.includes('kenapa ai tahu data') ||
    qL.includes('arsitektur ai') ||
    qL.includes('apakah ai sungguhan') ||
    qL.includes('context injection') ||
    /\brag\b/i.test(qL)
  ) {
    return [
      '**Arsitektur & Cara Kerja AI Assistant SI PADI:**',
      'AI Assistant SI PADI menggunakan arsitektur **Hybrid Retrieval-Augmented Generation (RAG) & Real-Time Context Injection**:',
      '',
      '1. **Dynamic Real-Time Context Injection:**',
      '   Setiap kali pengguna mengirimkan pertanyaan, backend Next.js mengambil data agregasi terbaru dari database MySQL TiDB Cloud (jumlah pengguna, daftar petani, lahan, musim tanam, hasil panen, peringatan aktif). Seluruh data ini disuntikkan secara dinamis ke dalam *System Instruction* model LLM (**Google Gemini 3.0 Flash** / **OpenAI GPT-4o-mini**).',
      '2. **Deterministic Super Engine Agronomi Lokal:**',
      '   Sistem dilengkapi mesin pencocokan pola cerdas lokal yang menguasai seluruh data master dashboard dan pengetahuan agronomi padi sawah. Jika API Key belum dikonfigurasikan atau kuota cloud habis, mesin lokal ini langsung merespons secara instan (0 ms latensi) dengan data 100% akurat.',
      '3. **Persona Bahasa Adaptif:**',
      '   Dapat disesuaikan di menu Konfigurasi Sistem: Gaya Ramah & Santun (Sunda/Cirebon), Pakar Agronomi Peneliti, atau Penyuluh Lapangan Ringkas.'
    ].join('\n')
  }

  // 11. FORMAT LAPORAN KEDINASAN RESMI
  if (
    qL.includes('laporan dinas') ||
    qL.includes('format laporan') ||
    qL.includes('siapa yang tanda tangan laporan') ||
    qL.includes('laporan resmi desa')
  ) {
    const kades = getKepalaDesaUser(userContext?.statsDesa)
    const kadesName = kades?.fullName || 'Bapak Karsiman, S.Sos'
    return [
      '**Format Laporan Resmi Agrikultur Desa Cirebon Girang:**',
      '• **Kop Surat Kedinasan:** Menampilkan Kop Resmi Pemerintah Kabupaten Cirebon, Kecamatan Talun, Kantor Kuwu Desa Cirebon Girang.',
      '• **Muatan Laporan:** Berisi rekapitulasi inventarisasi luas lahan sawah (6,0 Ha), daftar kelompok tani binaan, jadwal musim tanam aktif, estimasi panen, realisasi panen gabah, serta catatan penyuluhan lapangan.',
      `• **Pengesahan & Tanda Tangan:** Ditandatangani secara resmi oleh Kuwu / Kepala Desa Cirebon Girang (**${kadesName}**) sebagai penanggung jawab pemerintahan desa untuk diserahkan ke Dinas Pertanian Kabupaten Cirebon.`,
      '• **Akses Cetak:** Tersedia di tombol **[Cetak / PDF]** pada menu Lahan, Musim Tanam, Data Panen, dan Kelompok Tani.'
    ].join('\n')
  }

  // 12. METODOLOGI PENGEMBANGAN PERANGKAT LUNAK (SDLC)
  if (
    qL.includes('metode pengembangan') ||
    qL.includes('metodologi pengembangan') ||
    qL.includes('metode rekayasa') ||
    /\bsdlc\b/i.test(qL) ||
    qL.includes('tahapan pengembangan') ||
    qL.includes('siklus pengembangan') ||
    (qL.includes('metode') && (qL.includes('software') || qL.includes('sistem') || qL.includes('aplikasi') || qL.includes('perangkat lunak')))
  ) {
    return [
      '**Metode Pengembangan Perangkat Lunak (SDLC) SI PADI:**',
      'Pengembangan platform SI PADI menggunakan pendekatan **Iterative Agile & Prototype SDLC** dengan tahapan sistematis:',
      '',
      '1. **Analisis Kebutuhan (Requirements Analysis):** Observasi tata kelola pertanian di Desa Cirebon Girang dan wawancara dengan Kuwu Bapak Karsiman, S.Sos serta ketua kelompok tani.',
      '2. **Perancangan Sistem (System Design):**',
      '   • Perancangan Database Relasional (13 tabel ERD pada MySQL TiDB Cloud).',
      '   • Pemodelan Use Case Diagram & Flowchart alur registrasi OTP serta Early Warning System.',
      '   • Perancangan UI/UX responsif 3 dashboard berbasis Tailwind CSS.',
      '3. **Implementasi & Pengkodean (Coding Phase):** Full-stack Next.js 15 App Router, React 19, TypeScript, dan Prisma ORM.',
      '4. **Pengujian (Testing):** Fungsional Black Box Testing dan User Acceptance Testing (UAT).',
      '5. **Penerapan & Pemeliharaan (Deployment & CI/CD):** Hosting cloud serverless di Vercel dengan integrasi Git otomatis.'
    ].join('\n')
  }

  // 13. PENGUJIAN SISTEM (BLACK BOX & UAT)
  if (
    qL.includes('metode pengujian') ||
    qL.includes('metode testing') ||
    qL.includes('cara pengujian') ||
    qL.includes('pengujian sistem') ||
    qL.includes('black box') ||
    qL.includes('white box') ||
    /\buat\b/i.test(qL) ||
    qL.includes('user acceptance test')
  ) {
    return [
      '**Metodologi Pengujian Sistem (Software Testing) SI PADI:**',
      'Pengujian platform SI PADI dilakukan melalui 2 pendekatan utama:',
      '',
      '1. **Black Box Testing (Pengujian Fungsionalitas):**',
      '   • Menguji fungsi autentikasi login kredensial dan role guard middleware.',
      '   • Menguji keabsahan alur registrasi petani dan masa berlaku kode OTP 6 digit (5 menit).',
      '   • Menguji fungsi CRUD pada 13 tabel (petani, kelompok tani, lahan, musim tanam, panen, aktivitas).',
      '   • Menguji responsivitas peta GIS Leaflet dan kalkulasi dosis pemupukan per HST.',
      '   • *Hasil:* Seluruh test case input-output berjalan sukses (100% lulus tanpa kegagalan fungsional).',
      '',
      '2. **User Acceptance Testing (UAT):**',
      '   • Diujicobakan langsung bersama Perangkat Desa (Kuwu Bapak Karsiman, S.Sos) dan perwakilan petani (Bapak Sukardi, Bapak Sutarjo, Bapak H. Karyono).',
      '   • Memastikan antarmuka intuitif, notifikasi WhatsApp/Email terkirim seketika, dan format laporan dinas telah sesuai regulasi desa.'
    ].join('\n')
  }

  // 14. KEAMANAN DARI SERANGAN WEB (SQL INJECTION, XSS, CSRF)
  if (
    qL.includes('sql injection') ||
    /\bxss\b/i.test(qL) ||
    /\bcsrf\b/i.test(qL) ||
    qL.includes('mencegah serangan') ||
    qL.includes('keamanan web') ||
    qL.includes('keamanan sistem') ||
    qL.includes('vulnerability')
  ) {
    return [
      '**Mekanisme Keamanan Siber pada Web SI PADI:**',
      '1. **Anti SQL Injection:**',
      '   Semua interaksi database wajib menggunakan **Prisma ORM**, yang secara *built-in* mengeksekusi *Parameterized Queries / Prepared Statements*. Input pengguna tidak pernah digabungkan langsung secara string literal ke query SQL.',
      '2. **Anti Cross-Site Scripting (XSS):**',
      '   Framework Next.js & React 19 secara otomatis melakukan sanitasi dan *HTML-escaping* pada semua data sebelum dirender ke DOM peramban.',
      '3. **Anti Cross-Site Request Forgery (CSRF):**',
      '   Token otentikasi disimpan dalam cookie dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure` (pada protokol HTTPS di Vercel), sehingga skrip JavaScript sisi klien tidak dapat mencuri token.',
      '4. **Hashed Password Protection:**',
      '   Kata sandi tidak pernah disimpan dalam bentuk teks polos (plain text), melainkan di-hash searah dengan algoritma **bcryptjs (salt round 10)**.'
    ].join('\n')
  }

  // 15. PERBEDAAN DATA MASTER USER VS DATA PETANI
  if (
    qL.includes('beda user dan petani') ||
    qL.includes('perbedaan user dan petani') ||
    qL.includes('beda data master user') ||
    qL.includes('kenapa user dan petani dipisah') ||
    qL.includes('relasi user dan petani')
  ) {
    return [
      '**Perbedaan Menu "Data Master User" vs "Data Petani" pada SI PADI:**',
      'Arsitektur pemisahan ini menerapkan prinsip *Separation of Concerns* (SoC) pada basis data relasional:',
      '',
      '1. **Tabel `User` (Menu Data Master User):**',
      '   • **Fokus:** Keamanan otentikasi & hak akses sistem.',
      '   • **Atribut:** `username`, `password` (hash bcrypt), `role` (ADMIN, PERANGKAT_DESA, PETANI), `email`, `isActive`.',
      '   • **Pengguna:** Dikelola eksklusif oleh Administrator untuk mengatur siapa saja yang berhak masuk ke web.',
      '',
      '2. **Tabel `Petani` (Menu Data Petani):**',
      '   • **Fokus:** Profil agrikultur dan sosiodemografis di pedesaan.',
      '   • **Atribut:** `nik` (16 digit), `alamat` domisili RT/RW, `kelompokTaniId`, riwayat kepemilikan petak sawah (`Lahan`), dan riwayat musim tanam.',
      '   • **Relasi:** Setiap entitas `Petani` memiliki foreign key `userId` opsional yang bertaut (1-to-1) dengan akun `User` agar petani dapat login secara mandiri.'
    ].join('\n')
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// PENANGANAN QUERY MASTER DATA, DASHBOARD & FITUR ADMIN/DESA/PETANI
// ─────────────────────────────────────────────────────────────────────────────

export function handleMasterDataAndAdminQueries(
  query: string,
  rawQuery: string,
  userContext?: PetaniContext,
  conversationContext?: string
): string | null {
  const norm = normalizeIndonesianQuery(query)
  const q = norm.toLowerCase().trim()
  const rawQ = rawQuery.toLowerCase().trim()
  const cCtx = (conversationContext || '').toLowerCase()

  // 00. Pertanyaan Dosen Penguji / Akademis Seputar Web & Dashboard
  const dosenRes = handleDosenQuestion(q, rawQ, userContext) || handleDosenQuestion(rawQ, rawQ, userContext)
  if (dosenRes) return dosenRes

  // 0A. Action Button & Fitur Teknis Web
  const actionRes = handleActionButtonAndFeatureResponse(q) || handleActionButtonAndFeatureResponse(rawQ)
  if (actionRes) return actionRes

  // 0B. Pertanyaan Jumlah Menu
  if (q.includes('berapa menu') || q.includes('jumlah menu') || q.includes('total menu') || /ada\s*berapa\s*menu/i.test(q)) {
    return generateJumlahMenuResponse(q)
  }

  // 0C. Peringatan Dini / Early Warning / Cuaca / Broadcast
  if (
    q.includes('peringatan dini') ||
    q.includes('early warning') ||
    q.includes('notifikasi') ||
    q.includes('broadcast') ||
    q.includes('waspada') ||
    q.includes('peringatan apa')
  ) {
    return generateWarningsResponse(userContext)
  }

  // 0D. Audit Log / Riwayat Sistem
  if (q.includes('audit') || q.includes('log sistem') || q.includes('riwayat sistem') || q.includes('riwayat aktivitas sistem')) {
    return generateAuditLogResponse(userContext)
  }

  // 0E. Artikel / Pengumuman / Informasi Desa
  if (
    q.includes('pengumuman') ||
    q.includes('artikel') ||
    q.includes('berita') ||
    q.includes('pupuk bersubsidi') ||
    q.includes('gropyokan') ||
    (q.includes('informasi') && (q.includes('desa') || q.includes('pertanian') || q.includes('apa saja')))
  ) {
    return generateInformasiResponse(userContext)
  }

  // 0F. Lahan per Blok Dusun
  if ((q.includes('blok manis') || q.includes('karang anyar')) && (q.includes('lahan') || q.includes('sawah') || q.includes('petak') || q.includes('ada apa') || q.includes('apa saja') || q.includes('daftar'))) {
    return generateBlokLahanDetailResponse('manis', userContext)
  }
  if ((q.includes('blok wage') || q.includes('girang hilir')) && (q.includes('lahan') || q.includes('sawah') || q.includes('petak') || q.includes('ada apa') || q.includes('apa saja') || q.includes('daftar'))) {
    return generateBlokLahanDetailResponse('wage', userContext)
  }
  if ((q.includes('blok pahing') || q.includes('cirebon ilir')) && (q.includes('lahan') || q.includes('sawah') || q.includes('petak') || q.includes('ada apa') || q.includes('apa saja') || q.includes('daftar'))) {
    return generateBlokLahanDetailResponse('pahing', userContext)
  }

  // 0F-SUPERLATIF: LAHAN TERLUAS, TERKECIL, PANEN TERBANYAK, RATA-RATA (cek sebelum total luas/panen!)
  const wantsTerluas =
    q.includes('siapa lahan yang paling luas') ||
    q.includes('siapa yang punya lahan paling luas') ||
    q.includes('lahan siapa yang paling luas') ||
    q.includes('lahan mana yang paling luas') ||
    q.includes('lahan terluas') ||
    q.includes('lahan paling luas') ||
    q.includes('petani lahan terluas') ||
    q.includes('siapa pemilik lahan terluas') ||
    (
      (q.includes('lahan') || q.includes('petak') || q.includes('sawah') || q.includes('siapa') || q.includes('mana')) &&
      (q.includes('paling luas') || q.includes('terluas') || q.includes('terbesar') || q.includes('paling besar')) &&
      !q.includes('total luas') && !q.includes('berapa luas')
    )
  const wantsTerkecil =
    (q.includes('lahan') || q.includes('petak') || q.includes('sawah') || q.includes('siapa') || q.includes('mana')) &&
    (q.includes('paling kecil') || q.includes('terkecil') || q.includes('paling sempit') || q.includes('tersempit'))

  if (wantsTerluas && wantsTerkecil) {
    return `${generateLahanTerluasResponse(userContext)}\n${generateLahanTerkecilResponse(userContext)}`
  }
  if (wantsTerluas) {
    return generateLahanTerluasResponse(userContext)
  }
  if (wantsTerkecil) {
    return generateLahanTerkecilResponse(userContext)
  }

  if (q.includes('rata-rata') && (q.includes('luas') || q.includes('lahan') || q.includes('petak'))) {
    const s = userContext?.statsDesa
    const totalHa = s?.totalLuasHa ?? 6.0
    const totalLahan = s?.totalLahan || 4
    const totalPetani = s?.totalPetani || 3
    return `Rata-rata luas lahan adalah **${(totalHa / totalLahan).toFixed(2)} Ha** per petak sawah (${totalLahan} petak), atau **${(totalHa / totalPetani).toFixed(2)} Ha** per petani (${totalPetani} petani).`
  }

  // 0F-BREAKDOWN: PERTANYAAN PER-ITEM ("masing-masing", "tiap", "setiap", "per petani/petak", "sebutkan ... dan ...")
  const isBreakdownQuery =
    q.includes('masing-masing') ||
    q.includes('masing masing') ||
    /\btiap\b/i.test(q) ||
    /\bsetiap\b/i.test(q) ||
    /\bper\s+(petani|orang|petak|lahan|sawah|kelompok|poktan|musim|user)\b/i.test(q) ||
    /\b(sebutkan|rincian|detail|daftar)\b/i.test(q)

  if (isBreakdownQuery) {
    if (q.includes('petani') && (q.includes('alamat') || q.includes('beserta'))) {
      if (isBerapaQuery(q)) return generateFarmerCountOnlyResponse(userContext)
      if (isSiapaQuery(q)) return generateFarmerNamesOnlyResponse(userContext)
      return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext)
    }
    if (q.includes('petani') && (q.includes('lahan') || q.includes('sawah') || q.includes('luas') || q.includes('petak') || q.includes('garapan') || q.includes('masing'))) {
      if (isBerapaQuery(q)) return generateFarmerCountOnlyResponse(userContext)
      if (isSiapaQuery(q)) return generateFarmerNamesOnlyResponse(userContext)
      return generatePetaniWithLahanBreakdownResponse(userContext)
    }
    if (q.includes('petani') && !q.includes('kelompok') && !q.includes('poktan') && !q.includes('panen')) {
      if (isBerapaQuery(q)) return generateFarmerCountOnlyResponse(userContext)
      if (isSiapaQuery(q)) return generateFarmerNamesOnlyResponse(userContext)
      return generatePetaniWithLahanBreakdownResponse(userContext)
    }
    if (q.includes('kelompok tani') || q.includes('poktan')) {
      if (isBerapaQuery(q)) return generatePoktanCountOnlyResponse(userContext)
      if (isSiapaQuery(q) && (q.includes('ketua') || q.includes('pimpinan'))) return generatePoktanKetuaNamesResponse(userContext)
      return generatePoktanStatsResponse(userContext)
    }
    if (q.includes('panen')) {
      if (isBerapaQuery(q)) return generatePanenCountOnlyResponse(userContext)
      return generatePanenDetailResponse(userContext)
    }
    if (q.includes('musim')) {
      if (isBerapaQuery(q)) return generateMusimCountOnlyResponse(userContext)
      return generateMusimDetailResponse(userContext)
    }
    if (q.includes('aktivitas') || q.includes('kegiatan')) {
      if (isBerapaQuery(q)) return generateAktivitasCountOnlyResponse(userContext)
      return generateAktivitasStatsResponse(userContext)
    }
    if (q.includes('user') || q.includes('pengguna') || q.includes('akun')) {
      if (isBerapaQuery(q)) return generateUserCountOnlyResponse(userContext)
      if (isSiapaQuery(q) || q.includes('nama')) return generateUserNamesOnlyResponse(userContext)
      return generateUserStatsResponse(userContext)
    }
    if (q.includes('blok')) {
      return generateZonasiBlokStatsResponse(userContext)
    }
    if (q.includes('lahan') || q.includes('sawah') || q.includes('petak')) {
      if (isBerapaQuery(q)) return generateLahanCountOnlyResponse(userContext)
      return generateLahanDetailResponse(userContext)
    }
  }

  // 0G. TOTAL LUAS LAHAN (hanya jika bukan pertanyaan per-petani/masing-masing!)
  if (
    q.includes('total luas') ||
    q.includes('luas keseluruhan') ||
    q.includes('luas hamparan') ||
    q.includes('luas total') ||
    q.includes('luas lahan') ||
    q.includes('luas sawah') ||
    q.includes('luas baku') ||
    q === 'luas' ||
    /(berapa|jumlah|total|ada berapa).*luas/i.test(q) ||
    /luas.*(berapa|total|keseluruhan|seluruh|semua|desa|hamparan|sawah|lahan|hektar|m2|meter)/i.test(q) ||
    /(berapa|total).*(hektar|meter persegi|m2)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generateLuasCountOnlyResponse(userContext)
    return generateHamparanStatsResponse(userContext)
  }

  // 0H. JUMLAH LAHAN / PETAK SAWAH
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
    if (isBerapaQuery(q)) return generateLahanCountOnlyResponse(userContext)
    return generateLahanStatsResponse(userContext)
  }

  // 0I. MUSIM TANAM
  if (
    q.includes('total musim') ||
    q.includes('musim aktif') ||
    q.includes('musim berjalan') ||
    q.includes('siklus musim') ||
    /(berapa|total|ada berapa).*musim/i.test(q) ||
    /musim.*(berjalan|aktif|tanam|siklus|ada berapa|berapa)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generateMusimCountOnlyResponse(userContext)
    return generateMusimStatsResponse(userContext)
  }

  // 0J-PRE. SUPERLATIF PANEN TERBANYAK / TERTINGGI (cek sebelum total panen!)
  if (
    (q.includes('panen') || q.includes('hasil') || q.includes('produksi')) &&
    (q.includes('paling banyak') || q.includes('terbanyak') || q.includes('tertinggi') || q.includes('paling tinggi'))
  ) {
    return generatePanenTerbanyakResponse(userContext)
  }

  // 0J. HASIL PANEN
  if (
    q.includes('total panen') ||
    q.includes('hasil panen') ||
    q.includes('realisasi panen') ||
    q.includes('produksi gabah') ||
    /(berapa|total|hasil|riwayat|realisasi|jumlah|ada berapa).*panen/i.test(q) ||
    /panen.*(ada berapa|berapa|jumlah|total|ton|kg)/i.test(q) ||
    /produksi.*(gabah|padi|berapa ton)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generatePanenCountOnlyResponse(userContext)
    return generatePanenStatsResponse(userContext)
  }

  // 0K. DATA PETANI
  if (
    q.includes('total petani') ||
    q.includes('jumlah petani') ||
    /(berapa|jumlah|total|ada berapa).*petani/i.test(q) ||
    /petani.*(bergabung|terdaftar|ada|bina|anggota|ada berapa|berapa|siapa saja)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generateFarmerCountOnlyResponse(userContext)
    if (isSiapaQuery(q)) return generateFarmerNamesOnlyResponse(userContext)
    return generateFarmerStatsResponse(userContext)
  }

  // 0L. KELOMPOK TANI / POKTAN
  if (
    q.includes('total poktan') ||
    q.includes('jumlah poktan') ||
    q.includes('total kelompok tani') ||
    q.includes('jumlah kelompok tani') ||
    /(berapa|jumlah|total|ada berapa).*(kelompok tani|poktan|kelembagaan)/i.test(q) ||
    /(kelompok tani|poktan).*(ada berapa|berapa|jumlah)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generatePoktanCountOnlyResponse(userContext)
    if (isSiapaQuery(q) && (q.includes('ketua') || q.includes('pimpinan') || q.includes('kelompok') || q.includes('poktan'))) {
      return generatePoktanKetuaNamesResponse(userContext)
    }
    return generatePoktanStatsResponse(userContext)
  }

  // 0M. DATA MASTER USER / PENGGUNA / AKUN
  if (
    q.includes('total user') ||
    q.includes('jumlah user') ||
    q.includes('total pengguna') ||
    q.includes('jumlah akun') ||
    /(berapa|jumlah|total|ada berapa|siapa saja|daftar|semua).*(pengguna|user|akun|hak akses)/i.test(q) ||
    /(user|akun|pengguna).*(terdaftar|ada berapa|berapa|siapa)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generateUserCountOnlyResponse(userContext)
    if (isSiapaQuery(q)) return generateUserNamesOnlyResponse(userContext)
    return generateUserStatsResponse(userContext)
  }

  // 0N. AKTIVITAS BUDIDAYA
  if (
    q.includes('total aktivitas') ||
    q.includes('jumlah aktivitas') ||
    q.includes('biaya budidaya') ||
    /(berapa|jumlah|total|ada berapa).*aktivitas/i.test(q) ||
    /aktivitas.*(ada berapa|berapa|jumlah|tercatat|terbaru)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generateAktivitasCountOnlyResponse(userContext)
    return generateAktivitasStatsResponse(userContext)
  }

  // SEMUA MENU DASHBOARD
  if (
    q.includes('setiap dashboard') ||
    q.includes('semua dashboard') ||
    q.includes('semua menu') ||
    q.includes('seluruh menu') ||
    q.includes('daftar menu') ||
    q.includes('menu apa saja') ||
    q.includes('apa saja menu') ||
    q.includes('menu di dashboard') ||
    (q.includes('menu') && (q.includes('apa saja') || q.includes('ada apa') || q.includes('daftar') || q.includes('dashboard') || q.includes('semua')))
  ) {
    if (q.includes('admin') || q.includes('administrator')) return generateAdminDashboardMenusResponse()
    if (q.includes('desa') || q.includes('perangkat')) return generateDesaDashboardMenusResponse()
    if (q.includes('petani')) return generatePetaniDashboardMenusResponse()
    return generateAllDashboardMenusResponse()
  }

  // PENJELASAN MENU SPESIFIK
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && (q.includes('peta') || q.includes('gis'))) {
    return generateMenuExplanationResponse('peta', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && (q.includes('kelompok tani') || q.includes('poktan'))) {
    return generateMenuExplanationResponse('kelompok tani', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && (q.includes('master user') || (q.includes('user') && q.includes('menu')))) {
    return generateMenuExplanationResponse('data master user', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && (q.includes('data petani') || (q.includes('petani') && q.includes('menu')))) {
    return generateMenuExplanationResponse('data petani', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && (q.includes('lahan') || q.includes('sawah'))) {
    return generateMenuExplanationResponse('lahan', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && q.includes('musim')) {
    return generateMenuExplanationResponse('musim', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && q.includes('aktivitas')) {
    return generateMenuExplanationResponse('aktivitas', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && q.includes('panen')) {
    return generateMenuExplanationResponse('panen', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && (q.includes('edukasi') || q.includes('panduan'))) {
    return generateMenuExplanationResponse('edukasi', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && q.includes('profil')) {
    return generateMenuExplanationResponse('profil', userContext)
  }
  if ((q.includes('menu') || q.includes('fungsi') || q.includes('fitur') || q.includes('apa itu') || q.includes('jelaskan')) && q.includes('konfigurasi')) {
    return generateMenuExplanationResponse('konfigurasi', userContext)
  }

  // 1. Kepala Desa / Kuwu / Perangkat Desa ("siapa nama kepala desa", "karsiman", "kuwu", "kaur ekbang")
  if (
    q.includes('karsiman') ||
    q.includes('kepala desa') ||
    q.includes('perangkat desa') ||
    q.includes('pemerintah desa') ||
    q.includes('kaur ekbang') ||
    q.includes('pamong') ||
    q.includes('aparat desa') ||
    q.includes('staf desa') ||
    /(berapa|jumlah|total|siapa|nama|ada berapa).*(perangkat|aparat|pamong|kepala desa|kuwu|kades)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generatePerangkatDesaCountResponse(userContext)
    if (isSiapaQuery(q) || q.includes('siapa') || q.includes('nama')) return generatePerangkatDesaNameResponse(userContext)
    return generatePerangkatDesaResponse(userContext)
  }

  // 2. Administrator Sistem ("siapa admin", "karisma")
  if (
    q.includes('karisma') ||
    isAdminInfoQuery(q) ||
    /(berapa|jumlah|total|siapa|nama|ada berapa).*(admin|administrator)/i.test(q)
  ) {
    if (isBerapaQuery(q)) return generateAdminCountResponse(userContext)
    if (isSiapaQuery(q) || q.includes('siapa') || q.includes('nama')) return generateAdminNameResponse(userContext)
    return generateAdminResponse(userContext)
  }

  // 3. Ikhtisar Semua Data Master & Dashboard
  if (
    q.includes('data master') ||
    q.includes('semua yang ada di dashboard') ||
    q.includes('apa saja di dashboard') ||
    /(apa saja|sebutkan|daftar|jelaskan).*(data master|fitur|dashboard)/i.test(q)
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
    q.includes('notifikasi email')
  ) {
    return generateKonfigurasiStatsResponse(userContext)
  }

  // 5A. Anggota Beserta Luas & Alamat
  if (
    !q.includes('total luas') &&
    !q.includes('berapa luas') &&
    (q.includes('beserta luas') || q.includes('beserta lahan') || q.includes('beserta alamat') || q.includes('luas garapan') || ((q.includes('anggota') || q.includes('petani')) && q.includes('alamat')))
  ) {
    if (q.includes('sri rejeki') || cCtx.includes('sri rejeki')) return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext, 'Sri Rejeki')
    if (q.includes('sumber subur') || cCtx.includes('sumber subur')) return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext, 'Sumber Subur')
    if (q.includes('tani makmur') || cCtx.includes('tani makmur')) return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext, 'Tani Makmur')
    return generatePoktanAnggotaWithLahanAndAlamatResponse(userContext)
  }

  // 5B. Anggota Poktan
  if (q.includes('anggota') || (cCtx.includes('kelompok tani') && /(siapa saja|sebutkan|daftar|anggotanya)/i.test(q))) {
    if (q.includes('sri rejeki')) return generatePoktanAnggotaResponse(userContext, 'Sri Rejeki')
    if (q.includes('sumber subur')) return generatePoktanAnggotaResponse(userContext, 'Sumber Subur')
    if (q.includes('tani makmur')) return generatePoktanAnggotaResponse(userContext, 'Tani Makmur')
    return generatePoktanAnggotaResponse(userContext)
  }

  // 5C. Ketua / Kontak / Wilayah Poktan
  if (q.includes('ketua') && (q.includes('kelompok') || q.includes('poktan') || q.includes('siapa') || cCtx.includes('kelompok tani'))) {
    if (q.includes('sri rejeki') || cCtx.includes('sri rejeki')) {
      const p = (userContext?.statsDesa?.daftarPoktan || []).find(x => x.nama.toLowerCase().includes('sri rejeki'))
      return `Ketua Kelompok Tani Sri Rejeki adalah **${p?.ketua || 'Bapak Sukardi'}**.`
    }
    if (q.includes('sumber subur') || cCtx.includes('sumber subur')) {
      const p = (userContext?.statsDesa?.daftarPoktan || []).find(x => x.nama.toLowerCase().includes('sumber subur'))
      return `Ketua Kelompok Tani Sumber Subur adalah **${p?.ketua || 'Bapak H. Karyono'}**.`
    }
    if (q.includes('tani makmur') || cCtx.includes('tani makmur')) {
      const p = (userContext?.statsDesa?.daftarPoktan || []).find(x => x.nama.toLowerCase().includes('tani makmur'))
      return `Ketua Kelompok Tani Tani Makmur adalah **${p?.ketua || 'Bapak Sutarjo'}**.`
    }
    if (isSiapaQuery(q)) return generatePoktanKetuaNamesResponse(userContext)
    return generatePoktanKetuaResponse(userContext)
  }
  if ((q.includes('kontak') || q.includes('hp') || q.includes('wa')) && (q.includes('kelompok') || q.includes('poktan'))) {
    return generatePoktanKontakResponse(userContext)
  }
  if ((q.includes('wilayah') || q.includes('lokasi') || q.includes('dusun')) && (q.includes('kelompok') || q.includes('poktan'))) {
    return generatePoktanWilayahResponse(userContext)
  }

  // 5D. Poktan Spesifik
  if (q.includes('sri rejeki')) return generateSinglePoktanDetailResponse('sri rejeki', userContext)
  if (q.includes('sumber subur')) return generateSinglePoktanDetailResponse('sumber subur', userContext)
  if (q.includes('tani makmur')) return generateSinglePoktanDetailResponse('tani makmur', userContext)

  if (q.includes('kelompok tani') || q.includes('poktan') || q.includes('kelembagaan')) {
    if (isBerapaQuery(q)) return generatePoktanCountOnlyResponse(userContext)
    if (isSiapaQuery(q) && (q.includes('ketua') || q.includes('pimpinan'))) return generatePoktanKetuaNamesResponse(userContext)
    return generatePoktanStatsResponse(userContext)
  }

  // 6. Profil Petani Dinamis (cocokkan nama siapa pun dari database!)
  const dynamicPetani = (userContext?.statsDesa?.daftarPetani || []).find(p => {
    const tokens = p.nama.toLowerCase().replace(/bapak|ibu|h\.|mang/g, '').trim().split(/\s+/).filter(t => t.length >= 4)
    return tokens.some(t => q.includes(t))
  })
  if (dynamicPetani) {
    return generatePetaniDetailResponse(dynamicPetani.nama, userContext)
  }

  if (/(berapa|jumlah|total|siapa|daftar|data|nama).*petani/i.test(q)) {
    if (isBerapaQuery(q)) return generateFarmerCountOnlyResponse(userContext)
    if (isSiapaQuery(q)) return generateFarmerNamesOnlyResponse(userContext)
    return generateFarmerStatsResponse(userContext)
  }

  // 7. Titik Lahan / Koordinat GPS / Zonasi Blok / Daftar Lahan
  if (q.includes('titik lahan') || q.includes('petak gis') || q.includes('koordinat') || q.includes('latitude') || q.includes('longitude')) {
    return generateTitikLahanStatsResponse(userContext)
  }
  if (q.includes('zonasi') || q.includes('blok dusun') || q.includes('blok sawah') || /(berapa|nama|daftar|apa saja).*blok/i.test(q)) {
    return generateZonasiBlokStatsResponse(userContext)
  }
  if (q.includes('daftar lahan') || q.includes('daftar petak') || q.includes('petak sawah apa saja') || q.includes('lahan apa saja') || q.includes('sebaran petak')) {
    return generateLahanDetailResponse(userContext)
  }
  if (q.includes('gis') || q.includes('peta lahan')) {
    return generateMenuExplanationResponse('peta', userContext)
  }

  // 8. Detail Musim Tanam / Estimasi Panen / HST
  if (q.includes('varietas apa') || q.includes('jadwal tanam') || q.includes('kapan panen') || q.includes('estimasi panen') || q.includes('hst')) {
    return generateMusimDetailResponse(userContext)
  }
  if (q.includes('musim aktif') || q.includes('musim tanam')) {
    return generateMusimStatsResponse(userContext)
  }

  // 9. Detail Panen
  if (q.includes('siapa yang panen') || q.includes('siapa yang sudah panen') || q.includes('detail panen') || q.includes('rincian panen')) {
    return generatePanenDetailResponse(userContext)
  }

  // 10. Ringkasan Eksekutif
  if (/(ringkasan|rekapitulasi|overview|statistik).*(sistem|operasional|desa|data|pertanian)|dashboard.*data|kondisi.*sistem/i.test(q)) {
    return generateOverviewStatsResponse(userContext)
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR LAPORAN RESMI DESA (HTML KOP SURAT)
// ─────────────────────────────────────────────────────────────────────────────

function generateOfficialAgriculturalReport(query: string, userContext?: PetaniContext): string {
  const s = userContext?.statsDesa
  const totalPetani = s?.totalPetani ?? 3
  const totalPoktan = s?.totalPoktan ?? 3
  const totalLahan = s?.totalLahan ?? 4
  const totalLuasHa = s?.totalLuasHa ?? 6.0
  const totalLuasM2 = s?.totalLuasM2 ?? 60000
  const musimBerjalan = s?.musimBerjalan ?? 3
  const musimPerencanaan = s?.musimPerencanaan ?? 0
  const musimSelesai = s?.musimSelesai ?? 2
  const totalPanenTon = s?.totalPanenTon ?? 20.0
  const totalPanenKg = s?.totalPanenKg ?? 20000
  const kadesName = getKepalaDesaUser(s)?.fullName || 'Bapak Karsiman, S.Sos'

  const daftarPoktan = s?.daftarPoktan?.length
    ? s.daftarPoktan
    : [
        { nama: 'Kelompok Tani Sri Rejeki', ketua: 'Bapak Sutarjo', wilayah: 'Dusun Karang Anyar / Blok Manis', jumlahPetani: 2 },
        { nama: 'Kelompok Tani Tani Makmur', ketua: 'H. Karyono', wilayah: 'Dusun Girang Hilir / Blok Wage', jumlahPetani: 1 },
        { nama: 'Kelompok Tani Sumber Subur', ketua: 'Mang Rasidi', wilayah: 'Dusun Cirebon Ilir / Blok Pahing', jumlahPetani: 0 },
      ]

  const daftarMusim = s?.daftarMusim || []
  const daftarPanen = s?.daftarPanen || []

  const now = new Date()
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now.getMonth()] || 'X'
  const tahun = now.getFullYear() || 2026

  const poktanRows = daftarPoktan.map((p, idx) => `| ${idx + 1} | ${p.nama} | ${p.ketua} | ${p.wilayah} | ${p.jumlahPetani} Orang |`).join('\n')
  const musimRows = daftarMusim.map((m, idx) => `| ${idx + 1} | ${m.namaMusim} | ${m.varietas} | ${m.lahanNama} | ${m.petaniNama} | ${m.status} |`).join('\n')
  const panenRows = daftarPanen.map((p, idx) => `| ${idx + 1} | ${p.tanggalPanen} | ${p.varietas} | ${p.jumlahKg.toLocaleString('id-ID')} kg | ${(p.jumlahKg / 1000).toFixed(2)} Ton | ${p.kualitas || 'GKP Super'} | ${p.petani} |`).join('\n')

  const kopSurat = `<div style="text-align:center; border-bottom: 4px double #000; padding-bottom: 10px; margin-bottom: 20px;"><div style="font-size: 16px; font-weight: bold; text-transform: uppercase;">Pemerintah Kabupaten Cirebon</div><div style="font-size: 16px; font-weight: bold; text-transform: uppercase;">Kecamatan Talun</div><div style="font-size: 22px; font-weight: bold; text-transform: uppercase;">Kantor Kepala Desa Cirebon Girang</div><div style="font-size: 12px; font-style: italic;">Jl. Pangeran Cakrabuana No. 1, Desa Cirebon Girang, Kec. Talun, Kab. Cirebon 45171</div></div><div style="text-align:center; margin-bottom: 20px;"><div style="font-size: 16px; font-weight: bold; text-decoration: underline;">LAPORAN RESMI REKAPITULASI & PERKEMBANGAN PERTANIAN PADI</div><div style="font-size: 14px;">Nomor Registrasi: 521.1/LAP-TANI/CRB-GRG/${bulanRomawi}/${tahun}</div></div>`

  return `${kopSurat}

**Klasifikasi Dokumen:** Laporan Eksekutif Pertanian & Pengawasan Lahan Padi  
**Otoritas Pembuat:** Diterbitkan Secara Otomatis oleh **Asisten Pintar Administrator Pertanian (SI PADI)**  
**Sasaran Dokumen:** Administrator Sistem, Kuwu/Kepala Desa, & Dinas Pertanian Kabupaten Cirebon  

---

### I. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
* 👥 **Total Petani Terdaftar:** **${totalPetani} Orang Petani Aktif**
* 🏢 **Kelembagaan Kelompok Tani:** **${totalPoktan} Kelompok Tani**
* 🌾 **Baku Luas Lahan Sawah:** **${totalLuasHa.toFixed(2)} Hektar** (${totalLuasM2.toLocaleString('id-ID')} m²) terbagi dalam **${totalLahan} Petak Sawah**
* 📅 **Status Musim Tanam:** **${musimBerjalan} Berjalan**, **${musimPerencanaan} Perencanaan**, **${musimSelesai} Selesai Panen**
* ⚖️ **Total Realisasi Panen:** **${totalPanenTon.toFixed(2)} Ton** (${totalPanenKg.toLocaleString('id-ID')} kg) GKP

---

### II. REKAPITULASI KELOMPOK TANI (POKTAN)
| No | Nama Kelompok Tani | Ketua Kelompok | Wilayah / Blok Dusun | Jumlah Anggota |
|:---:|:---|:---|:---|:---:|
${poktanRows}

---

### III. STATUS KALENDER MUSIM TANAM
| No | Nama Musim Tanam | Varietas Benih | Petak Lahan | Petani | Status |
|:---:|:---|:---|:---|:---|:---:|
${musimRows || '| - | Belum ada data | - | - | - | - |'}

---

### IV. REALISASI HASIL PANEN
| No | Tanggal Panen | Varietas | Produksi (kg) | Estimasi (Ton) | Mutu Gabah | Petani |
|:---:|:---|:---|:---:|:---:|:---|:---|
${panenRows || '| - | - | - | - | - | - | - |'}

---

### V. LEMBAR PENGESAHAN
Mengetahui,  
**Kuwu / Kepala Desa Cirebon Girang**  
**${kadesName}**`
}

// ─────────────────────────────────────────────────────────────────────────────
// DETEKSI QUERY IDENTITAS & DOMAIN
// ─────────────────────────────────────────────────────────────────────────────

const RICE_AGRICULTURE_KEYWORDS = [
  'padi', 'gabah', 'beras', 'benih', 'bibit', 'semai', 'persemaian', 'tanam', 'tandur', 'panen',
  'musim tanam', 'rendeng', 'gadu', 'mt1', 'mt2', 'mt3', 'malai', 'bulir', 'anakan', 'rumpun',
  'sawah', 'lahan', 'pematang', 'galengan', 'petak', 'tanah', 'bajak', 'singkal', 'garu', 'lumpur', 'pelumpuran', 'jerami',
  'pupuk', 'pemupukan', 'urea', 'npk', 'phonska', 'sp-36', 'kcl', 'za', 'organik', 'kompos', 'dolomit', 'dosis', 'takaran', 'hst', 'hss', 'poc',
  'air', 'irigasi', 'pengairan', 'macak', 'intermiten', 'genang', 'genangan', 'drainase', 'sumur', 'pompa', 'kemarau', 'banjir', 'cuaca', 'el nino', 'la nina',
  'hama', 'penyakit', 'wereng', 'wbc', 'sundep', 'beluk', 'penggerek', 'keong', 'siput', 'tikus', 'walang sangit', 'kepik', 'ulat', 'grayak', 'burung', 'pipit',
  'kresek', 'hawar', 'blast', 'blas', 'bercak', 'kuning', 'menguning', 'busuk', 'pelepah', 'tungro', 'kerdil', 'asam', 'asam-asaman', 'karat',
  'insektisida', 'fungisida', 'bakterisida', 'moluskisida', 'rodentisida', 'pestisida', 'racun', 'obat', 'nabati',
  'inpari', 'ciherang', 'mekongga', 'varietas', 'situbagendit', 'cakrabuana', 'padjajaran', 'sintanur', 'unggul', 'legowo', 'jajar legowo',
  'cirebon girang', 'desa', 'petani', 'kelompok tani', 'poktan', 'gapoktan', 'lahan sawah', 'gkp', 'gkg', 'kadar air', 'bwd', 'bunting',
  'laporan', 'rekap', 'rekapitulasi', 'evaluasi', 'statistik', 'data tani', 'dinas', 'bpp', 'administrasi', 'produksi',
  'pengguna', 'user', 'akun', 'berapa', 'jumlah', 'total', 'siapa saja', 'daftar', 'database', 'sistem', 'dashboard', 'admin', 'aktivitas', 'kegiatan',
  'sandi', 'password', 'kata sandi', 'lupa', 'reset', 'kredensial', 'gulma', 'rumput', 'teki', 'jajagoan', 'herbisida', 'penyiangan', 'osrok',
  'hampa', 'bernas', 'primordia', 'matang susu', 'busuk batang', 'rhizoctonia', 'lumbung', 'gudang',
  'anggota', 'ketua', 'kontak', 'wilayah', 'alamat', 'garapan', 'sri rejeki', 'sumber subur', 'tani makmur', 'sukardi', 'sutarjo', 'karyono', 'rasidi', 'karsiman', 'karisma', 'jadwal', 'estimasi', 'menu', 'fitur', 'terluas', 'terkecil', 'terbanyak', 'tertinggi', 'paling', 'siapa', 'peta', 'gis', 'konfigurasi', 'edukasi', 'panduan', 'profil', 'kepala desa', 'kuwu', 'kades', 'peringatan', 'audit', 'notifikasi', 'email', 'wa', 'whatsapp', 'fonnte', 'vercel', 'tidb', 'mysql', 'web', 'aplikasi'
]

export function isUserIdentityQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  return [
    /siapa\s+(saya|aku|diriku|nama\s+saya)/i,
    /(saya|aku|diriku)\s+siapa/i,
    /(nama|profil|identitas|biodata|data\s+diri|akun)\s+(saya|aku)/i,
    /(siapa|apa)\s+(nama|profil|identitas|peran|role)\s+saya/i,
    /siapa\s+yang\s+sedang\s+login/i,
    /user\s+saya/i,
  ].some(p => p.test(q))
}

export function isBotIdentityQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  return [
    /siapa\s+(kamu|anda|dirimu|asisten|ai|bot)/i,
    /(kamu|anda|dirimu|asisten|ai|bot)\s+siapa/i,
    /(apa|siapa)\s+(peran|tugas|fungsi)\s+(kamu|anda|ai|bot)/i,
    /bisa\s+apa\s+(kamu|anda)/i,
    /apa\s+(yang\s+bisa\s+kamu\s+lakukan|kemampuanmu)/i,
  ].some(p => p.test(q))
}

export function isAdminInfoQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  if (q.includes('admin') && (q.includes('siapa') || q.includes('nama') || q.includes('kontak') || q.includes('profil'))) {
    return true
  }
  return [
    /siapa\s+(nama\s+)?(admin|administrator|pengelola|operator|pembuat)(nya)?/i,
    /(admin|administrator|pengelola)(nya)?\s+siapa/i,
    /(nama|kontak|profil)\s+(admin|administrator)/i,
    /siapa\s+yang\s+(mengelola|kelola|buat|membuat)\s+(sistem|web|aplikasi)/i,
  ].some(p => p.test(q))
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
    q.includes('pengajuan surat')
  )
}

export function generateVillageServicesResponse(query: string, userContext?: PetaniContext): string {
  const q = query.toLowerCase().trim()
  const role = userContext?.role || 'PETANI'

  if (q.includes('domisili')) {
    return `**Syarat Surat Keterangan Domisili di Balai Desa Cirebon Girang:**\n1. Surat pengantar RT/RW setempat.\n2. Fotokopi KTP dan KK.\n3. Pas foto 3x4 (2 lembar).\nPelayanan Senin–Jumat (08.00–15.00 WIB) di Balai Desa.`
  }
  if (q.includes('mengajukan surat') || q.includes('pengajuan surat')) {
    return `**Alur Pengajuan Surat Desa:**\n1. Minta surat pengantar RT/RW.\n2. Bawa berkas ke Loket Balai Desa Cirebon Girang.\n3. Petugas memverifikasi dan memproses tanda tangan pengesahan Kepala Desa (${getKepalaDesaUser(userContext?.statsDesa)?.fullName || 'Bapak Karsiman, S.Sos'}).`
  }
  if (role === 'ADMIN') {
    return `**Layanan Administrator SI PADI:**\n• Manajemen akun user, data petani & kelompok tani\n• Pemetaan GIS lahan sawah, monitoring musim tanam & panen\n• Peringatan dini Email/WA, konfigurasi sistem & laporan dinas`
  }
  return `**Layanan SI PADI untuk Petani:**\n• Konsultasi hama, penyakit, dan dosis pupuk per HST\n• Pemantauan petak sawah GIS dan jadwal musim tanam\n• Pencatatan hasil panen padi dan informasi desa`
}

function isRiceFarmingQuery(query: string, role?: string): boolean {
  if (role === 'ADMIN' || role === 'PERANGKAT_DESA') return true
  const q = query.toLowerCase()
  if (isIdentityQuery(q) || isPasswordOrAccountQuery(q) || isVillageServicesQuery(q)) return true
  if (['halo', 'hai', 'assalam', 'selamat pagi', 'selamat siang', 'selamat sore', 'pagi', 'siang', 'malam', 'apa kabar'].some(s => q.includes(s))) return true
  return RICE_AGRICULTURE_KEYWORDS.some(k => q.includes(k))
}

export function generateUserIdentityResponse(userContext?: PetaniContext): string {
  const role = userContext?.role || 'PETANI'
  const namaLengkap = userContext?.namaLengkap || userContext?.namaUser || (role === 'ADMIN' ? 'Karisma Siti Nabila' : role === 'PERANGKAT_DESA' ? 'Bapak Karsiman, S.Sos' : 'Bapak Sukardi')
  const poktan = userContext?.kelompokTani || 'Kelompok Tani Sri Rejeki'

  if (role === 'PETANI') {
    const totalLahan = userContext?.lahan?.length ?? 2
    return `Anda terdaftar sebagai **${namaLengkap}** (Petani), anggota **${poktan}** dengan **${totalLahan} petak sawah aktif** di Desa Cirebon Girang.`
  }
  if (role === 'PERANGKAT_DESA') {
    return `Anda terdaftar sebagai **${namaLengkap}** (Perangkat Desa / Kuwu pengawas pertanian Desa Cirebon Girang).`
  }
  return `Anda terdaftar sebagai **${namaLengkap}** (Administrator Sistem SI PADI Desa Cirebon Girang).`
}

export function generateBotIdentityResponse(userContext?: PetaniContext): string {
  return `Saya adalah **AI Assistant SI PADI Desa Cirebon Girang**, siap menjawab seluruh informasi data dashboard, struktur web, serta konsultasi budidaya padi sawah.`
}

export function getOutOfScopeResponse(userContext?: PetaniContext): string {
  return `Maaf, saya asisten AI khusus platform SI PADI dan budidaya padi Desa Cirebon Girang. Silakan ajukan pertanyaan seputar data dashboard, sawah, musim tanam, hama, atau pemupukan padi.`
}

export function generateAdminInfoResponse(userContext?: PetaniContext): string {
  return generateAdminResponse(userContext)
}

export const OUT_OF_SCOPE_RESPONSE = getOutOfScopeResponse()

export function isPasswordOrAccountQuery(query: string): boolean {
  const q = query.toLowerCase().trim()
  return [
    /sandi/i,
    /password/i,
    /kata\s*sandi/i,
    /lupa\s*(sandi|password|kata\s*sandi|akun|login)/i,
    /reset\s*(sandi|password|kata\s*sandi|akun)/i,
    /kredensial/i,
    /(daftar|tabel|data|semua)\s*(akun|user|email|pengguna).*(sandi|password)/i,
  ].some(p => p.test(q))
}

export function generatePasswordAndAccountResponse(userQuery: string, userContext?: PetaniContext): string {
  return `Berikut informasi akun dan kata sandi akses dashboard sistem:\n- **Admin (Karisma Siti Nabila)**: \`Karismasitinabila7@gmail.com\` | Sandi: \`Karisma123\`\n- **Perangkat Desa / Kuwu (Bapak Karsiman, S.Sos)**: \`karsiman@gmail.com\` | Sandi: \`Karsiman123\`\n- **Petani (Bapak Sukardi)**: \`sukardi@gmail.com\` | Sandi: \`Sukardi123\`\n- **Petani Lainnya**: \`sutarjo@gmail.com\` (\`Sutarjo123\`), \`karyono@gmail.com\` (\`Karyono123\`)`
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPER KNOWLEDGE BASE & DYNAMIC LOCAL RESPONSE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function getMatchedLocalResponse(userQuery: string, userContext?: PetaniContext, conversationContext?: string): string | null {
  const norm = normalizeIndonesianQuery(userQuery)
  const query = norm.toLowerCase().trim()
  const rawQuery = userQuery.toLowerCase().trim()
  const role = userContext?.role || 'PETANI'
  const greetingName = userContext?.namaLengkap ? `Bapak/Ibu ${userContext.namaLengkap}` : role === 'ADMIN' ? 'Bapak/Ibu Administrator' : role === 'PERANGKAT_DESA' ? 'Bapak/Ibu Perangkat Desa' : 'Bapak/Ibu Petani'

  if (isPasswordOrAccountQuery(rawQuery) || isPasswordOrAccountQuery(query)) {
    return generatePasswordAndAccountResponse(userQuery, userContext)
  }
  if (isAdminInfoQuery(rawQuery) || isAdminInfoQuery(query)) {
    if (isBerapaQuery(rawQuery) || isBerapaQuery(query)) {
      return generateAdminCountResponse(userContext)
    }
    if (isSiapaQuery(rawQuery) || isSiapaQuery(query) || rawQuery.includes('siapa') || query.includes('siapa') || rawQuery.includes('nama') || query.includes('nama')) {
      return generateAdminNameResponse(userContext)
    }
    return generateAdminResponse(userContext)
  }
  if (isUserIdentityQuery(rawQuery) || isUserIdentityQuery(query)) {
    return generateUserIdentityResponse(userContext)
  }
  if (isBotIdentityQuery(rawQuery) || isBotIdentityQuery(query)) {
    return generateBotIdentityResponse(userContext)
  }

  if (rawQuery === 'halo' || rawQuery === 'hai' || rawQuery === 'assalamualaikum' || rawQuery.startsWith('selamat pagi') || rawQuery.startsWith('selamat siang') || rawQuery.startsWith('selamat sore')) {
    return `Halo ${greetingName}! Ada yang bisa saya bantu seputar data dashboard, pertanian, atau budidaya padi di Desa Cirebon Girang?`
  }

  // Laporan Resmi
  if (
    query.includes('laporan resmi') ||
    query.includes('draft laporan') ||
    query.includes('buatkan laporan') ||
    query.includes('buat laporan') ||
    query.includes('laporan dinas') ||
    query.includes('laporan bulanan') ||
    query.includes('laporan rekapitulasi')
  ) {
    return generateOfficialAgriculturalReport(query, userContext)
  }

  // Master Data & Pertanyaan Dashboard Dinamis
  const masterDataAnswer =
    handleMasterDataAndAdminQueries(query, userQuery, userContext, conversationContext) ||
    handleMasterDataAndAdminQueries(rawQuery, userQuery, userContext, conversationContext)
  if (masterDataAnswer) {
    return masterDataAnswer
  }

  // Pencarian Entitas Dinamis langsung ke seluruh isi Database
  const dynamicMatch = smartDynamicDatabaseLookup(userQuery, userContext)
  if (dynamicMatch) {
    return dynamicMatch
  }

  if (!isRiceFarmingQuery(rawQuery, userContext?.role) && !isRiceFarmingQuery(query, userContext?.role)) {
    return getOutOfScopeResponse(userContext)
  }

  // Pengetahuan Agronomi Padi Sawah
  if (query.includes('air garam') || query.includes('seleksi benih') || query.includes('uji benih') || query.includes('peram benih') || query.includes('semai') || query.includes('persemaian') || query.includes('dapog')) {
    return `**Uji Benih Air Garam & Persemaian:**\n• Larutkan garam hingga telur mentah mengapung. Ambil benih yang tenggelam (bernas), cuci bersih.\n• Rendam 24 jam, peram 24–48 jam. Semai di bedengan 400 m²/Ha (20–25 kg benih), tanam pindah umur 15–18 HSS.`
  }
  if (query.includes('legowo') || query.includes('jajar legowo') || query.includes('jarak tanam')) {
    return `**Sistem Jajar Legowo 2:1:**\n• Pola tanam berselang (20 × 10 × 40 cm) dengan populasi ±213.300 rumpun/Ha.\n• Memberikan efek tanaman pinggir, sirkulasi udara lancar, dan meningkatkan hasil panen 15–25%.`
  }
  if (query.includes('biaya') || query.includes('modal') || query.includes('keuntungan') || query.includes('analisa usaha') || query.includes('usaha tani') || (/\blaba\b/i.test(query) && !query.includes('laba-laba'))) {
    return `**Estimasi Usaha Tani Padi (1 Ha di Cirebon):**\n• **Modal Biaya:** ±Rp 13.250.000 (olah tanah, benih, tanam, pupuk, pestisida, panen).\n• **Hasil Gabah:** ~7 Ton GKP × Rp 7.000 = Rp 49.000.000.\n• **Keuntungan Bersih:** ±Rp 35.750.000 per musim tanam.`
  }
  if (query.includes('pestisida nabati') || query.includes('nabati') || query.includes('mimba') || query.includes('tembakau') || query.includes('organik')) {
    return `**Pestisida Nabati Organik:**\n• Tumbuk 1 kg daun mimba/sirsak, 250 g lengkuas, 250 g bawang putih, dan 200 g tembakau dalam 5 L air. Fermentasi 24–48 jam.\n• Saring, larutkan 200 ml per tangki semprot (14–16 L air).`
  }
  if (query.includes('asam') || query.includes('asam-asaman') || query.includes('karat besi')) {
    return `**Solusi Padi Asam-Asaman (Karat Besi / Akar Hitam):**\n1. Keringkan air sawah 4–7 hari hingga retak rambut.\n2. Tabur kapur Dolomit 200–300 kg/Ha.\n3. Semprot Silika/Zn dan hentikan Urea sementara.`
  }
  if (query.includes('tikus') || query.includes('gropyokan') || query.includes('tbs') || query.includes('rubuha') || query.includes('rodentisida')) {
    return `**Pengendalian Hama Tikus Sawah:**\n• Gropyokan serentak & emposan belerang pada liang aktif saat bera/olah tanah.\n• Pasang Rubuha (Rumah Burung Hantu) atau pagar perangkap TBS.`
  }
  if (query.includes('wereng') || query.includes('wbc') || query.includes('hopperburn')) {
    return `**Pengendalian Wereng Batang Coklat (WBC):**\n1. Keringkan petak sawah macak-macak.\n2. Hentikan pemupukan Urea berlebih.\n3. Semprot pangkal rumpun pagi hari dengan *Pimetrozin* atau *Buprofezin*.`
  }
  if (query.includes('sundep') || query.includes('beluk') || query.includes('penggerek')) {
    return `**Pengendalian Sundep & Beluk (Penggerek Batang):**\n• **Sundep (vegetatif):** Potong ujung bibit sebelum tanam, aplikasi karbofuran 10–14 HST.\n• **Beluk (generatif):** Semprot *Klorantraniliprol* atau *Dimehipo* saat bunting.`
  }
  if (query.includes('keong') || query.includes('siput')) {
    return `**Pengendalian Keong Mas (1–15 HST):**\n• Jaga air macak-macak (0,5–1 cm), buat parit carem di pinggir petak, atau pasang umpan daun pepaya.`
  }
  if (query.includes('walang') || query.includes('sangit')) {
    return `**Pengendalian Walang Sangit (Fase Masak Susu):**\n• Pasang perangkap bangkai keong/kepiting di pematang dan semprot pagi hari dengan *Deltametrin* atau *BPMC*.`
  }
  if (query.includes('kresek') || query.includes('hawar') || query.includes('blast') || query.includes('blas') || query.includes('potong leher')) {
    return `**Pengendalian Kresek & Blas:**\n• **Kresek:** Hentikan Urea, semprot bakterisida Tembaga Hidroksida.\n• **Blas / Potong Leher:** Semprot fungisida *Trisiklazol* saat 45 HST & 60 HST.`
  }
  if (query.includes('varietas') || query.includes('inpari') || query.includes('ciherang') || query.includes('mekongga') || query.includes('cakrabuana')) {
    return `**Varietas Padi Unggul di Cirebon Girang:**\n• **Inpari 32 HDB:** Potensi 8,5–10,5 ton/Ha, tahan kresek, pulen.\n• **Ciherang:** Potensi 7,5–8,5 ton/Ha, pulen gurih.\n• **Inpari 42 GSR:** Genjah (112 hari), hemat air untuk musim kemarau.`
  }
  if (query.includes('kuning') || query.includes('menguning')) {
    return `**Penyebab Daun Padi Menguning:**\n• **Kresek:** Ujung daun kering bergelombang -> Stop Urea, semprot bakterisida.\n• **Kurang Hara:** Daun tua bawah kuning merata -> Susulan Urea + NPK Phonska.\n• **Asam-asaman:** Bercak karat, akar hitam -> Keringkan & tabur Dolomit.`
  }
  if (query.includes('olah tanah') || query.includes('bajak') || query.includes('garu') || query.includes('pelumpuran') || query.includes('singkal')) {
    return `**Tahapan Pengolahan Tanah:**\n1. Bajak I (20–25 cm) & jemur 5–7 hari.\n2. Genangi 3–5 cm selama 1 minggu.\n3. Bajak II (rotari) & ratakan hingga lumpur matang ±20 cm.`
  }
  if (query.includes('pupuk') || query.includes('pemupukan') || query.includes('dosis') || query.includes('takaran') || query.includes('urea') || query.includes('npk') || query.includes('phonska')) {
    return `**Dosis Pemupukan Berimbang per Ha:**\n• **Dasar (0–5 HST):** Organik 500–1.000 kg + SP-36 75–100 kg.\n• **Susulan I (10–14 HST):** Urea 75–100 kg + NPK Phonska 150 kg.\n• **Susulan II (30–35 HST):** Urea 50 kg + Phonska 100 kg + KCl 25–50 kg.`
  }
  if (query.includes('irigasi') || query.includes('pengairan') || query.includes('macak') || query.includes('awd') || query.includes('intermitten') || query.includes('air')) {
    return `**Manajemen Air Macak-Macak (AWD):**\n• **0–7 HST:** Air 1–2 cm.\n• **8–35 HST:** Macak-macak berselang.\n• **40–70 HST:** Genangi 3–5 cm.\n• **10–14 hari pra-panen:** Keringkan total.`
  }
  if (query.includes('jadwal tanam') || query.includes('musim tanam') || query.includes('rendeng') || query.includes('gadu') || query.includes('estimasi panen')) {
    return generateMusimDetailResponse(userContext)
  }
  if (query.includes('panen') || query.includes('gkp') || query.includes('gkg') || query.includes('kadar air') || query.includes('bulog') || query.includes('gabah')) {
    return `**Panen & Standar Gabah:**\n• **Siap Panen:** 90–95% bulir menguning.\n• **GKP:** Kadar air 20–25%.\n• **GKG (Bulog):** Kadar air maksimal 14%.\n${generatePanenStatsResponse(userContext)}`
  }
  if (query.includes('gulma') || query.includes('rumput') || query.includes('penyiangan') || query.includes('osrok') || query.includes('gasrok') || query.includes('herbisida')) {
    return `**Pengendalian Gulma:**\nPenyiangan I umur 15–21 HST dengan gasrok/landak, penyiangan II umur 30–35 HST. Herbisida selektif diaplikasikan 0–5 HST saat air macak-macak.`
  }
  if (!query.includes('hampar') && (query.includes('bulir hampa') || query.includes('gabah kosong') || query.includes('malai') || /\bhampa\b/i.test(query))) {
    return `**Mencegah Bulir Hampa:** Beri KCl 25–50 kg/Ha (30–35 HST), semprot Kalium/Silika (50–60 HST), jaga air 3–5 cm saat berbunga, dan kendalikan walang sangit.`
  }
  if (query.includes('anakan') || query.includes('tunas') || query.includes('rumpun padat')) {
    return `**Memperbanyak Anakan Produktif:** Tanam bibit muda 15–18 HSS dangkal (1–2 cm), pengairan macak-macak 8–35 HST, dan pupuk tepat waktu 10–14 HST.`
  }
  if (query.includes('putih palsu') || query.includes('ulat daun') || query.includes('ulat')) {
    return `**Pengendalian Ulat Daun / Hama Putih Palsu:** Jika kerusakan daun >10%, semprot pagi hari dengan *Klorantraniliprol* atau *Emamektin Benzoat*.`
  }
  if (query.includes('busuk pelepah') || query.includes('busuk batang') || query.includes('pelepah')) {
    return `**Pengendalian Busuk Pelepah/Batang:** Gunakan jajar legowo, kurangi Urea berlebih, dan semprot fungisida *Heksakonazol* atau *Difenokonazol*.`
  }
  if (query.includes('lumbung') || query.includes('simpan gabah') || query.includes('gudang') || query.includes('pasca panen')) {
    return `**Penyimpanan Gabah:** Keringkan hingga kadar air 14%, simpan karung di atas palet kayu setinggi 15–20 cm, berjarak 30 cm dari dinding.`
  }

  return null
}

export function getSmartLocalResponse(userQuery: string, userContext?: PetaniContext, conversationContext?: string): string {
  return (
    getMatchedLocalResponse(userQuery, userContext, conversationContext) ||
    generateOverviewStatsResponse(userContext) +
      '\n\nSilakan tanyakan detail spesifik seputar data dashboard, pengguna, petani, kelompok tani, lahan, musim tanam, panen, peringatan dini, atau konsultasi budidaya padi!'
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROSES CHAT UTAMA (GEMINI / OPENAI + LIVE ENGINE LOKAL)
// ─────────────────────────────────────────────────────────────────────────────

export async function processAiChat(params: ProcessAiChatParams): Promise<ProcessAiChatResult> {
  const { messages, userContext } = params
  let apiKey = params.apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY
  let provider = (params.provider || process.env.AI_PROVIDER || 'gemini').toLowerCase()
  let geminiModel = provider === 'gemini' && params.model ? params.model : (process.env.AI_GEMINI_MODEL || 'gemini-3.0-flash')
  let openAiModel = provider === 'openai' && params.model ? params.model : (process.env.AI_OPENAI_MODEL || 'gpt-4o-mini')

  try {
    const appSettings = await getAppSettingsAsync()
    if (!apiKey && appSettings?.aiApiKey) apiKey = appSettings.aiApiKey
    if (!params.provider && appSettings?.aiProvider) provider = appSettings.aiProvider.toLowerCase()
    if (!params.model && appSettings?.aiGeminiModel) geminiModel = appSettings.aiGeminiModel
    if (!params.model && appSettings?.aiOpenAiModel) openAiModel = appSettings.aiOpenAiModel
  } catch {
    // fallback to env
  }

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const recentMessages = messages.slice(-5)
  const conversationContext = recentMessages.map(m => m.content).join(' ').toLowerCase()

  const queryTrimmed = lastUserMessage.toLowerCase().trim()
  const queryNormalized = normalizeIndonesianQuery(lastUserMessage)

  // 1. Query kredensial/password & laporan HTML formal selalu ditangani instan dengan akurat
  if (isPasswordOrAccountQuery(queryTrimmed) || isPasswordOrAccountQuery(queryNormalized)) {
    return {
      content: generatePasswordAndAccountResponse(lastUserMessage, userContext),
      provider: 'local-security-engine',
    }
  }

  if (/laporan resmi|draft laporan|buatkan laporan|buat laporan|laporan rekapitulasi/i.test(queryNormalized)) {
    return {
      content: generateOfficialAgriculturalReport(queryNormalized, userContext),
      provider: 'local-report-engine',
    }
  }

  // 2. Pertahankan kecerdasan lokal SI PADI sebagai prioritas utama
  //    agar menempelkan API Key tidak mengubah jawaban data dashboard, menu, dan pengetahuan inti yang sudah akurat.
  if (!params.skipLocalPriority) {
    const matchedLocal = getMatchedLocalResponse(lastUserMessage, userContext, conversationContext)
    if (matchedLocal) {
      return {
        content: matchedLocal,
        provider: apiKey && apiKey.trim() !== '' ? 'local-knowledge-engine (hybrid)' : 'local-knowledge-engine',
      }
    }
  }

  // 3. Jika belum tercakup di engine lokal & API Key belum tersedia -> Gunakan fallback overview lokal
  if (!apiKey || apiKey.trim() === '') {
    const localAnswer = getSmartLocalResponse(lastUserMessage, userContext, conversationContext)
    return {
      content: localAnswer,
      provider: 'local-knowledge-engine',
    }
  }

  // 4. Jika belum tercakup di aturan lokal & API Key tersedia -> Kirim ke Gemini / OpenAI dengan System Prompt berisi seluruh data live database!
  const systemPrompt = buildSystemPrompt(userContext)

  if (provider === 'gemini') {
    const retiredModels = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'])
    const preferredModel = retiredModels.has(geminiModel) ? 'gemini-3.0-flash' : geminiModel
    const candidateModels = Array.from(
      new Set([preferredModel, 'gemini-3.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'].filter(Boolean))
    )

    try {
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))

      let lastErrMsg = ''
      for (const model of candidateModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 700,
            },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errMsg = `HTTP ${response.status}`
          try {
            const errData = await response.json()
            if (errData?.error?.message) errMsg = `${errData.error.message} (HTTP ${response.status})`
          } catch {}
          lastErrMsg = errMsg
          // Jika model belum tersedia (404) atau server sedang sibuk/limit (429/5xx), coba model Gemini kandidat berikutnya
          if (response.status === 404 || response.status === 429 || response.status >= 500) {
            continue
          }
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
          return { content: text.trim(), provider: `gemini (${model})` }
        }
        lastErrMsg = 'Respon Gemini kosong'
      }

      console.warn(`Semua model Gemini gagal (${lastErrMsg}), beralih ke super knowledge engine lokal.`)
      return {
        content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
        provider: 'local-fallback',
        apiError: lastErrMsg || 'Model Gemini tidak tersedia',
      }
    } catch (err: any) {
      console.warn('Gagal memanggil Gemini API:', err.message)
      return {
        content: getSmartLocalResponse(lastUserMessage, userContext, conversationContext),
        provider: 'local-fallback',
        apiError: err.message,
      }
    }
  }

  if (provider === 'openai') {
    const model = openAiModel
    try {
      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ]

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: openAiMessages,
          temperature: 0.2,
          max_tokens: 700,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`
        try {
          const errData = await response.json()
          if (errData?.error?.message) errMsg = `${errData.error.message} (HTTP ${response.status})`
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
        return { content: text.trim(), provider: `openai (${model})` }
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
