import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { formatWhatsAppPhone } from '@/lib/whatsapp'
import {
  ensureOtpTable,
  generateOtpCode,
  maskEmailAddress,
  maskPhoneNumber,
  sendDualChannelOtp,
} from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const namaLengkap = String(body.namaLengkap || '').trim()
    const username = String(body.username || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
    const email = String(body.email || '').trim().toLowerCase()
    const rawPhone = String(body.nomorTelepon || '').trim()
    const password = String(body.password || '')
    const alamat = String(body.alamat || '').trim()
    const nik = body.nik ? String(body.nik).trim() : null
    const kelompokTaniId = body.kelompokTaniId ? String(body.kelompokTaniId).trim() : null
    const jenisKelamin = body.jenisKelamin === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI_LAKI'

    // 1. Validasi Input Dasar
    if (namaLengkap.length < 3) {
      return NextResponse.json({ error: 'Nama lengkap minimal 3 karakter.' }, { status: 400 })
    }
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter (hanya huruf kecil, angka, atau garis bawah).' },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid.' }, { status: 400 })
    }

    const phoneDigits = rawPhone.replace(/\D/g, '')
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp aktif wajib diisi dengan benar (minimal 9 digit).' },
        { status: 400 }
      )
    }
    const normalizedPhone = formatWhatsAppPhone(rawPhone, phoneDigits)

    if (password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter.' }, { status: 400 })
    }
    if (alamat.length < 5) {
      return NextResponse.json({ error: 'Alamat / blok dusun wajib diisi.' }, { status: 400 })
    }
    if (nik && !/^\d{16}$/.test(nik)) {
      return NextResponse.json({ error: 'NIK harus terdiri dari 16 digit angka.' }, { status: 400 })
    }

    // 2. Cek Duplikasi Akun / Petani di Database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { username: true, email: true },
    })

    if (existingUser) {
      const conflictField =
        existingUser.email?.toLowerCase() === email ? 'Alamat email' : 'Username'
      return NextResponse.json(
        { error: `${conflictField} sudah terdaftar di sistem. Silakan login atau gunakan data lain.` },
        { status: 409 }
      )
    }

    if (nik) {
      const existingNik = await prisma.petani.findUnique({
        where: { nik },
        select: { id: true },
      })
      if (existingNik) {
        return NextResponse.json(
          { error: 'NIK tersebut sudah terdaftar sebagai petani di sistem.' },
          { status: 409 }
        )
      }
    }

    // 3. Siapkan Tabel OTP & Cek Cooldown Anti-Spam (45 detik)
    await ensureOtpTable()

    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        email,
        purpose: 'REGISTER_PETANI',
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (latestOtp) {
      const elapsedMs = Date.now() - new Date(latestOtp.createdAt).getTime()
      if (elapsedMs < 45 * 1000) {
        const waitSec = Math.ceil((45 * 1000 - elapsedMs) / 1000)
        return NextResponse.json(
          { error: `Tunggu ${waitSec} detik sebelum mengirim ulang kode OTP.` },
          { status: 429 }
        )
      }
    }

    // Bersihkan OTP lama yang belum terverifikasi untuk email/nomor yang sama
    await prisma.otpVerification.deleteMany({
      where: {
        purpose: 'REGISTER_PETANI',
        verifiedAt: null,
        OR: [{ email }, { phone: normalizedPhone }],
      },
    })

    // 4. Generate OTP 6 Digit & Hash Password Aman
    const otpCode = generateOtpCode()
    const passwordHash = await bcrypt.hash(password, 10)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // berlaku 5 menit

    const draftPayload = {
      namaLengkap,
      username,
      email,
      nomorTelepon: normalizedPhone,
      passwordHash,
      alamat,
      nik,
      kelompokTaniId: kelompokTaniId || null,
      jenisKelamin,
    }

    const otpRecord = await prisma.otpVerification.create({
      data: {
        email,
        phone: normalizedPhone,
        otpCode,
        purpose: 'REGISTER_PETANI',
        payloadJson: JSON.stringify(draftPayload),
        expiresAt,
      },
    })

    // 5. Kirim OTP Otomatis khusus ke WhatsApp Petani (Fonnte/Gateway)
    const delivery = await sendDualChannelOtp({
      otpCode,
      namaLengkap,
      email,
      phone: normalizedPhone,
    })

    const sentRealWa = delivery.whatsapp.sentAutomatically

    let summaryMsg = 'Kode OTP 6 digit telah dibuat.'
    if (sentRealWa) {
      summaryMsg = `Kode OTP 6 digit berhasil dikirim otomatis ke WhatsApp (${maskPhoneNumber(normalizedPhone)}).`
    } else {
      summaryMsg = `Kode OTP 6 digit telah dibuat untuk nomor WhatsApp ${maskPhoneNumber(normalizedPhone)}.`
    }

    return NextResponse.json({
      success: true,
      verificationId: otpRecord.id,
      expiresInSeconds: 300,
      maskedPhone: maskPhoneNumber(normalizedPhone),
      maskedEmail: maskEmailAddress(email),
      channels: {
        whatsapp: delivery.whatsapp,
        email: delivery.email,
      },
      message: summaryMsg,
    })
  } catch (error: any) {
    console.error('Error requesting registration OTP:', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pendaftaran & pengiriman OTP.' },
      { status: 500 }
    )
  }
}

