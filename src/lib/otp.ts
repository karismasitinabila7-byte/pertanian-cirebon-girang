import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { sendWhatsAppNotification, formatWhatsAppPhone } from '@/lib/whatsapp'
import { sendEmailNotification } from '@/lib/email'

let otpTableEnsured = false

/**
 * Memastikan tabel `otp_verifications` tersedia di MySQL / TiDB Cloud
 * meskipun `prisma db push` belum dijalankan ke database cloud.
 */
export async function ensureOtpTable() {
  if (otpTableEnsured) return
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`otp_verifications\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`phone\` VARCHAR(191) NOT NULL,
        \`otpCode\` VARCHAR(191) NOT NULL,
        \`purpose\` VARCHAR(191) NOT NULL DEFAULT 'REGISTER_PETANI',
        \`payloadJson\` TEXT NOT NULL,
        \`attempts\` INT NOT NULL DEFAULT 0,
        \`verifiedAt\` DATETIME(3) NULL,
        \`expiresAt\` DATETIME(3) NOT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX \`otp_verifications_email_purpose_idx\`(\`email\`, \`purpose\`),
        INDEX \`otp_verifications_phone_purpose_idx\`(\`phone\`, \`purpose\`),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `)
    otpTableEnsured = true
  } catch (err) {
    console.warn('Gagal memastikan tabel otp_verifications:', (err as any)?.message)
  }
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

export function maskEmailAddress(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`
  return `${local.slice(0, 2)}${'*'.repeat(Math.min(4, local.length - 2))}@${domain}`
}

export function maskPhoneNumber(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length <= 6) return clean
  return `${clean.slice(0, 4)}${'*'.repeat(Math.max(3, clean.length - 8))}${clean.slice(-4)}`
}

export interface SendDualOtpParams {
  otpCode: string
  namaLengkap: string
  email: string
  phone: string
}

export async function sendDualChannelOtp({ otpCode, namaLengkap, email, phone }: SendDualOtpParams) {
  const normalizedPhone = formatWhatsAppPhone(phone, phone)

  const waPromise = sendWhatsAppNotification({
    to: normalizedPhone,
    type: 'OTP',
    severity: 'INFO',
    title: 'Kode OTP Pendaftaran Akun Petani SI PADI',
    petaniNama: namaLengkap,
    message:
      `Kode OTP verifikasi pendaftaran akun petani Anda adalah:\n\n` +
      `👉 *${otpCode}*\n\n` +
      `Kode ini berlaku selama *5 menit*. Masukkan kode tersebut pada halaman pendaftaran SI PADI Desa Cirebon Girang.`,
    actionUrl: '/register',
  })

  const emailPromise = sendEmailNotification({
    to: email,
    subject: `[SI PADI] Kode OTP Verifikasi Pendaftaran: ${otpCode}`,
    title: 'Kode OTP Pendaftaran Akun Petani SI PADI',
    severity: 'INFO',
    petaniNama: namaLengkap,
    message:
      `Halo ${namaLengkap}, gunakan kode OTP 6 digit berikut untuk menyelesaikan pendaftaran akun Petani SI PADI Desa Cirebon Girang:\n\n` +
      `KODE OTP: ${otpCode}\n\n` +
      `Kode berlaku selama 5 menit. Demi keamanan, jangan bagikan kode ini kepada siapa pun.`,
    actionUrl: '/register',
  })

  const [waSettled, emailSettled] = await Promise.allSettled([waPromise, emailPromise])

  const waResult =
    waSettled.status === 'fulfilled'
      ? waSettled.value
      : {
          success: false,
          sentAutomatically: false,
          isNotConfigured: false,
          note: waSettled.reason?.message || 'Gagal mengirim OTP via WhatsApp',
        }

  const emailResult =
    emailSettled.status === 'fulfilled'
      ? emailSettled.value
      : {
          success: false,
          isSimulated: true,
          note: emailSettled.reason?.message || 'Gagal mengirim OTP via Email',
        }

  return {
    normalizedPhone,
    whatsapp: {
      sentAutomatically: Boolean(waResult.sentAutomatically),
      isNotConfigured: Boolean((waResult as any).isNotConfigured),
      note: (waResult as any).note || (waResult as any).error || '',
    },
    email: {
      sent: Boolean(emailResult.success),
      isSimulated: Boolean((emailResult as any).isSimulated),
      note: (emailResult as any).note || (emailResult as any).error || '',
    },
  }
}
