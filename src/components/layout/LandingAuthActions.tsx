'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, LogOut, Loader2, UserCheck } from 'lucide-react'

interface SessionInfo {
  userId: string
  username: string
  role: string
  fullName?: string
  email?: string
}

function getRoleLabel(role?: string) {
  if (role === 'ADMIN') return 'Administrator'
  if (role === 'PERANGKAT_DESA') return 'Perangkat Desa'
  return 'Petani'
}

function getDashboardUrl(role?: string) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'PERANGKAT_DESA') return '/desa'
  return '/petani'
}

export function LandingNavActions({ session }: { session: SessionInfo | null }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRole')
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      // ignore
    } finally {
      router.refresh()
      setLoggingOut(false)
    }
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition"
      >
        <span>Masuk ke Sistem</span>
        <ArrowRight size={16} />
      </Link>
    )
  }

  const roleLabel = getRoleLabel(session.role)
  const dashboardUrl = getDashboardUrl(session.role)

  return (
    <div className="flex items-center gap-2">
      <Link
        href={dashboardUrl}
        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition"
        title="Lanjut langsung ke dashboard yang sedang aktif"
      >
        <span>Buka Dashboard ({roleLabel})</span>
        <ArrowRight size={15} />
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs sm:text-sm font-bold px-3 py-2.5 rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
        title="Keluar dari akun saat ini dan kembali ke status belum login"
      >
        {loggingOut ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <LogOut size={15} />
        )}
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </div>
  )
}

export function LandingHeroActions({ session }: { session: SessionInfo | null }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRole')
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      // ignore
    } finally {
      router.refresh()
      setLoggingOut(false)
    }
  }

  const roleLabel = getRoleLabel(session?.role)
  const dashboardUrl = getDashboardUrl(session?.role)

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* Tombol Utama: SELALU ke Halaman Portal Login */}
        <Link
          href="/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 text-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          <span>Masuk ke Portal Login</span>
          <ArrowRight size={18} />
        </Link>

        {/* Jika sedang login, tampilkan opsi cepat Lanjut ke Dashboard */}
        {session && (
          <Link
            href={dashboardUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-6 py-3.5 rounded-xl text-sm transition"
          >
            <UserCheck size={17} className="text-emerald-700" />
            <span>Lanjut ke Dashboard ({roleLabel})</span>
          </Link>
        )}
      </div>

      {/* Info status login aktif + link logout cepat */}
      {session && (
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200 text-xs text-gray-600">
          <span>
            Sesi aktif: <strong className="text-emerald-800">{session.fullName || session.username}</strong> ({roleLabel})
          </span>
          <span>&middot;</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {loggingOut && <Loader2 size={11} className="animate-spin" />}
            <span>Klik di sini untuk Keluar (Logout)</span>
          </button>
        </div>
      )}
    </div>
  )
}

