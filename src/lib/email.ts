import nodemailer from 'nodemailer'
import { getAppSettings } from '@/lib/settings'

export interface EmailNotificationPayload {
  to?: string
  subject?: string
  title: string
  message: string
  type?: 'PEMUPUKAN' | 'PANEN' | 'HAMA_CUACA' | 'MUSIM_BARU' | 'PANEN_BARU' | 'UMUM'
  severity?: 'URGENT' | 'WARNING' | 'INFO'
  lahanNama?: string
  petaniNama?: string
  hst?: number
  daysRemaining?: number
  actionUrl?: string
  actionLabel?: string
  timestamp?: string
}

export const DEFAULT_NOTIFICATION_EMAIL =
  process.env.NOTIFICATION_TARGET_EMAIL || 'karismasitinabila7@gmail.com'

/**
 * Membuat transporter Nodemailer dengan konfigurasi dinamis (dari app_settings.json atau .env).
 * Jika kredensial belum diisi, menggunakan fallback jsonTransport aman.
 */
function createTransporter() {
  const settings = getAppSettings()
  const host = settings.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(settings.smtpPort || process.env.SMTP_PORT || 587)
  const user = (settings.smtpUser || process.env.SMTP_USER || '').trim()
  const pass = (settings.smtpPass || process.env.SMTP_PASS || '').trim()

  if (user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
      isConfigured: true,
      user,
      host,
    }
  }

  // Jika belum ada kredensial, gunakan JSON transport simulasi yang aman & tidak crash
  return {
    transporter: nodemailer.createTransport({
      jsonTransport: true,
    }),
    isConfigured: false,
    user: '',
    host,
  }
}

/**
 * Menghasilkan HTML template email yang presisi sesuai gaya notifikasi portal layanan digital resmi SI PADI
 */
