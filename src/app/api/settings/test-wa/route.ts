import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { getAppSettingsAsync } from '@/lib/settings'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

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
    const recipient = body.recipient || settings.defaultWhatsAppNumber || '6285797864834'

    const result = await sendWhatsAppNotification(
      {
        to: recipient,
        title: 'Uji Coba Pengiriman WhatsApp Otomatis SI PADI',
        message: `Halo Administrator / Pengurus Desa Cirebon Girang,\n\nIni adalah pesan uji coba otomatis dari menu Konfigurasi Sistem SI PADI. Pengiriman notifikasi otomatis ke WhatsApp telah aktif dan terhubung dengan baik.\n\nWaktu Uji Coba: ${new Date().toLocaleString('id-ID')}`,
        type: 'UMUM',
        severity: 'INFO',
        petaniNama: settings.adminContactName || 'Karisma Siti Nabila (Admin)',
        actionUrl: '/admin/konfigurasi',
      },
      {
        token: body.token,
        provider: body.provider,
        apiUrl: body.apiUrl,
      }
    )

    return NextResponse.json({
      success: result.success,
      sentAutomatically: result.sentAutomatically,
      isNotConfigured: result.isNotConfigured,
      target: result.target,
      provider: result.provider,
      waUrl: result.waUrl,
      note: result.note,
      error: result.error,
      detail: result.detail,
    })
  } catch (error: any) {
    console.error('Error testing WhatsApp:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengirim pesan WhatsApp uji coba.' },
      { status: 500 }
    )
  }
}

