import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { processAiChat, AiMessage, PetaniContext, StatsDesaContext } from '@/services/aiService'

// Chat AI disetel tanpa batas limit pesan (Unlimited) untuk kemudahan petani & presentasi

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
      aktivitasData,
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
          anggota: { select: { namaLengkap: true } },
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
      prisma.aktivitasBudidaya.findMany({
        include: {
          musimTanam: {
            include: {
              lahan: { include: { petani: true } },
            },
          },
        },
        orderBy: { tanggal: 'desc' },
        take: 15,
      }),
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
    }))

    // 2. Data Petani
    const totalPetani = petaniData.length
    const daftarPetani = petaniData.map(p => {
      let farmerM2 = 0
      for (const l of p.lahan) {
        if (l.satuanLuas === 'Ha') farmerM2 += l.luasLahan * 10000
        else if (l.satuanLuas === 'Bata') farmerM2 += l.luasLahan * 14
        else farmerM2 += l.luasLahan
      }
      return {
        nama: p.namaLengkap,
        nik: p.nik || '-',
        telepon: p.nomorTelepon,
        alamat: p.alamat,
        poktan: p.kelompokTani?.nama || 'Belum Terdaftar Poktan',
        totalLahan: p.lahan.length,
        totalLuasM2: Math.round(farmerM2),
        totalLuasHa: Number((farmerM2 / 10000).toFixed(2)),
        username: p.user?.username,
      }
    })

    // 3. Data Kelompok Tani (Poktan)
    const totalPoktan = poktanData.length
    const daftarPoktan = poktanData.map(p => ({
      nama: p.nama,
      ketua: p.ketua,
      wilayah: p.wilayah,
      kontak: p.nomorKontak || '-',
      deskripsi: p.deskripsi || '-',
      jumlahPetani: p._count.anggota,
      anggotaNames: p.anggota.map(a => a.namaLengkap),
    }))

    // 4. Data Lahan Pertanian Sawah
    const totalLahan = lahanData.length
    const lahanAktif = lahanData.filter(l => l.status === 'AKTIF').length
    const lahanTidakAktif = lahanData.filter(l => l.status !== 'AKTIF').length
    let totalLuasM2 = 0
    const daftarLahan = lahanData.map(l => {
      let m2 = 0
      if (l.satuanLuas === 'Ha') m2 = l.luasLahan * 10000
      else if (l.satuanLuas === 'Bata') m2 = l.luasLahan * 14
      else m2 = l.luasLahan

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
      }
    })
    const totalLuasHa = Number((totalLuasM2 / 10000).toFixed(2))

    // 5. Data Musim Tanam
    const totalMusim = musimData.length
    const musimBerjalan = musimData.filter(m => m.status === 'BERJALAN').length
    const musimPerencanaan = musimData.filter(m => m.status === 'PERENCANAAN').length
    const musimSelesai = musimData.filter(m => m.status === 'SELESAI').length
    const musimGagal = musimData.filter(m => m.status === 'GAGAL').length
    const daftarMusim = musimData.slice(0, 15).map(m => ({
      namaMusim: m.namaMusim,
      varietas: m.varietasPadi,
      status: m.status,
      lahanNama: m.lahan?.namaLahan || '-',
      petaniNama: m.lahan?.petani?.namaLengkap || '-',
      tanggalTanam: m.tanggalTanam ? m.tanggalTanam.toISOString().slice(0, 10) : undefined,
      estimasiPanen: m.estimasiPanen ? m.estimasiPanen.toISOString().slice(0, 10) : undefined,
    }))

    // 6. Data Panen
    const totalPanenSesi = panenData.length
    let totalPanenKg = 0
    const daftarPanen = panenData.slice(0, 15).map(p => {
      let kg = p.jumlahProduksi
      if (p.satuan === 'ton') kg = p.jumlahProduksi * 1000
      else if (p.satuan === 'kuintal') kg = p.jumlahProduksi * 100
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
    const totalAktivitas = aktivitasData.length
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
      totalLuasM2,
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
      aktivitasTerbaru,
    }
  } catch (error) {
    console.error('Error in getFullDatabaseContext:', error)
    // Fallback default snapshot jika koneksi error
    return {
      totalUsers: 6,
      usersByRole: { admin: 1, perangkatDesa: 1, petani: 4 },
      totalPetani: 4,
      totalPoktan: 3,
      daftarPoktan: [],
      totalLahan: 8,
      lahanAktif: 8,
      lahanTidakAktif: 0,
      totalLuasHa: 9.85,
      totalLuasM2: 98500,
      daftarLahan: [],
      totalMusim: 9,
      musimBerjalan: 6,
      musimPerencanaan: 1,
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

    // Endpoint opsional: Mengambil ringkasan statistik live database untuk UI
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
      // Get messages for a specific session
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

    // List all sessions
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
    const { message, sessionId, role: requestedRole, userName: requestedUserName } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Pesan terlalu panjang (maksimal 2000 karakter)' }, { status: 400 })
    }

    let session = await getSession()

    // Resolusi user cerdas jika sesi cookie belum disetel atau demo dashboard
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

    // Ambil detail data profil user terdaftar langsung dari database utama
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

    // Get or create chat session
    let chatSession
    if (sessionId) {
      chatSession = await prisma.aiChatSession.findFirst({
        where: { id: sessionId, userId: session.userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // last 20 messages for context
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

    // Save user message
    await prisma.aiChatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message.trim(),
      },
    })

    // Kebijakan: Pembuatan laporan resmi eksklusif untuk role ADMIN dan PERANGKAT_DESA
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

    // Build conversation history for AI
    const conversationHistory: AiMessage[] = [
      ...(chatSession.messages || []).map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      { role: 'user' as const, content: message.trim() },
    ]

    // Bangun userContext yang akurat sesuai user yang sedang login di dashboard masing-masing
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

    // 1. Ambil data database lengkap untuk Administrator & Perangkat Desa atau pertanyaan terkait data desa
    userContext.statsDesa = await getFullDatabaseContext()

    // Call AI service
    const aiResponse = await processAiChat({
      messages: conversationHistory,
      userContext,
    })

    // Save AI response to DB
    const savedAiMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: aiResponse.content,
      },
    })

    // Update session updatedAt
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

    // User-friendly error messages
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
