'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  XCircle,
  KeyRound,
  Shield,
  Loader2
} from 'lucide-react'

export default function AdminPetaniPage() {
  const [data, setData] = useState<any[]>([])
  const [kelompokList, setKelompokList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, limit: 10 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPetani, setSelectedPetani] = useState<any>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Form Fields
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    namaLengkap: '',
    nik: '',
    nomorTelepon: '',
    alamat: '',
    jenisKelamin: 'LAKI_LAKI',
    kelompokTaniId: '',
    isActive: true,
  })

  // Fetch Kelompok Tani options for select dropdown
  const fetchKelompokOptions = async () => {
    try {
      const res = await fetch('/api/kelompok-tani')
      const json = await res.json()
      if (res.ok) {
        setKelompokList(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching kelompok tani:', err)
    }
  }

  // Fetch Farmers Data
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (kelompokFilter) params.set('kelompokTaniId', kelompokFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/petani?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setPagination(json.pagination)
      } else {
        setError(json.error || 'Gagal memuat data petani')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelompokOptions()
  }, [])

  useEffect(() => {
    fetchData()
  }, [search, kelompokFilter, page])

  // Open Form Modal for Create
  const handleOpenAdd = () => {
    setIsEdit(false)
    setSelectedPetani(null)
    setForm({
      username: '',
      email: '',
      password: 'password123',
      namaLengkap: '',
      nik: '',
      nomorTelepon: '',
      alamat: '',
      jenisKelamin: 'LAKI_LAKI',
      kelompokTaniId: '',
      isActive: true,
    })
    setFormError('')
    setIsFormOpen(true)
  }

  // Open Form Modal for Edit
  const handleOpenEdit = (item: any) => {
    setIsEdit(true)
    setSelectedPetani(item)
    setForm({
      username: item.user?.username || '',
      email: item.user?.email || '',
      password: '', // Kosongkan jika tidak ingin ganti password
      namaLengkap: item.namaLengkap || '',
      nik: item.nik || '',
      nomorTelepon: item.nomorTelepon || '',
      alamat: item.alamat || '',
      jenisKelamin: item.jenisKelamin || 'LAKI_LAKI',
      kelompokTaniId: item.kelompokTaniId || '',
      isActive: item.user?.isActive ?? true,
    })
    setFormError('')
    setIsFormOpen(true)
  }

  // Submit Form (Add or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      if (isEdit) {
        const payload: any = {
          namaLengkap: form.namaLengkap,
          nik: form.nik,
          nomorTelepon: form.nomorTelepon,
          alamat: form.alamat,
          jenisKelamin: form.jenisKelamin,
          kelompokTaniId: form.kelompokTaniId || null,
          email: form.email,
          isActive: form.isActive,
        }
        if (form.password.trim()) {
          payload.password = form.password.trim()
        }

        const res = await fetch(`/api/petani/${selectedPetani.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal memperbarui data petani')

        setSuccess('Data petani berhasil diperbarui')
      } else {
        const payload = {
          ...form,
          kelompokTaniId: form.kelompokTaniId || null,
        }

        const res = await fetch('/api/petani', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Gagal menambahkan petani baru')

        setSuccess('Petani baru berhasil didaftarkan')
      }

      setIsFormOpen(false)
      fetchData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedPetani) return
    setFormLoading(true)
    try {
      const res = await fetch(`/api/petani/${selectedPetani.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus petani')

      setIsDeleteOpen(false)
      setSelectedPetani(null)
      setSuccess('Data petani berhasil dihapus dari sistem')
      fetchData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus petani')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Data Petani</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar lengkap petani, keanggotaan kelompok tani, dan manajemen akun petani Desa Cirebon Girang.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Petani
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-4 rounded-lg text-green-800 bg-green-50 border border-green-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg text-red-700 bg-red-50 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative rounded-md shadow-sm md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari nama petani, NIK, nomor telepon, username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="relative">
            <select
              value={kelompokFilter}
              onChange={(e) => {
                setKelompokFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Kelompok Tani</option>
              {kelompokList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.wilayah})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Petani & Akun
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelompok Tani
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak & NIK
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Petak Lahan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Akun
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600 mb-2" />
                    Memuat data petani...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Tidak ada data petani yang ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((petani) => (
                  <tr key={petani.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          {petani.namaLengkap.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{petani.namaLengkap}</div>
                          <div className="text-xs text-gray-500">
                            Username: <span className="font-mono text-gray-700">{petani.user?.username}</span>
                          </div>
                          {petani.user?.email && (
                            <div className="text-xs text-gray-400">{petani.user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {petani.kelompokTani ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {petani.kelompokTani.nama}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{petani.kelompokTani.wilayah}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Mandiri / Non-Kelompok
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center text-xs text-gray-700 mb-1">
                        <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {petani.nomorTelepon || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        NIK: <span className="font-mono">{petani.nik || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-emerald-200">
                        {petani._count?.lahan || 0} Petak Sawah
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {petani.user?.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1 text-red-600" />
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPetani(petani)
                            setIsDetailOpen(true)
                          }}
                          className="text-gray-500 hover:text-green-600 p-1 rounded-md hover:bg-gray-100"
                          title="Lihat Detail Petani"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(petani)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="Edit Data Petani"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPetani(petani)
                            setIsDeleteOpen(true)
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Hapus Petani"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> sampai{' '}
                  <span className="font-medium">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{' '}
                  dari <span className="font-medium">{pagination.total}</span> data petani
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Halaman {page} dari {pagination.totalPages}
                  </span>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Add / Edit Farmer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {isEdit ? 'Ubah Data Petani' : 'Pendaftaran Petani Baru'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Petani *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sukardi"
                  value={form.namaLengkap}
                  onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    NIK (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="3209..."
                    value={form.nik}
                    onChange={(e) => setForm({ ...form, nik: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    No. Telepon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0852..."
                    value={form.nomorTelepon}
                    onChange={(e) => setForm({ ...form, nomorTelepon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Kelompok Tani
                </label>
                <select
                  value={form.kelompokTaniId}
                  onChange={(e) => setForm({ ...form, kelompokTaniId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">Pilih Kelompok Tani (Opsional)</option>
                  {kelompokList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama} ({k.wilayah})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: RT 03/RW 02 Blok Manis Desa Cirebon Girang"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={form.jenisKelamin}
                    onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Status Akun
                  </label>
                  <select
                    value={form.isActive ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {/* Data Akun / Login */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-green-600" />
                  Kredensial Akun Login Petani
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required={!isEdit}
                      disabled={isEdit}
                      placeholder="sukardi"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      placeholder="sukardi@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    {isEdit ? 'Ubah Kata Sandi (Kosongkan jika tidak diganti)' : 'Kata Sandi Awal *'}
                  </label>
                  <input
                    type="password"
                    required={!isEdit}
                    placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? 'Simpan Perubahan' : 'Daftarkan Petani'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Petani */}
      {isDetailOpen && selectedPetani && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Profil Petani</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                  {selectedPetani.namaLengkap.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{selectedPetani.namaLengkap}</h4>
                  <p className="text-xs text-gray-500">Username: @{selectedPetani.user?.username}</p>
                  <p className="text-xs text-green-700 font-medium mt-0.5">
                    {selectedPetani.kelompokTani?.nama || 'Petani Mandiri'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">NIK</span>
                  <span className="font-mono font-medium text-gray-900">{selectedPetani.nik || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">No. Telepon</span>
                  <span className="font-mono font-medium text-gray-900">{selectedPetani.nomorTelepon || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Email Akun</span>
                  <span className="font-medium text-gray-900">{selectedPetani.user?.email || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Kelompok Tani</span>
                  <span className="font-medium text-gray-900">{selectedPetani.kelompokTani?.nama || 'Non-Kelompok'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Ketua Kelompok</span>
                  <span className="font-medium text-gray-900">{selectedPetani.kelompokTani?.ketua || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Jumlah Lahan</span>
                  <span className="font-bold text-emerald-700">{selectedPetani._count?.lahan || 0} Petak Sawah</span>
                </div>
                <div className="py-1">
                  <span className="text-gray-500 block mb-1">Alamat</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded-lg text-xs">{selectedPetani.alamat || '-'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteOpen && selectedPetani && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Data Petani?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Yakin ingin menghapus petani <strong>{selectedPetani.namaLengkap}</strong>? Akun login dan data terkait lahan akan dihapus secara permanen.
              </p>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={formLoading}
                onClick={handleDelete}
                className="w-1/2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {formLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
