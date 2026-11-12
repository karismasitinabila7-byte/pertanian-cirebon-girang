'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  Droplets,
  Wheat,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  X,
  RefreshCw,
  Sparkles,
  Info,
  Mail,
  Send,
  Loader2,
  ExternalLink,
  Check,
  PlusCircle,
  Phone,
  User,
  Users,
  Megaphone,
  Trash2,
  Share2
} from 'lucide-react'
import Link from 'next/link'

interface WarningNotification {
  id: string
  type: 'PEMUPUKAN' | 'PANEN' | 'HAMA_CUACA'
  severity: 'URGENT' | 'WARNING' | 'INFO'
  title: string
  message: string
  musimId?: string
  musimNama?: string
  lahanNama?: string
  petaniNama?: string
  petaniTelepon?: string
  recipientPhone?: string
  daysRemaining?: number
  hst?: number
  actionUrl: string
  actionLabel: string
  timestamp: string
  isManual?: boolean
  recipientEmail?: string
  senderName?: string
}

interface PetaniOption {
  id: string
  nama: string
  telepon: string
  email: string
  poktan: string
}

const TARGET_DEFAULT_WA = '6285797864834'
const TARGET_NOTIFICATION_EMAIL = 'karismasitinabila7@gmail.com'

function buildWhatsAppUrl(item: WarningNotification): string {
  let phone = TARGET_DEFAULT_WA
  if (item.petaniTelepon) {
    let clean = item.petaniTelepon.replace(/\D/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    if (!clean.startsWith('62') && clean.length > 8) clean = '62' + clean
    if (clean.length >= 9) phone = clean
  }

  const urgencyLabel =
    item.severity === 'URGENT'
      ? '🔴 TENGGAT MENDESAK'
      : item.severity === 'WARNING'
      ? '🟡 PERHATIAN'
      : '🔵 INFORMASI SIKLUS'

  const messageLines = [
    `📢 *PERINGATAN DINI PERTANIAN (EARLY WARNING SYSTEM)*`,
    `*Pemerintah Desa Cirebon Girang, Kec. Talun*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ *Topik Peringatan:* ${item.title}`,
    `🏷️ *Tingkat Urgensi:* ${urgencyLabel}`,
    item.lahanNama ? `🌾 *Petak Sawah:* ${item.lahanNama}` : '',
    `👤 *Nama Petani:* ${item.petaniNama || 'Bapak Sukardi'}`,
    item.hst ? `🌱 *Umur Tanaman:* ${item.hst} HST (Hari Setelah Tanam)` : '',
    item.daysRemaining !== undefined
      ? `⏳ *Estimasi:* ${
          item.daysRemaining <= 0
            ? 'Hari H Masa Panen!'
            : `${item.daysRemaining} hari menuju panen`
        }`
      : '',
    ``,
    `📋 *Detail Pemberitahuan & Petunjuk Teknis:*`,
    `${item.message}`,
    ``,
    `⏰ *Waktu Pemberitahuan:* ${new Date(item.timestamp || Date.now()).toLocaleDateString(
      'id-ID',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Pesan dikirim melalui Sistem Informasi Pertanian Padi (SI PADI) Desa Cirebon Girang._`,
  ]
    .filter(Boolean)
    .join('\n')

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
    messageLines
  )}`
}

export function EarlyWarningWidget({ role }: { role?: string }) {
  const [warnings, setWarnings] = useState<WarningNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)
  const [sendingAllEmail, setSendingAllEmail] = useState(false)
  const [sendingWaId, setSendingWaId] = useState<string | null>(null)
  const [sendingAllWa, setSendingAllWa] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    type: 'success' | 'error'
    message: string
    gmailUrl?: string
    waUrl?: string
  } | null>(null)

  // State Modal Buat Notifikasi Manual
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [petaniOptions, setPetaniOptions] = useState<PetaniOption[]>([])
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL')
  const [customPetaniName, setCustomPetaniName] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [manualMessage, setManualMessage] = useState('')
  const [manualCategory, setManualCategory] = useState<string>('PEMUPUKAN')
  const [manualSeverity, setManualSeverity] = useState<'URGENT' | 'WARNING' | 'INFO'>('WARNING')
  const [sendViaEmailChecked, setSendViaEmailChecked] = useState(true)
  const [sendViaWaChecked, setSendViaWaChecked] = useState(true)
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)

  const fetchWarnings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/warnings')
      const json = await res.json()
      if (res.ok) {
        setWarnings(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching warnings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load petani options for modal selection
  const fetchPetaniOptions = async () => {
    try {
      const res = await fetch('/api/notifications/manual')
      const json = await res.json()
      if (res.ok && json.petaniOptions) {
        setPetaniOptions(json.petaniOptions)
      }
    } catch (err) {
      console.error('Error fetching petani options:', err)
    }
  }

  useEffect(() => {
    fetchWarnings()
    fetchPetaniOptions()
  }, [])

  // Saat pilihan target penerima berganti di modal
  const handleTargetChange = (targetVal: string) => {
    setSelectedTarget(targetVal)
    if (targetVal === 'ALL') {
      setCustomPetaniName('')
      setManualEmail(TARGET_NOTIFICATION_EMAIL)
      setManualPhone('0852-1122-3344')
    } else if (targetVal === 'PETANI') {
      setCustomPetaniName('Seluruh Kelompok Tani')
      setManualEmail('sukardi@gmail.com')
      setManualPhone('0852-1122-3344')
    } else if (targetVal === 'PERANGKAT_DESA') {
      setCustomPetaniName('Perangkat Desa')
      setManualEmail('karsiman@gmail.com')
      setManualPhone('0812-9876-5432')
    } else if (targetVal === 'CUSTOM') {
      setCustomPetaniName('')
      setManualEmail('')
      setManualPhone('')
    } else {
      // Petani spesifik berdasarkan ID
      const selected = petaniOptions.find((p) => p.id === targetVal)
      if (selected) {
        setCustomPetaniName(selected.nama)
        setManualEmail(selected.email || `${selected.nama.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`)
        setManualPhone(selected.telepon || '')
      }
    }
  }

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id])
  }

  // Hapus notifikasi manual (khusus Admin)
  const handleDeleteManualNotif = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus notifikasi pengumuman ini?')) return
    try {
      const res = await fetch(`/api/notifications/manual?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setWarnings((prev) => prev.filter((w) => w.id !== id))
        setEmailStatus({
          type: 'success',
          message: 'Notifikasi manual berhasil dihapus dari sistem.',
        })
      }
    } catch (e) {
      console.error('Error deleting manual notif:', e)
    }
  }

  // Submit form notifikasi manual baru
  const handleCreateManualNotif = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTitle.trim() || !manualMessage.trim()) {
      alert('Judul dan isi pesan wajib diisi.')
      return
    }

    try {
      setIsSubmittingManual(true)
      setEmailStatus(null)

      let targetRole = 'ALL'
      let targetPetaniId: string | undefined = undefined

      if (selectedTarget === 'ALL' || selectedTarget === 'PETANI' || selectedTarget === 'PERANGKAT_DESA') {
        targetRole = selectedTarget
      } else if (selectedTarget === 'CUSTOM') {
        targetRole = 'SPESIFIK'
      } else {
        targetRole = 'SPESIFIK'
        targetPetaniId = selectedTarget
      }

      const res = await fetch('/api/notifications/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          message: manualMessage.trim(),
          targetRole,
          targetPetaniId,
          targetPetaniName: customPetaniName.trim() || undefined,
          category: manualCategory,
          severity: manualSeverity,
          recipientEmail: manualEmail.trim() || undefined,
          recipientPhone: manualPhone.trim() || undefined,
          sendEmail: sendViaEmailChecked,
          sendWa: sendViaWaChecked,
          actionUrl: '/petani',
          actionLabel: 'Buka Dashboard',
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsModalOpen(false)
        const waAuto = data.data?.waResult?.sentAutomatically
        const waTarget = data.data?.waResult?.target || manualPhone
        const waNote = sendViaWaChecked
          ? waAuto
            ? ` & terkirim OTOMATIS ke WhatsApp (${waTarget})`
            : ` (WA: Token Fonnte belum diatur di Konfigurasi Sistem)`
          : ''

        setEmailStatus({
          type: 'success',
          message: `Notifikasi "${manualTitle}" berhasil diterbitkan ke Dashboard${manualEmail && sendViaEmailChecked ? ` & email ${manualEmail}` : ''}${waNote}!`,
          gmailUrl: data.data?.gmailUrl,
          waUrl: waAuto ? undefined : data.data?.waUrl,
        })

        // Reset form
        setManualTitle('')
        setManualMessage('')

        // Refresh warnings list to include the newly added notification immediately
        await fetchWarnings()
      } else {
        alert(data.error || 'Gagal menerbitkan notifikasi.')
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi gangguan jaringan saat membuat notifikasi.')
    } finally {
      setIsSubmittingManual(false)
    }
  }

  // Kirim satu notifikasi ke Email
  const handleSendSingleEmail = async (item: WarningNotification) => {
    try {
      setSendingEmailId(item.id)
      setEmailStatus(null)

      const targetTo = item.recipientEmail || TARGET_NOTIFICATION_EMAIL

      const res = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetTo,
          title: item.title,
          message: item.message,
          type: item.type,
          severity: item.severity,
          lahanNama: item.lahanNama,
          petaniNama: item.petaniNama,
          hst: item.hst,
          daysRemaining: item.daysRemaining,
          actionUrl: item.actionUrl,
          actionLabel: item.actionLabel,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setEmailStatus({
          type: 'success',
          message: `Notifikasi "${item.title}" berhasil dikirimkan ke email ${targetTo}`,
          gmailUrl: data.gmailUrl,
        })
      } else {
        setEmailStatus({
          type: 'error',
          message: data.error || `Gagal mengirim email ke ${targetTo}`,
        })
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Terjadi gangguan jaringan saat pengiriman email.',
      })
    } finally {
      setSendingEmailId(null)
    }
  }

  // Kirim rangkuman semua peringatan aktif ke karismasitinabila7@gmail.com
  const handleSendAllEmail = async () => {
    try {
      setSendingAllEmail(true)
      setEmailStatus(null)

      const res = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_ALL_WARNINGS',
          to: TARGET_NOTIFICATION_EMAIL,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setEmailStatus({
          type: 'success',
          message: `Rangkuman ${data.totalWarnings || warnings.length} peringatan aktif berhasil dikirimkan ke ${TARGET_NOTIFICATION_EMAIL}`,
          gmailUrl: data.gmailUrl,
        })
      } else {
        setEmailStatus({
          type: 'error',
          message: data.error || `Gagal mengirim rangkuman email ke ${TARGET_NOTIFICATION_EMAIL}`,
        })
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Terjadi gangguan jaringan saat pengiriman email.',
      })
    } finally {
      setSendingAllEmail(false)
    }
  }

  // Kirim satu notifikasi ke WhatsApp secara OTOMATIS via server gateway
  const handleSendSingleWa = async (item: WarningNotification) => {
    try {
      setSendingWaId(item.id)
      setEmailStatus(null)

      const targetWa = item.recipientPhone || item.petaniTelepon || TARGET_DEFAULT_WA

      const res = await fetch('/api/notifications/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetWa,
          title: item.title,
          message: item.message,
          type: item.type,
          severity: item.severity,
          lahanNama: item.lahanNama,
          petaniNama: item.petaniNama,
          hst: item.hst,
          daysRemaining: item.daysRemaining,
          actionUrl: item.actionUrl,
        }),
      })

      const data = await res.json()

      if (res.ok && data.sentAutomatically) {
        setEmailStatus({
          type: 'success',
          message: `Notifikasi "${item.title}" berhasil dikirim OTOMATIS ke WhatsApp (${data.target})!`,
        })
      } else if (data.isNotConfigured) {
        setEmailStatus({
          type: 'error',
          message: `Pengiriman otomatis WA belum aktif: Token WhatsApp Gateway (Fonnte) belum diisi di Admin > Konfigurasi Sistem.`,
          waUrl: data.waUrl,
        })
      } else {
        setEmailStatus({
          type: 'error',
          message: data.result?.error || data.error || `Gagal mengirim WhatsApp otomatis ke ${targetWa}`,
          waUrl: data.waUrl,
        })
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Terjadi gangguan jaringan saat pengiriman WhatsApp.',
      })
    } finally {
      setSendingWaId(null)
    }
  }

  // Kirim rangkuman semua peringatan aktif ke WhatsApp secara OTOMATIS
  const handleSendAllWa = async () => {
    try {
      setSendingAllWa(true)
      setEmailStatus(null)

      const res = await fetch('/api/notifications/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_ALL_WARNINGS',
          to: TARGET_DEFAULT_WA,
        }),
      })

      const data = await res.json()

      if (res.ok && data.sentAutomatically) {
        setEmailStatus({
          type: 'success',
          message: `Rangkuman ${data.totalWarnings || warnings.length} peringatan aktif berhasil dikirim OTOMATIS ke WhatsApp (${data.target})!`,
        })
      } else if (data.isNotConfigured) {
        setEmailStatus({
          type: 'error',
          message: `Pengiriman otomatis WA belum aktif: Token WhatsApp Gateway (Fonnte) belum diisi di Admin > Konfigurasi Sistem.`,
          waUrl: data.waUrl,
        })
      } else {
        setEmailStatus({
          type: 'error',
          message: data.result?.error || data.error || `Gagal mengirim rangkuman WhatsApp otomatis.`,
          waUrl: data.waUrl,
        })
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Terjadi gangguan jaringan saat pengiriman WhatsApp.',
      })
    } finally {
      setSendingAllWa(false)
    }
  }

  const visibleWarnings = warnings
    .filter((w) => !dismissedIds.includes(w.id))
    .filter((w) => filterType === 'ALL' || w.type === filterType)

  const urgentCount = warnings.filter(
    (w) => !dismissedIds.includes(w.id) && w.severity === 'URGENT'
  ).length

  const getIcon = (type: string, severity: string, isManual?: boolean) => {
    if (isManual) {
      return <Megaphone className="h-5 w-5 text-indigo-600" />
    }
    if (type === 'PEMUPUKAN') {
      return <Droplets className="h-5 w-5 text-amber-600" />
    }
    if (type === 'PANEN') {
      return <Wheat className="h-5 w-5 text-emerald-600" />
    }
    return <ShieldAlert className="h-5 w-5 text-rose-600" />
  }

  const getSeverityStyle = (severity: string, isManual?: boolean) => {
    if (isManual) {
      return {
        border: 'border-l-indigo-600 bg-indigo-50/40 border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        label: '🏛️ Pemberitahuan Desa',
      }
    }
    switch (severity) {
      case 'URGENT':
        return {
          border: 'border-l-rose-500 bg-rose-50/40 border-rose-200',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          label: 'Tenggat Mendesak',
        }
      case 'WARNING':
        return {
          border: 'border-l-amber-500 bg-amber-50/40 border-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'Perhatian',
        }
      default:
        return {
          border: 'border-l-blue-500 bg-blue-50/40 border-blue-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Informasi Siklus',
        }
    }
  }

  const isAdminOrDesa = role === 'ADMIN' || role === 'PERANGKAT_DESA' || !role

  return (
    <Card className="p-5 border-2 border-emerald-500/20 shadow-sm bg-white overflow-hidden relative">
      {/* Widget Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3.5 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Bell className="h-5 w-5" />
            </div>
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[9px] font-bold items-center justify-center">
                  {urgentCount}
                </span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900">
                Peringatan Dini Pertanian (Early Warning System)
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Sistem Monitoring Aktif
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Notifikasi terhubung ke Email (<strong>{TARGET_NOTIFICATION_EMAIL}</strong>), WhatsApp, dan Dashboard seluruh petani & perangkat desa.
            </p>
          </div>
        </div>

        {/* Action Buttons: Buat Notifikasi Manual, Kirim Semua, dan Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Buat Notifikasi Baru (Email & WA Manual) */}
          {isAdminOrDesa && (
            <button
              onClick={() => {
                handleTargetChange('ALL')
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
              title="Buat notifikasi baru untuk dikirimkan ke Email, WhatsApp, dan Dashboard Petani"
            >
              <PlusCircle size={14} />
              <span>Kirim Notifikasi Petani</span>
            </button>
          )}

          <button
            onClick={handleSendAllEmail}
            disabled={sendingAllEmail || visibleWarnings.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-2xs hover:shadow-xs transition disabled:opacity-50 cursor-pointer"
            title={`Kirim seluruh rekapitulasi peringatan dini aktif ke ${TARGET_NOTIFICATION_EMAIL}`}
          >
            {sendingAllEmail ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Mail size={13} />
                <span>Kirim Semua ke Email</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendAllWa}
            disabled={sendingAllWa || visibleWarnings.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white shadow-2xs hover:shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Kirim seluruh rekapitulasi peringatan dini secara otomatis ke WhatsApp"
          >
            {sendingAllWa ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Mengirim WA...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Kirim Semua ke WA</span>
              </>
            )}
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'ALL'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua ({warnings.filter((w) => !dismissedIds.includes(w.id)).length})
            </button>
            <button
              onClick={() => setFilterType('PEMUPUKAN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'PEMUPUKAN'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              💧 Pemupukan
            </button>
            <button
              onClick={() => setFilterType('PANEN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'PANEN'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              🌾 Panen
            </button>
            <button
              onClick={() => setFilterType('HAMA_CUACA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterType === 'HAMA_CUACA'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              🛡️ Hama & Cuaca
            </button>
          </div>
        </div>
      </div>

      {/* Email / WA Status Toast Banner */}
      {emailStatus && (
        <div
          className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            emailStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {emailStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{emailStatus.message}</span>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {emailStatus.waUrl && (
              <a
                href={emailStatus.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
              >
                <span>Buka WhatsApp</span>
                <ExternalLink size={12} />
              </a>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg">
              <Mail size={12} /> Notifikasi SI PADI
            </span>
            {emailStatus.gmailUrl && (
              <a
                href={emailStatus.gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Draft manual di Gmail (Catatan: Mengirim manual akan menampilkan nama akun Google pribadi Anda)"
                className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 underline"
              >
                <span>Draft Cadangan</span>
                <ExternalLink size={10} />
              </a>
            )}
            <button
              onClick={() => setEmailStatus(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Widget Body */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Menganalisis jadwal budidaya sawah & notifikasi desa...</span>
            </div>
          </div>
        ) : visibleWarnings.length === 0 ? (
          <div className="py-6 px-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-center">
            <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-900">
              Semua Jadwal Budidaya Berjalan Lancar
            </h4>
            <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
              Tidak ada tenggat waktu mendesak untuk pemupukan atau panen saat ini. Sawah terpantau dalam kondisi optimal.
            </p>
          </div>
        ) : (
          visibleWarnings.map((item) => {
            const style = getSeverityStyle(item.severity, item.isManual)
            const isSendingThis = sendingEmailId === item.id
            const targetEmailForThis = item.recipientEmail || TARGET_NOTIFICATION_EMAIL

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-xl border border-l-4 ${style.border} transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs hover:shadow-sm`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {getIcon(item.type, item.severity, item.isManual)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-gray-900">
                        {item.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      {item.lahanNama && (
                        <span className="text-[11px] font-semibold text-gray-600 bg-white/80 px-2 py-0.5 rounded border border-gray-200">
                          {item.lahanNama}
                        </span>
                      )}
                      {item.petaniNama && (
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.petaniNama}
                        </span>
                      )}
                      {item.isManual && item.senderName && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-medium">
                          Pengirim: {item.senderName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 flex-wrap">
                  {/* Tombol Aksi Kirim ke Email */}
                  <button
                    onClick={() => handleSendSingleEmail(item)}
                    disabled={isSendingThis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs hover:shadow-xs transition cursor-pointer disabled:opacity-50"
                    title={`Kirim peringatan ini langsung ke email ${targetEmailForThis}`}
                  >
                    {isSendingThis ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={13} />
                        <span>Kirim Email</span>
                      </>
                    )}
                  </button>

                  {/* Tombol Aksi Kirim Otomatis ke WhatsApp */}
                  <button
                    onClick={() => handleSendSingleWa(item)}
                    disabled={sendingWaId === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xs hover:shadow-xs transition cursor-pointer disabled:opacity-50"
                    title={`Kirim otomatis detail peringatan ini ke WhatsApp (${item.recipientPhone || item.petaniTelepon || TARGET_DEFAULT_WA})`}
                  >
                    {sendingWaId === item.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span>Kirim WA</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={item.actionUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-gray-50 text-emerald-800 border border-emerald-300 shadow-2xs transition"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight size={13} />
                  </Link>

                  {/* Tombol Hapus Notifikasi Manual untuk Admin */}
                  {item.isManual && isAdminOrDesa ? (
                    <button
                      onClick={() => handleDeleteManualNotif(item.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus pemberitahuan desa ini dari sistem"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDismiss(item.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                      title="Tandai selesai / sembunyikan peringatan ini"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL BUAT NOTIFIKASI MANUAL (EMAIL & WA PETANI)           */}
      {/* ────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Kirim Notifikasi Manual ke Petani
                  </h3>
                  <p className="text-xs text-gray-500">
                    Otomatis masuk ke Dashboard Petani, Email, dan WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateManualNotif} className="p-5 space-y-4 text-xs">
              {/* Target Penerima */}
              <div>
                <label className="block font-bold text-gray-800 mb-1.5">
                  1. Pilih Target Penerima:
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50/50"
                >
                  <option value="ALL">📢 Semua Pengguna (Seluruh Petani & Perangkat Desa)</option>
                  <option value="PETANI">🌾 Seluruh Kelompok Tani & Petani Sawah</option>
                  <option value="PERANGKAT_DESA">🏛️ Seluruh Perangkat Desa</option>
                  <optgroup label="── Petani Terdaftar ──">
                    {petaniOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        👤 {p.nama} ({p.poktan})
                      </option>
                    ))}
                  </optgroup>
                  <option value="CUSTOM">✏️ Input Kontak Kustom / Manual</option>
                </select>
              </div>

              {/* Detail Kontak Petani / Penerima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80">
                <div>
                  <label className="block font-semibold text-emerald-950 mb-1">
                    Alamat Email Penerima:
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="contoh: sukardi@gmail.com"
                      className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Bisa dimasukkan alamat Gmail pribadi petani.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-emerald-950 mb-1">
                    Nomor WhatsApp Penerima:
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="contoh: 0852-1122-3344"
                      className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Nomor WA aktif untuk pesan langsung.
                  </span>
                </div>
              </div>

              {/* Judul & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-800 mb-1">
                    2. Judul / Topik Notifikasi:
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Contoh: Penyaluran Pupuk Subsidi Tahap II Tiba di Desa"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Kategori:
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="PEMUPUKAN">💧 Pemupukan Padi</option>
                    <option value="PANEN">🌾 Panen Padi</option>
                    <option value="HAMA_CUACA">🛡️ Hama & Cuaca</option>
                    <option value="PENGUMUMAN">📢 Pengumuman Desa</option>
                    <option value="BANTUAN">🎁 Bantuan Benih/Pupuk</option>
                    <option value="IRIGASI">🌊 Irigasi & Air Sawah</option>
                  </select>
                </div>
              </div>

              {/* Tingkat Urgensi */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Tingkat Urgensi / Prioritas:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualSeverity('INFO')}
                    className={`p-2 rounded-xl border text-center transition ${
                      manualSeverity === 'INFO'
                        ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    🔵 Informasi Siklus
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualSeverity('WARNING')}
                    className={`p-2 rounded-xl border text-center transition ${
                      manualSeverity === 'WARNING'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    🟡 Perhatian
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualSeverity('URGENT')}
                    className={`p-2 rounded-xl border text-center transition ${
                      manualSeverity === 'URGENT'
                        ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    🔴 Mendesak (Urgent)
                  </button>
                </div>
              </div>

              {/* Isi Pesan */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  3. Isi Pesan Notifikasi Lengkap:
                </label>
                <textarea
                  required
                  rows={4}
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder="Tuliskan petunjuk teknis, anjuran agronomi, waktu kegiatan, atau instruksi bagi petani di sini..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                ></textarea>
              </div>

              {/* Saluran Pengiriman Checklist */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="block font-bold text-gray-800">
                  Saluran Pengiriman yang Diaktifkan:
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>🖥️ Masuk Dashboard Petani & Desa</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={sendViaEmailChecked}
                      onChange={(e) => setSendViaEmailChecked(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>📧 Kirimkan ke Email</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={sendViaWaChecked}
                      onChange={(e) => setSendViaWaChecked(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>💬 Kirimkan ke WhatsApp</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs hover:shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingManual ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menerbitkan Notifikasi...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Kirim Notifikasi Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
