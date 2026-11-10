import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { getAppSettings, saveAppSettings } from '@/lib/settings'

export async function GET(req: NextRequest) {
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

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = getAppSettings()
    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        hasApiKey: !!settings.aiApiKey,
        hasSmtpPass: !!settings.smtpPass,
      },
    })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat pengaturan' }, { status: 500 })
  }
}

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

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya Administrator yang berwenang mengubah konfigurasi sistem.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const updated = saveAppSettings(body)

    // Catat ke AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE',
        entity: 'SystemSettings',
        details: 'Memperbarui konfigurasi sistem (Kecerdasan Buatan AI & Notifikasi Email/WhatsApp)',
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi sistem berhasil disimpan dan diterapkan.',
      data: {
        ...updated,
        hasApiKey: !!updated.aiApiKey,
        hasSmtpPass: !!updated.smtpPass,
      },
    })
  } catch (error: any) {
    console.error('Error saving settings:', error)
    return NextResponse.json({ error: error.message || 'Gagal menyimpan pengaturan' }, { status: 500 })
  }
}
