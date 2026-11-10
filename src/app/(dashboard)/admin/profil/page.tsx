'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  CheckCircle,
  Clock,
  ShieldCheck,
  Building,
  KeyRound
} from 'lucide-react'
import Link from 'next/link'

export default function AdminProfilPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  })

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/user/profile')
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setForm({
          fullName: json.data.fullName || '',
          phone: json.data.phone || '',
          email: json.data.email || '',
          password: ''
        })
      } else {
        setError(json.error || 'Gagal memuat profil administrator')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui profil')

      setData({ ...data, ...json.data })
      setIsEditing(false)
      setSuccessMessage('Profil Administrator berhasil diperbarui!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat data profil administrator...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        <h2 className="font-semibold text-lg">Gagal Membuka Profil</h2>
        <p className="mt-1 text-sm">{error || 'Data akun tidak ditemukan.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Administrator</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data akun pengelola sistem platform SI PADI Desa Cirebon Girang.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Ubah Data Profil
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm shadow-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-lg overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <img
            src="/avatars/admin.jpg"
            alt={data.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md flex-shrink-0"
          />
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold">{data.fullName}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-400/20 text-red-100 border border-red-400/30">
                Super Administrator
              </span>
            </div>
            <p className="text-emerald-200 text-sm mt-1">
              Pengelola Sistem Penuh &bull; SI PADI Cirebon Girang &bull; Akun @{data.username}
            </p>
          </div>
        </div>
      </Card>

      {/* Form Edit OR Normal View */}
      {isEditing ? (
        <Card className="p-6 border-emerald-200">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Edit3 className="h-5 w-5 text-emerald-600 mr-2" />
              Edit Data Akun Administrator
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap Administrator *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Administrator (Opsional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ganti Password (Opsional)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Kosongkan jika tidak ingin mengganti"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none disabled:opacity-50 shadow-sm"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {formLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <ShieldCheck className="h-5 w-5 text-emerald-700 mr-2" />
                Informasi Akun Utama
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{data.fullName}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Peran Otoritas</p>
                  <p className="text-sm font-semibold text-emerald-800 mt-1">
                    Super Administrator Sistem
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nomor Kontak / WhatsApp</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                    <Phone className="h-4 w-4 text-emerald-600 mr-1.5" />
                    {data.phone || '0812-3456-7890'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Akun</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                    <Mail className="h-4 w-4 text-emerald-600 mr-1.5" />
                    {data.email || 'Karismasitinabila7@gmail.com'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-50 border-slate-200">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-700" />
                Hak Istimewa Administrator
              </h3>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                <li>Manajemen penuh akun pengguna (tambah akun, ganti hak akses/role, blokir akun).</li>
                <li>CRUD seluruh entitas data: Kelompok Tani, Petani, Petak Lahan, Musim Tanam, Aktivitas, dan Panen.</li>
                <li>Akses modul pelaporan resmi dan generator laporan AI.</li>
                <li>Pemantauan audit log seluruh aktivitas sistem.</li>
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <KeyRound className="h-5 w-5 text-emerald-600 mr-2" />
                Status Kredensial
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Username</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 mt-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {data.username}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Level Hak Akses</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    ADMIN
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sesi Terakhir Login</p>
                  <p className="text-sm text-gray-700 mt-1 flex items-center">
                    <Clock className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    {data.lastLoginAt 
                      ? new Date(data.lastLoginAt).toLocaleString('id-ID')
                      : 'Sedang Aktif'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-purple-50 border border-purple-200">
              <h4 className="font-bold text-sm text-purple-900 mb-1">Manajemen Pengguna</h4>
              <p className="text-xs text-purple-700 mb-3">
                Kelola hak akses dan akun petani atau perangkat desa secara dinamis.
              </p>
              <Link
                href="/admin/users"
                className="inline-block w-full text-center py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition shadow-xs"
              >
                Buka Manajemen Pengguna &rarr;
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
