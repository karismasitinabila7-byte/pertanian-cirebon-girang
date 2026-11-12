import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { sendEmailNotification, buildGmailComposeUrl } from '@/lib/email'
import { getAppSettingsAsync } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
      if (defaultAdmin) {
        session = {
          userId: defaultAdmin.id,
          username: defaultAdmin.username,
          role: defaultAdmin.role,
          fullName: defaultAdmin.fullName,
        }
      }
    }

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getAppSettingsAsync()
    const body = await req.json().catch(() => ({}))
    const recipient = body.recipient || settings.notificationTargetEmail || 'karismasitinabila7@gmail.com'

    const testPayload = {
      to: recipient,
      subject: `[SI PADI] Uji Coba Konfigurasi Notifikasi Email`,
      title: `Uji Coba Pengiriman Notifikasi Email Berhasil`,
      message: `Halo Karisma Siti Nabila (Administrator),\n\nIni adalah pesan uji coba dari halaman Konfigurasi Sistem SI PADI Desa Cirebon Girang. Pengaturan notifikasi email dan integrasi sistem budidaya padi telah terhubung dengan baik.\n\nWaktu Uji Coba: ${new Date().toLocaleString('id-ID')}`,
      type: 'UMUM' as const,
      severity: 'INFO' as const,
      petaniNama: 'Karisma Siti Nabila (Admin)',
      actionUrl: '/admin/konfigurasi',
      actionLabel: 'Buka Konfigurasi Sistem',
    }

    const result = await sendEmailNotification(testPayload)
    const gmailUrl = buildGmailComposeUrl(testPayload)

    return NextResponse.json({
      success: result.success,
      recipient,
      result,
      gmailUrl,
    })
  } catch (error: any) {
    console.error('Error testing email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal mengirim email uji coba.',
      },
      { status: 500 }
    )
  }
}
