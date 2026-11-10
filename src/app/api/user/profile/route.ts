import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET /api/user/profile - Get current logged-in user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
          include: {
            kelompokTani: true,
            lahan: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Data akun tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: user })
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat data profil' }, { status: 500 })
  }
}

// PUT /api/user/profile - Update current user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fullName, phone, email, password } = body

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi' }, { status: 400 })
    }

    const userUpdate: any = {
      fullName: fullName.trim(),
      phone: phone && phone.trim() ? phone.trim() : null,
    }

    // Email update & check
    if (email !== undefined) {
      const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null
      if (cleanEmail) {
        const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } })
        if (existingEmail && existingEmail.id !== session.userId) {
          return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 })
        }
      }
      userUpdate.email = cleanEmail
    }

    // Password change
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
      }
      userUpdate.passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: session.userId },
        data: userUpdate,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          updatedAt: true
        }
      })

      // Sync to Petani profile if exists
      const existingPetani = await tx.petani.findUnique({ where: { userId: session.userId } })
      if (existingPetani) {
        await tx.petani.update({
          where: { userId: session.userId },
          data: {
            namaLengkap: u.fullName,
            nomorTelepon: u.phone || existingPetani.nomorTelepon
          }
        })
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'UPDATE',
          entity: 'Profile',
          entityId: session.userId,
          details: `Pengguna memperbarui informasi profil akun: ${u.fullName}`
        }
      })

      return u
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profil Anda berhasil diperbarui!'
    })
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: error.message || 'Gagal memperbarui profil' }, { status: 500 })
  }
}
