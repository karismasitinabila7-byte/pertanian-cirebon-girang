import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/edukasi - Ambil daftar artikel panduan edukasi tani
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kategori = searchParams.get('kategori') || ''
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'PUBLISHED'

    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (kategori && kategori !== 'ALL') {
      where.kategori = kategori
    }

    if (search.trim()) {
      where.OR = [
        { judul: { contains: search } },
        { isi: { contains: search } },
        { namaPenulis: { contains: search } }
      ]
    }

    const articles = await prisma.informasiPertanian.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Hitung estimasi waktu baca (rata-rata 200 kata per menit)
    const enriched = articles.map(art => {
      const wordsCount = art.isi.split(/\s+/).length
      const readTimeMinutes = Math.max(2, Math.ceil(wordsCount / 180))
      return {
        ...art,
        readTime: `${readTimeMinutes} menit baca`
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
      total: enriched.length
    })
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat artikel' }, { status: 500 })
  }
}

// POST /api/edukasi - Tambah artikel panduan baru (Admin / Perangkat Desa)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'PETANI') {
      return NextResponse.json({ error: 'Hanya Pengelola Desa dan Admin yang dapat mempublikasikan panduan' }, { status: 403 })
    }

    const body = await req.json()
    const { judul, isi, kategori, gambar, status = 'PUBLISHED' } = body

    if (!judul || !judul.trim()) {
      return NextResponse.json({ error: 'Judul artikel wajib diisi' }, { status: 400 })
    }

    if (!isi || !isi.trim()) {
      return NextResponse.json({ error: 'Isi materi panduan wajib diisi' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    const newArticle = await prisma.informasiPertanian.create({
      data: {
        judul: judul.trim(),
        isi: isi.trim(),
        kategori: kategori || 'Budidaya Padi',
        gambar: gambar || null,
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
        tanggalPublikasi: new Date(),
        penulisId: session.userId,
        namaPenulis: user?.fullName || session.username
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'InformasiPertanian',
        entityId: newArticle.id,
        details: `${session.role} membuat panduan tani baru: ${newArticle.judul}`
      }
    }).catch(err => console.error(err))

    return NextResponse.json({
      success: true,
      data: newArticle,
      message: 'Artikel panduan berhasil diterbitkan'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: error.message || 'Gagal membuat artikel' }, { status: 500 })
  }
}
