import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// GET /api/petani/[id] - Get detail data petani
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const petani = await prisma.petani.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true
          }
        },
        kelompokTani: true,
        _count: {
          select: {
            lahan: true
          }
        }
      }
    })

    if (!petani) {
      return NextResponse.json({ error: 'Data petani tidak ditemukan' }, { status: 404 })
    }

    // Privacy and Authorization Check
    // If role is PETANI, only allow viewing their own data
    if (session.role === 'PETANI' && petani.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki akses melihat data petani lain' }, { status: 403 })
    }

    return NextResponse.json({ data: petani })
  } catch (error: any) {
    console.error('Error getting petani detail:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/petani/[id] - Update data petani
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingPetani = await prisma.petani.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingPetani) {
      return NextResponse.json({ error: 'Data petani tidak ditemukan' }, { status: 404 })
    }

    // Role Permissions:
    // ADMIN: Can edit all fields, change kelompok tani, change password, toggle isActive
    // PETANI: Can only edit their own profile info (namaLengkap, nomorTelepon, alamat, jenisKelamin, tanggalLahir, fotoProfil, email)
    // PERANGKAT_DESA: Read-only access on Petani module
    if (session.role === 'PERANGKAT_DESA') {
      return NextResponse.json({ error: 'Forbidden: Perangkat Desa hanya memiliki hak akses melihat data petani' }, { status: 403 })
    }

    if (session.role === 'PETANI' && existingPetani.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden: Anda tidak memiliki izin mengubah data petani lain' }, { status: 403 })
    }

    const body = await req.json()
    const {
      namaLengkap,
      nik,
      nomorTelepon,
      alamat,
      jenisKelamin,
      tanggalLahir,
      fotoProfil,
      kelompokTaniId,
      email,
      password,
      isActive
    } = body

    // Validation
    if (!namaLengkap || !nomorTelepon || !alamat) {
      return NextResponse.json({ error: 'Nama lengkap, nomor telepon, dan alamat wajib diisi' }, { status: 400 })
    }

    // If NIK is provided and changed, check uniqueness (ADMIN only)
    if (session.role === 'ADMIN' && nik !== undefined) {
      const cleanNik = nik && nik.trim() ? nik.trim() : null
      if (cleanNik && cleanNik !== existingPetani.nik) {
        const nikExists = await prisma.petani.findUnique({ where: { nik: cleanNik } })
        if (nikExists) {
          return NextResponse.json({ error: 'NIK sudah digunakan oleh petani lain' }, { status: 400 })
        }
      }
    }

    // Check email uniqueness if changed
    if (email && email.trim() !== (existingPetani.user.email || '')) {
      const emailExists = await prisma.user.findUnique({ where: { email: email.trim() } })
      if (emailExists && emailExists.id !== existingPetani.userId) {
        return NextResponse.json({ error: 'Email sudah terdaftar pada pengguna lain' }, { status: 400 })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Prepare User update data
      const userUpdateData: any = {
        fullName: namaLengkap.trim(),
        phone: nomorTelepon.trim(),
        email: email && email.trim() ? email.trim() : null
      }

      // Password update (if requested)
      if (password && password.trim()) {
        if (password.length < 6) {
          throw new Error('Password baru minimal 6 karakter')
        }
        userUpdateData.passwordHash = await bcrypt.hash(password.trim(), 10)
      }

      // Admin specific User updates: isActive
      if (session.role === 'ADMIN' && isActive !== undefined) {
        userUpdateData.isActive = Boolean(isActive)
      }

      await tx.user.update({
        where: { id: existingPetani.userId },
        data: userUpdateData
      })

      // Prepare Petani update data
      const petaniUpdateData: any = {
        namaLengkap: namaLengkap.trim(),
        nomorTelepon: nomorTelepon.trim(),
        alamat: alamat.trim(),
        jenisKelamin: jenisKelamin || existingPetani.jenisKelamin,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        fotoProfil: fotoProfil !== undefined ? fotoProfil : existingPetani.fotoProfil
      }

      // Admin specific Petani updates: NIK & Kelompok Tani
      if (session.role === 'ADMIN') {
        if (nik !== undefined) {
          petaniUpdateData.nik = nik && nik.trim() ? nik.trim() : null
        }
        if (kelompokTaniId !== undefined) {
          petaniUpdateData.kelompokTaniId = kelompokTaniId && kelompokTaniId.trim() ? kelompokTaniId : null
        }
      }

      const updatedPetani = await tx.petani.update({
        where: { id },
        data: petaniUpdateData,
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

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'UPDATE',
          entity: 'Petani',
          entityId: id,
          details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} mengupdate data petani: ${updatedPetani.namaLengkap}`
        }
      })

      return updatedPetani
    })

    return NextResponse.json({ data: result, message: 'Data petani berhasil diperbarui' })
  } catch (error: any) {
    console.error('Error updating petani:', error)
    return NextResponse.json({ error: error.message || 'Gagal memperbarui data petani' }, { status: 500 })
  }
}

// DELETE /api/petani/[id] - Delete petani & linked user account (ADMIN ONLY)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang memiliki hak menghapus data petani' }, { status: 403 })
    }

    const { id } = await params

    const petani = await prisma.petani.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!petani) {
      return NextResponse.json({ error: 'Data petani tidak ditemukan' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // Deleting user will cascade delete petani due to schema relation onDelete: Cascade
      await tx.user.delete({
        where: { id: petani.userId }
      })

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'DELETE',
          entity: 'Petani',
          entityId: id,
          details: `Admin menghapus akun dan data petani: ${petani.namaLengkap} (${petani.user.username})`
        }
      })
    })

    return NextResponse.json({ success: true, message: 'Data petani berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting petani:', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus data petani' }, { status: 500 })
  }
}
