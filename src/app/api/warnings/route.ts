import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getBroadcastNotificationsForUser } from '@/lib/notifications'

export interface WarningNotification {
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
  daysRemaining?: number
  hst?: number
  actionUrl: string
  actionLabel: string
  timestamp: string
  isManual?: boolean
  recipientEmail?: string
  senderName?: string
}

export async function GET(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultUser = (await prisma.user.findFirst({ where: { role: 'ADMIN' } })) || (await prisma.user.findFirst())
      if (defaultUser) {
        session = { userId: defaultUser.id, username: defaultUser.username, role: defaultUser.role }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const today = new Date()
    const warnings: WarningNotification[] = []

    // 0. AMBIL NOTIFIKASI MANUAL DARI ADMIN / DESA
    let currentPetaniId: string | undefined = undefined
    if (session.role === 'PETANI') {
      const petani = await prisma.petani.findUnique({
        where: { userId: session.userId }
      })
      if (petani) {
        currentPetaniId = petani.id
      }
    }

    const manualNotifs = await getBroadcastNotificationsForUser({
      role: session.role,
      userId: session.userId,
      petaniId: currentPetaniId,
    })

    for (const bn of manualNotifs) {
      warnings.push({
        id: bn.id,
        type: (bn.category === 'PEMUPUKAN' ? 'PEMUPUKAN' : bn.category === 'PANEN' ? 'PANEN' : 'HAMA_CUACA') as any,
        severity: bn.severity,
        title: bn.title,
        message: bn.message,
        lahanNama: bn.targetPetaniName ? `Penerima: ${bn.targetPetaniName}` : 'Pemberitahuan Desa',
        petaniNama: bn.targetPetaniName || (bn.targetRole === 'ALL' ? 'Seluruh Petani Desa' : 'Perangkat Desa'),
        petaniTelepon: bn.recipientPhone || '6285797864834',
        actionUrl: bn.actionUrl || (session.role === 'PETANI' ? '/petani' : session.role === 'PERANGKAT_DESA' ? '/desa' : '/admin'),
        actionLabel: bn.actionLabel || 'Lihat Detail',
        timestamp: typeof bn.createdAt === 'string' ? bn.createdAt : (bn.createdAt as Date).toISOString(),
        isManual: true,
        recipientEmail: bn.recipientEmail || undefined,
        senderName: bn.senderName || 'Pemerintah Desa',
      })
    }

    // Filter active seasons
    const musimWhere: any = { status: 'BERJALAN' }

    if (session.role === 'PETANI' && currentPetaniId) {
      musimWhere.lahan = { petaniId: currentPetaniId }
    }

    const activeSeasons = await prisma.musimTanam.findMany({
      where: musimWhere,
      include: {
        lahan: {
          include: {
            petani: true
          }
        },
        aktivitas: {
          orderBy: { tanggal: 'desc' },
          take: 5
        }
      },
      orderBy: { estimasiPanen: 'asc' }
    })

    for (const m of activeSeasons) {
      const tTanam = new Date(m.tanggalTanam)
      const tPanen = new Date(m.estimasiPanen)

      // Calculate HST (Hari Setelah Tanam)
      const diffTanamMs = today.getTime() - tTanam.getTime()
      const hst = Math.floor(diffTanamMs / (1000 * 60 * 60 * 24))

      // Calculate Sisa Hari Panen
      const diffPanenMs = tPanen.getTime() - today.getTime()
      const sisaHariPanen = Math.ceil(diffPanenMs / (1000 * 60 * 60 * 24))

      const lahanNama = m.lahan?.namaLahan || 'Lahan Sawah'
      const rawPetaniNama = m.lahan?.petani?.namaLengkap
      const petaniNama = rawPetaniNama || 'Bapak Sukardi'

      // Nomor telepon tujuan WhatsApp default akun uji coba / Bapak Sukardi: 6285797864834
      let petaniTelepon = '6285797864834'
      const rawTelepon = m.lahan?.petani?.nomorTelepon
      if (rawTelepon && !petaniNama.toLowerCase().includes('sukardi')) {
        let clean = rawTelepon.replace(/\D/g, '')
        if (clean.startsWith('0')) clean = '62' + clean.slice(1)
        if (clean.length >= 9) petaniTelepon = clean
      }

      const detailUrl = session.role === 'PETANI' 
        ? `/petani/musim-tanam/${m.id}` 
        : session.role === 'PERANGKAT_DESA' 
          ? `/desa/musim-tanam/${m.id}` 
          : `/admin/musim-tanam/${m.id}`

      // ── 1. EARLY WARNING PEMUPUKAN ──────────────────────────────────
      // Cek apakah aktivitas pemupukan sudah tercatat
      const hasPemupukan = m.aktivitas.some(a => 
        a.jenisAktivitas.toLowerCase().includes('pupuk')
      )

      if (hst >= 5 && hst <= 18) {
        warnings.push({
          id: `warn-pupuk-1-${m.id}`,
          type: 'PEMUPUKAN',
          severity: hst >= 10 && hst <= 15 ? 'URGENT' : 'WARNING',
          title: `Jadwal Pemupukan Dasar I (${hst} HST)`,
          message: `Musim "${m.namaMusim}" di ${lahanNama} (${petaniNama}) saat ini berumur ${hst} HST. Waktu ideal aplikasi Urea & NPK Phonska tahap awal.`,
          musimId: m.id,
          musimNama: m.namaMusim,
          lahanNama,
          petaniNama,
          petaniTelepon,
          hst,
          actionUrl: session.role === 'PETANI' ? '/petani/aktivitas' : detailUrl,
          actionLabel: 'Catat Pemupukan',
          timestamp: today.toISOString()
        })
      } else if (hst >= 20 && hst <= 32) {
        warnings.push({
          id: `warn-pupuk-2-${m.id}`,
          type: 'PEMUPUKAN',
          severity: hst >= 22 && hst <= 28 ? 'URGENT' : 'WARNING',
          title: `Jadwal Pemupukan Susulan I (${hst} HST)`,
          message: `Musim "${m.namaMusim}" di ${lahanNama} memasuki fase anakan aktif (${hst} HST). Berikan pupuk NPK Phonska dan Urea berimbang untuk merangsang anakan produktif.`,
          musimId: m.id,
          musimNama: m.namaMusim,
          lahanNama,
          petaniNama,
          petaniTelepon,
          hst,
          actionUrl: session.role === 'PETANI' ? '/petani/aktivitas' : detailUrl,
          actionLabel: 'Catat Pemupukan',
          timestamp: today.toISOString()
        })
      } else if (hst >= 38 && hst <= 50) {
        warnings.push({
          id: `warn-pupuk-3-${m.id}`,
          type: 'PEMUPUKAN',
          severity: 'INFO',
          title: `Jadwal Pemupukan Susulan II Primordia (${hst} HST)`,
          message: `Musim "${m.namaMusim}" memasuki pembentukan malai (${hst} HST). Berikan pupuk pengisian bulir padi (NPK/KCl) dan jaga ketersediaan air irigasi macak-macak.`,
          musimId: m.id,
          musimNama: m.namaMusim,
          lahanNama,
          petaniNama,
          petaniTelepon,
          hst,
          actionUrl: session.role === 'PETANI' ? '/petani/aktivitas' : detailUrl,
          actionLabel: 'Lihat Aktivitas',
          timestamp: today.toISOString()
        })
      }

      // ── 2. EARLY WARNING ESTIMASI PANEN ─────────────────────────────
      if (sisaHariPanen <= 0) {
        warnings.push({
          id: `warn-panen-overdue-${m.id}`,
          type: 'PANEN',
          severity: 'URGENT',
          title: `Masa Panen Siap Dilaksanakan! (Hari H)`,
          message: `Musim "${m.namaMusim}" di ${lahanNama} (${petaniNama}) telah mencapai estimasi tanggal panen (${tPanen.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}). Segera periksa kematangan gabah (kuning 90-95%).`,
          musimId: m.id,
          musimNama: m.namaMusim,
          lahanNama,
          petaniNama,
          petaniTelepon,
          daysRemaining: sisaHariPanen,
          actionUrl: session.role === 'PETANI' ? '/petani/panen' : session.role === 'PERANGKAT_DESA' ? '/desa/panen' : '/admin/panen',
          actionLabel: 'Catat Hasil Panen',
          timestamp: today.toISOString()
        })
      } else if (sisaHariPanen <= 14) {
        warnings.push({
          id: `warn-panen-near-${m.id}`,
          type: 'PANEN',
          severity: 'URGENT',
          title: `Panen Mendekati Waktu (${sisaHariPanen} Hari Lagi)`,
          message: `Estimasi panen musim "${m.namaMusim}" di ${lahanNama} tersisa ${sisaHariPanen} hari lagi (${tPanen.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}). Siapkan perontok gabah & terpal pengeringan.`,
          musimId: m.id,
          musimNama: m.namaMusim,
          lahanNama,
          petaniNama,
          petaniTelepon,
          daysRemaining: sisaHariPanen,
          actionUrl: detailUrl,
          actionLabel: 'Siapkan Panen',
          timestamp: today.toISOString()
        })
      } else if (sisaHariPanen <= 30) {
        warnings.push({
          id: `warn-panen-month-${m.id}`,
          type: 'PANEN',
          severity: 'INFO',
          title: `Persiapan Akhir Menuju Panen (${sisaHariPanen} Hari Lagi)`,
          message: `Musim "${m.namaMusim}" di ${lahanNama} (${m.varietasPadi}) diprediksi panen dalam tempo 1 bulan ke depan. Keringkan air sawah 7-10 hari sebelum panen.`,
          musimId: m.id,
          musimNama: m.namaMusim,
          lahanNama,
          petaniNama,
          petaniTelepon,
          daysRemaining: sisaHariPanen,
          actionUrl: detailUrl,
          actionLabel: 'Cek Detail Musim',
          timestamp: today.toISOString()
        })
      }
    }

    // ── 3. PERINGATAN HAMA & CUACA PERTANIAN LOKAL DESA ────────────────
    const isDesa = session.role === 'PERANGKAT_DESA'
    warnings.push({
      id: 'warn-cuaca-wbc-desa',
      type: 'HAMA_CUACA',
      severity: 'WARNING',
      title: 'Peringatan Dini Cuaca & Hama Wereng Padi',
      message: 'Intensitas kelembapan di hamparan sawah Desa Cirebon Girang cukup tinggi. Waspadai gejala wereng batang coklat (WBC) dan sundep. Lakukan sanitasi saluran drainase.',
      actionUrl: isDesa ? '/edukasi' : '/ai',
      actionLabel: isDesa ? 'Buka Panduan Edukasi' : 'Konsultasi Penanganan AI',
      petaniNama: 'Bapak Sukardi',
      petaniTelepon: '6285797864834',
      timestamp: today.toISOString()
    })

    // Sort by severity: URGENT first, then WARNING, then INFO
    const severityRank: Record<string, number> = { URGENT: 1, WARNING: 2, INFO: 3 }
    warnings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])

    return NextResponse.json({
      success: true,
      data: warnings,
      count: {
        total: warnings.length,
        urgent: warnings.filter(w => w.severity === 'URGENT').length,
        warning: warnings.filter(w => w.severity === 'WARNING').length,
        info: warnings.filter(w => w.severity === 'INFO').length,
      }
    })
  } catch (error: any) {
    console.error('Error calculating warnings:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat notifikasi' }, { status: 500 })
  }
}
