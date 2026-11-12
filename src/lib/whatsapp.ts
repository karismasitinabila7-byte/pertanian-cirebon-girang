import { getAppSettingsAsync } from '@/lib/settings'

export interface WhatsAppNotificationPayload {
  to?: string
  title: string
  message: string
  type?: 'PEMUPUKAN' | 'PANEN' | 'HAMA_CUACA' | 'MUSIM_BARU' | 'PANEN_BARU' | 'UMUM' | string
  severity?: 'URGENT' | 'WARNING' | 'INFO'
  lahanNama?: string
  petaniNama?: string
  hst?: number
  daysRemaining?: number
  actionUrl?: string
  timestamp?: string
}

export interface WhatsAppSendResult {
  success: boolean
  sentAutomatically: boolean
  isNotConfigured?: boolean
  provider: string
  target: string
  waUrl: string
  messageText: string
  note?: string
  error?: string
  detail?: any
}

export function formatWhatsAppPhone(phone?: string | null, fallback = '6285797864834'): string {
  if (!phone) return fallback
  const parts = phone
    .split(',')
    .map((p) => {
      let clean = p.replace(/\D/g, '')
      if (clean.startsWith('0')) clean = '62' + clean.slice(1)
      else if (clean.length > 8 && !clean.startsWith('62')) clean = '62' + clean
      return clean
    })
    .filter((p) => p.length >= 9)

  return parts.length > 0 ? parts.join(',') : fallback
}

