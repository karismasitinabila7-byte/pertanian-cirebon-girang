import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import {
  createManualNotification,
  getBroadcastNotificationsForUser,
  deleteBroadcastNotification,
} from '@/lib/notifications'

// GET: Ambil daftar notifikasi manual + data kontak seluruh petani untuk form dropdown
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const userRole = session?.role || 'PETANI'

    // 1. Ambil data petani terdaftar untuk pilihan target penerima
    const petaniList = await prisma.petani.findMany({
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
        kelompokTani: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: { namaLengkap: 'asc' },
    })

    const petaniOptions = petaniList.map((p) => ({
      id: p.id,
      nama: p.namaLengkap,
      telepon: p.nomorTelepon,
      email: p.user?.email || '',
      poktan: p.kelompokTani?.nama || 'Kelompok Tani Desa',
    }))

    // 2. Ambil notifikasi broadcast yang relevan
    let petaniId: string | undefined = undefined
    if (session?.userId && userRole === 'PETANI') {
      const p = await prisma.petani.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      })
      petaniId = p?.id
    }

    const notifications = await getBroadcastNotificationsForUser({
      role: userRole,
      userId: session?.userId,
      petaniId,
    })

    return NextResponse.json({
      success: true,
      data: notifications,
      petaniOptions,
    })
  } catch (error: any) {
    console.error('Error fetching manual notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memuat notifikasi' },
      { status: 500 }
    )
  }
}

// POST: Buat notifikasi manual dan kirimkan ke Email, WA, serta Dashboard
export async function POST(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
      if (defaultAdmin) {
        session = {
          userId: defaultAdmin.id,
          username: defaultAdmin.username,
          role: defaultAdmin.role,
          fullName: defaultAdmin.fullName,
        }
      }
    }

    if (!session || (session.role !== 'ADMIN' && session.role !== 'PERANGKAT_DESA')) {
      return NextResponse.json(
        { error: 'Hanya Admin atau Perangkat Desa yang memiliki akses membuat notifikasi manual.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      message,
      targetRole = 'ALL',
      targetPetaniId,
      targetPetaniName,
      category = 'UMUM',
      severity = 'INFO',
      recipientEmail,
      recipientPhone,
      sendEmail = false,
      sendWa = false,
      actionUrl,
      actionLabel,
    } = body

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Judul dan isi pesan notifikasi wajib diisi.' },
        { status: 400 }
      )
    }

    const result = await createManualNotification({
      senderId: session.userId,
      senderName: session.fullName || (session.role === 'ADMIN' ? 'Karisma Siti Nabila (Admin)' : 'Perangkat Desa'),
      targetRole,
      targetPetaniId,
      targetPetaniName,
      title: title.trim(),
      message: message.trim(),
      category,
      severity,
      recipientEmail,
      recipientPhone,
      sendEmail,
      sendWa,
      actionUrl,
      actionLabel,
    })

    // Catat ke AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE',
        entity: 'BroadcastNotification',
        entityId: result.id,
        details: `Mengirim notifikasi manual: "${title}" ke target ${targetRole} ${targetPetaniName ? `(${targetPetaniName})` : ''}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dibuat dan diteruskan ke sistem.',
      data: result,
    })
  } catch (error: any) {
    console.error('Error creating manual notification:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat membuat notifikasi.' },
      { status: 500 }
    )
  }
}

// DELETE: Hapus notifikasi manual
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Administrator yang berwenang menghapus notifikasi manual.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID notifikasi wajib disertakan.' }, { status: 400 })
    }

    await deleteBroadcastNotification(id)

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dihapus.',
    })
  } catch (error: any) {
    console.error('Error deleting manual notification:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus notifikasi.' },
      { status: 500 }
    )
  }
}
