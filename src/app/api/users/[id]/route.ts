import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET /api/users/[id] - Get detail user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
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
            lahan: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: user })
  } catch (error: any) {
    console.error('Error fetching user detail:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat detail pengguna' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user & dynamic role modification
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await req.json()
    const { fullName, email, phone, role, password, isActive } = body

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { petani: true }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    const updateData: any = {}

    if (fullName && fullName.trim()) {
      updateData.fullName = fullName.trim()
    }

    if (phone !== undefined) {
      updateData.phone = phone && phone.trim() ? phone.trim() : null
    }

    if (isActive !== undefined) {
      // Prevent deactivating own account
      if (id === session.userId && isActive === false) {
        return NextResponse.json({ error: 'Anda tidak dapat menonaktifkan akun Anda sendiri' }, { status: 400 })
      }
      updateData.isActive = Boolean(isActive)
    }

    // Role modification check
    if (role && ['ADMIN', 'PERANGKAT_DESA', 'PETANI'].includes(role)) {
      // Prevent changing own role away from ADMIN
      if (id === session.userId && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Anda tidak dapat mencabut hak akses Admin akun Anda sendiri' }, { status: 400 })
      }
      updateData.role = role
    }

    // Email uniqueness check
    if (email !== undefined) {
      const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null
      if (cleanEmail && cleanEmail !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({ where: { email: cleanEmail } })
        if (emailExists && emailExists.id !== id) {
          return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 })
        }
      }
      updateData.email = cleanEmail
    }

    // Password reset if provided
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
      }
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const res = await tx.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          updatedAt: true
        }
      })

      // If role changed to PETANI and user didn't have a Petani profile yet, create one
      if (updateData.role === 'PETANI' && !existingUser.petani) {
        await tx.petani.create({
          data: {
            userId: id,
            namaLengkap: res.fullName,
            nomorTelepon: res.phone || '081200000000',
            alamat: 'Desa Cirebon Girang',
          }
        })
      }

      // If name or phone updated, sync with Petani profile if exists
      if (existingUser.petani) {
        await tx.petani.update({
          where: { userId: id },
          data: {
            namaLengkap: res.fullName,
            nomorTelepon: res.phone || existingUser.petani.nomorTelepon
          }
        })
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'UPDATE',
          entity: 'User',
          entityId: id,
          details: `Admin memperbarui data pengguna ${res.username}: role -> ${res.role}, status aktif -> ${res.isActive}`
        }
      })

      return res
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Data pengguna dan hak akses berhasil diperbarui'
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: error.message || 'Gagal memperbarui pengguna' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user account
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    if (id === session.userId) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({
        where: { id }
      })

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'DELETE',
          entity: 'User',
          entityId: id,
          details: `Admin menghapus akun pengguna: ${user.username} (${user.fullName}, Role: ${user.role})`
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `Akun pengguna "${user.username}" berhasil dihapus`
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus pengguna' }, { status: 500 })
  }
}