export function buildWhatsAppMessage(payload: WhatsAppNotificationPayload): string {
  if (payload.type === 'OTP') {
    return [
      `🔐 *KODE OTP VERIFIKASI SI PADI*`,
      `*Desa Cirebon Girang, Kec. Talun*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      payload.petaniNama ? `👤 *Calon Petani:* ${payload.petaniNama}` : '',
      ``,
      `${payload.message}`,
      ``,
      `⚠️ _Demi keamanan, JANGAN bagikan kode OTP ini kepada siapa pun termasuk pihak desa/admin._`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Dikirim otomatis oleh Sistem Informasi Pertanian Padi (SI PADI)._`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const urgencyLabel =
    payload.severity === 'URGENT'
      ? '🔴 TENGGAT MENDESAK'
      : payload.severity === 'WARNING'
      ? '🟡 PERHATIAN'
      : '🔵 INFORMASI SISTEM'

  const formattedDate = new Date(payload.timestamp || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const appUrl = process.env.APP_URL || 'https://pertanian-cirebon-girang.vercel.app'
  const link = payload.actionUrl?.startsWith('http')
    ? payload.actionUrl
    : payload.actionUrl
    ? `${appUrl}${payload.actionUrl}`
    : appUrl

  return [
    `📢 *NOTIFIKASI RESMI SI PADI*`,
    `*Pemerintah Desa Cirebon Girang, Kec. Talun*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ *Topik:* ${payload.title}`,
    `🏷️ *Tingkat:* ${urgencyLabel}`,
    payload.lahanNama ? `🌾 *Petak Sawah:* ${payload.lahanNama}` : '',
    payload.petaniNama ? `👤 *Penerima:* ${payload.petaniNama}` : '',
    payload.hst ? `🌱 *Umur Tanaman:* ${payload.hst} HST` : '',
    payload.daysRemaining !== undefined
      ? `⏳ *Estimasi Panen:* ${payload.daysRemaining <= 0 ? 'Hari H Masa Panen!' : `${payload.daysRemaining} hari lagi`}`
      : '',
    ``,
    `📋 *Pesan:*`,
    `${payload.message}`,
    ``,
    `🔗 *Buka Sistem:* ${link}`,
    `⏰ *Waktu:* ${formattedDate}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `_Dikirim otomatis oleh Sistem Informasi Pertanian Padi (SI PADI) Desa Cirebon Girang._`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function buildWhatsAppDirectUrl(payload: WhatsAppNotificationPayload, fallbackPhone = '6285797864834'): string {
  const target = formatWhatsAppPhone(payload.to, fallbackPhone).split(',')[0]
  const text = buildWhatsAppMessage(payload)
  return `https://api.whatsapp.com/send?phone=${target}&text=${encodeURIComponent(text)}`
}

/**
 * Mengirimkan notifikasi WhatsApp secara OTOMATIS dari server ke nomor tujuan
 * melalui WhatsApp Gateway API (Fonnte / Wablas / Custom Webhook).
 */
export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload,
  overrideConfig?: { token?: string; provider?: string; apiUrl?: string }
): Promise<WhatsAppSendResult> {
  const settings = await getAppSettingsAsync()
  const fallbackPhone = settings.defaultWhatsAppNumber || '6285797864834'
  const target = formatWhatsAppPhone(payload.to, fallbackPhone)
  const messageText = buildWhatsAppMessage(payload)
  const waUrl = `https://api.whatsapp.com/send?phone=${target.split(',')[0]}&text=${encodeURIComponent(messageText)}`

  const provider = (overrideConfig?.provider || settings.waGatewayProvider || process.env.WA_GATEWAY_PROVIDER || 'fonnte').toLowerCase()
  const token = (overrideConfig?.token !== undefined ? overrideConfig.token : settings.waApiToken || process.env.WA_API_TOKEN || process.env.FONNTE_TOKEN || '').trim()
  const apiUrl = (overrideConfig?.apiUrl || settings.waApiUrl || process.env.WA_API_URL || '').trim()

  if (!token && provider !== 'webhook') {
    return {
      success: false,
      sentAutomatically: false,
      isNotConfigured: true,
      provider,
      target,
      waUrl,
      messageText,
      note: 'Token WhatsApp Gateway (Fonnte/Wablas) belum diisi di Admin > Konfigurasi Sistem. Isi token agar pesan terkirim otomatis tanpa perlu klik kirim manual.',
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    if (provider === 'fonnte') {
      const endpoint = apiUrl || 'https://api.fonnte.com/send'
      const formBody = new URLSearchParams()
      formBody.append('target', target)
      formBody.append('message', messageText)
      formBody.append('countryCode', '62')

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.status === true) {
        return {
          success: true,
          sentAutomatically: true,
          provider: 'fonnte',
          target,
          waUrl,
          messageText,
          detail: data,
          note: `Pesan WhatsApp berhasil dikirim otomatis oleh server SI PADI ke ${target} melalui Fonnte.`,
        }
      }

      return {
        success: false,
        sentAutomatically: false,
        provider: 'fonnte',
        target,
        waUrl,
        messageText,
        error: data?.reason || data?.message || `Fonnte menolak pengiriman (HTTP ${res.status})`,
        detail: data,
      }
    }

    if (provider === 'wablas') {
      const endpoint = apiUrl || 'https://pati.wablas.com/api/send-message'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: target,
          message: messageText,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.status === true) {
        return {
          success: true,
          sentAutomatically: true,
          provider: 'wablas',
          target,
          waUrl,
          messageText,
          detail: data,
          note: `Pesan WhatsApp berhasil dikirim otomatis ke ${target} melalui Wablas.`,
        }
      }

      return {
        success: false,
        sentAutomatically: false,
        provider: 'wablas',
        target,
        waUrl,
        messageText,
        error: data?.message || `Wablas gagal mengirim (HTTP ${res.status})`,
        detail: data,
      }
    }

    // Custom Webhook Gateway
    if (!apiUrl) {
      clearTimeout(timeoutId)
      return {
        success: false,
        sentAutomatically: false,
        isNotConfigured: true,
        provider: 'webhook',
        target,
        waUrl,
        messageText,
        note: 'URL Endpoint Webhook WhatsApp belum diisi di Konfigurasi Sistem.',
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        target,
        message: messageText,
        title: payload.title,
        severity: payload.severity || 'INFO',
        type: payload.type || 'UMUM',
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      return {
        success: true,
        sentAutomatically: true,
        provider: 'webhook',
        target,
        waUrl,
        messageText,
        detail: data,
        note: `Pesan WhatsApp berhasil dikirim otomatis ke ${target} melalui Webhook Gateway.`,
      }
    }

    return {
      success: false,
      sentAutomatically: false,
      provider: 'webhook',
      target,
      waUrl,
      messageText,
      error: data?.error || data?.message || `Webhook gagal merespons (HTTP ${res.status})`,
      detail: data,
    }
  } catch (error: any) {
    return {
      success: false,
      sentAutomatically: false,
      provider,
      target,
      waUrl,
      messageText,
      error: error?.message || 'Gagal menghubungi server WhatsApp Gateway.',
    }
  }
}

