import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/lahan/[id] - Get detail data lahan
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

    const lahan = await prisma.lahan.findUnique({
      where: { id },
      include: {
        petani: {
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
        },
        musimTanam: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                aktivitas: true
              }
            },
            panen: true
          }
        }
      }
    })

    if (!lahan) {
      return NextResponse.json({ error: 'Data lahan tidak ditemukan' }, { status: 404 })
    }

    // Role-based privacy verification
    if (session.role === 'PETANI' && lahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda tidak memiliki akses melihat data lahan milik petani lain' 
      }, { status: 403 })
    }

    return NextResponse.json({ data: lahan })
  } catch (error: any) {
    console.error('Error fetching lahan detail:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/lahan/[id] - Update data lahan
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
        error: 'Forbidden: Perangkat Desa hanya memiliki izin memantau data lahan' 
      }, { status: 403 })
    }

    const { id } = await params

    const existingLahan = await prisma.lahan.findUnique({
      where: { id },
      include: {
        petani: true
      }
    })

    if (!existingLahan) {
      return NextResponse.json({ error: 'Data lahan tidak ditemukan' }, { status: 404 })
    }

    // Petani can ONLY edit their own land
    if (session.role === 'PETANI' && existingLahan.petani.userId !== session.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Anda tidak memiliki izin mengubah data lahan milik petani lain' 
      }, { status: 403 })
    }

    const body = await req.json()
    const {
      namaLahan,
      luasLahan,
      satuanLuas,
      lokasi,
      status,
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
      return NextResponse.json({ error: 'Luas lahan harus berupa angka valid lebih besar dari 0' }, { status: 400 })
    }

    if (!lokasi || !lokasi.trim()) {
      return NextResponse.json({ error: 'Lokasi/deskripsi lahan wajib diisi' }, { status: 400 })
    }

    const updatePayload: any = {
      namaLahan: namaLahan.trim(),
      luasLahan: parsedLuas,
      satuanLuas: satuanLuas || existingLahan.satuanLuas,
      lokasi: lokasi.trim(),
      latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : existingLahan.latitude,
      longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : existingLahan.longitude,
      status: status === 'TIDAK_AKTIF' ? 'TIDAK_AKTIF' : 'AKTIF',
      catatan: catatan !== undefined ? (catatan && catatan.trim() ? catatan.trim() : null) : existingLahan.catatan
    }

    // Admin can reassign land to another farmer if provided
    if (session.role === 'ADMIN' && providedPetaniId && providedPetaniId !== existingLahan.petaniId) {
      const checkNewPetani = await prisma.petani.findUnique({
        where: { id: providedPetaniId }
      })
      if (!checkNewPetani) {
        return NextResponse.json({ error: 'Petani pemilik baru tidak ditemukan' }, { status: 404 })
      }
      updatePayload.petaniId = checkNewPetani.id
    }

    const updatedLahan = await prisma.lahan.update({
      where: { id },
      data: updatePayload,
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
        action: 'UPDATE',
        entity: 'Lahan',
        entityId: id,
        details: `${session.role === 'ADMIN' ? 'Admin' : 'Petani'} memperbarui data lahan ${updatedLahan.namaLahan}`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({ data: updatedLahan, message: 'Data lahan berhasil diperbarui' })
  } catch (error: any) {
    console.error('Error updating lahan:', error)
    return NextResponse.json({ error: error.message || 'Gagal memperbarui data lahan' }, { status: 500 })
  }
}

// DELETE /api/lahan/[id] - Delete lahan (ADMIN ONLY)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang memiliki hak menghapus data lahan' }, { status: 403 })
    }

    const { id } = await params

    const lahan = await prisma.lahan.findUnique({
      where: { id },
      include: { petani: true }
    })

    if (!lahan) {
      return NextResponse.json({ error: 'Data lahan tidak ditemukan' }, { status: 404 })
    }

    await prisma.lahan.delete({
      where: { id }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE',
        entity: 'Lahan',
        entityId: id,
        details: `Admin menghapus lahan: ${lahan.namaLahan} (${lahan.petani.namaLengkap})`
      }
    }).catch((err) => console.error('AuditLog error:', err))

    return NextResponse.json({ success: true, message: 'Data lahan berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting lahan:', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus data lahan' }, { status: 500 })
  }
}
