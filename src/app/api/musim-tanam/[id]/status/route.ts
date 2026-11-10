import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// PATCH /api/musim-tanam/[id]/status - Quick status transition
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
        error: 'Forbidden: Perangkat Desa tidak memiliki izin mengubah status musim tanam' 
      }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { status } = body

    const validStatuses = ['PERENCANAAN', 'BERJALAN', 'SELESAI', 'GAGAL']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Status tidak valid. Pilihan: PERENCANAAN, BERJALAN, SELESAI, GAGAL' 
      }, { status: 400 })
    }

    const existingMusim = await prisma.musimTanam.findUnique({
      where: { id },
      include: {
        lahan: {
          include: {
            petani: true
          }
        }
      }
    })

    if (!existingMusim) {
      return NextResponse.json({ error: 'Data musim tanam tidak ditemukan' }, { status: 404 })
    }

    // Petani can only update their own season
    if (session.role === 'PETANI' && existingMusim.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda tidak memiliki izin mengubah status musim tanam petani lain' 
      }, { status: 403 })
    }

    const updatedMusim = await prisma.musimTanam.update({
      where: { id },
      data: { status },
      include: {
        lahan: {
          include: {
            petani: true
          }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'MusimTanam',
        entityId: id,
        details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} mengubah status musim tanam ${updatedMusim.namaMusim} menjadi ${status}`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({
      success: true,
      data: updatedMusim,
      message: `Status musim tanam berhasil diubah menjadi ${status}`
    })
  } catch (error: any) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
