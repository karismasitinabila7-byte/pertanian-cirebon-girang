import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// PATCH /api/lahan/[id]/toggle-status - Toggle status AKTIF <-> TIDAK_AKTIF
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'PERANGKAT_DESA') {
      return NextResponse.json({ 
        error: 'Forbidden: Perangkat Desa tidak memiliki izin mengubah status lahan' 
      }, { status: 403 })
    }

    const { id } = await params

    const lahan = await prisma.lahan.findUnique({
      where: { id },
      include: {
        petani: true
      }
    })

    if (!lahan) {
      return NextResponse.json({ error: 'Data lahan tidak ditemukan' }, { status: 404 })
    }

    // Petani can only toggle their own land
    if (session.role === 'PETANI' && lahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda tidak memiliki izin mengubah status lahan milik petani lain' 
      }, { status: 403 })
    }

    const newStatus = lahan.status === 'AKTIF' ? 'TIDAK_AKTIF' : 'AKTIF'

    const updatedLahan = await prisma.lahan.update({
      where: { id },
      data: { status: newStatus },
      include: {
        petani: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'Lahan',
        entityId: id,
        details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} mengubah status lahan ${updatedLahan.namaLahan} menjadi ${newStatus}`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({
      success: true,
      status: updatedLahan.status,
      message: `Status lahan berhasil diubah menjadi ${newStatus === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'}`
    })
  } catch (error: any) {
    console.error('Error toggling lahan status:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
