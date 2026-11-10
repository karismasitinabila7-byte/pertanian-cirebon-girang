'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { MusimTimeline } from '@/components/features/MusimTimeline'
import { 
  ArrowLeft, 
  Sprout, 
  Calendar, 
  MapPin, 
  Edit2, 
  Clock, 
  Map, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Sparkles
} from 'lucide-react'

export default function PetaniMusimTanamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    namaMusim: '',
    varietasPadi: 'Inpari 32',
    tanggalMulai: '',
    tanggalTanam: '',
    estimasiPanen: '',
    status: 'PERENCANAAN',
    catatan: ''
  })

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/musim-tanam/${id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setForm({
          namaMusim: json.data.namaMusim || '',
          varietasPadi: json.data.varietasPadi || 'Inpari 32',
          tanggalMulai: json.data.tanggalMulai ? json.data.tanggalMulai.substring(0, 10) : '',
          tanggalTanam: json.data.tanggalTanam ? json.data.tanggalTanam.substring(0, 10) : '',
          estimasiPanen: json.data.estimasiPanen ? json.data.estimasiPanen.substring(0, 10) : '',
          status: json.data.status || 'PERENCANAAN',
          catatan: json.data.catatan || ''
        })
      } else {
        setError(json.error || 'Gagal memuat detail musim tanam')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Ubah status siklus musim tanam menjadi ${newStatus}?`)) return

    try {
      const res = await fetch(`/api/musim-tanam/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal mengubah status')

      await fetchDetail()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
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
      setFormError('Estimasi panen harus setelah tanggal tanam')
      setFormLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/musim-tanam/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui musim tanam')

      setData(json.data)
      setIsEditOpen(false)
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
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat informasi musim tanam Anda...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/petani/musim-tanam" className="inline-flex items-center text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Musim Tanam Saya
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <h2 className="font-semibold text-lg">Akses Ditolak atau Data Tidak Ditemukan</h2>
          <p className="mt-1 text-sm">{error || 'Anda tidak memiliki hak akses melihat musim tanam ini.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/petani/musim-tanam"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Musim Tanam Saya
        </Link>

        <button
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm transition-colors"
        >
          <Edit2 className="h-4 w-4 mr-1.5 text-gray-500" />
          Edit Musim Tanam
        </button>
      </div>

      {/* Main Banner Card */}
      <Card className="p-6 bg-gradient-to-r from-green-800 via-emerald-800 to-teal-900 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-white text-green-800 font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            <Sprout className="h-10 w-10 text-green-800" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{data.namaMusim}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                data.status === 'BERJALAN' 
                  ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30'
                  : data.status === 'PERENCANAAN'
                    ? 'bg-blue-400/20 text-blue-100 border border-blue-400/30'
                    : data.status === 'SELESAI'
                      ? 'bg-purple-400/20 text-purple-100 border border-purple-400/30'
                      : 'bg-rose-400/20 text-rose-100 border border-rose-400/30'
              }`}>
                {data.status}
              </span>
            </div>
            <p className="text-green-100 text-sm mt-1">
              Varietas: <strong>{data.varietasPadi}</strong> &bull; Lahan: <strong>{data.lahan?.namaLahan}</strong> ({data.lahan?.luasLahan} {data.lahan?.satuanLuas})
            </p>
          </div>
        </div>
      </Card>

      {/* Visual Timeline Component */}
      <MusimTimeline
        tanggalMulai={data.tanggalMulai}
        tanggalTanam={data.tanggalTanam}
        estimasiPanen={data.estimasiPanen}
        status={data.status}
      />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Spesifikasi */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Jadwal Siklus Tanam
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Musim</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{data.namaMusim}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Varietas Padi</p>
                <p className="text-sm font-bold text-green-700 mt-1">{data.varietasPadi}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mulai Olah Lahan</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(data.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Tanam</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(data.tanggalTanam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Perkiraan Panen</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(data.estimasiPanen).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ubah Status Siklus</p>
                <div className="mt-1">
                  <select
                    value={data.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white cursor-pointer focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="PERENCANAAN">PERENCANAAN (Persiapan Lahan / Persemaian)</option>
                    <option value="BERJALAN">BERJALAN (Bibit Sudah Ditanam)</option>
                    <option value="SELESAI">SELESAI (Panen Berhasil)</option>
                    <option value="GAGAL">GAGAL (Puso)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Catatan Anda</p>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {data.catatan || 'Belum ada catatan khusus untuk musim tanam ini.'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: AI Assistant & Lahan Card */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Map className="h-5 w-5 text-green-600 mr-2" />
              Petak Sawah Anda
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lahan</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.lahan?.namaLahan}</p>
                <p className="text-xs text-gray-500">{data.lahan?.luasLahan} {data.lahan?.satuanLuas}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lokasi</p>
                <p className="text-xs text-gray-700 mt-0.5">{data.lahan?.lokasi}</p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/petani/lahan/${data.lahan?.id}`}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center"
                >
                  Buka Data Lahan &rarr;
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900 to-emerald-950 text-white shadow-md">
            <div className="flex items-center space-x-2 text-green-300 mb-2">
              <Sparkles className="h-5 w-5" />
              <h4 className="font-bold text-sm">Konsultasi AI Pertanian</h4>
            </div>
            <p className="text-xs text-green-100 leading-relaxed mb-4">
              Dapatkan rekomendasi jadwal pemupukan berimbang dan pencegahan hama untuk varietas <strong>{data.varietasPadi}</strong> bersama AI Assistant.
            </p>
            <Link
              href="/ai"
              className="inline-block w-full text-center py-2 px-3 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Tanya AI Assistant Sekarang
            </Link>
          </Card>
        </div>
      </div>

      {/* Edit Modal Form */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsEditOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-green-800 text-white">
                <h3 className="text-lg font-semibold">Edit Musim Tanam</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-green-200 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Musim *</label>
                    <input
                      type="text"
                      required
                      value={form.namaMusim}
                      onChange={(e) => setForm({ ...form, namaMusim: e.target.value })}
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
                    <option value="PERENCANAAN">PERENCANAAN</option>
                    <option value="BERJALAN">BERJALAN</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="GAGAL">GAGAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 shadow-sm"
                  >
                    {formLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
