import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const petani = await prisma.petani.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true
          }
        },
        kelompokTani: true,
        lahan: {
          orderBy: { createdAt: 'desc' },
          include: {
            musimTanam: {
              where: { status: 'BERJALAN' },
              take: 1
            }
          }
        },
        _count: {
          select: {
            lahan: true
          }
        }
      }
    })

    if (!petani) {
      return NextResponse.json({ error: 'Profil petani belum terdaftar atau tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: petani })
  } catch (error: any) {
    console.error('Error getting petani profile:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
