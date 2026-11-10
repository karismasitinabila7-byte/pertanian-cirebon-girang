import prisma from '@/lib/prisma'
import { sendEmailNotification, buildGmailComposeUrl } from '@/lib/email'
import crypto from 'crypto'

export interface BroadcastNotificationItem {
  id: string
  senderId?: string | null
  senderName?: string | null
  targetRole: string // 'ALL' | 'PETANI' | 'PERANGKAT_DESA' | 'SPESIFIK'
  targetPetaniId?: string | null
  targetPetaniName?: string | null
  title: string
  message: string
  category: string
  severity: 'URGENT' | 'WARNING' | 'INFO'
  recipientEmail?: string | null
  recipientPhone?: string | null
  sentViaEmail: boolean
  sentViaWa: boolean
  actionUrl?: string | null
  actionLabel?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateBroadcastInput {
  senderId?: string
  senderName?: string
  targetRole?: 'ALL' | 'PETANI' | 'PERANGKAT_DESA' | 'SPESIFIK'
  targetPetaniId?: string
  targetPetaniName?: string
  title: string
  message: string
  category?: 'PEMUPUKAN' | 'PANEN' | 'HAMA_CUACA' | 'PENGUMUMAN' | 'BANTUAN' | 'IRIGASI' | 'UMUM'
  severity?: 'URGENT' | 'WARNING' | 'INFO'
  recipientEmail?: string
  recipientPhone?: string
  sendEmail?: boolean
  sendWa?: boolean
  actionUrl?: string
  actionLabel?: string
}

function generateId(): string {
  return 'notif_' + crypto.randomBytes(12).toString('hex')
}

/**
 * Simpan notifikasi manual / broadcast dari admin ke database MySQL.
 */
export async function createManualNotification(input: CreateBroadcastInput) {
  const id = generateId()
  const now = new Date()
  const targetRole = input.targetRole || 'ALL'
  const category = input.category || 'UMUM'
  const severity = input.severity || 'INFO'
  const sentViaEmail = !!input.sendEmail
  const sentViaWa = !!input.sendWa
  const senderName = input.senderName || 'Administrator Desa Cirebon Girang'
  const actionUrl = input.actionUrl || '/login'
  const actionLabel = input.actionLabel || 'Buka Sistem Pertanian'

  // Simpan record ke database menggunakan query aman
  await prisma.$executeRaw`
    INSERT INTO broadcast_notifications (
      id, senderId, senderName, targetRole, targetPetaniId, targetPetaniName,
      title, message, category, severity, recipientEmail, recipientPhone,
      sentViaEmail, sentViaWa, actionUrl, actionLabel, createdAt, updatedAt
    ) VALUES (
      ${id}, ${input.senderId || null}, ${senderName}, ${targetRole},
      ${input.targetPetaniId || null}, ${input.targetPetaniName || null},
      ${input.title.trim()}, ${input.message.trim()}, ${category}, ${severity},
      ${input.recipientEmail?.trim() || null}, ${input.recipientPhone?.trim() || null},
      ${sentViaEmail ? 1 : 0}, ${sentViaWa ? 1 : 0}, ${actionUrl}, ${actionLabel},
      ${now}, ${now}
    )
  `

  // Format link WhatsApp tujuan
  let waUrl = ''
  if (input.recipientPhone) {
    let cleanPhone = input.recipientPhone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    if (!cleanPhone.startsWith('62') && cleanPhone.length > 8) cleanPhone = '62' + cleanPhone

    const urgencyEmoji = severity === 'URGENT' ? '🔴 MENDESAK' : severity === 'WARNING' ? '🟡 PERHATIAN' : '🔵 INFORMASI'
    const waText = [
      `📢 *PEMBERITAHUAN RESMI PERTANIAN DESA CIREBON GIRANG*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⚠️ *Judul:* ${input.title}`,
      `🏷️ *Tingkat:* ${urgencyEmoji}`,
      input.targetPetaniName ? `👤 *Penerima:* ${input.targetPetaniName}` : `👥 *Target:* ${targetRole === 'ALL' ? 'Semua Petani & Perangkat Desa' : targetRole}`,
      ``,
      `📋 *Pesan:*`,
      input.message,
      ``,
      `⏰ *Waktu:* ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Pemberitahuan dari Administrator Sistem Pertanian Padi (SI PADI) Desa Cirebon Girang._`
    ].filter(Boolean).join('\n')

    waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waText)}`
  }

  // Kirim email jika diminta
  let emailResult: any = null
  let gmailUrl = ''
  if (sentViaEmail && input.recipientEmail) {
    emailResult = await sendEmailNotification({
      to: input.recipientEmail,
      subject: `[SI PADI] ${input.title}`,
      title: input.title,
      message: input.message,
      type: (category as any) || 'UMUM',
      severity: severity,
      petaniNama: input.targetPetaniName || 'Warga Tani Desa Cirebon Girang',
      actionUrl: actionUrl,
      actionLabel: actionLabel
    })

    gmailUrl = buildGmailComposeUrl({
      to: input.recipientEmail,
      subject: `[SI PADI] ${input.title}`,
      title: input.title,
      message: input.message,
      petaniNama: input.targetPetaniName,
      severity: severity,
    })
  }

  return {
    id,
    title: input.title,
    message: input.message,
    targetRole,
    targetPetaniName: input.targetPetaniName,
    recipientEmail: input.recipientEmail,
    recipientPhone: input.recipientPhone,
    waUrl,
    gmailUrl,
    emailResult,
    createdAt: now
  }
}

/**
 * Ambil daftar notifikasi manual untuk user berdasarkan perannya.
 * - ADMIN: Melihat seluruh notifikasi manual.
 * - PERANGKAT_DESA: Melihat notifikasi target ALL dan PERANGKAT_DESA.
 * - PETANI: Melihat notifikasi target ALL, PETANI, atau yang ditujukan khusus kepadanya (targetPetaniId).
 */
export async function getBroadcastNotificationsForUser(user: { role: string; userId?: string; petaniId?: string }): Promise<BroadcastNotificationItem[]> {
  try {
    let rows: any[] = []

    if (user.role === 'ADMIN') {
      rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM broadcast_notifications ORDER BY createdAt DESC LIMIT 30
      `
    } else if (user.role === 'PERANGKAT_DESA') {
      rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM broadcast_notifications 
        WHERE targetRole IN ('ALL', 'PERANGKAT_DESA')
        ORDER BY createdAt DESC LIMIT 30
      `
    } else {
      // Role PETANI
      const pId = user.petaniId || ''
      rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM broadcast_notifications 
        WHERE targetRole IN ('ALL', 'PETANI') 
           OR (targetRole = 'SPESIFIK' AND targetPetaniId = ${pId})
        ORDER BY createdAt DESC LIMIT 30
      `
    }

    return rows.map((r) => ({
      id: r.id,
      senderId: r.senderId,
      senderName: r.senderName,
      targetRole: r.targetRole,
      targetPetaniId: r.targetPetaniId,
      targetPetaniName: r.targetPetaniName,
      title: r.title,
      message: r.message,
      category: r.category,
      severity: r.severity as any,
      recipientEmail: r.recipientEmail,
      recipientPhone: r.recipientPhone,
      sentViaEmail: !!r.sentViaEmail,
      sentViaWa: !!r.sentViaWa,
      actionUrl: r.actionUrl,
      actionLabel: r.actionLabel,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  } catch (error) {
    console.error('Error fetching broadcast notifications:', error)
    return []
  }
}

/**
 * Hapus notifikasi manual
 */
export async function deleteBroadcastNotification(id: string) {
  return await prisma.$executeRaw`
    DELETE FROM broadcast_notifications WHERE id = ${id}
  `
}
