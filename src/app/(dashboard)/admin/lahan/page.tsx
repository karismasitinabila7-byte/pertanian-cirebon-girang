'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Power, 
  Map, 
  Users, 
  Sprout, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  FileText
} from 'lucide-react'

export default function AdminLahanPage() {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalLuasM2: 0,
    totalLuasHektar: 0,
    totalLahan: 0,
    totalAktif: 0,
    totalTidakAktif: 0
  })
  const [kelompokList, setKelompokList] = useState<any[]>([])
  const [petaniList, setPetaniList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('')
  const [petaniFilter, setPetaniFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, limit: 10 })
  const [error, setError] = useState('')

  // Modal Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    petaniId: '',
    namaLahan: '',
    luasLahan: '',
    satuanLuas: 'm²',
    lokasi: '',
    status: 'AKTIF',
    catatan: ''
  })

  // Fetch filter dropdown options
  const fetchOptions = async () => {
    try {
      const [resKelompok, resPetani] = await Promise.all([
        fetch('/api/kelompok-tani'),
        fetch('/api/petani?limit=200')
      ])
      const [jsonKelompok, jsonPetani] = await Promise.all([
        resKelompok.json(),
        resPetani.json()
      ])
      if (resKelompok.ok) setKelompokList(jsonKelompok.data || [])
      if (resPetani.ok) setPetaniList(jsonPetani.data || [])
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  // Fetch Farmland Data
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (kelompokFilter) params.set('kelompokTaniId', kelompokFilter)
      if (petaniFilter) params.set('petaniId', petaniFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/lahan?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setStats(json.stats || {})
        setPagination(json.pagination || { total: 0, totalPages: 1, limit: 10 })
      } else {
        setError(json.error || 'Gagal memuat data lahan')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchData()
  }, [search, kelompokFilter, petaniFilter, statusFilter, page])

  const handleOpenCreate = () => {
    setIsEdit(false)
    setCurrentId('')
    setFormError('')
    setForm({
      petaniId: petaniList.length > 0 ? petaniList[0].id : '',
      namaLahan: '',
      luasLahan: '',
      satuanLuas: 'm²',
      lokasi: '',
      status: 'AKTIF',
      catatan: ''
    })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setIsEdit(true)
    setCurrentId(item.id)
    setFormError('')
    setForm({
      petaniId: item.petaniId || '',
      namaLahan: item.namaLahan || '',
      luasLahan: item.luasLahan ? item.luasLahan.toString() : '',
      satuanLuas: item.satuanLuas || 'm²',
      lokasi: item.lokasi || '',
      status: item.status || 'AKTIF',
      catatan: item.catatan || ''
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    const luasNum = parseFloat(form.luasLahan)
    if (isNaN(luasNum) || luasNum <= 0) {
      setFormError('Luas lahan harus berupa angka lebih besar dari 0')
      setFormLoading(false)
      return
    }

    try {
      const url = isEdit ? `/api/lahan/${currentId}` : '/api/lahan'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan data')
      }

      await fetchData()
      handleCloseForm()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleStatus = async (item: any) => {
    const actionText = item.status === 'AKTIF' ? 'menonaktifkan' : 'mengaktifkan'
    if (!confirm(`Apakah Anda yakin ingin ${actionText} status lahan "${item.namaLahan}"?`)) return

    try {
      const res = await fetch(`/api/lahan/${item.id}/toggle-status`, {
        method: 'PATCH'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal mengubah status lahan')

      await fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm(`PERINGATAN: Menghapus lahan "${item.namaLahan}" akan menghapus seluruh data musim tanam dan aktivitas yang terkait. Lanjutkan?`)) return

    try {
      const res = await fetch(`/api/lahan/${item.id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus lahan')

      await fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Data Lahan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola pendataan petak sawah, kepemilikan petani, dan status produktivitas lahan desa.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Lahan
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-green-600">
          <div className="p-3 bg-green-50 rounded-xl text-green-700">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Lahan</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalLahan || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-emerald-600">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Luas</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalLuasM2 ? stats.totalLuasM2.toLocaleString('id-ID') : 0} <span className="text-xs font-normal text-gray-500">m²</span>
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">≈ {stats.totalLuasHektar || 0} Hektar (Ha)</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lahan Aktif</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalAktif || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-amber-600">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tidak Aktif / Istirahat</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalTidakAktif || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative rounded-md shadow-sm md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari lahan, lokasi, petani..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div>
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

          <div>
            <select
              value={petaniFilter}
              onChange={(e) => {
                setPetaniFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Petani</option>
              {petaniList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaLengkap} {p.kelompokTani ? `(${p.kelompokTani.nama})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">Hanya Aktif</option>
              <option value="TIDAK_AKTIF">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg text-red-700 bg-red-50 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Lahan & Blok
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Petani Pemilik
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Luas Lahan
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data lahan pertanian...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <Map className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">Tidak ada data lahan yang ditemukan.</p>
                    <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kelompok tani/petani.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.namaLahan}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-xs">{item.lokasi}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.petani?.namaLengkap}</div>
                      <div className="text-xs text-green-700 mt-0.5">
                        {item.petani?.kelompokTani?.nama ? item.petani.kelompokTani.nama : 'Petani Mandiri'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {item.luasLahan.toLocaleString('id-ID')} {item.satuanLuas || 'm²'}
                      </div>
                      {item.satuanLuas === 'm²' && item.luasLahan >= 1000 && (
                        <div className="text-xs text-gray-500">
                          ≈ {(item.luasLahan / 10000).toFixed(2)} Ha
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.status === 'AKTIF' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <XCircle className="h-3 w-3 mr-1" /> Tidak Aktif
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Detail Link */}
                        <Link
                          href={`/admin/lahan/${item.id}`}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                          title="Lihat Detail Lahan"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Lahan"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`p-1.5 rounded-md transition-colors ${
                            item.status === 'AKTIF'
                              ? 'text-gray-500 hover:text-amber-700 hover:bg-amber-50'
                              : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={item.status === 'AKTIF' ? 'Nonaktifkan Lahan' : 'Aktifkan Lahan'}
                        >
                          <Power className={`h-4 w-4 ${item.status === 'AKTIF' ? 'text-emerald-600' : 'text-gray-400'}`} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus Lahan"
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
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Halaman <span className="font-medium text-gray-900">{pagination.page}</span> dari <span className="font-medium text-gray-900">{pagination.totalPages}</span> (Total {pagination.total} Lahan)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form Tambah / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseForm}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-green-800 text-white">
                <h3 className="text-lg font-semibold">
                  {isEdit ? 'Edit Data Lahan Pertanian' : 'Tambah Petak Lahan Baru'}
                </h3>
                <button onClick={handleCloseForm} className="text-green-200 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Petani Pemilik Lahan *</label>
                  <select
                    required
                    value={form.petaniId}
                    onChange={(e) => setForm({ ...form, petaniId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                  >
                    <option value="">-- Pilih Petani --</option>
                    {petaniList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.namaLengkap} - {p.kelompokTani ? p.kelompokTani.nama : 'Mandiri'} ({p.nomorTelepon})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama / Label Lahan *</label>
                  <input
                    type="text"
                    required
                    value={form.namaLahan}
                    onChange={(e) => setForm({ ...form, namaLahan: e.target.value })}
                    placeholder="Contoh: Sawah Blok Kulon A, Petak Kidul 02"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Luas Lahan *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={form.luasLahan}
                      onChange={(e) => setForm({ ...form, luasLahan: e.target.value })}
                      placeholder="e.g. 1400"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Satuan Luas</label>
                    <select
                      value={form.satuanLuas}
                      onChange={(e) => setForm({ ...form, satuanLuas: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                    >
                      <option value="m²">m² (Meter Persegi)</option>
                      <option value="Ha">Ha (Hektar)</option>
                      <option value="Bata">Bata (14 m²)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lokasi / Deskripsi Lahan *</label>
                  <input
                    type="text"
                    required
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                    placeholder="Contoh: Dusun Karang Anyar Blok Sawah Kulon No. 12"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Produktivitas Lahan</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                  >
                    <option value="AKTIF">Aktif (Produktif & Siap Tanam)</option>
                    <option value="TIDAK_AKTIF">Tidak Aktif (Masa Bera / Istirahat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Informasi irigasi, kondisi tanah, atau batas petak..."
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 shadow-sm"
                  >
                    {formLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Lahan'}
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
