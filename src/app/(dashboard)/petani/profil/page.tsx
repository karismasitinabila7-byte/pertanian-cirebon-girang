'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { 
  User, 
  Phone, 
  MapPin, 
  Users, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  Map,
  Plus,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function PetaniProfilPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit Mode State for Personal Profile
  const [isEditing, setIsEditing] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    namaLengkap: '',
    nomorTelepon: '',
    alamat: '',
    jenisKelamin: 'LAKI_LAKI',
    tanggalLahir: '',
    email: '',
    password: ''
  })

  // Edit Land Location Modal State
  const [editingLahan, setEditingLahan] = useState<any | null>(null)
  const [lahanFormLoading, setLahanFormLoading] = useState(false)
  const [lahanFormError, setLahanFormError] = useState('')
  const [lahanForm, setLahanForm] = useState({
    namaLahan: '',
    luasLahan: '',
    satuanLuas: 'm²',
    lokasi: '',
    catatan: ''
  })

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/petani/me')
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setForm({
          namaLengkap: json.data.namaLengkap || '',
          nomorTelepon: json.data.nomorTelepon || '',
          alamat: json.data.alamat || '',
          jenisKelamin: json.data.jenisKelamin || 'LAKI_LAKI',
          tanggalLahir: json.data.tanggalLahir ? json.data.tanggalLahir.substring(0, 10) : '',
          email: json.data.user?.email || '',
          password: ''
        })
      } else {
        setError(json.error || 'Gagal memuat profil petani')
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
    if (!data) return
    setFormLoading(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const res = await fetch(`/api/petani/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui profil')

      setData({ ...data, ...json.data })
      setIsEditing(false)
      setSuccessMessage('Profil Anda berhasil diperbarui!')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleOpenEditLahan = (lahan: any) => {
    setEditingLahan(lahan)
    setLahanFormError('')
    setLahanForm({
      namaLahan: lahan.namaLahan || '',
      luasLahan: lahan.luasLahan ? String(lahan.luasLahan) : '',
      satuanLuas: lahan.satuanLuas || 'm²',
      lokasi: lahan.lokasi || '',
      catatan: lahan.catatan || ''
    })
  }

  const handleSaveLahan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLahan) return
    setLahanFormLoading(true)
    setLahanFormError('')

    try {
      const res = await fetch(`/api/lahan/${editingLahan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLahan: lahanForm.namaLahan,
          luasLahan: parseFloat(lahanForm.luasLahan),
          satuanLuas: lahanForm.satuanLuas,
          lokasi: lahanForm.lokasi,
          catatan: lahanForm.catatan,
          status: editingLahan.status || 'AKTIF'
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui data lahan')

      setSuccessMessage(`Alamat petak lahan "${lahanForm.namaLahan}" berhasil diperbarui!`)
      setEditingLahan(null)
      await fetchProfile()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setLahanFormError(err.message)
    } finally {
      setLahanFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat data profil Anda...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        <h2 className="font-semibold text-lg">Gagal Membuka Profil</h2>
        <p className="mt-1 text-sm">{error || 'Data profil petani belum terhubung dengan akun Anda.'}</p>
      </div>
    )
  }

  const lahanList = data.lahan || []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Petani & Lahan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data diri, kontak, dan alamat letak petak lahan sawah Anda di Desa Cirebon Girang.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Ubah Data Pribadi
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm shadow-sm animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white shadow-lg overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white text-green-800 font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            {data.namaLengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold">{data.namaLengkap}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                Anggota Petani Aktif
              </span>
            </div>
            <p className="text-green-100 text-sm mt-1">
              Petani Desa Cirebon Girang &bull; Akun @{data.user?.username} &bull; {lahanList.length} Petak Lahan
            </p>
          </div>
        </div>
      </Card>

      {/* Form Edit OR Normal View */}
      {isEditing ? (
        <Card className="p-6 border-green-200">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Edit3 className="h-5 w-5 text-green-600 mr-2" />
              Edit Informasi Profil Pribadi
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
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={form.namaLengkap}
                  onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={form.nomorTelepon}
                  onChange={(e) => setForm({ ...form, nomorTelepon: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  value={form.jenisKelamin}
                  onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  value={form.tanggalLahir}
                  onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (Opsional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ganti Password (Opsional)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter jika ingin ganti"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Alamat Rumah Tinggal *</label>
                <textarea
                  required
                  rows={2}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="e.g. RT 03/RW 02 Blok Manis Desa Cirebon Girang"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 shadow-sm"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {formLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Biodata & Kontak Display */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <User className="h-5 w-5 text-green-600 mr-2" />
                Biodata Pribadi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{data.namaLengkap}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {data.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Lahir</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {data.tanggalLahir 
                      ? new Date(data.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nomor Telepon / WhatsApp</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                    <Phone className="h-4 w-4 text-green-600 mr-1.5" />
                    {data.nomorTelepon}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alamat Domisili Rumah</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 flex items-start">
                    <MapPin className="h-4 w-4 text-green-600 mr-1.5 mt-0.5 flex-shrink-0" />
                    {data.alamat}
                  </p>
                </div>
              </div>
            </Card>

            {/* SEKSI ALAMAT LAHAN PERTANIAN (Requirement 1: update data diri, kontak, serta alamat lahan) */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Map className="h-5 w-5 text-emerald-600 mr-2" />
                  Alamat & Data Petak Lahan Sawah Saya
                </h3>
                <Link
                  href="/petani/lahan"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md"
                >
                  <Plus size={13} /> Tambah Lahan
                </Link>
              </div>

              {lahanList.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
                  <Map className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p>Anda belum mendaftarkan petak lahan pertanian.</p>
                  <Link
                    href="/petani/lahan"
                    className="mt-2 inline-flex items-center text-xs font-bold text-emerald-700 hover:underline"
                  >
                    + Daftarkan Petak Lahan Sekarang
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {lahanList.map((lahan: any) => (
                    <div
                      key={lahan.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 bg-white transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{lahan.namaLahan}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            lahan.status === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {lahan.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 flex items-start gap-1">
                          <MapPin size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Alamat / Letak Lahan:</strong> {lahan.lokasi}</span>
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Luas: <strong>{lahan.luasLahan.toLocaleString('id-ID')} {lahan.satuanLuas || 'm²'}</strong>
                          {lahan.catatan && ` &bull; ${lahan.catatan}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditLahan(lahan)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                          title="Perbarui alamat atau luas lahan ini"
                        >
                          <Edit3 size={13} /> Ubah Alamat Lahan
                        </button>
                        <Link
                          href={`/petani/lahan/${lahan.id}`}
                          className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-lg transition"
                          title="Lihat Detail Lahan"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                Kelompok Tani Anda
              </h3>

              {data.kelompokTani ? (
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <h4 className="text-base font-bold text-green-900">{data.kelompokTani.nama}</h4>
                  <p className="text-sm text-green-800 mt-1">Wilayah / Dusun: {data.kelompokTani.wilayah}</p>
                  <p className="text-xs text-green-700 mt-1">Ketua Kelompok: {data.kelompokTani.ketua}</p>
                </div>
              ) : (
                <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
                  Anda belum terdaftar ke dalam kelompok tani.
                </div>
              )}
            </Card>
          </div>

          {/* Account Details & AI Assistant Promo */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                Akun Aplikasi
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Username</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 mt-1 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {data.user?.username}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-800 mt-1">{data.user?.email || '-'}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Terakhir Login</p>
                  <p className="text-sm text-gray-700 mt-1 flex items-center">
                    <Clock className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    {data.user?.lastLoginAt 
                      ? new Date(data.user.lastLoginAt).toLocaleString('id-ID')
                      : 'Sedang Aktif'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-900 to-emerald-950 text-white shadow-md">
              <div className="flex items-center space-x-2 text-green-300 mb-2">
                <Sparkles className="h-5 w-5" />
                <h4 className="font-bold text-sm">Butuh Bantuan Pertanian?</h4>
              </div>
              <p className="text-xs text-green-100 leading-relaxed mb-4">
                Konsultasikan kendala hama padi, takaran pupuk, dan jadwal tanam Anda bersama AI Assistant Pertanian kami.
              </p>
              <a
                href="/ai"
                className="inline-block w-full text-center py-2 px-3 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Mulai Tanya AI
              </a>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Edit Alamat Lahan */}
      {editingLahan && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setEditingLahan(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-emerald-800 text-white">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-300" />
                  Perbarui Alamat Lahan Pertanian
                </h3>
                <button onClick={() => setEditingLahan(null)} className="text-emerald-200 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLahan} className="p-6 space-y-4">
                {lahanFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {lahanFormError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase">Nama / Label Petak *</label>
                  <input
                    type="text"
                    required
                    value={lahanForm.namaLahan}
                    onChange={(e) => setLahanForm({ ...lahanForm, namaLahan: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Luas Lahan *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lahanForm.luasLahan}
                      onChange={(e) => setLahanForm({ ...lahanForm, luasLahan: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Satuan Luas</label>
                    <select
                      value={lahanForm.satuanLuas}
                      onChange={(e) => setLahanForm({ ...lahanForm, satuanLuas: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="m²">m² (Meter Persegi)</option>
                      <option value="Ha">Ha (Hektar)</option>
                      <option value="Bata">Bata (Tumbak)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase">
                    Alamat / Letak Geografis Lahan Sawah *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={lahanForm.lokasi}
                    onChange={(e) => setLahanForm({ ...lahanForm, lokasi: e.target.value })}
                    placeholder="Contoh: Dusun Karang Anyar Blok Manis, Dekat Saluran Sekunder Cipager"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Cantumkan dusun, blok pematang, atau patokan saluran irigasi agar mudah diverifikasi perangkat desa.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase">Catatan Lahan (Opsional)</label>
                  <input
                    type="text"
                    value={lahanForm.catatan}
                    onChange={(e) => setLahanForm({ ...lahanForm, catatan: e.target.value })}
                    placeholder="Contoh: Tanah subur lempung liat, irigasi lancar"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingLahan(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={lahanFormLoading}
                    className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 shadow-sm"
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {lahanFormLoading ? 'Menyimpan...' : 'Simpan Alamat Lahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
