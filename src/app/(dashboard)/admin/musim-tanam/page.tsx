'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { MusimTimeline } from '@/components/features/MusimTimeline'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Sprout, 
  Calendar, 
  Map, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Filter,
  Check
} from 'lucide-react'
import { ExportButtons } from '@/components/ui/ExportButtons'

export default function AdminMusimTanamPage() {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalMusim: 0,
    totalPerencanaan: 0,
    totalBerjalan: 0,
    totalSelesai: 0,
    totalGagal: 0
  })
  const [kelompokList, setKelompokList] = useState<any[]>([])
  const [lahanList, setLahanList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
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
    lahanId: '',
    namaMusim: '',
    varietasPadi: 'Inpari 32',
    tanggalMulai: '',
    tanggalTanam: '',
    estimasiPanen: '',
    status: 'PERENCANAAN',
    catatan: ''
  })

  // Fetch filter options
  const fetchOptions = async () => {
    try {
      const [resKelompok, resLahan] = await Promise.all([
        fetch('/api/kelompok-tani'),
        fetch('/api/lahan?limit=200')
      ])
      const [jsonKelompok, jsonLahan] = await Promise.all([
        resKelompok.json(),
        resLahan.json()
      ])
      if (resKelompok.ok) setKelompokList(jsonKelompok.data || [])
      if (resLahan.ok) setLahanList(jsonLahan.data || [])
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  // Fetch Seasons
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (kelompokFilter) params.set('kelompokTaniId', kelompokFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (yearFilter) params.set('year', yearFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/musim-tanam?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data || [])
        setStats(json.stats || {})
        setPagination(json.pagination || { total: 0, totalPages: 1, limit: 10 })
      } else {
        setError(json.error || 'Gagal memuat data musim tanam')
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
  }, [search, kelompokFilter, statusFilter, yearFilter, page])

  const handleOpenCreate = () => {
    setIsEdit(false)
    setCurrentId('')
    setFormError('')
    
    // Default dates helper
    const today = new Date().toISOString().substring(0, 10)
    const plantDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    const harvestDate = new Date(Date.now() + 115 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)

    setForm({
      lahanId: lahanList.length > 0 ? lahanList[0].id : '',
      namaMusim: `Musim Rendeng MT1 ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      varietasPadi: 'Inpari 32',
      tanggalMulai: today,
      tanggalTanam: plantDate,
      estimasiPanen: harvestDate,
      status: 'PERENCANAAN',
      catatan: ''
    })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setIsEdit(true)
    setCurrentId(item.id)
    setFormError('')
    setForm({
      lahanId: item.lahanId || '',
      namaMusim: item.namaMusim || '',
      varietasPadi: item.varietasPadi || 'Inpari 32',
      tanggalMulai: item.tanggalMulai ? item.tanggalMulai.substring(0, 10) : '',
      tanggalTanam: item.tanggalTanam ? item.tanggalTanam.substring(0, 10) : '',
      estimasiPanen: item.estimasiPanen ? item.estimasiPanen.substring(0, 10) : '',
      status: item.status || 'PERENCANAAN',
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

    const dMulai = new Date(form.tanggalMulai)
    const dTanam = new Date(form.tanggalTanam)
    const dPanen = new Date(form.estimasiPanen)

    if (dMulai.getTime() > dTanam.getTime()) {
      setFormError('Tanggal mulai persiapan tidak boleh setelah tanggal tanam')
      setFormLoading(false)
      return
    }

    if (dPanen.getTime() <= dTanam.getTime()) {
      setFormError('Estimasi panen harus setelah tanggal tanam (siklus padi normal 95-120 hari)')
      setFormLoading(false)
      return
    }

    try {
      const url = isEdit ? `/api/musim-tanam/${currentId}` : '/api/musim-tanam'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan data musim tanam')
      }

      await fetchData()
      handleCloseForm()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleQuickStatusChange = async (item: any, newStatus: string) => {
    if (!confirm(`Ubah status musim tanam "${item.namaMusim}" menjadi ${newStatus}?`)) return

    try {
      const res = await fetch(`/api/musim-tanam/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal mengubah status')

      await fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus musim tanam "${item.namaMusim}"? Seluruh data aktivitas dan panen terkait akan ikut terhapus.`)) return

    try {
      const res = await fetch(`/api/musim-tanam/${item.id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus musim tanam')

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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Musim Tanam</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola penjadwalan siklus tanam, varietas bibit padi, dan status progres budidaya desa.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <ExportButtons
            title="Laporan Rekapitulasi Siklus Musim Tanam Padi Desa Cirebon Girang"
            fileName="rekap-musim-tanam-cirebon-girang"
            columns={[
              { header: "Musim Tanam", key: "namaMusim" },
              { header: "Varietas Padi", key: "varietasPadi" },
              { header: "Petak Lahan", key: "lahan", render: (r) => r.lahan?.namaLahan || "—" },
              { header: "Nama Petani", key: "petani", render: (r) => r.lahan?.petani?.namaLengkap || "—" },
              { header: "Kelompok Tani", key: "poktan", render: (r) => r.lahan?.petani?.kelompokTani?.nama || "Mandiri" },
              { header: "Tgl Persiapan", key: "tMulai", render: (r) => new Date(r.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
              { header: "Tgl Penanaman", key: "tTanam", render: (r) => new Date(r.tanggalTanam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
              { header: "Estimasi Panen", key: "tPanen", render: (r) => new Date(r.estimasiPanen).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
              { header: "Status Siklus", key: "status" }
            ]}
            data={data}
            summaryStats={[
              { label: "Total Musim", value: stats.totalMusim || 0 },
              { label: "Sedang Berjalan", value: stats.totalBerjalan || 0 },
              { label: "Selesai Panen", value: stats.totalSelesai || 0 },
              { label: "Tahap Perencanaan", value: stats.totalPerencanaan || 0 }
            ]}
          />
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Musim Tanam
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-gray-600">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Musim</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalMusim || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-blue-600 uppercase">Perencanaan</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalPerencanaan || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Sedang Berjalan</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{stats.totalBerjalan || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <p className="text-xs font-semibold text-purple-600 uppercase">Selesai Panen</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{stats.totalSelesai || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600 col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-rose-600 uppercase">Gagal / Puso</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{stats.totalGagal || 0}</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari musim, varietas, petani..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Status Siklus</option>
              <option value="PERENCANAAN">Tahap Perencanaan</option>
              <option value="BERJALAN">Sedang Berjalan (Aktif)</option>
              <option value="SELESAI">Selesai Panen</option>
              <option value="GAGAL">Gagal Panen</option>
            </select>
          </div>

          <div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Tahun Tanam</option>
              <option value="2027">Tahun 2027</option>
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
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
                  Musim & Varietas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lahan & Petani
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline Siklus
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
                      <span>Memuat data musim tanam...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <Sprout className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">Tidak ada data musim tanam yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{item.namaMusim}</div>
                      <div className="text-xs text-green-700 font-medium mt-0.5 flex items-center">
                        <Sprout className="h-3 w-3 mr-1" />
                        Varietas: {item.varietasPadi}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.lahan?.namaLahan}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.lahan?.petani?.namaLengkap} &bull; {item.lahan?.petani?.kelompokTani?.nama || 'Mandiri'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-52">
                        <MusimTimeline
                          tanggalMulai={item.tanggalMulai}
                          tanggalTanam={item.tanggalTanam}
                          estimasiPanen={item.estimasiPanen}
                          status={item.status}
                          compact={true}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          item.status === 'BERJALAN'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.status === 'PERENCANAAN'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : item.status === 'SELESAI'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="PERENCANAAN">Perencanaan</option>
                        <option value="BERJALAN">Berjalan</option>
                        <option value="SELESAI">Selesai</option>
                        <option value="GAGAL">Gagal</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/musim-tanam/${item.id}`}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                          title="Lihat Detail & Timeline"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Musim Tanam"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus Musim Tanam"
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
              Halaman <span className="font-medium text-gray-900">{pagination.page}</span> dari <span className="font-medium text-gray-900">{pagination.totalPages}</span> (Total {pagination.total} Musim)
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
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-green-800 text-white">
                <h3 className="text-lg font-semibold">
                  {isEdit ? 'Edit Musim Tanam' : 'Tambah Musim Tanam Baru'}
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
                  <label className="block text-sm font-medium text-gray-700">Pilih Lahan Sawah *</label>
                  <select
                    required
                    value={form.lahanId}
                    onChange={(e) => setForm({ ...form, lahanId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                  >
                    <option value="">-- Pilih Lahan Sawah --</option>
                    {lahanList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.namaLahan} ({l.luasLahan} {l.satuanLuas}) - {l.petani?.namaLengkap} [{l.lokasi}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Musim / Tahun *</label>
                    <input
                      type="text"
                      required
                      value={form.namaMusim}
                      onChange={(e) => setForm({ ...form, namaMusim: e.target.value })}
                      placeholder="e.g. Musim Rendeng MT1 2026/2027"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Varietas Padi *</label>
                    <input
                      type="text"
                      required
                      value={form.varietasPadi}
                      onChange={(e) => setForm({ ...form, varietasPadi: e.target.value })}
                      placeholder="e.g. Inpari 32, Ciherang, Mekongga"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Tgl Mulai Persiapan *</label>
                    <input
                      type="date"
                      required
                      value={form.tanggalMulai}
                      onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-2 text-xs focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Tgl Penanaman *</label>
                    <input
                      type="date"
                      required
                      value={form.tanggalTanam}
                      onChange={(e) => setForm({ ...form, tanggalTanam: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-2 text-xs focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Estimasi Panen *</label>
                    <input
                      type="date"
                      required
                      value={form.estimasiPanen}
                      onChange={(e) => setForm({ ...form, estimasiPanen: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-2 text-xs focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Siklus</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
                  >
                    <option value="PERENCANAAN">PERENCANAAN (Persiapan Lahan / Persemaian)</option>
                    <option value="BERJALAN">BERJALAN (Masa Tanam / Vegetatif-Generatif)</option>
                    <option value="SELESAI">SELESAI (Panen Berhasil)</option>
                    <option value="GAGAL">GAGAL (Puso / Serangan Hama / Bencana)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catatan Budidaya (Opsional)</label>
                  <textarea
                    rows={2}
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Catatan target hasil, dosis pemupukan awal, dll..."
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 shadow-sm"
                  >
                    {formLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Musim Tanam'}
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
