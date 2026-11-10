import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET /api/petani - List petani with search, filter kelompokTaniId, pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check: PETANI cannot list all farmers
    if (session.role === 'PETANI') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const kelompokTaniId = searchParams.get('kelompokTaniId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // cap at 100
    const skip = (page - 1) * limit

    const whereCondition: any = {}

    // Filter by kelompokTaniId if provided
    if (kelompokTaniId) {
      whereCondition.kelompokTaniId = kelompokTaniId
    }

    // Filter by search text (namaLengkap, nik, nomorTelepon, user.username)
    if (search.trim()) {
      whereCondition.OR = [
        { namaLengkap: { contains: search } },
        { nik: { contains: search } },
        { nomorTelepon: { contains: search } },
        { alamat: { contains: search } },
        { user: { username: { contains: search } } }
      ]
    }

    const [total, data] = await Promise.all([
      prisma.petani.count({ where: whereCondition }),
      prisma.petani.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true
            }
          },
          kelompokTani: {
            select: {
              id: true,
              nama: true,
              wilayah: true,
              ketua: true
            }
          },
          _count: {
            select: {
              lahan: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ])

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching petani list:', error)
    return NextResponse.json({ error: 'Gagal mengambil data petani' }, { status: 500 })
  }
}

// POST /api/petani - Create new petani (ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang memiliki akses membuat data petani' }, { status: 403 })
    }

    const body = await req.json()
    const {
      username,
      password,
      email,
      namaLengkap,
      nik,
      nomorTelepon,
      alamat,
      jenisKelamin,
      tanggalLahir,
      fotoProfil,
      kelompokTaniId,
      isActive
    } = body

    // Validation
    if (!username || !password || !namaLengkap || !nomorTelepon || !alamat) {
      return NextResponse.json({ 
        error: 'Username, password, nama lengkap, nomor telepon, dan alamat wajib diisi' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Password minimal 6 karakter' 
      }, { status: 400 })
    }

    // Check username uniqueness
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    // Check NIK uniqueness if provided
    if (nik && nik.trim()) {
      const existingNik = await prisma.petani.findUnique({ where: { nik: nik.trim() } })
      if (existingNik) {
        return NextResponse.json({ error: 'NIK sudah terdaftar pada petani lain' }, { status: 400 })
      }
    }

    // Check email uniqueness if provided
    if (email && email.trim()) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } })
      if (existingEmail) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Create User and Petani in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: username.trim(),
          email: email && email.trim() ? email.trim() : null,
          passwordHash,
          fullName: namaLengkap.trim(),
          phone: nomorTelepon.trim(),
          role: 'PETANI',
          isActive: isActive !== undefined ? Boolean(isActive) : true
        }
      })

      const newPetani = await tx.petani.create({
        data: {
          userId: newUser.id,
          kelompokTaniId: kelompokTaniId && kelompokTaniId.trim() ? kelompokTaniId : null,
          nik: nik && nik.trim() ? nik.trim() : null,
          namaLengkap: namaLengkap.trim(),
          nomorTelepon: nomorTelepon.trim(),
          alamat: alamat.trim(),
          jenisKelamin: jenisKelamin || 'LAKI_LAKI',
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          fotoProfil: fotoProfil || null
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true
            }
          },
          kelompokTani: true
        }
      })

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE',
          entity: 'Petani',
          entityId: newPetani.id,
          details: `Admin mendaftarkan petani baru: ${newPetani.namaLengkap} (${newPetani.user.username})`
        }
      })

      return newPetani
    })

    return NextResponse.json({ data: result, message: 'Petani berhasil ditambahkan' }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating petani:', error)
    return NextResponse.json({ error: error.message || 'Gagal menambahkan petani' }, { status: 500 })
  }
}
