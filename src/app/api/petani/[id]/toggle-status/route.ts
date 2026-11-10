import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// PATCH /api/petani/[id]/toggle-status - Toggle isActive User Petani
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang memiliki hak mengaktifkan/menonaktifkan akun petani' }, { status: 403 })
    }

    const { id } = await params

    const petani = await prisma.petani.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!petani) {
      return NextResponse.json({ error: 'Data petani tidak ditemukan' }, { status: 404 })
    }

    const newStatus = !petani.user.isActive

    const updatedUser = await prisma.user.update({
      where: { id: petani.userId },
      data: { isActive: newStatus }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: petani.userId,
        details: `Admin ${newStatus ? 'mengaktifkan' : 'menonaktifkan'} akun petani ${petani.namaLengkap} (${petani.user.username})`
      }
    })

    return NextResponse.json({
      success: true,
      isActive: updatedUser.isActive,
      message: `Akun petani berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`
    })
  } catch (error: any) {
    console.error('Error toggling petani status:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
