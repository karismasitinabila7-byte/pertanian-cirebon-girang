'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { MusimTimeline } from '@/components/features/MusimTimeline'
import { 
  Plus, 
  Sprout, 
  Calendar, 
  MapPin, 
  Eye, 
  Edit2, 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Bot
} from 'lucide-react'

export default function PetaniMusimTanamPage() {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalMusim: 0,
    totalPerencanaan: 0,
    totalBerjalan: 0,
    totalSelesai: 0,
    totalGagal: 0
  })
  const [myLahanList, setMyLahanList] = useState<any[]>([])
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
    lahanId: '',
    namaMusim: '',
    varietasPadi: 'Inpari 32',
    tanggalMulai: '',
    tanggalTanam: '',
    estimasiPanen: '',
    status: 'PERENCANAAN',
    catatan: ''
  })

  // Fetch farmer's own farmlands
  const fetchMyLahan = async () => {
    try {
      const res = await fetch('/api/lahan?limit=100')
      const json = await res.json()
      if (res.ok) setMyLahanList(json.data || [])
    } catch (err) {
      console.error('Error fetching my lahan:', err)
    }
  }

  // Fetch farmer's planting seasons
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '50')

      const res = await fetch(`/api/musim-tanam?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data || [])
        setStats(json.stats || {})
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
    fetchMyLahan()
  }, [])

  useEffect(() => {
    fetchData()
  }, [search, statusFilter])

  const handleOpenCreate = () => {
    setIsEdit(false)
    setCurrentId('')
    setFormError('')

    const today = new Date().toISOString().substring(0, 10)
    const plantDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    const harvestDate = new Date(Date.now() + 115 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)

    setForm({
      lahanId: myLahanList.length > 0 ? myLahanList[0].id : '',
      namaMusim: `Musim Rendeng MT1 ${new Date().getFullYear()}`,
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
      setFormError('Tanggal mulai persiapan lahan tidak boleh setelah tanggal tanam')
      setFormLoading(false)
      return
    }

    if (dPanen.getTime() <= dTanam.getTime()) {
      setFormError('Estimasi tanggal panen harus setelah tanggal tanam')
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
        throw new Error(json.error || 'Gagal menyimpan musim tanam')
      }

      await fetchData()
      handleCloseForm()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleQuickStatus = async (item: any, newStatus: string) => {
    if (!confirm(`Ubah status siklus musim tanam "${item.namaMusim}" menjadi ${newStatus}?`)) return

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Musim Tanam Saya</h1>
          <p className="mt-1 text-sm text-gray-500">
            Catat dan pantau jadwal siklus budidaya padi pada setiap petak sawah Anda.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={myLahanList.length === 0}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Plus className="h-5 w-5 mr-2" />
          Mulai Musim Tanam Baru
        </button>
      </div>

      {myLahanList.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center justify-between">
          <span>Anda belum memiliki petak lahan terdaftar untuk memulai musim tanam.</span>
          <Link href="/petani/lahan" className="font-bold underline ml-2">
            Tambah Lahan Dulu &rarr;
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-blue-600 uppercase">Perencanaan</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalPerencanaan || 0} Musim</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Sedang Tanam</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{stats.totalBerjalan || 0} Musim</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <p className="text-xs font-semibold text-purple-600 uppercase">Selesai Panen</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{stats.totalSelesai || 0} Musim</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <p className="text-xs font-semibold text-rose-600 uppercase">Gagal / Puso</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{stats.totalGagal || 0} Musim</p>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative rounded-md shadow-sm sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari musim atau varietas bibit..."
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
              <option value="">Semua Status Musim</option>
              <option value="PERENCANAAN">Perencanaan</option>
              <option value="BERJALAN">Sedang Berjalan</option>
              <option value="SELESAI">Selesai Panen</option>
              <option value="GAGAL">Gagal Panen</option>
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

      {/* Seasons Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <div className="inline-flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat musim tanam Anda...</span>
          </div>
        </div>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-200">
          <Sprout className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">Belum Ada Musim Tanam Terdaftar</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Mulai rencanakan musim tanam padi Anda untuk memantau hari setelah tanam (HST), catatan aktivitas pemupukan, dan jadwal panen.
          </p>
          {myLahanList.length > 0 && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Rencanakan Musim Tanam Sekarang
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-gray-200">
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                      Varietas {item.varietasPadi}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1.5">{item.namaMusim}</h3>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1 flex-shrink-0" />
                      Lahan: <strong className="ml-1 text-gray-700">{item.lahan?.namaLahan}</strong> ({item.lahan?.luasLahan} {item.lahan?.satuanLuas})
                    </p>
                  </div>

                  <select
                    value={item.status}
                    onChange={(e) => handleQuickStatus(item, e.target.value)}
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
                    <option value="BERJALAN">Masa Tanam</option>
                    <option value="SELESAI">Selesai Panen</option>
                    <option value="GAGAL">Gagal Panen</option>
                  </select>
                </div>

                {/* Timeline compact */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <MusimTimeline
                    tanggalMulai={item.tanggalMulai}
                    tanggalTanam={item.tanggalTanam}
                    estimasiPanen={item.estimasiPanen}
                    status={item.status}
                    compact={false}
                  />
                </div>

                {item.catatan && (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    &quot;{item.catatan}&quot;
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/petani/musim-tanam/${item.id}`}
                  className="inline-flex items-center text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Lihat Detail Timeline
                </Link>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="inline-flex items-center text-xs font-medium text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-md transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1 text-amber-600" />
                  Edit Musim
                </button>
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
                  {isEdit ? 'Edit Musim Tanam' : 'Rencanakan Musim Tanam Baru'}
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
                  <label className="block text-sm font-medium text-gray-700">Pilih Petak Lahan Sawah *</label>
                  <select
                    required
                    disabled={isEdit}
                    value={form.lahanId}
                    onChange={(e) => setForm({ ...form, lahanId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white disabled:bg-gray-100"
                  >
                    <option value="">-- Pilih Lahan --</option>
                    {myLahanList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.namaLahan} ({l.luasLahan} {l.satuanLuas}) - {l.lokasi}
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
                      placeholder="e.g. Musim Rendeng 2026"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Varietas Bibit Padi *</label>
                    <input
                      type="text"
                      required
                      value={form.varietasPadi}
                      onChange={(e) => setForm({ ...form, varietasPadi: e.target.value })}
                      placeholder="e.g. Inpari 32, Ciherang"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Mulai Persiapan *</label>
                    <input
                      type="date"
                      required
                      value={form.tanggalMulai}
                      onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-2 text-xs focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Tanggal Tanam *</label>
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
                    <option value="PERENCANAAN">PERENCANAAN (Olah Tanah / Semai Benih)</option>
                    <option value="BERJALAN">BERJALAN (Bibit Ditanam / Masa Pemeliharaan)</option>
                    <option value="SELESAI">SELESAI (Panen Berhasil)</option>
                    <option value="GAGAL">GAGAL (Puso)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Rencana pemupukan berimbang, kebutuhan air..."
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
                    {formLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Musim Tanam'}
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
