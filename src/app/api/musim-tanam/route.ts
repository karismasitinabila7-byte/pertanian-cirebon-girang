import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendEmailNotification } from '@/lib/email'

// GET /api/musim-tanam - List musim tanam with filters, search, pagination, and stats
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const kelompokTaniId = searchParams.get('kelompokTaniId') || ''
    const petaniId = searchParams.get('petaniId') || ''
    const lahanId = searchParams.get('lahanId') || ''
    const year = searchParams.get('year') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const whereCondition: any = {}

    // Role-based filtering
    if (session.role === 'PETANI') {
      const petani = await prisma.petani.findUnique({
        where: { userId: session.userId }
      })

      if (!petani) {
        return NextResponse.json({
          data: [],
          stats: {
            totalMusim: 0,
            totalPerencanaan: 0,
            totalBerjalan: 0,
            totalSelesai: 0,
            totalGagal: 0
          },
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        })
      }

      whereCondition.lahan = {
        petaniId: petani.id
      }
    } else {
      // ADMIN & PERANGKAT_DESA filters
      if (lahanId) {
        whereCondition.lahanId = lahanId
      } else if (petaniId) {
        whereCondition.lahan = {
          petaniId: petaniId
        }
      } else if (kelompokTaniId) {
        whereCondition.lahan = {
          petani: {
            kelompokTaniId: kelompokTaniId
          }
        }
      }
    }

    // Status filter
    if (status && status !== 'ALL') {
      whereCondition.status = status
    }

    // Year / Period filter
    if (year && year !== 'ALL') {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`)
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`)
      whereCondition.tanggalTanam = {
        gte: startOfYear,
        lte: endOfYear
      }
    }

    // Search filter (namaMusim, varietasPadi, catatan, lahan.namaLahan, lahan.petani.namaLengkap)
    if (search.trim()) {
      whereCondition.OR = [
        { namaMusim: { contains: search } },
        { varietasPadi: { contains: search } },
        { catatan: { contains: search } },
        { lahan: { namaLahan: { contains: search } } },
        { lahan: { lokasi: { contains: search } } },
        { lahan: { petani: { namaLengkap: { contains: search } } } }
      ]
    }

    const statsWhereCondition = { ...whereCondition }

    const [total, data, totalPerencanaan, totalBerjalan, totalSelesai, totalGagal] = await Promise.all([
      prisma.musimTanam.count({ where: whereCondition }),
      prisma.musimTanam.findMany({
        where: whereCondition,
        include: {
          lahan: {
            include: {
              petani: {
                select: {
                  id: true,
                  namaLengkap: true,
                  nomorTelepon: true,
                  kelompokTani: {
                    select: {
                      id: true,
                      nama: true,
                      wilayah: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              aktivitas: true
            }
          },
          panen: true
        },
        orderBy: { tanggalTanam: 'desc' },
        skip,
        take: limit
      }),
      prisma.musimTanam.count({
        where: { ...statsWhereCondition, status: 'PERENCANAAN' }
      }),
      prisma.musimTanam.count({
        where: { ...statsWhereCondition, status: 'BERJALAN' }
      }),
      prisma.musimTanam.count({
        where: { ...statsWhereCondition, status: 'SELESAI' }
      }),
      prisma.musimTanam.count({
        where: { ...statsWhereCondition, status: 'GAGAL' }
      })
    ])

    return NextResponse.json({
      data,
      stats: {
        totalMusim: total,
        totalPerencanaan,
        totalBerjalan,
        totalSelesai,
        totalGagal
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching musim tanam:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST /api/musim-tanam - Create new musim tanam
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'PERANGKAT_DESA') {
      return NextResponse.json({ 
        error: 'Forbidden: Perangkat Desa tidak memiliki izin membuat data musim tanam' 
      }, { status: 403 })
    }

    const body = await req.json()
    const {
      lahanId,
      namaMusim,
      varietasPadi,
      tanggalMulai,
      tanggalTanam,
      estimasiPanen,
      status = 'PERENCANAAN',
      catatan
    } = body

    // Validation
    if (!lahanId || !namaMusim?.trim() || !varietasPadi?.trim()) {
      return NextResponse.json({ 
        error: 'Lahan sawah, nama musim/tahun, dan varietas padi wajib diisi' 
      }, { status: 400 })
    }

    if (!tanggalMulai || !tanggalTanam || !estimasiPanen) {
      return NextResponse.json({ 
        error: 'Tanggal mulai persiapan, tanggal tanam, dan estimasi panen wajib diisi' 
      }, { status: 400 })
    }

    const dMulai = new Date(tanggalMulai)
    const dTanam = new Date(tanggalTanam)
    const dPanen = new Date(estimasiPanen)

    if (isNaN(dMulai.getTime()) || isNaN(dTanam.getTime()) || isNaN(dPanen.getTime())) {
      return NextResponse.json({ error: 'Format tanggal tidak valid' }, { status: 400 })
    }

    if (dMulai.getTime() > dTanam.getTime()) {
      return NextResponse.json({ 
        error: 'Tanggal mulai persiapan lahan tidak boleh setelah tanggal penanaman' 
      }, { status: 400 })
    }

    if (dPanen.getTime() <= dTanam.getTime()) {
      return NextResponse.json({ 
        error: 'Estimasi tanggal panen harus setelah tanggal penanaman' 
      }, { status: 400 })
    }

    // Verify Lahan
    const targetLahan = await prisma.lahan.findUnique({
      where: { id: lahanId },
      include: {
        petani: true
      }
    })

    if (!targetLahan) {
      return NextResponse.json({ error: 'Lahan sawah tidak ditemukan' }, { status: 404 })
    }

    // If PETANI: Ensure the land belongs to the logged in farmer
    if (session.role === 'PETANI' && targetLahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda hanya dapat mendaftarkan musim tanam pada lahan milik Anda sendiri' 
      }, { status: 403 })
    }

    const validStatuses = ['PERENCANAAN', 'BERJALAN', 'SELESAI', 'GAGAL']
    const finalStatus = validStatuses.includes(status) ? status : 'PERENCANAAN'

    const newMusim = await prisma.musimTanam.create({
      data: {
        lahanId,
        namaMusim: namaMusim.trim(),
        varietasPadi: varietasPadi.trim(),
        tanggalMulai: dMulai,
        tanggalTanam: dTanam,
        estimasiPanen: dPanen,
        status: finalStatus,
        catatan: catatan && catatan.trim() ? catatan.trim() : null
      },
      include: {
        lahan: {
          include: {
            petani: true
          }
        }
      }
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'MusimTanam',
        entityId: newMusim.id,
        details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} mendaftarkan musim tanam baru: ${newMusim.namaMusim} (${newMusim.varietasPadi}) di lahan ${newMusim.lahan.namaLahan}`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    // Notifikasi Otomatis ke Email Admin (karismasitinabila7@gmail.com)
    sendEmailNotification({
      to: 'karismasitinabila7@gmail.com',
      subject: `[SI PADI] Pendaftaran Musim Tanam Baru: ${newMusim.namaMusim}`,
      title: `Musim Tanam Baru: ${newMusim.namaMusim}`,
      message: `Musim tanam padi baru dengan varietas ${newMusim.varietasPadi} telah didaftarkan di petak lahan ${newMusim.lahan.namaLahan}. Estimasi panen: ${dPanen.toLocaleDateString('id-ID')}.`,
      type: 'MUSIM_BARU',
      severity: 'INFO',
      lahanNama: newMusim.lahan.namaLahan,
      petaniNama: newMusim.lahan.petani?.namaLengkap || 'Petani Desa',
      actionUrl: `/admin/musim-tanam/${newMusim.id}`,
      actionLabel: 'Tinjau Musim Tanam'
    }).catch(err => console.error('Gagal mengirim email notifikasi musim tanam:', err))

    return NextResponse.json({ 
      data: newMusim, 
      message: 'Musim tanam berhasil didaftarkan' 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating musim tanam:', error)
    return NextResponse.json({ error: error.message || 'Gagal membuat musim tanam' }, { status: 500 })
  }
}
