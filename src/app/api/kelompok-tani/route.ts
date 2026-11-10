import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    // Petani only sees their own group
    if (session.role === 'PETANI') {
      const petani = await prisma.petani.findUnique({
        where: { userId: session.userId },
        include: { kelompokTani: true }
      })

      if (!petani || !petani.kelompokTaniId) {
        return NextResponse.json({ data: [] }) // Or a specific empty message
      }

      const kelompok = await prisma.kelompokTani.findUnique({
        where: { id: petani.kelompokTaniId },
        include: {
          _count: { select: { anggota: true } }
        }
      })

      return NextResponse.json({ data: kelompok ? [kelompok] : [] })
    }

    // Admin & Desa see all, with optional search
    const kelompokList = await prisma.kelompokTani.findMany({
      where: {
        OR: [
          { nama: { contains: search } },
          { ketua: { contains: search } },
          { wilayah: { contains: search } }
        ]
      },
      include: {
        _count: { select: { anggota: true } }
      },
      orderBy: { nama: 'asc' }
    })

    return NextResponse.json({ data: kelompokList })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { nama, ketua, wilayah, deskripsi, nomorKontak } = body

    if (!nama || !ketua || !wilayah) {
      return NextResponse.json({ error: 'Nama, Ketua, dan Wilayah wajib diisi' }, { status: 400 })
    }

    const kelompok = await prisma.kelompokTani.create({
      data: {
        nama,
        ketua,
        wilayah,
        deskripsi,
        nomorKontak
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'KelompokTani',
        entityId: kelompok.id,
        details: `Membuat kelompok tani ${nama}`
      }
    })

    return NextResponse.json({ data: kelompok }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
