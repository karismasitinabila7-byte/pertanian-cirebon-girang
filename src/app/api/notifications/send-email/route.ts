import { NextRequest, NextResponse } from 'next/server'
import {
  sendEmailNotification,
  DEFAULT_NOTIFICATION_EMAIL,
  buildGmailComposeUrl,
  EmailNotificationPayload,
} from '@/lib/email'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const targetEmail = body.to || DEFAULT_NOTIFICATION_EMAIL

    // Mode 1: Kirim rangkuman SEMUA peringatan dini aktif (Digest Email)
    if (body.action === 'SEND_ALL_WARNINGS') {
      const today = new Date()
      const activeSeasons = await prisma.musimTanam.findMany({
        where: { status: 'BERJALAN' },
        include: {
          lahan: {
            include: {
              petani: true,
            },
          },
          aktivitas: {
            orderBy: { tanggal: 'desc' },
            take: 3,
          },
        },
      })

      const warningItems: string[] = []

      for (const m of activeSeasons) {
        const tTanam = new Date(m.tanggalTanam)
        const tPanen = new Date(m.estimasiPanen)
        const diffTanamMs = today.getTime() - tTanam.getTime()
        const hst = Math.floor(diffTanamMs / (1000 * 60 * 60 * 24))
        const diffPanenMs = tPanen.getTime() - today.getTime()
        const sisaHariPanen = Math.ceil(diffPanenMs / (1000 * 60 * 60 * 24))
        const lahan = m.lahan?.namaLahan || 'Lahan Sawah'
        const petani = m.lahan?.petani?.namaLengkap || 'Bapak Sukardi'

        if (hst >= 5 && hst <= 20) {
          warningItems.push(
            `• [Pemupukan Dasar I] Musim "${m.namaMusim}" di ${lahan} (${petani}) berumur ${hst} HST.`
          )
        } else if (hst >= 21 && hst <= 35) {
          warningItems.push(
            `• [Pemupukan Susulan I] Musim "${m.namaMusim}" di ${lahan} (${petani}) fase anakan aktif (${hst} HST).`
          )
        }

        if (sisaHariPanen <= 14) {
          warningItems.push(
            `• [Panen Mendekati] Musim "${m.namaMusim}" di ${lahan} (${petani}) estimasi panen ${sisaHariPanen} hari lagi.`
          )
        }
      }

      // Tambahkan info waspada cuaca desa
      warningItems.push(
        `• [Hama & Cuaca] Waspada kelembapan tinggi terhadap wereng batang coklat (WBC) di Blok Manis & Wage.`
      )

      const digestMessage =
        `Halo Karisma Siti Nabila (Admin),\n\n` +
        `Berikut adalah ringkasan peringatan dini pertanian padi aktif di Desa Cirebon Girang:\n\n` +
        warningItems.join('\n\n') +
        `\n\nSilakan tinjau data selengkapnya melalui Dashboard SI PADI.`

      const payload: EmailNotificationPayload = {
        to: targetEmail,
        subject: `[SI PADI] Rekapitulasi Peringatan Dini Pertanian Desa Cirebon Girang (${today.toLocaleDateString('id-ID')})`,
        title: `Rekapitulasi Peringatan Dini Pertanian Desa Cirebon Girang`,
        message: digestMessage,
        severity: 'WARNING',
        actionUrl: '/admin',
        actionLabel: 'Buka Dashboard Admin',
      }

      const result = await sendEmailNotification(payload)
      const gmailUrl = buildGmailComposeUrl(payload)

      return NextResponse.json({
        success: result.success,
        targetEmail,
        result,
        gmailUrl,
        totalWarnings: warningItems.length,
      })
    }

    // Mode 2: Kirim satu notifikasi spesifik
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
      actionLabel,
    } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Field title dan message wajib disertakan.' },
        { status: 400 }
      )
    }

    const payload: EmailNotificationPayload = {
      to: targetEmail,
      subject: `[SI PADI] ${title}`,
      title,
      message,
      type: type || 'UMUM',
      severity: severity || 'WARNING',
      lahanNama,
      petaniNama,
      hst,
      daysRemaining,
      actionUrl: actionUrl || '/admin',
      actionLabel: actionLabel || 'Buka Sistem Pertanian',
    }

    const result = await sendEmailNotification(payload)
    const gmailUrl = buildGmailComposeUrl(payload)

    return NextResponse.json({
      success: result.success,
      targetEmail,
      result,
      gmailUrl,
    })
  } catch (error: any) {
    console.error('Error in send-email route:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses pengiriman email.' },
      { status: 500 }
    )
  }
}