export function generateNotificationEmailHtml(payload: EmailNotificationPayload): string {
  const urgencyColor =
    payload.severity === 'URGENT'
      ? '#ef4444'
      : payload.severity === 'WARNING'
      ? '#f59e0b'
      : '#3b82f6'

  const urgencyBg =
    payload.severity === 'URGENT'
      ? 'rgba(239, 68, 68, 0.15)'
      : payload.severity === 'WARNING'
      ? 'rgba(245, 158, 11, 0.15)'
      : 'rgba(59, 130, 246, 0.15)'

  const urgencyLabel =
    payload.severity === 'URGENT'
      ? '🔴 TENGGAT MENDESAK'
      : payload.severity === 'WARNING'
      ? '🟡 PERHATIAN'
      : '🔵 INFORMASI SISTEM'

  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const actionHref = payload.actionUrl?.startsWith('http')
    ? payload.actionUrl
    : `${appUrl}${payload.actionUrl || '/login'}`

  const nowFormatted = new Date(payload.timestamp || Date.now()).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )

  // Tentukan nama penerima yang sopan dan personal
  let namaPenerima = payload.petaniNama
  if (!namaPenerima) {
    if (payload.to?.toLowerCase().includes('karisma')) {
      namaPenerima = 'Karisma Siti Nabila'
    } else {
      namaPenerima = 'Petani / Administrator'
    }
  }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111827; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1f2937; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid #374151;">
          
          <!-- Header Banner (Mirip Pelayanan Digital Portal) -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); padding: 32px 28px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #bfdbfe; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
                      PEMERINTAH DESA CIREBON GIRANG
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.2;">
                      SI PADI &middot; DESA CIREBON GIRANG
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #dbeafe; font-weight: 500;">
                      Portal Informasi & Layanan Digital Pertanian Padi
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 24px; background-color: #1f2937;">
              
              <!-- Salutation Greeting -->
              <div style="font-size: 14px; color: #9ca3af; margin-bottom: 12px; font-weight: 500;">
                Yth. Bapak/Ibu <strong style="color: #ffffff;">${namaPenerima}</strong>,
              </div>

              <!-- Big Title -->
              <h2 style="margin: 0 0 16px 0; font-size: 19px; font-weight: 800; color: #ffffff; line-height: 1.35; letter-spacing: -0.01em;">
                Pembaruan Sistem: ${payload.title}
              </h2>

              <!-- Urgency Badge -->
              <div style="margin-bottom: 18px;">
                <span style="display: inline-block; background-color: ${urgencyBg}; border: 1px solid ${urgencyColor}; color: ${urgencyColor}; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
                  ${urgencyLabel}
                </span>
              </div>

              <!-- Message Card Box -->
              <div style="background-color: #111827; border-left: 4px solid #3b82f6; padding: 16px 18px; border-radius: 0 12px 12px 0; margin-bottom: 24px; font-size: 14px; line-height: 1.65; color: #e5e7eb; border-top: 1px solid #374151; border-right: 1px solid #374151; border-bottom: 1px solid #374151;">
                ${payload.message}
              </div>

              <!-- Detail Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111827; border: 1px solid #374151; border-radius: 12px; margin-bottom: 26px; font-size: 13px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; width: 38%; color: #9ca3af; font-weight: 600;">
                    🌾 Petak Lahan Sawah
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #ffffff; font-weight: 700;">
                    ${payload.lahanNama || 'Hamparan Sawah Desa Cirebon Girang'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #9ca3af; font-weight: 600;">
                    👤 Penanggung Jawab
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #ffffff; font-weight: 700;">
                    ${payload.petaniNama || 'Bapak Sukardi (Poktan Sri Rejeki)'}
                  </td>
                </tr>
                ${
                  payload.hst
                    ? `<tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #9ca3af; font-weight: 600;">
                    🌱 Fase Pertumbuhan
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #34d399; font-weight: 700;">
                    ${payload.hst} HST (Hari Setelah Tanam)
                  </td>
                </tr>`
                    : ''
                }
                ${
                  payload.daysRemaining !== undefined
                    ? `<tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #9ca3af; font-weight: 600;">
                    ⏳ Estimasi Masa Panen
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #1f2937; color: #fbbf24; font-weight: 700;">
                    ${
                      payload.daysRemaining <= 0
                        ? '🔥 Hari H Siap Panen!'
                        : `${payload.daysRemaining} hari lagi menuju panen`
                    }
                  </td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 12px 16px; color: #9ca3af; font-weight: 600;">
                    ⏰ Waktu Notifikasi
                  </td>
                  <td style="padding: 12px 16px; color: #d1d5db;">
                    ${nowFormatted} WIB
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${actionHref}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16,185,129,0.4); letter-spacing: 0.02em;">
                  ${payload.actionLabel || 'Buka Layanan SI PADI &rarr;'}
                </a>
              </div>

              <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 14px;">
                Tautan aplikasi resmi: <a href="${appUrl}" style="color: #60a5fa; text-decoration: underline;">${appUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #111827; border-top: 1px solid #374151; padding: 22px 24px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #d1d5db;">
                Pemerintah Desa Cirebon Girang &middot; Kecamatan Talun, Kabupaten Cirebon
              </p>
              <p style="margin: 0 0 6px 0;">
                Sistem Informasi Pertanian Padi (SI PADI) didukung Kecerdasan Buatan (AI)
              </p>
              <p style="margin: 0; color: #6b7280;">
                Email pemberitahuan resmi ini ditujukan khusus kepada: <strong style="color: #9ca3af;">${payload.to || DEFAULT_NOTIFICATION_EMAIL}</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Mengirimkan notifikasi email dengan nama pengirim "SI PADI"
 */
export async function sendEmailNotification(payload: EmailNotificationPayload) {
  const settings = getAppSettings()
  const recipient = payload.to || settings.notificationTargetEmail || DEFAULT_NOTIFICATION_EMAIL
  const subject = payload.subject || `[SI PADI] ${payload.title}`
  const htmlContent = generateNotificationEmailHtml({ ...payload, to: recipient })

  // Nama pengirim email ditetapkan sebagai "SI PADI" agar tampil di inbox Gmail persis seperti platform
  const fromName = settings.smtpFromName || process.env.SMTP_FROM_NAME || 'SI PADI'
  const fromEmail = settings.smtpFromEmail || process.env.SMTP_FROM_EMAIL || 'Karismasitinabila7@gmail.com'
  const fromHeader = `"${fromName}" <${fromEmail}>`

  try {
    const { transporter, isConfigured } = createTransporter()
    const info = await transporter.sendMail({
      from: fromHeader,
      to: recipient,
      subject: subject,
      text: `${payload.title}\n\n${payload.message}\n\nLahan: ${payload.lahanNama || '-'}\nPetani: ${payload.petaniNama || '-'}\nWaktu: ${new Date().toISOString()}`,
      html: htmlContent,
    })

    console.log(`[Email Service - SI PADI] Notifikasi dikirimkan ke ${recipient}:`, {
      from: fromHeader,
      messageId: info.messageId,
      isConfigured,
      subject,
    })

    return {
      success: true,
      recipient,
      from: fromHeader,
      messageId: info.messageId,
      isSimulated: !isConfigured,
      note: !isConfigured
        ? 'Tersimpan dalam mode simulasi server. Masukkan Akun & Sandi Aplikasi Google (16 huruf) di Admin > Konfigurasi agar email otomatis terkirim langsung dari server ke HP tanpa nama akun pribadi.'
        : `Berhasil dikirimkan langsung oleh server SI PADI ke ${recipient} dengan pengirim "${fromName}".`,
    }
  } catch (error: any) {
    console.error('[Email Service - SI PADI] Gagal mengirimkan email:', error)
    return {
      success: false,
      recipient,
      error: error.message || 'Gagal mengirim email',
    }
  }
}

/**
 * Helper untuk membuat URL Gmail Compose yang langsung terisi nama pengirim, penerima,
 * subjek bertema [SI PADI], dan body teks rapi.
 */
export function buildGmailComposeUrl(payload: EmailNotificationPayload): string {
  const recipient = payload.to || DEFAULT_NOTIFICATION_EMAIL
  const subject = encodeURIComponent(payload.subject || `[SI PADI] ${payload.title}`)
  const bodyText = encodeURIComponent(
    `📢 SI PADI - DESA CIREBON GIRANG\n` +
      `Portal Informasi & Layanan Digital Pertanian Padi\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Yth. Bapak/Ibu ${payload.petaniNama || 'Karisma Siti Nabila'},\n\n` +
      `⚠️ Pembaruan Sistem: ${payload.title}\n` +
      `🌾 Petak Sawah: ${payload.lahanNama || 'Hamparan Sawah Desa'}\n` +
      `👤 Penanggung Jawab: ${payload.petaniNama || 'Bapak Sukardi'}\n` +
      (payload.hst ? `🌱 Umur Tanaman: ${payload.hst} HST\n` : '') +
      (payload.daysRemaining !== undefined
        ? `⏳ Estimasi Panen: ${payload.daysRemaining <= 0 ? 'Hari H Siap Panen!' : `${payload.daysRemaining} hari lagi`}\n`
        : '') +
      `\n📋 Detail Pesan Pemberitahuan:\n${payload.message}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Pemberitahuan resmi dikirim melalui SI PADI (Sistem Informasi Pertanian Padi).\n` +
      `Pemerintah Desa Cirebon Girang, Kec. Talun, Kab. Cirebon`
  )

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipient
  )}&su=${subject}&body=${bodyText}`
}
