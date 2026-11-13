'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Menu, User, ChevronDown, Bell, AlertTriangle, Droplets, Wheat, ShieldAlert, ExternalLink, Bot, Sparkles, Loader2, Check, MessageSquare } from 'lucide-react'

export function Header({
  user,
  onMenuClick,
}: {
  user: { username: string; role: string; fullName?: string; email?: string } | null
  onMenuClick: () => void
}) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [warnings, setWarnings] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [sendingWaId, setSendingWaId] = useState<string | null>(null)
  const [isSendingAllWa, setIsSendingAllWa] = useState(false)
  const [waToast, setWaToast] = useState<{
    id?: string
    success: boolean
    sentAutomatically: boolean
    target?: string
    message: string
    waUrl?: string
  } | null>(null)

  const handleSendSingleWa = async (w: any) => {
    try {
      setSendingWaId(w.id)
      setWaToast(null)
      const res = await fetch('/api/notifications/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: w.petaniTelepon || w.recipientPhone,
          title: w.title,
          message: w.message,
          type: w.type,
          severity: w.severity,
          lahanNama: w.lahanNama,
          petaniNama: w.petaniNama,
          hst: w.hst,
          daysRemaining: w.daysRemaining,
          actionUrl: w.actionUrl,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setWaToast({
          id: w.id,
          success: true,
          sentAutomatically: Boolean(data.sentAutomatically),
          target: data.target,
          message: data.sentAutomatically
            ? `Pesan otomatis terkirim ke WA ${data.target}`
            : data.result?.note || 'Token Gateway WA belum dikonfigurasi.',
          waUrl: data.waUrl,
        })
        if (data.sentAutomatically) {
          setTimeout(() => setWaToast(null), 5000)
        }
      } else {
        setWaToast({
          id: w.id,
          success: false,
          sentAutomatically: false,
          message: data.error || data.result?.error || 'Gagal mengirim notifikasi WA otomatis.',
          waUrl: data.waUrl,
        })
      }
    } catch (e: any) {
      setWaToast({
        id: w.id,
        success: false,
        sentAutomatically: false,
        message: e.message || 'Gagal menghubungi server WA.',
      })
    } finally {
      setSendingWaId(null)
    }
  }

  const handleSendAllWa = async () => {
    try {
      setIsSendingAllWa(true)
      setWaToast(null)
      const res = await fetch('/api/notifications/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_ALL_WARNINGS' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setWaToast({
          id: 'ALL',
          success: true,
          sentAutomatically: Boolean(data.sentAutomatically),
          target: data.target,
          message: data.sentAutomatically
            ? `Rangkuman ${data.totalWarnings || warnings.length} peringatan otomatis terkirim ke WA ${data.target}`
            : data.result?.note || 'Token Gateway WA belum dikonfigurasi.',
          waUrl: data.waUrl,
        })
        if (data.sentAutomatically) {
          setTimeout(() => setWaToast(null), 5000)
        }
      } else {
        setWaToast({
          id: 'ALL',
          success: false,
          sentAutomatically: false,
          message: data.error || data.result?.error || 'Gagal mengirim rangkuman WA otomatis.',
          waUrl: data.waUrl,
        })
      }
    } catch (e: any) {
      setWaToast({
        id: 'ALL',
        success: false,
        sentAutomatically: false,
        message: e.message || 'Gagal menghubungi server WA.',
      })
    } finally {
      setIsSendingAllWa(false)
    }
  }

  useEffect(() => {
    if (!user?.username) return

    // Cache warnings for 60s in session to avoid firing API request on every page switch
    try {
      const cached = sessionStorage.getItem('sipadi_warnings_cache')
      const cacheTime = sessionStorage.getItem('sipadi_warnings_time')
      const now = Date.now()

      if (cached && cacheTime && now - Number(cacheTime) < 60000) {
        const data = JSON.parse(cached)
        setWarnings(data)
        setUnreadCount(data.filter((w: any) => w.severity === 'URGENT' || w.severity === 'WARNING').length)
        return
      }
    } catch (e) {}

    fetch('/api/warnings')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setWarnings(json.data)
          setUnreadCount(json.data.filter((w: any) => w.severity === 'URGENT' || w.severity === 'WARNING').length)
          try {
            sessionStorage.setItem('sipadi_warnings_cache', JSON.stringify(json.data))
            sessionStorage.setItem('sipadi_warnings_time', String(Date.now()))
          } catch (e) {}
        }
      })
      .catch(() => {})
  }, [user?.username])

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRole')
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      // ignore
    }
    router.push('/login')
    router.refresh()
  }

  const roleLabel = user?.role === 'ADMIN'
    ? 'Administrator'
    : user?.role === 'PERANGKAT_DESA'
    ? 'Perangkat Desa'
    : 'Petani'

  const avatarSrc = user?.role === 'ADMIN'
    ? '/avatars/admin.jpg'
    : user?.role === 'PERANGKAT_DESA'
    ? '/avatars/perangkat.jpg'
    : '/avatars/petani.jpg'

  const profileHref = user?.role === 'ADMIN'
    ? '/admin/profil'
    : user?.role === 'PERANGKAT_DESA'
    ? '/desa/profil'
    : '/petani/profil'

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
        >
          <span className="sr-only">Buka menu</span>
          <Menu className="h-6 w-6" />
        </button>
        <span className="hidden sm:inline-block text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          Desa Cirebon Girang &middot; {roleLabel}
        </span>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Tombol Akses AI Assistant di Navigasi Header Atas (Admin & Petani saja) */}
        {Boolean(user) && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-ai-chat'))
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all group border border-blue-500/30 cursor-pointer"
            title={
              user?.role === 'ADMIN'
                ? 'Buka Asisten Pintar Administrator Pertanian'
                : 'Buka AI Assistant Pertanian Padi'
            }
          >
            <div className="relative flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-100 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-300"></span>
              </span>
            </div>
            <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
              {user?.role === 'ADMIN' ? 'AI Assistant' : 'AI Assistant'}
            </span>
            <Sparkles className="h-3 w-3 text-amber-300 hidden md:inline-block animate-pulse" />
          </button>
        )}

        {/* Notification Bell (Early Warning System) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowDropdown(false)
            }}
            className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-xl relative transition"
            title="Peringatan Dini Pertanian"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-700" />
                  <span className="text-xs font-bold text-gray-900">Peringatan Dini Pertanian</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {warnings.length} Notifikasi
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {warnings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    Tidak ada peringatan tenggat waktu aktif.
                  </div>
                ) : (
                  warnings.slice(0, 5).map((w: any) => (
                    <div key={w.id} className="p-3 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex-shrink-0">
                          {w.type === 'PEMUPUKAN' ? (
                            <Droplets className="h-4 w-4 text-amber-600" />
                          ) : w.type === 'PANEN' ? (
                            <Wheat className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-rose-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 leading-tight">
                            {w.title}
                          </p>
                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                            {w.message}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-emerald-700">
                              {w.lahanNama || 'Sawah Desa'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendSingleWa(w)}
                                disabled={sendingWaId === w.id}
                                className="text-[10px] font-bold text-[#15803d] hover:text-[#166534] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                title="Kirim notifikasi ini secara otomatis ke WhatsApp tujuan"
                              >
                                {sendingWaId === w.id ? (
                                  <>
                                    <Loader2 size={10} className="animate-spin" />
                                    <span>Mengirim...</span>
                                  </>
                                ) : waToast?.id === w.id && waToast?.sentAutomatically ? (
                                  <>
                                    <Check size={10} className="text-emerald-600" />
                                    <span>Terkirim</span>
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare size={10} />
                                    <span>Kirim WA</span>
                                  </>
                                )}
                              </button>
                              <Link
                                href={w.actionUrl}
                                onClick={() => setShowNotifications(false)}
                                className="text-[10px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5"
                              >
                                <span>{w.actionLabel}</span>
                                <ExternalLink size={10} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer: Kirim Rekapitulasi Otomatis ke WhatsApp */}
              <div className="p-2.5 bg-gray-50 border-t border-gray-100 space-y-2">
                {waToast && (
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] flex items-center justify-between gap-2 border ${
                      waToast.sentAutomatically
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : waToast.success
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <span className="line-clamp-2">{waToast.message}</span>
                    {!waToast.sentAutomatically && waToast.waUrl && (
                      <a
                        href={waToast.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline flex-shrink-0 text-emerald-800"
                      >
                        Buka WA Web
                      </a>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendAllWa}
                  disabled={isSendingAllWa || warnings.length === 0}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-[#16a34a] hover:bg-[#15803d] text-white transition disabled:opacity-50 cursor-pointer shadow-2xs"
                  title="Kirimkan rangkuman seluruh peringatan aktif otomatis ke WhatsApp tujuan"
                >
                  {isSendingAllWa ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Mengirim Semua WA...</span>
                    </>
                  ) : waToast?.id === 'ALL' && waToast?.sentAutomatically ? (
                    <>
                      <Check size={12} />
                      <span>WA Terkirim!</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={12} />
                      <span>Kirim Semua Peringatan ke WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown)
                setShowNotifications(false)
              }}
              className="flex items-center space-x-2.5 p-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl focus:outline-none border border-transparent hover:border-gray-200 transition"
            >
              <img
                src={avatarSrc}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-2xs"
              />
              <div className="hidden sm:block text-left">
                <span className="block font-semibold text-xs text-gray-900 leading-tight">
                  {user.fullName || user.username}
                </span>
                <span className="block text-[10px] text-gray-500 font-medium leading-none mt-0.5">
                  {roleLabel}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2.5">
                  <img
                    src={avatarSrc}
                    alt={user.fullName || user.username}
                    className="w-9 h-9 rounded-full object-cover border border-emerald-400"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-700">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <Link
                  href={profileHref}
                  prefetch={true}
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center transition"
                >
                  <User className="h-3.5 w-3.5 mr-2 text-gray-400" />
                  Profil & Data Lahan
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center transition"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Keluar dari Sistem
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
