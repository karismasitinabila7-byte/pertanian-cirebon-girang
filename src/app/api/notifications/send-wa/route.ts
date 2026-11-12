import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getAppSettingsAsync } from '@/lib/settings'
import { sendWhatsAppNotification, WhatsAppNotificationPayload } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const settings = await getAppSettingsAsync()
    const targetPhone = body.to || settings.defaultWhatsAppNumber || '6285797864834'

    // Mode 1: Kirim rangkuman SEMUA peringatan dini aktif ke WhatsApp
    if (body.action === 'SEND_ALL_WARNINGS') {
      const today = new Date()
      const activeSeasons = await prisma.musimTanam.findMany({
        where: { status: 'BERJALAN' },
        include: {
          lahan: { include: { petani: true } },
        },
      })

      const warningItems: string[] = []

      for (const m of activeSeasons) {
        const tTanam = new Date(m.tanggalTanam)
        const tPanen = new Date(m.estimasiPanen)
        const hst = Math.floor((today.getTime() - tTanam.getTime()) / (1000 * 60 * 60 * 24))
        const sisaHariPanen = Math.ceil((tPanen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const lahan = m.lahan?.namaLahan || 'Lahan Sawah'
        const petani = m.lahan?.petani?.namaLengkap || 'Petani'

        if (hst >= 5 && hst <= 20) {
          warningItems.push(`• [Pemupukan Dasar I] "${m.namaMusim}" di ${lahan} (${petani}) umur ${hst} HST.`)
        } else if (hst >= 21 && hst <= 35) {
          warningItems.push(`• [Pemupukan Susulan] "${m.namaMusim}" di ${lahan} (${petani}) umur ${hst} HST.`)
        }

        if (sisaHariPanen <= 14) {
          warningItems.push(`• [Panen Mendekati] "${m.namaMusim}" di ${lahan} (${petani}) sisa ${sisaHariPanen} hari lagi.`)
        }
      }

      warningItems.push(
        `• [Hama & Cuaca] Waspada kelembapan tinggi terhadap wereng batang coklat (WBC) di Blok Manis & Wage.`
      )

      const payload: WhatsAppNotificationPayload = {
        to: targetPhone,
        title: `Rekapitulasi Peringatan Dini Pertanian (${today.toLocaleDateString('id-ID')})`,
        message: `Ringkasan peringatan dini pertanian padi aktif di Desa Cirebon Girang:\n\n${warningItems.join('\n')}`,
        severity: 'WARNING',
        actionUrl: '/admin',
      }

      const result = await sendWhatsAppNotification(payload)

      if (session?.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'CREATE',
            entity: 'WhatsAppNotification',
            details: `Kirim otomatis ${warningItems.length} peringatan dini ke WhatsApp ${result.target} (${result.sentAutomatically ? 'Berhasil' : result.isNotConfigured ? 'Belum Konfigurasi Token' : 'Gagal'})`,
          },
        }).catch(() => {})
      }

      return NextResponse.json({
        success: result.success,
        sentAutomatically: result.sentAutomatically,
        isNotConfigured: result.isNotConfigured,
        target: result.target,
        waUrl: result.waUrl,
        result,
        totalWarnings: warningItems.length,
      })
    }

    // Mode 2: Kirim satu notifikasi spesifik ke WhatsApp
    const {
      title,
      message,
      type,
      severity,
      lahanNama,
      petaniNama,
      hst,
      daysRemaining,
      actionUrl,
    } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Field title dan message wajib disertakan.' },
        { status: 400 }
      )
    }

    const payload: WhatsAppNotificationPayload = {
      to: targetPhone,
      title,
      message,
      type,
      severity,
      lahanNama,
      petaniNama,
      hst,
      daysRemaining,
      actionUrl,
    }

    const result = await sendWhatsAppNotification(payload)

    if (session?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE',
          entity: 'WhatsAppNotification',
          details: `Kirim notifikasi "${title}" ke WhatsApp ${result.target} (${result.sentAutomatically ? 'Otomatis Berhasil' : result.isNotConfigured ? 'Token Belum Diatur' : result.error || 'Gagal'})`,
        },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: result.success,
      sentAutomatically: result.sentAutomatically,
      isNotConfigured: result.isNotConfigured,
      target: result.target,
      waUrl: result.waUrl,
      result,
    })
  } catch (error: any) {
    console.error('Error in send-wa API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses pengiriman WhatsApp.' },
      { status: 500 }
    )
  }
}

