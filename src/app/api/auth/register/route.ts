import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/auth/register - Ambil daftar Kelompok Tani untuk dropdown pendaftaran petani
export async function GET() {
  try {
    const kelompokTani = await prisma.kelompokTani.findMany({
      select: {
        id: true,
        nama: true,
        wilayah: true,
      },
      orderBy: { nama: 'asc' },
    })

    return NextResponse.json({
      success: true,
      kelompokTani,
    })
  } catch (error: any) {
    console.error('Error loading public registration metadata:', error)
    return NextResponse.json(
      { success: false, kelompokTani: [], error: 'Gagal memuat daftar kelompok tani' },
      { status: 500 }
    )
  }
}

