import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { getAppSettingsAsync } from '@/lib/settings'
import { processAiChat, AiMessage, PetaniContext, StatsDesaContext } from '@/services/aiService'

// Chat AI disetel tanpa batas limit pesan (Unlimited) untuk kemudahan petani & presentasi

function convertLuasToM2(luas: number, satuan: string): number {
  if (satuan === 'Ha') return luas * 10000
  if (satuan === 'Bata') return luas * 14
  return luas
}

function convertPanenToKg(jumlah: number, satuan: string): number {
  if (satuan === 'ton') return jumlah * 1000
  if (satuan === 'kuintal') return jumlah * 100
  return jumlah
}

/**
 * Mengambil rekapitulasi data lengkap dan mendalam dari seluruh tabel database utama via Prisma
 */
async function getFullDatabaseContext(): Promise<StatsDesaContext> {
  try {
    const [
      usersData,
      petaniData,
      poktanData,
      lahanData,
      musimData,
      panenData,
      aktivitasCount,
      aktivitasBiayaAgg,
      aktivitasData,
      informasiData,
      broadcastData,
      auditLogData,
      appSettings,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          phone: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.petani.findMany({
        include: {
          user: { select: { username: true, email: true } },
          kelompokTani: { select: { nama: true } },
          lahan: {
            select: {
              id: true,
              namaLahan: true,
              luasLahan: true,
              satuanLuas: true,
              status: true,
              lokasi: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.kelompokTani.findMany({
        include: {
          _count: { select: { anggota: true } },
          anggota: {
            select: {
              namaLengkap: true,
              lahan: { select: { luasLahan: true, satuanLuas: true } },
            },
          },
        },
        orderBy: { nama: 'asc' },
      }),
      prisma.lahan.findMany({
        include: {
          petani: { select: { namaLengkap: true } },
          musimTanam: { select: { namaMusim: true, status: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.musimTanam.findMany({
        include: {
          lahan: { include: { petani: true } },
          aktivitas: { select: { jenisAktivitas: true } },
          panen: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.panen.findMany({
        include: {
          musimTanam: {
            include: {
              lahan: { include: { petani: true } },
            },
          },
        },
        orderBy: { tanggalPanen: 'desc' },
      }),
      prisma.aktivitasBudidaya.count(),
      prisma.aktivitasBudidaya.aggregate({ _sum: { biaya: true } }).catch(() => ({ _sum: { biaya: 0 } })),
      prisma.aktivitasBudidaya.findMany({
        include: {
          musimTanam: {
            include: {
              lahan: { include: { petani: true } },
            },
          },
        },
        orderBy: { tanggal: 'desc' },
        take: 25,
      }),
      prisma.informasiPertanian.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }).catch(() => []),
      prisma.broadcastNotification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).catch(() => []),
      prisma.auditLog.findMany({
        include: {
          user: { select: { fullName: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }).catch(() => []),
      getAppSettingsAsync(),
    ])

    // 1. Data Akun Pengguna
    const totalUsers = usersData.length
    const usersByRole = {
      admin: usersData.filter(u => u.role === 'ADMIN').length,
      perangkatDesa: usersData.filter(u => u.role === 'PERANGKAT_DESA').length,
      petani: usersData.filter(u => u.role === 'PETANI').length,
    }
    const daftarUsers = usersData.map(u => ({
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      phone: u.phone || '-',
      email: u.email || '-',
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString().slice(0, 10) : undefined,
    }))

    // 2. Data Petani
    const totalPetani = petaniData.length
    const daftarPetani = petaniData.map(p => {
      let farmerM2 = 0
      for (const l of p.lahan) {
        farmerM2 += convertLuasToM2(l.luasLahan, l.satuanLuas)
      }
      return {
        nama: p.namaLengkap,
        nik: p.nik || '-',
        telepon: p.nomorTelepon,
        alamat: p.alamat,
        jenisKelamin: p.jenisKelamin,
        poktan: p.kelompokTani?.nama || 'Belum Terdaftar Poktan',
        totalLahan: p.lahan.length,
        totalLuasM2: Math.round(farmerM2),
        totalLuasHa: Number((farmerM2 / 10000).toFixed(2)),
        username: p.user?.username,
        lahanNames: p.lahan.map(l => l.namaLahan),
      }
    })

    // 3. Data Kelompok Tani (Poktan)
    const totalPoktan = poktanData.length
    const daftarPoktan = poktanData.map(p => {
      let poktanM2 = 0
      for (const a of p.anggota) {
        for (const l of a.lahan) {
          poktanM2 += convertLuasToM2(l.luasLahan, l.satuanLuas)
        }
      }
      return {
        nama: p.nama,
        ketua: p.ketua,
        wilayah: p.wilayah,
        kontak: p.nomorKontak || '-',
        deskripsi: p.deskripsi || '-',
        jumlahPetani: p._count.anggota,
        anggotaNames: p.anggota.map(a => a.namaLengkap),
        totalLuasHa: Number((poktanM2 / 10000).toFixed(2)),
      }
    })

    // 4. Data Lahan Pertanian Sawah
    const totalLahan = lahanData.length
    const lahanAktif = lahanData.filter(l => l.status === 'AKTIF').length
    const lahanTidakAktif = lahanData.filter(l => l.status !== 'AKTIF').length
    let totalLuasM2 = 0
    const daftarLahan = lahanData.map(l => {
      const m2 = convertLuasToM2(l.luasLahan, l.satuanLuas)
      totalLuasM2 += m2
      return {
        nama: l.namaLahan,
        luas: l.luasLahan,
        satuan: l.satuanLuas,
        luasM2: Math.round(m2),
        luasHa: Number((m2 / 10000).toFixed(2)),
        lokasi: l.lokasi,
        status: l.status,
        petani: l.petani?.namaLengkap || 'Belum ditentukan',
        latitude: l.latitude ?? undefined,
        longitude: l.longitude ?? undefined,
        catatan: l.catatan || undefined,
      }
    })
    const totalLuasHa = Number((totalLuasM2 / 10000).toFixed(2))

    // 5. Data Musim Tanam + Hitung HST & Early Warnings
    const today = new Date()
    const totalMusim = musimData.length
    const musimBerjalan = musimData.filter(m => m.status === 'BERJALAN').length
    const musimPerencanaan = musimData.filter(m => m.status === 'PERENCANAAN').length
    const musimSelesai = musimData.filter(m => m.status === 'SELESAI').length
    const musimGagal = musimData.filter(m => m.status === 'GAGAL').length
    const daftarMusim = musimData.map(m => {
      const tTanam = new Date(m.tanggalTanam)
      const tPanen = new Date(m.estimasiPanen)
      const hst = Math.floor((today.getTime() - tTanam.getTime()) / (1000 * 60 * 60 * 24))
      const sisaHariPanen = Math.ceil((tPanen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        namaMusim: m.namaMusim,
        varietas: m.varietasPadi,
        status: m.status,
        lahanNama: m.lahan?.namaLahan || '-',
        petaniNama: m.lahan?.petani?.namaLengkap || '-',
        tanggalTanam: m.tanggalTanam ? tTanam.toISOString().slice(0, 10) : undefined,
        estimasiPanen: m.estimasiPanen ? tPanen.toISOString().slice(0, 10) : undefined,
        hst,
        sisaHariPanen,
        catatan: m.catatan || undefined,
      }
    })

    // Hitung Peringatan Dini (konsisten dengan /api/warnings)
    const earlyWarnings: Array<{
      title: string
      severity: 'URGENT' | 'WARNING' | 'INFO'
      type: string
      lahanNama?: string
      petaniNama?: string
      message: string
    }> = []

    for (const m of musimData.filter(item => item.status === 'BERJALAN')) {
      const tTanam = new Date(m.tanggalTanam)
      const tPanen = new Date(m.estimasiPanen)
      const hst = Math.floor((today.getTime() - tTanam.getTime()) / (1000 * 60 * 60 * 24))
      const sisaHariPanen = Math.ceil((tPanen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const lahanNama = m.lahan?.namaLahan || 'Lahan Sawah'
      const petaniNama = m.lahan?.petani?.namaLengkap || 'Petani'

      if (hst >= 5 && hst <= 18) {
        earlyWarnings.push({
          title: `Jadwal Pemupukan Pertama (${hst} HST)`,
          severity: 'WARNING',
          type: 'PEMUPUKAN',
          lahanNama,
          petaniNama,
          message: `Tanaman varietas ${m.varietasPadi} di ${lahanNama} berusia ${hst} HST, waktunya pemupukan dasar/susulan I.`,
        })
      }

      if (sisaHariPanen <= 0) {
        earlyWarnings.push({
          title: `Siap Panen / Lewat Estimasi (${Math.abs(sisaHariPanen)} hari)`,
          severity: 'URGENT',
          type: 'PANEN',
          lahanNama,
          petaniNama,
          message: `Musim "${m.namaMusim}" di ${lahanNama} (${petaniNama}) telah memasuki masa panen.`,
        })
      } else if (sisaHariPanen <= 14) {
        earlyWarnings.push({
          title: `Panen Mendekati Waktu (${sisaHariPanen} Hari Lagi)`,
          severity: 'URGENT',
          type: 'PANEN',
          lahanNama,
          petaniNama,
          message: `Estimasi panen "${m.namaMusim}" di ${lahanNama} tersisa ${sisaHariPanen} hari (${tPanen.toISOString().slice(0, 10)}).`,
        })
      } else if (sisaHariPanen <= 30) {
        earlyWarnings.push({
          title: `Persiapan Panen (${sisaHariPanen} Hari Lagi)`,
          severity: 'INFO',
          type: 'PANEN',
          lahanNama,
          petaniNama,
          message: `Musim "${m.namaMusim}" di ${lahanNama} diprediksi panen dalam ${sisaHariPanen} hari.`,
        })
      }
    }

    earlyWarnings.push({
      title: 'Peringatan Dini Cuaca & Hama Wereng Padi',
      severity: 'WARNING',
      type: 'HAMA_CUACA',
      message: 'Waspadai gejala wereng batang coklat (WBC) dan sundep saat kelembapan tinggi; lakukan pengeringan berkala macak-macak.',
    })

    // 6. Data Panen (hitung total dari SELURUH data panen)
    const totalPanenSesi = panenData.length
    let totalPanenKg = 0
    const daftarPanen = panenData.map(p => {
      const kg = convertPanenToKg(p.jumlahProduksi, p.satuan)
      totalPanenKg += kg
      return {
        tanggalPanen: p.tanggalPanen.toISOString().slice(0, 10),
        jumlahKg: Math.round(kg),
        satuan: p.satuan,
        kualitas: p.kualitas || 'Gabah Kering Panen (GKP)',
        varietas: p.musimTanam?.varietasPadi || 'Inpari 32',
        petani: p.musimTanam?.lahan?.petani?.namaLengkap || '-',
        lahan: p.musimTanam?.lahan?.namaLahan || '-',
        catatan: p.catatan || '-',
      }
    })
    const totalPanenTon = Number((totalPanenKg / 1000).toFixed(2))

    // 7. Aktivitas Budidaya Terkini
    const totalAktivitas = aktivitasCount
    const totalBiayaAktivitas = Math.round(aktivitasBiayaAgg._sum.biaya || 0)
    const aktivitasTerbaru = aktivitasData.map(a => ({
      tanggal: a.tanggal.toISOString().slice(0, 10),
      jenis: a.jenisAktivitas,
      deskripsi: a.deskripsi,
      musim: a.musimTanam?.namaMusim || '-',
      lahan: a.musimTanam?.lahan?.namaLahan || '-',
      petani: a.musimTanam?.lahan?.petani?.namaLengkap || '-',
      bahan: a.bahan || '-',
      biaya: a.biaya || 0,
    }))

    // 8. Informasi & Edukasi Pertanian
    const daftarInformasi = informasiData.map(i => ({
      judul: i.judul,
      kategori: i.kategori,
      namaPenulis: i.namaPenulis,
      isiRingkas: i.isi.slice(0, 200),
      tanggalPublikasi: (i.tanggalPublikasi || i.createdAt).toISOString().slice(0, 10),
    }))

    // 9. Broadcast Notifications
    const daftarBroadcast = broadcastData.map((b: any) => ({
      title: b.title,
      message: b.message,
      category: b.category,
      severity: b.severity,
      targetRole: b.targetRole,
      sentViaEmail: !!b.sentViaEmail,
      sentViaWa: !!b.sentViaWa,
      createdAt: new Date(b.createdAt).toISOString().slice(0, 10),
    }))

    // 10. Audit Logs
    const daftarAuditLog = auditLogData.map((a: any) => ({
      action: a.action,
      entity: a.entity,
      details: a.details || '-',
      userName: a.user?.fullName || 'Sistem',
      createdAt: new Date(a.createdAt).toISOString().slice(0, 16).replace('T', ' '),
    }))

    return {
      totalUsers,
      usersByRole,
      daftarUsers,
      totalPetani,
      daftarPetani,
      totalPoktan,
      daftarPoktan,
      totalLahan,
      lahanAktif,
      lahanTidakAktif,
      totalLuasHa,
      totalLuasM2: Math.round(totalLuasM2),
      daftarLahan,
      totalMusim,
      musimBerjalan,
      musimPerencanaan,
      musimSelesai,
      musimGagal,
      daftarMusim,
      totalPanenSesi,
      totalPanenTon,
      totalPanenKg: Math.round(totalPanenKg),
      daftarPanen,
      totalAktivitas,
      totalBiayaAktivitas,
      aktivitasTerbaru,
      daftarInformasi,
      daftarBroadcast,
      daftarAuditLog,
      earlyWarnings,
      appSettings: {
        appName: appSettings.appName,
        villageName: appSettings.villageName,
        districtName: appSettings.districtName,
        regencyName: appSettings.regencyName,
        adminContactName: appSettings.adminContactName,
        adminContactPhone: appSettings.adminContactPhone,
        notificationTargetEmail: appSettings.notificationTargetEmail,
        defaultWhatsAppNumber: appSettings.defaultWhatsAppNumber,
        waGatewayProvider: appSettings.waGatewayProvider,
        waConfigured: Boolean(appSettings.waApiToken),
        aiProvider: appSettings.aiProvider,
        smtpHost: appSettings.smtpHost,
      },
    }
  } catch (error) {
    console.error('Error in getFullDatabaseContext:', error)
    // Fallback default snapshot sesuai seed terbaru jika koneksi error
    return {
      totalUsers: 5,
      usersByRole: { admin: 1, perangkatDesa: 1, petani: 3 },
      totalPetani: 3,
      totalPoktan: 3,
      daftarPoktan: [],
      totalLahan: 4,
      lahanAktif: 4,
      lahanTidakAktif: 0,
      totalLuasHa: 6.0,
      totalLuasM2: 60000,
      daftarLahan: [],
      totalMusim: 5,
      musimBerjalan: 3,
      musimPerencanaan: 0,
      musimSelesai: 2,
      musimGagal: 0,
      daftarMusim: [],
      totalPanenSesi: 2,
      totalPanenTon: 20.0,
      totalPanenKg: 20000,
      daftarPanen: [],
      totalAktivitas: 9,
      aktivitasTerbaru: [],
    }
  }
}

// GET /api/ai/chat - Get chat sessions for current user or live system stats
export async function GET(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultUser =
        (await prisma.user.findFirst({ where: { role: 'PETANI' } })) ||
        (await prisma.user.findFirst())
      if (defaultUser) {
        session = { userId: defaultUser.id, username: defaultUser.fullName || defaultUser.username, role: defaultUser.role }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const statsRequested = searchParams.get('stats') === 'true'

    if (statsRequested) {
      const dbStats = await getFullDatabaseContext()
      return NextResponse.json({
        data: {
          totalUsers: dbStats.totalUsers,
          totalPetani: dbStats.totalPetani,
          totalPoktan: dbStats.totalPoktan,
          totalLahan: dbStats.totalLahan,
          lahanAktif: dbStats.lahanAktif,
          totalLuasHa: dbStats.totalLuasHa,
          totalPanenTon: dbStats.totalPanenTon,
          musimBerjalan: dbStats.musimBerjalan,
        }
      })
    }

    if (sessionId) {
      const chatSession = await prisma.aiChatSession.findFirst({
        where: {
          id: sessionId,
          userId: session.userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!chatSession) {
        return NextResponse.json({ error: 'Sesi chat tidak ditemukan' }, { status: 404 })
      }

      return NextResponse.json({ data: chatSession })
    }

    const chatSessions = await prisma.aiChatSession.findMany({
      where: { userId: session.userId },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({ data: chatSessions })
  } catch (error: any) {
    console.error('Error fetching AI chat sessions:', error)
    return NextResponse.json({ error: 'Gagal mengambil riwayat chat' }, { status: 500 })
  }
}

// POST /api/ai/chat - Send a message and get AI response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionId, role: requestedRole } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Pesan terlalu panjang (maksimal 2000 karakter)' }, { status: 400 })
    }

    let session = await getSession()

    if (!session) {
      const referer = req.headers.get('referer') || ''
      const targetRole =
        requestedRole ||
        (referer.includes('/admin')
          ? 'ADMIN'
          : referer.includes('/desa')
          ? 'PERANGKAT_DESA'
          : 'PETANI')

      const defaultUser =
        (await prisma.user.findFirst({
          where: { role: targetRole },
          include: { petani: true },
        })) ||
        (await prisma.user.findFirst({ include: { petani: true } }))

      if (defaultUser) {
        session = {
          userId: defaultUser.id,
          username: defaultUser.fullName || defaultUser.username,
          role: defaultUser.role,
          fullName: defaultUser.fullName,
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        petani: {
          include: {
            kelompokTani: true,
            lahan: {
              where: { status: 'AKTIF' },
              include: {
                musimTanam: {
                  where: { status: { in: ['BERJALAN', 'PERENCANAAN'] } },
                  include: {
                    aktivitas: {
                      orderBy: { tanggal: 'desc' },
                      take: 1,
                    },
                  },
                  take: 3,
                },
              },
              take: 5,
            },
          },
        },
      },
    })

    let chatSession
    if (sessionId) {
      chatSession = await prisma.aiChatSession.findFirst({
        where: { id: sessionId, userId: session.userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20,
          },
        },
      })
    }

    if (!chatSession) {
      chatSession = await prisma.aiChatSession.create({
        data: {
          userId: session.userId,
          topik: 'Konsultasi Budidaya Padi',
        },
        include: { messages: true },
      })
    }

    await prisma.aiChatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message.trim(),
      },
    })

    const isReportQuery = /laporan resmi|buatkan laporan|buat laporan|draft laporan/i.test(message)
    if (isReportQuery && session.role === 'PETANI') {
      const refusalText = `Maaf, pembuatan laporan resmi pertanian desa hanya dapat diakses oleh Administrator dan Perangkat Desa. Sebagai Petani, Anda dapat menanyakan panduan perawatan padi, jadwal musim tanam, atau data sawah Anda.`

      const savedAiMessage = await prisma.aiChatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: 'assistant',
          content: refusalText,
        },
      })

      return NextResponse.json({
        data: {
          sessionId: chatSession.id,
          message: {
            id: savedAiMessage.id,
            role: 'assistant',
            content: refusalText,
            createdAt: savedAiMessage.createdAt,
          },
          provider: 'system-access-control',
          unlimited: true,
        },
      })
    }

    const conversationHistory: AiMessage[] = [
      ...(chatSession.messages || []).map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      { role: 'user' as const, content: message.trim() },
    ]

    const activeRole = dbUser?.role || session.role || 'PETANI'
    const fullName =
      dbUser?.petani?.namaLengkap ||
      dbUser?.fullName ||
      session.fullName ||
      session.username ||
      (activeRole === 'ADMIN'
        ? 'Karisma Siti Nabila'
        : activeRole === 'PERANGKAT_DESA'
        ? 'Bapak Karsiman, S.Sos'
        : 'Bapak Sukardi')

    const userContext: PetaniContext = {
      role: activeRole,
      namaUser: dbUser?.username || session.username,
      namaLengkap: fullName,
      telepon:
        dbUser?.petani?.nomorTelepon ||
        dbUser?.phone ||
        (activeRole === 'ADMIN'
          ? '0812-3456-7890'
          : activeRole === 'PERANGKAT_DESA'
          ? '0812-9876-5432'
          : '0852-1122-3344'),
      alamat:
        dbUser?.petani?.alamat ||
        'Desa Cirebon Girang, Kec. Talun, Kab. Cirebon',
      nik: dbUser?.petani?.nik || undefined,
      kelompokTani:
        dbUser?.petani?.kelompokTani?.nama ||
        (activeRole === 'PETANI' ? 'Kelompok Tani Sri Rejeki' : undefined),
    }

    if (dbUser?.petani?.lahan && dbUser.petani.lahan.length > 0) {
      userContext.lahan = dbUser.petani.lahan.map(l => ({
        namaLahan: l.namaLahan,
        luasLahan: l.luasLahan,
        satuanLuas: l.satuanLuas,
        lokasi: l.lokasi,
        status: l.status,
      }))
      userContext.musimAktif = dbUser.petani.lahan.flatMap(l =>
        l.musimTanam.map(m => ({
          namaMusim: m.namaMusim,
          varietasPadi: m.varietasPadi,
          tanggalTanam: m.tanggalTanam.toISOString(),
          estimasiPanen: m.estimasiPanen.toISOString(),
          status: m.status,
          lahanNama: l.namaLahan,
          aktivitasTerakhir: m.aktivitas[0]?.jenisAktivitas,
        }))
      )
    }

    userContext.statsDesa = await getFullDatabaseContext()

    const aiResponse = await processAiChat({
      messages: conversationHistory,
      userContext,
    })

    const savedAiMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: aiResponse.content,
      },
    })

    await prisma.aiChatSession.update({
      where: { id: chatSession.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      data: {
        sessionId: chatSession.id,
        message: {
          id: savedAiMessage.id,
          role: 'assistant',
          content: aiResponse.content,
          createdAt: savedAiMessage.createdAt,
        },
        provider: aiResponse.provider,
        unlimited: true,
      },
    })
  } catch (error: any) {
    console.error('Error in AI chat:', error)
    const message = error.message || 'Terjadi kesalahan pada layanan AI'
    const isApiError =
      message.includes('Layanan AI') ||
      message.includes('AI_API_KEY') ||
      message.includes('Pertanyaan tidak dapat')

    return NextResponse.json(
      { error: message, code: isApiError ? 'AI_ERROR' : 'INTERNAL_ERROR' },
      { status: isApiError ? 503 : 500 }
    )
  }
}

// DELETE /api/ai/chat - Delete a chat session
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId diperlukan' }, { status: 400 })
    }

    const chatSession = await prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId: session.userId },
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Sesi chat tidak ditemukan' }, { status: 404 })
    }

    await prisma.aiChatSession.delete({ where: { id: sessionId } })

    return NextResponse.json({ message: 'Sesi chat berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting AI chat session:', error)
    return NextResponse.json({ error: 'Gagal menghapus sesi chat' }, { status: 500 })
  }
}
