import Link from 'next/link'
import {
  Sprout,
  Tractor,
  Building2,
  Shield,
  ArrowRight,
  MapPin,
  Wheat,
  Bot,
  BarChart3,
  CheckCircle2,
  Layers,
  ChevronRight,
  Sparkles,
  Compass,
  CloudSun,
  BookOpen
} from 'lucide-react'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const metadata = {
  title: 'SI PADI | Sistem Informasi Pertanian Padi Desa Cirebon Girang',
  description:
    'Platform terpadu digitalisasi pertanian padi Desa Cirebon Girang untuk Petani, Perangkat Desa, dan Administrator.',
}

export default async function HomePage() {
  const session = await getSession()

  // Ambil statistik real-time dari database
  const [totalPetani, totalPoktan, totalLahan, totalProduksiObj] = await Promise.all([
    prisma.petani.count().catch(() => 0),
    prisma.kelompokTani.count().catch(() => 0),
    prisma.lahan.count().catch(() => 0),
    prisma.panen.aggregate({ _sum: { jumlahProduksi: true } }).catch(() => ({ _sum: { jumlahProduksi: 0 } }))
  ])

  const totalProduksiKg = totalProduksiObj._sum.jumlahProduksi || 0
  const totalProduksiTon = (totalProduksiKg / 1000).toFixed(1)

  // Redirect target jika sudah login
  let loggedInUrl = '/login'
  if (session) {
    if (session.role === 'ADMIN') loggedInUrl = '/admin'
    else if (session.role === 'PERANGKAT_DESA') loggedInUrl = '/desa'
    else loggedInUrl = '/petani'
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-800 flex flex-col font-sans selection:bg-emerald-200">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition">
              <Sprout size={22} />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 tracking-tight text-lg block leading-none">
                SI PADI
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">
                Desa Cirebon Girang
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fitur" className="hover:text-emerald-700 transition">Fitur Utama</a>
            <a href="#peran" className="hover:text-emerald-700 transition">Akses 3 Peran</a>
            <a href="#statistik" className="hover:text-emerald-700 transition">Statistik Desa</a>
            <a href="#ai-asisten" className="hover:text-emerald-700 transition flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Sparkles size={14} /> AI Pertanian
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={loggedInUrl}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
              >
                <span>Buka Dashboard ({session.role.replace('_', ' ')})</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <span>Masuk ke Sistem</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badges */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Sistem Informasi Pertanian & Manajemen Budidaya Padi
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
              Digitalisasi Pertanian Padi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700">
                Desa Cirebon Girang
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed">
              Platform komprehensif terpadu untuk pendataan lahan sawah, penjadwalan musim tanam padi,
              rekapitulasi panen kelompok tani, dan konsultasi cerdas berbasis AI untuk <strong>Petani</strong>,{' '}
              <strong>Perangkat Desa</strong>, dan <strong>Administrator</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-sm transition"
              >
                <span>Masuk ke Portal Login</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#peran"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-3.5 rounded-xl border border-gray-300 text-sm shadow-xs transition"
              >
                <span>Lihat Panduan 3 Dashboard</span>
              </a>
            </div>

            {/* Micro details */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Login Mandiri per Role
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Rekap Data Kelompok Tani
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Asisten Cerdas AI Konsultasi Padi
              </span>
            </div>
          </div>

          {/* ── Live Stats Counter ── */}
          <div id="statistik" className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs text-center">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 block">
                {totalPetani > 0 ? totalPetani : '15+'}
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 block">
                Petani Terdaftar
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs text-center">
              <span className="text-3xl sm:text-4xl font-black text-green-700 block">
                {totalPoktan > 0 ? totalPoktan : '3'}
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 block">
                Kelompok Tani Desa
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs text-center">
              <span className="text-3xl sm:text-4xl font-black text-teal-700 block">
                {totalLahan > 0 ? totalLahan : '25+'}
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 block">
                Petak Sawah Aktif
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs text-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-600 block">
                {totalProduksiKg > 0 ? `${totalProduksiTon} Ton` : '20+ Ton'}
              </span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1 block">
                Produksi Panen Gabah
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Gradient Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      </section>

      {/* ── 3 Role Portal Section ── */}
      <section id="peran" className="py-16 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
              Akses Terpadu Multi-Peran
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              3 Dashboard Khusus Sesuai Tanggung Jawab
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Sistem memisahkan alur kerja untuk Petani, Perangkat Desa, dan Administrator secara terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Dashboard Petani */}
            <div className="bg-[#f0fdf4] rounded-2xl p-6 border border-emerald-200/80 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20">
                  <Tractor size={24} />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Role: PETANI
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Dashboard Petani</h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Dikhususkan untuk petani sawah mandiri atau anggota Poktan. Mengelola data petak lahan pribadi,
                  mencatat musim tanam, input aktivitas pemupukan harian, mencatat hasil panen, serta konsultasi AI.
                </p>

                <div className="bg-white/80 rounded-xl p-3 border border-emerald-200 text-xs text-gray-700 space-y-1.5 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Demo:</span>
                    <strong className="font-mono text-emerald-800">sukardi@gmail.com</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kata Sandi:</span>
                    <strong className="font-mono text-emerald-800">Sukardi123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tujuan URL:</span>
                    <span className="font-mono text-gray-600">/petani</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
              >
                <span>Masuk Dashboard Petani</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 2. Dashboard Perangkat Desa */}
            <div className="bg-[#f0f9ff] rounded-2xl p-6 border border-sky-200/80 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-md shadow-sky-600/20">
                  <Building2 size={24} />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Role: PERANGKAT_DESA
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Dashboard Perangkat Desa</h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Dikhususkan untuk Kepala Desa dan Kaur Ekbang. Memantau sebaran luas lahan per blok,
                  rekapitulasi seluruh kelompok tani, grafik status musim tanam, prediksi panen 30 hari ke depan, dan total produksi gabah desa.
                </p>

                <div className="bg-white/80 rounded-xl p-3 border border-sky-200 text-xs text-gray-700 space-y-1.5 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Demo:</span>
                    <strong className="font-mono text-sky-800">karsiman@gmail.com</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kata Sandi:</span>
                    <strong className="font-mono text-sky-800">Karsiman123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tujuan URL:</span>
                    <span className="font-mono text-gray-600">/desa</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
              >
                <span>Masuk Dashboard Desa</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* 3. Dashboard Admin */}
            <div className="bg-[#faf5ff] rounded-2xl p-6 border border-purple-200/80 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-600/20">
                  <Shield size={24} />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Role: ADMIN
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Dashboard Administrator</h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Dikhususkan untuk admin teknis sistem desa. Kontrol penuh CRUD: Kelola Master Petani & Akun Pengguna,
                  Kelompok Tani, Seluruh Petak Lahan Desa, Musim Tanam, Log Aktivitas Budidaya, Panen, dan Riwayat Audit.
                </p>

                <div className="bg-white/80 rounded-xl p-3 border border-purple-200 text-xs text-gray-700 space-y-1.5 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email Demo:</span>
                    <strong className="font-mono text-purple-800">Karismasitinabila7@gmail.com</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kata Sandi:</span>
                    <strong className="font-mono text-purple-800">Karisma123</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tujuan URL:</span>
                    <span className="font-mono text-gray-600">/admin</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
              >
                <span>Masuk Dashboard Admin</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fitur Unggulan ── */}
      <section id="fitur" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">
              Solusi Digital Lengkap
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
              Fitur Lengkap Platform SI PADI
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Dirancang sesuai kebutuhan riil pertanian padi di Desa Cirebon Girang, Kecamatan Talun, Cirebon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Peta GIS Lahan */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-200/90 shadow-2xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Compass size={20} />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-2">
                Fitur Unggulan GIS
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Peta Interaktif Lahan Sawah</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pemetaan geospasial titik lahan di Desa Cirebon Girang dengan citra satelit Esri, batas blok sawah (Manis, Wage, Pahing), dan info pemilik serta varietas padi.
              </p>
            </div>

            {/* 2. Prediksi Cuaca & Agroklimat */}
            <div className="bg-white p-6 rounded-2xl border border-teal-200/90 shadow-2xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <CloudSun size={20} />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase mb-2">
                Parameter Pertanian
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Widget Cuaca & Rekomendasi Tani</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pemantauan suhu, kelembapan, kecepatan angin, curah hujan, serta rekomendasi harian otomatis untuk waktu pemupukan, penyemprotan, dan pengeringan gabah.
              </p>
            </div>

            {/* 3. Pusat Edukasi Tani */}
            <div className="bg-white p-6 rounded-2xl border border-blue-200/90 shadow-2xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <BookOpen size={20} />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase mb-2">
                Basis Pengetahuan
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Pusat Informasi & Edukasi Tani</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Panduan praktis budidaya padi, teknik penanggulangan hama wereng batang coklat (WBC), dosis pemupukan berimbang, sistem jajar legowo, dan penanganan pascapanen.
              </p>
            </div>

            {/* 4. Manajemen Musim Tanam */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Sprout size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Manajemen Musim Tanam</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pelacakan varietas unggul (Inpari 32, Ciherang, Sintanur), tanggal tanam, tahapan budidaya, dan estimasi waktu panen otomatis per petak sawah.
              </p>
            </div>

            {/* 5. Rekapitulasi Panen */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-4">
                <Wheat size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-base mb-2">Rekapitulasi Panen & Produksi</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pencatatan hasil gabah kering panen, produktivitas per hektar tiap kelompok tani, serta rekapitulasi capaian ketahanan pangan desa.
              </p>
            </div>

            {/* 6. AI Asisten */}
            <div id="ai-asisten" className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center mb-4 border border-emerald-400/30">
                <Bot size={20} />
              </div>
              <h4 className="font-bold text-white text-base mb-2">AI Asisten Budidaya Padi</h4>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Konsultasi gejala hama wereng coklat, sundep/beluk, takaran pupuk berimbang, dan diagnosis masalah tanaman padi Desa Cirebon Girang 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-gray-900 text-gray-300 text-xs py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Sprout size={18} />
            </div>
            <div>
              <p className="font-bold text-white">Platform Pertanian Padi Desa Cirebon Girang</p>
              <p className="text-gray-400 text-[11px]">Kecamatan Talun, Kabupaten Cirebon, Jawa Barat</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span>Sistem Informasi Tugas Akhir</span>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-emerald-400 transition">
              Masuk ke Sistem
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
