import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/musim-tanam/[id] - Get detail data musim tanam
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

    const musimTanam = await prisma.musimTanam.findUnique({
      where: { id },
      include: {
        lahan: {
          include: {
            petani: {
              include: {
                kelompokTani: true
              }
            }
          }
        },
        aktivitas: {
          orderBy: { tanggal: 'desc' }
        },
        panen: true
      }
    })

    if (!musimTanam) {
      return NextResponse.json({ error: 'Data musim tanam tidak ditemukan' }, { status: 404 })
    }

    // Role-based privacy verification
    if (session.role === 'PETANI' && musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda tidak memiliki akses melihat musim tanam petani lain' 
      }, { status: 403 })
    }

    return NextResponse.json({ data: musimTanam })
  } catch (error: any) {
    console.error('Error fetching musim tanam detail:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/musim-tanam/[id] - Update musim tanam
export async function PUT(
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
        error: 'Forbidden: Perangkat Desa tidak memiliki izin mengubah data musim tanam' 
      }, { status: 403 })
    }

    const { id } = await params

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

    // Petani can only update their own musim tanam
    if (session.role === 'PETANI' && existingMusim.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda tidak memiliki izin mengubah data musim tanam petani lain' 
      }, { status: 403 })
    }

    const body = await req.json()
    const {
      namaMusim,
      varietasPadi,
      tanggalMulai,
      tanggalTanam,
      estimasiPanen,
      status,
      catatan,
      lahanId: providedLahanId
    } = body

    // Validation
    if (!namaMusim?.trim() || !varietasPadi?.trim()) {
      return NextResponse.json({ 
        error: 'Nama musim dan varietas padi wajib diisi' 
      }, { status: 400 })
    }

    const dMulai = new Date(tanggalMulai || existingMusim.tanggalMulai)
    const dTanam = new Date(tanggalTanam || existingMusim.tanggalTanam)
    const dPanen = new Date(estimasiPanen || existingMusim.estimasiPanen)

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

    const validStatuses = ['PERENCANAAN', 'BERJALAN', 'SELESAI', 'GAGAL']
    const finalStatus = status && validStatuses.includes(status) ? status : existingMusim.status

    const updatePayload: any = {
      namaMusim: namaMusim.trim(),
      varietasPadi: varietasPadi.trim(),
      tanggalMulai: dMulai,
      tanggalTanam: dTanam,
      estimasiPanen: dPanen,
      status: finalStatus,
      catatan: catatan !== undefined ? (catatan && catatan.trim() ? catatan.trim() : null) : existingMusim.catatan
    }

    // Admin can reassign to another land if provided
    if (session.role === 'ADMIN' && providedLahanId && providedLahanId !== existingMusim.lahanId) {
      const checkLahan = await prisma.lahan.findUnique({
        where: { id: providedLahanId }
      })
      if (!checkLahan) {
        return NextResponse.json({ error: 'Lahan tujuan tidak ditemukan' }, { status: 404 })
      }
      updatePayload.lahanId = checkLahan.id
    }

    const updatedMusim = await prisma.musimTanam.update({
      where: { id },
      data: updatePayload,
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
        action: 'UPDATE',
        entity: 'MusimTanam',
        entityId: id,
        details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} memperbarui musim tanam ${updatedMusim.namaMusim} (Status: ${updatedMusim.status})`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({ 
      data: updatedMusim, 
      message: 'Musim tanam berhasil diperbarui' 
    })
  } catch (error: any) {
    console.error('Error updating musim tanam:', error)
    return NextResponse.json({ error: error.message || 'Gagal memperbarui data musim tanam' }, { status: 500 })
  }
}

// DELETE /api/musim-tanam/[id] - Delete musim tanam (ADMIN ONLY)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden: Hanya Admin yang berwenang menghapus data musim tanam' 
      }, { status: 403 })
    }

    const { id } = await params

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

    await prisma.musimTanam.delete({
      where: { id }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE',
        entity: 'MusimTanam',
        entityId: id,
        details: `Admin menghapus musim tanam: ${existingMusim.namaMusim} (${existingMusim.varietasPadi}) di lahan ${existingMusim.lahan.namaLahan}`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({ 
      success: true, 
      message: 'Data musim tanam berhasil dihapus' 
    })
  } catch (error: any) {
    console.error('Error deleting musim tanam:', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus data musim tanam' }, { status: 500 })
  }
}
