'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const targetEmail = email.trim()
    const targetPassword = password

    if (!targetEmail || !targetPassword) {
      setError('Alamat email dan kata sandi wajib diisi.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Email atau kata sandi tidak sesuai.')
      }

      // Simpan session info ke localStorage untuk sinkronisasi komponen klien
      localStorage.setItem('userName', data.user?.fullName || data.user?.username || 'Pengguna')
      localStorage.setItem('userEmail', data.user?.email || targetEmail)
      localStorage.setItem('userRole', (data.role || 'petani').toLowerCase())

      // Redirect ke dashboard masing-masing sesuai peran
      router.push(data.redirectTo || '/petani')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke sistem. Periksa kembali email dan password Anda.')
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8faf9',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(34, 153, 102, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.06) 0px, transparent 50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(10, 41, 27, 0.12), 0 0 0 1px rgba(226, 232, 227, 0.8)',
          padding: '40px 32px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Back to Home Link ── */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#059669',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            Kembali ke Beranda Utama
          </Link>
        </div>

        {/* ── Brand Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 12px auto',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              boxShadow: '0 4px 8px rgba(5, 150, 105, 0.12)',
            }}
          >
            <Sprout size={32} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0a291b',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Masuk ke Sistem Pertanian
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#4b6354',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Desa Cirebon Girang &middot; Petani, Perangkat Desa, Admin
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#b91c1c',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Formulir Login (Hanya Email, Kata Sandi, dan Tombol Masuk) ── */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Input Email */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '6px',
              }}
            >
              Alamat Email Pengguna
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#94a3b8',
                  display: 'flex',
                }}
              >
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: Karismasitinabila7@gmail.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '6px',
              }}
            >
              Kata Sandi
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#94a3b8',
                  display: 'flex',
                }}
              >
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  padding: 0,
                }}
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Tombol Masuk ke Dashboard */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '6px',
              width: '100%',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontWeight: 700,
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              opacity: isLoading ? 0.75 : 1,
              transition: 'background-color 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748b',
          }}
        >
          Belum punya akun petani?{' '}
          <Link
            href="/register"
            style={{
              color: '#059669',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Daftar Sekarang (Verifikasi OTP)
          </Link>
        </div>
      </div>
    </div>
  )
}