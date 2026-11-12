import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { ensureOtpTable } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const verificationId = String(body.verificationId || '').trim()
    const otpCode = String(body.otpCode || '').replace(/\s+/g, '')

    if (!verificationId || !/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'ID verifikasi dan 6 digit kode OTP wajib diisi dengan benar.' },
        { status: 400 }
      )
    }

    await ensureOtpTable()

    const record = await prisma.otpVerification.findUnique({
      where: { id: verificationId },
    })

    if (!record || record.purpose !== 'REGISTER_PETANI') {
      return NextResponse.json(
        { error: 'Sesi verifikasi OTP tidak ditemukan. Silakan daftar ulang.' },
        { status: 404 }
      )
    }

    if (record.verifiedAt) {
      return NextResponse.json(
        { error: 'Kode OTP ini sudah pernah digunakan untuk mengaktifkan akun.' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json(
        { error: 'Kode OTP sudah kedaluwarsa (melebihi 5 menit). Silakan klik Kirim Ulang OTP.' },
        { status: 400 }
      )
    }

    if (record.attempts >= 5) {
      return NextResponse.json(
        { error: 'Batas salah memasukkan OTP terlampaui (5x). Silakan klik Kirim Ulang OTP.' },
        { status: 429 }
      )
    }

    if (record.otpCode !== otpCode) {
      const nextAttempts = record.attempts + 1
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: nextAttempts },
      })
      const remaining = Math.max(0, 5 - nextAttempts)
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Kode OTP tidak cocok. Sisa kesempatan mencoba: ${remaining}x.`
              : 'Kode OTP tidak cocok dan batas percobaan habis. Silakan klik Kirim Ulang OTP.',
        },
        { status: 400 }
      )
    }

    const draft = JSON.parse(record.payloadJson)

    // Pastikan belum ada user/NIK yang terdaftar saat OTP diverifikasi
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: draft.username }, { email: draft.email }],
      },
      select: { id: true },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username atau email sudah terdaftar saat verifikasi. Silakan login.' },
        { status: 409 }
      )
    }

    if (draft.nik) {
      const existingNik = await prisma.petani.findUnique({
        where: { nik: draft.nik },
        select: { id: true },
      })
      if (existingNik) {
        return NextResponse.json(
          { error: 'NIK tersebut sudah terdaftar sebagai petani.' },
          { status: 409 }
        )
      }
    }

    // Validasi kelompokTaniId jika dipilih
    let validKelompokTaniId: string | null = null
    if (draft.kelompokTaniId) {
      const poktan = await prisma.kelompokTani.findUnique({
        where: { id: draft.kelompokTaniId },
        select: { id: true },
      })
      if (poktan) validKelompokTaniId = poktan.id
    }

    // Simpan User + Profil Petani + Tandai OTP Terverifikasi + AuditLog secara atomik
    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: draft.username,
          email: draft.email,
          passwordHash: draft.passwordHash,
          fullName: draft.namaLengkap,
          phone: draft.nomorTelepon,
          role: 'PETANI',
          isActive: true,
          lastLoginAt: new Date(),
        },
      })

      const petani = await tx.petani.create({
        data: {
          userId: user.id,
          namaLengkap: draft.namaLengkap,
          nomorTelepon: draft.nomorTelepon,
          alamat: draft.alamat,
          nik: draft.nik || null,
          kelompokTaniId: validKelompokTaniId,
          jenisKelamin: draft.jenisKelamin || 'LAKI_LAKI',
        },
      })

      await tx.otpVerification.update({
        where: { id: record.id },
        data: { verifiedAt: new Date() },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entity: 'Petani',
          entityId: petani.id,
          details: `Pendaftaran mandiri petani baru (${draft.namaLengkap}) berhasil diverifikasi melalui OTP.`,
        },
      })

      return user
    })

    // Buat sesi login otomatis sehingga petani langsung masuk dashboard
    await createSession({
      userId: createdUser.id,
      username: createdUser.fullName || createdUser.username,
      role: createdUser.role,
      fullName: createdUser.fullName,
      email: createdUser.email || '',
    })

    return NextResponse.json({
      success: true,
      message: 'Verifikasi OTP berhasil! Akun Petani Anda sudah aktif.',
      redirectTo: '/petani',
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        fullName: createdUser.fullName,
        role: createdUser.role,
      },
    })
  } catch (error: any) {
    console.error('Error verifying registration OTP:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memverifikasi kode OTP.' },
      { status: 500 }
    )
  }
}
