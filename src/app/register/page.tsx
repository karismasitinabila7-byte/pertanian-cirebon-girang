'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sprout,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Users,
  CreditCard,
} from 'lucide-react'

interface KelompokTaniOption {
  id: string
  nama: string
  wilayah: string
}

interface OtpResponseState {
  verificationId: string
  maskedPhone: string
  maskedEmail: string
  message: string
  channels: {
    whatsapp: { sentAutomatically: boolean; isNotConfigured?: boolean; note?: string }
    email: { sent: boolean; isSimulated?: boolean; note?: string }
  }
}

export default function RegisterPetaniPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [kelompokList, setKelompokList] = useState<KelompokTaniOption[]>([])

  // Form fields
  const [namaLengkap, setNamaLengkap] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [nomorTelepon, setNomorTelepon] = useState('')
  const [nik, setNik] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI')
  const [alamat, setAlamat] = useState('')
  const [kelompokTaniId, setKelompokTaniId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP state
  const [otpSession, setOtpSession] = useState<OtpResponseState | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [expiresSeconds, setExpiresSeconds] = useState(0)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/register')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.kelompokTani)) {
          setKelompokList(data.kelompokTani)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (step !== 'otp' || expiresSeconds <= 0) return
    const timer = setInterval(() => {
      setExpiresSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step, expiresSeconds])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLengkap,
          username,
          email,
          nomorTelepon,
          nik: nik.trim() || null,
          jenisKelamin,
          alamat,
          kelompokTaniId: kelompokTaniId || null,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pendaftaran petani.')
      }

      setOtpSession({
        verificationId: data.verificationId,
        maskedPhone: data.maskedPhone,
        maskedEmail: data.maskedEmail,
        message: data.message,
        channels: data.channels,
      })
      setOtpCode('')
      setExpiresSeconds(data.expiresInSeconds || 300)
      setResendCooldown(45)
      setStep('otp')
      setSuccessMsg(data.message)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim kode OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpSession) return
    setError(null)
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: otpSession.verificationId,
          otpCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Verifikasi OTP gagal.')
      }

      localStorage.setItem('userName', data.user?.fullName || namaLengkap)
      localStorage.setItem('userEmail', data.user?.email || email)
      localStorage.setItem('userRole', 'petani')

      setSuccessMsg('Pendaftaran berhasil diverifikasi! Mengarahkan ke Dashboard Petani...')
      setTimeout(() => {
        router.push(data.redirectTo || '/petani')
        router.refresh()
      }, 800)
    } catch (err: any) {
      setError(err.message || 'Kode OTP tidak valid.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8 space-y-6">
        {/* Top Nav & Brand */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Login</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Sprout size={13} className="text-emerald-600" />
            <span>SI PADI · Cirebon Girang</span>
          </span>
        </div>

        {/* Title & Stepper */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Pendaftaran Akun Petani Baru
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Setelah mendaftar, sistem akan mengirimkan <strong>kode OTP 6 digit otomatis</strong> ke{' '}
            <strong>WhatsApp</strong> &amp; <strong>Email</strong> Anda untuk aktivasi akun.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                step === 'form'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : 'bg-emerald-50/40 border-emerald-200 text-emerald-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                {step === 'otp' ? '✓' : '1'}
              </span>
              <span>Isi Data Petani</span>
            </div>
            <div
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                step === 'otp'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === 'otp' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-white'
                }`}
              >
                2
              </span>
              <span>Verifikasi OTP (WA &amp; Email)</span>
            </div>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: FORM DATA PETANI */}
        {step === 'form' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Nama Lengkap Petani *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Contoh: Bapak Ahmad Yani"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Username Login *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Contoh: ahmad_yani"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value as 'LAKI_LAKI' | 'PEREMPUAN')}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Nomor WhatsApp Aktif (Untuk OTP) *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={nomorTelepon}
                    onChange={(e) => setNomorTelepon(e.target.value)}
                    placeholder="0857xxxxxxxx"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Alamat Email Aktif (Untuk OTP) *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="petani@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  NIK (16 Digit, Opsional)
                </label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="3209xxxxxxxxxxxx"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kelompok Tani (Poktan)
                </label>
                <div className="relative">
                  <Users size={15} className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={kelompokTaniId}
                    onChange={(e) => setKelompokTaniId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">-- Pilih Kelompok Tani (Opsional) --</option>
                    {kelompokList.map((kt) => (
                      <option key={kt.id} value={kt.id}>
                        {kt.nama} ({kt.wilayah})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Alamat / Dusun / Blok Sawah *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Dusun Karang Anyar RT 02/01, Desa Cirebon Girang"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Konfirmasi Kata Sandi *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mengirim OTP ke WhatsApp &amp; Email...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Daftar &amp; Kirim Kode OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFIKASI KODE OTP */}
        {step === 'otp' && otpSession && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {/* Status Pengiriman Dual-Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  otpSession.channels.whatsapp.sentAutomatically
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  <span>WhatsApp ({otpSession.maskedPhone})</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed">
                  {otpSession.channels.whatsapp.sentAutomatically
                    ? '✓ Kode OTP terkirim otomatis ke WhatsApp Anda.'
                    : otpSession.channels.whatsapp.note || 'Gateway WA belum aktif di Konfigurasi.'}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  otpSession.channels.email.sent && !otpSession.channels.email.isSimulated
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Mail size={14} />
                  <span>Email ({otpSession.maskedEmail})</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed">
                  {otpSession.channels.email.sent && !otpSession.channels.email.isSimulated
                    ? '✓ Kode OTP terkirim otomatis ke kotak masuk Email.'
                    : otpSession.channels.email.note || 'SMTP Email belum diisi penuh di Konfigurasi.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
              <label className="block text-xs font-bold text-gray-800">
                Masukkan 6 Digit Kode OTP Verifikasi
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-56 mx-auto block text-center text-2xl font-extrabold tracking-[0.5em] py-3 px-4 rounded-xl border-2 border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 bg-white outline-none font-mono"
              />
              <p className="text-[11px] text-gray-500">
                {expiresSeconds > 0 ? (
                  <>
                    Kode berlaku selama{' '}
                    <span className="font-bold text-emerald-700 font-mono">
                      {formatTimer(expiresSeconds)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-rose-600">
                    Waktu OTP habis, silakan klik Kirim Ulang OTP.
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={submitting || otpCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memverifikasi OTP &amp; Mengaktifkan Akun...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verifikasi OTP &amp; Masuk Dashboard</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline cursor-pointer"
                >
                  ← Ubah Data Pendaftaran
                </button>

                <button
                  type="button"
                  disabled={submitting || resendCooldown > 0}
                  onClick={() => handleRequestOtp()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>
                    {resendCooldown > 0
                      ? `Kirim Ulang OTP (${resendCooldown}d)`
                      : 'Kirim Ulang OTP'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
