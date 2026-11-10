import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/lahan - List lahan with search, filters, pagination, and calculated stats
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const petaniId = searchParams.get('petaniId') || ''
    const kelompokTaniId = searchParams.get('kelompokTaniId') || ''
    const status = searchParams.get('status') || ''
    const isAll = searchParams.get('all') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = isAll ? 500 : parseInt(searchParams.get('limit') || '10')
    const skip = isAll ? 0 : (page - 1) * limit

    const whereCondition: any = {}

    // Role-based Access Control
    if (session.role === 'PETANI') {
      // Petani can strictly ONLY see their own farmlands
      const petani = await prisma.petani.findUnique({
        where: { userId: session.userId }
      })

      if (!petani) {
        return NextResponse.json({
          data: [],
          stats: {
            totalLuasM2: 0,
            totalLuasHektar: 0,
            totalLahan: 0,
            totalAktif: 0,
            totalTidakAktif: 0
          },
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        })
      }

      whereCondition.petaniId = petani.id
    } else {
      // ADMIN & PERANGKAT_DESA can filter by petaniId or kelompokTaniId
      if (petaniId) {
        whereCondition.petaniId = petaniId
      }

      if (kelompokTaniId) {
        whereCondition.petani = {
          kelompokTaniId: kelompokTaniId
        }
      }
    }

    // Status filter
    if (status && status !== 'ALL') {
      whereCondition.status = status
    }

    // Search filter
    if (search.trim()) {
      whereCondition.OR = [
        { namaLahan: { contains: search } },
        { lokasi: { contains: search } },
        { catatan: { contains: search } },
        { petani: { namaLengkap: { contains: search } } }
      ]
    }

    // Compute stats based on the current user scope
    // For Petani: scope is their own land; For Admin/Desa: scope can be filtered or all
    const statsWhereCondition = { ...whereCondition }

    const [total, data, totalStats, aktifCount, tidakAktifCount] = await Promise.all([
      prisma.lahan.count({ where: whereCondition }),
      prisma.lahan.findMany({
        where: whereCondition,
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
          },
          musimTanam: {
            where: { status: 'BERJALAN' },
            select: {
              id: true,
              namaMusim: true,
              varietasPadi: true,
              tanggalTanam: true,
              status: true
            }
          },
          _count: {
            select: {
              musimTanam: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.lahan.aggregate({
        where: statsWhereCondition,
        _sum: {
          luasLahan: true
        }
      }),
      prisma.lahan.count({
        where: {
          ...statsWhereCondition,
          status: 'AKTIF'
        }
      }),
      prisma.lahan.count({
        where: {
          ...statsWhereCondition,
          status: 'TIDAK_AKTIF'
        }
      })
    ])

    const totalLuasM2 = totalStats._sum.luasLahan || 0
    const totalLuasHektar = Number((totalLuasM2 / 10000).toFixed(2))

    return NextResponse.json({
      data,
      stats: {
        totalLuasM2,
        totalLuasHektar,
        totalLahan: total,
        totalAktif: aktifCount,
        totalTidakAktif: tidakAktifCount
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching lahan list:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lahan - Create new lahan (ADMIN or PETANI for themselves)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'PERANGKAT_DESA') {
      return NextResponse.json({ 
        error: 'Forbidden: Perangkat Desa tidak memiliki izin menambah data lahan' 
      }, { status: 403 })
    }

    const body = await req.json()
    const {
      namaLahan,
      luasLahan,
      satuanLuas = 'm²',
      lokasi,
      status = 'AKTIF',
      catatan,
      latitude,
      longitude,
      petaniId: providedPetaniId
    } = body

    // Validation
    if (!namaLahan || !namaLahan.trim()) {
      return NextResponse.json({ error: 'Nama/Label lahan wajib diisi' }, { status: 400 })
    }

    const parsedLuas = parseFloat(luasLahan)
    if (isNaN(parsedLuas) || parsedLuas <= 0) {
      return NextResponse.json({ error: 'Luas lahan harus berupa angka lebih besar dari 0' }, { status: 400 })
    }

    if (!lokasi || !lokasi.trim()) {
      return NextResponse.json({ error: 'Lokasi/deskripsi lahan wajib diisi' }, { status: 400 })
    }

    let targetPetaniId = ''

    if (session.role === 'PETANI') {
      const currentPetani = await prisma.petani.findUnique({
        where: { userId: session.userId }
      })

      if (!currentPetani) {
        return NextResponse.json({ error: 'Profil petani Anda belum terdaftar' }, { status: 404 })
      }
      targetPetaniId = currentPetani.id
    } else if (session.role === 'ADMIN') {
      if (!providedPetaniId || !providedPetaniId.trim()) {
        return NextResponse.json({ error: 'Petani pemilik lahan wajib dipilih' }, { status: 400 })
      }

      const checkPetani = await prisma.petani.findUnique({
        where: { id: providedPetaniId }
      })

      if (!checkPetani) {
        return NextResponse.json({ error: 'Data petani pemilik tidak ditemukan' }, { status: 404 })
      }
      targetPetaniId = checkPetani.id
    }

    const newLahan = await prisma.lahan.create({
      data: {
        petaniId: targetPetaniId,
        namaLahan: namaLahan.trim(),
        luasLahan: parsedLuas,
        satuanLuas: satuanLuas || 'm²',
        lokasi: lokasi.trim(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: status === 'TIDAK_AKTIF' ? 'TIDAK_AKTIF' : 'AKTIF',
        catatan: catatan && catatan.trim() ? catatan.trim() : null
      },
      include: {
        petani: {
          select: {
            id: true,
            namaLengkap: true,
            kelompokTani: true
          }
        }
      }
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'Lahan',
        entityId: newLahan.id,
        details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} menambahkan lahan baru: ${newLahan.namaLahan} (${newLahan.luasLahan} ${newLahan.satuanLuas}) untuk petani ${newLahan.petani.namaLengkap}`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({ data: newLahan, message: 'Data lahan berhasil ditambahkan' }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating lahan:', error)
    return NextResponse.json({ error: error.message || 'Gagal menambahkan data lahan' }, { status: 500 })
  }
}
