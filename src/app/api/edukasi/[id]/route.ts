import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/edukasi/[id] - Detail artikel panduan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const article = await prisma.informasiPertanian.findUnique({
      where: { id },
      include: {
        penulis: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }

    const wordsCount = article.isi.split(/\s+/).length
    const readTimeMinutes = Math.max(2, Math.ceil(wordsCount / 180))

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        readTime: `${readTimeMinutes} menit baca`
      }
    })
  } catch (error: any) {
    console.error('Error fetching article detail:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat detail artikel' }, { status: 500 })
  }
}

// DELETE /api/edukasi/[id] - Hapus artikel panduan (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang dapat menghapus artikel panduan' }, { status: 403 })
    }

    const { id } = await params
    const deleted = await prisma.informasiPertanian.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Artikel berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus artikel' }, { status: 500 })
  }
}
