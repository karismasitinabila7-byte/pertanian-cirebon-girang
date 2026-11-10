import Link from 'next/link'
import { Sprout, ArrowRight, CheckCircle2 } from 'lucide-react'
import { getSession } from '@/lib/session'

export const metadata = {
  title: 'SI PADI | Sistem Informasi Pertanian Padi Desa Cirebon Girang',
  description:
    'Platform terpadu digitalisasi pertanian padi Desa Cirebon Girang untuk Petani, Perangkat Desa, dan Administrator.',
}

export default async function HomePage() {
  const session = await getSession()

  // Redirect target jika sudah login
  let loggedInUrl = '/login'
  if (session) {
    if (session.role === 'ADMIN') loggedInUrl = '/admin'
    else if (session.role === 'PERANGKAT_DESA') loggedInUrl = '/desa'
    else loggedInUrl = '/petani'
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-800 flex flex-col justify-between font-sans selection:bg-emerald-200">
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

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={loggedInUrl}
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition"
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

      {/* ── Hero Section (Tampilan Utama Bersih) ── */}
      <main className="relative overflow-hidden flex-1 flex items-center justify-center py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Sistem Informasi Pertanian & Manajemen Budidaya Padi
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
            Digitalisasi Pertanian Padi{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 block sm:inline">
              Desa Cirebon Girang
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Platform komprehensif terpadu untuk pendataan lahan sawah, penjadwalan musim tanam padi,
            rekapitulasi panen kelompok tani, dan konsultasi cerdas berbasis AI untuk <strong>Petani</strong>,{' '}
            <strong>Perangkat Desa</strong>, dan <strong>Administrator</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? loggedInUrl : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-sm hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <span>{session ? 'Masuk ke Dashboard' : 'Masuk ke Portal Login'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Micro details */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Login Mandiri per Role
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Rekap Data Kelompok Tani
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Asisten Cerdas AI Konsultasi Padi
            </span>
          </div>
        </div>

        {/* Ambient Gradient Blur Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      </main>

      {/* ── Footer Bersih & Sederhana ── */}
      <footer className="bg-white border-t border-gray-200 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <Sprout size={14} />
            </div>
            <span className="font-bold text-gray-800">Platform Pertanian Padi Desa Cirebon Girang</span>
          </div>
          <p className="text-gray-400">Kecamatan Talun, Kabupaten Cirebon, Jawa Barat</p>
        </div>
      </footer>
    </div>
  )
}
