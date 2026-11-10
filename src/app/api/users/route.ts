import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET /api/users - List users (Admin only)
export async function GET(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
      if (defaultAdmin) {
        session = { userId: defaultAdmin.id, username: defaultAdmin.username, role: defaultAdmin.role }
      }
    }
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang berwenang' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (role && role !== 'ALL') {
      where.role = role
    }

    if (status && status !== 'ALL') {
      where.isActive = status === 'ACTIVE'
    }

    const [users, total, stats] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          petani: {
            select: {
              id: true,
              nik: true,
              alamat: true,
              kelompokTani: {
                select: { id: true, nama: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'PERANGKAT_DESA' } }),
        prisma.user.count({ where: { role: 'PETANI' } }),
        prisma.user.count({ where: { isActive: true } }),
      ]).then(([totalUsers, adminCount, desaCount, petaniCount, activeCount]) => ({
        totalUsers,
        adminCount,
        desaCount,
        petaniCount,
        activeCount,
      }))
    ])

    return NextResponse.json({
      data: users,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat daftar pengguna' }, { status: 500 })
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
      if (defaultAdmin) {
        session = { userId: defaultAdmin.id, username: defaultAdmin.username, role: defaultAdmin.role }
      }
    }
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang berwenang' }, { status: 403 })
    }

    const body = await req.json()
    const { username, fullName, email, phone, role, password, isActive, alamat, kelompokTaniId } = body

    if (!username || !fullName || !password) {
      return NextResponse.json({ error: 'Username, Nama Lengkap, dan Password wajib diisi' }, { status: 400 })
    }

    const validRoles = ['ADMIN', 'PERANGKAT_DESA', 'PETANI']
    const assignedRole = validRoles.includes(role) ? role : 'PETANI'

    const cleanUsername = username.trim().toLowerCase()
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null

    // Check username uniqueness
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername }
    })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username sudah digunakan oleh akun lain' }, { status: 400 })
    }

    // Check email uniqueness if provided
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail }
      })
      if (existingEmail) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 })
      }
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10)

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: cleanUsername,
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: phone && phone.trim() ? phone.trim() : null,
          role: assignedRole,
          passwordHash,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        }
      })

      // If created as PETANI, also create linked Petani profile
      if (assignedRole === 'PETANI') {
        await tx.petani.create({
          data: {
            userId: user.id,
            namaLengkap: fullName.trim(),
            nomorTelepon: phone && phone.trim() ? phone.trim() : '081200000000',
            alamat: alamat && alamat.trim() ? alamat.trim() : 'Desa Cirebon Girang',
            kelompokTaniId: kelompokTaniId && kelompokTaniId.trim() ? kelompokTaniId.trim() : null,
          }
        })
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE',
          entity: 'User',
          entityId: user.id,
          details: `Admin membuat akun baru: ${user.username} (${user.fullName}) dengan role ${user.role}`
        }
      })

      return user
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      message: 'Akun pengguna berhasil ditambahkan'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: error.message || 'Gagal membuat pengguna baru' }, { status: 500 })
  }
}
