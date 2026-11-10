'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import {
  Plus,
  Map,
  Layers,
  CheckCircle2,
  XCircle,
  MapPin,
  Power,
  Edit2,
  Eye,
  X,
  Search,
  Sparkles
} from 'lucide-react'

export default function PetaniLahanPage() {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalLuasM2: 0,
    totalLuasHektar: 0,
    totalLahan: 0,
    totalAktif: 0,
    totalTidakAktif: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')

  // Modal Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    namaLahan: '',
    luasLahan: '',
    satuanLuas: 'm²',
    lokasi: '',
    status: 'AKTIF',
    catatan: ''
  })

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '50')

      const res = await fetch(`/api/lahan?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data || [])
        setStats(json.stats || {})
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
    fetchData()
  }, [search, statusFilter])

  const handleOpenCreate = () => {
    setIsEdit(false)
    setCurrentId('')
    setFormError('')
    setForm({
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
      setFormError('Luas lahan harus berupa angka valid lebih besar dari 0')
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
        throw new Error(json.error || 'Gagal menyimpan data lahan')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lahan Pertanian Saya</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar seluruh petak sawah dan status kesiapan tanam milik Anda.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Lahan Baru
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-green-600">
          <div className="p-3 bg-green-50 rounded-xl text-green-700">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Lahan Saya</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalLahan || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-emerald-600">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Luas Keseluruhan</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalLuasM2 ? stats.totalLuasM2.toLocaleString('id-ID') : 0} <span className="text-xs font-normal text-gray-500">m²</span>
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">≈ {stats.totalLuasHektar || 0} Ha</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lahan Aktif Siap Tanam</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalAktif || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative rounded-md shadow-sm sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari nama petak atau lokasi sawah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Status Lahan</option>
              <option value="AKTIF">Lahan Aktif Saja</option>
              <option value="TIDAK_AKTIF">Lahan Tidak Aktif (Masa Bera)</option>
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

      {/* Lahan Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="inline-flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat daftar lahan Anda...</span>
          </div>
        </div>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-200">
          <Map className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">Belum Ada Petak Lahan</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Anda belum mendaftarkan petak lahan sawah Anda. Klik tombol Tambah Lahan Baru untuk mulai mencatat lahan.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Tambah Lahan Pertama
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-50 rounded-lg text-green-700">
                      <Map className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{item.namaLahan}</h3>
                      <p className="text-xs text-gray-500">{item.satuanLuas || 'm²'}</p>
                    </div>
                  </div>

                  {item.status === 'AKTIF' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      <XCircle className="h-3 w-3 mr-1" /> Istirahat
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Luas:</span>
                    <span className="font-bold text-gray-900">
                      {item.luasLahan.toLocaleString('id-ID')} {item.satuanLuas || 'm²'}
                    </span>
                  </div>

                  <div className="flex items-start text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{item.lokasi}</span>
                  </div>

                  {item.catatan && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 mt-2 line-clamp-2 italic">
                      &quot;{item.catatan}&quot;
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/petani/lahan/${item.id}`}
                  className="inline-flex items-center text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Lihat Detail
                </Link>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Edit Lahan"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`p-1.5 rounded-md transition-colors ${item.status === 'AKTIF'
                      ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    title={item.status === 'AKTIF' ? 'Nonaktifkan Lahan (Masa Bera)' : 'Aktifkan Lahan'}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseForm}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-green-800 text-white">
                <h3 className="text-lg font-semibold">
                  {isEdit ? 'Edit Lahan Pertanian Anda' : 'Tambah Petak Lahan Baru'}
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
                  <label className="block text-sm font-medium text-gray-700">Nama / Label Petak Sawah *</label>
                  <input
                    type="text"
                    required
                    value={form.namaLahan}
                    onChange={(e) => setForm({ ...form, namaLahan: e.target.value })}
                    placeholder="Contoh: Sawah Blok Wetan Petak 1"
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
                      placeholder="e.g. 1500"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Satuan</label>
                    <select
                      value={form.satuanLuas}
                      onChange={(e) => setForm({ ...form, satuanLuas: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                    >
                      <option value="m²">m²</option>
                      <option value="Ha">Ha</option>
                      <option value="Bata">Bata</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lokasi / Dusun / Blok *</label>
                  <input
                    type="text"
                    required
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                    placeholder="Contoh: Dusun Karang Anyar, Dekat Saluran Irigasi Barat"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Lahan</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                  >
                    <option value="AKTIF">Aktif (Siap Ditanami)</option>
                    <option value="TIDAK_AKTIF">Tidak Aktif (Sedang Istirahat/Bera)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Kondisi air irigasi, jenis tanah, dll..."
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
