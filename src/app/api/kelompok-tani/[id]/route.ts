import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params

    const kelompok = await prisma.kelompokTani.findUnique({
      where: { id },
      include: {
        anggota: {
          select: {
            id: true,
            namaLengkap: true,
            nomorTelepon: true,
            alamat: true
          }
        }
      }
    })

    if (!kelompok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Validasi akses untuk Petani
    if (session.role === 'PETANI') {
      const petani = await prisma.petani.findUnique({ where: { userId: session.userId } })
      if (!petani || petani.kelompokTaniId !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ data: kelompok })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    // Admin dan Perangkat Desa boleh update (bisa diubah sesuai kebijakan)
    if (!session || (session.role !== 'ADMIN' && session.role !== 'PERANGKAT_DESA')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { nama, ketua, wilayah, deskripsi, nomorKontak } = body

    if (!nama || !ketua || !wilayah) {
      return NextResponse.json({ error: 'Nama, Ketua, dan Wilayah wajib diisi' }, { status: 400 })
    }

    const kelompok = await prisma.kelompokTani.update({
      where: { id },
      data: { nama, ketua, wilayah, deskripsi, nomorKontak }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'KelompokTani',
        entityId: id,
        details: `Mengupdate kelompok tani ${nama}`
      }
    })

    return NextResponse.json({ data: kelompok })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    // Hanya Admin yang bisa hapus
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { id } = await params

    await prisma.kelompokTani.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE',
        entity: 'KelompokTani',
        entityId: id,
        details: `Menghapus kelompok tani`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
