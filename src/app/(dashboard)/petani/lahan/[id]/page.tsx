'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  Map, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Power, 
  Edit2, 
  Sprout, 
  Clock, 
  Layers, 
  X,
  FileText
} from 'lucide-react'

export default function PetaniLahanDetailPage() {
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
    namaLahan: '',
    luasLahan: '',
    satuanLuas: 'm²',
    lokasi: '',
    status: 'AKTIF',
    catatan: ''
  })

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/lahan/${id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setForm({
          namaLahan: json.data.namaLahan || '',
          luasLahan: json.data.luasLahan ? json.data.luasLahan.toString() : '',
          satuanLuas: json.data.satuanLuas || 'm²',
          lokasi: json.data.lokasi || '',
          status: json.data.status || 'AKTIF',
          catatan: json.data.catatan || ''
        })
      } else {
        setError(json.error || 'Gagal memuat detail lahan')
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

  const handleToggleStatus = async () => {
    if (!data) return
    const actionText = data.status === 'AKTIF' ? 'menonaktifkan' : 'mengaktifkan'
    if (!confirm(`Apakah Anda yakin ingin ${actionText} status petak lahan "${data.namaLahan}"?`)) return

    try {
      const res = await fetch(`/api/lahan/${id}/toggle-status`, {
        method: 'PATCH'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal mengubah status lahan')

      await fetchDetail()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
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
      const res = await fetch(`/api/lahan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui lahan')

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
          <span>Memuat informasi lahan sawah Anda...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/petani/lahan" className="inline-flex items-center text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Lahan Saya
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <h2 className="font-semibold text-lg">Akses Ditolak atau Data Tidak Ditemukan</h2>
          <p className="mt-1 text-sm">{error || 'Anda tidak memiliki hak akses melihat data lahan ini.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/petani/lahan"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Lahan Saya
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-1.5 text-gray-500" />
            Edit Lahan
          </button>

          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${
              data.status === 'AKTIF'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Power className="h-4 w-4 mr-1.5" />
            {data.status === 'AKTIF' ? 'Nonaktifkan (Masa Bera)' : 'Aktifkan Lahan'}
          </button>
        </div>
      </div>

      {/* Main Banner Header */}
      <Card className="p-6 bg-gradient-to-r from-green-800 via-emerald-800 to-teal-900 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-white text-green-800 font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            <Map className="h-10 w-10 text-green-800" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{data.namaLahan}</h1>
              {data.status === 'AKTIF' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-300" /> Aktif Siap Tanam
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-100 border border-amber-400/30">
                  <XCircle className="h-3 w-3 mr-1 text-amber-300" /> Sedang Istirahat / Bera
                </span>
              )}
            </div>
            <p className="text-green-100 text-sm mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              {data.lokasi}
            </p>
          </div>
        </div>
      </Card>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Detail Information */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Layers className="h-5 w-5 text-green-600 mr-2" />
              Rincian Petak Lahan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Petak Sawah</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{data.namaLahan}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Luas Lahan</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {data.luasLahan.toLocaleString('id-ID')} {data.satuanLuas || 'm²'}
                  {data.satuanLuas === 'm²' && data.luasLahan >= 1000 && (
                    <span className="text-xs text-green-700 font-medium ml-2">
                      (≈ {(data.luasLahan / 10000).toFixed(2)} Ha)
                    </span>
                  )}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lokasi / Dusun</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 flex items-start">
                  <MapPin className="h-4 w-4 text-green-600 mr-1.5 mt-0.5 flex-shrink-0" />
                  {data.lokasi}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Catatan Anda</p>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {data.catatan || 'Belum ada catatan tambahan untuk lahan ini.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Musim Tanam */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span className="flex items-center">
                <Sprout className="h-5 w-5 text-green-600 mr-2" />
                Musim Tanam di Lahan Ini
              </span>
              <span className="text-xs font-normal text-gray-500">
                {data.musimTanam?.length || 0} Musim
              </span>
            </h3>

            {data.musimTanam && data.musimTanam.length > 0 ? (
              <div className="space-y-3">
                {data.musimTanam.map((mt: any) => (
                  <div key={mt.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{mt.namaMusim}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Varietas: {mt.varietasPadi} &bull; Tanam: {new Date(mt.tanggalTanam).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mt.status === 'BERJALAN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <Sprout className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Belum ada musim tanam tercatat.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-green-50 border-green-100">
            <h3 className="text-sm font-bold text-green-900 mb-2">Tips Pengelolaan Lahan</h3>
            <p className="text-xs text-green-800 leading-relaxed">
              Pastikan status lahan diubah menjadi <strong>Tidak Aktif</strong> apabila sawah memasuki masa istirahat (bera) atau pengeringan tanah untuk memutus siklus hama wereng & penggerek batang.
            </p>
          </Card>

          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <Clock className="h-4 w-4 text-green-600 mr-1.5" />
              Waktu Pendaftaran
            </h3>
            <p className="text-xs text-gray-600">
              Didata: {new Date(data.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
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
                <h3 className="text-lg font-semibold">Edit Lahan Sawah Anda</h3>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Petak Sawah *</label>
                  <input
                    type="text"
                    required
                    value={form.namaLahan}
                    onChange={(e) => setForm({ ...form, namaLahan: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700">Lokasi / Dusun *</label>
                  <input
                    type="text"
                    required
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700">Catatan</label>
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
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 shadow-sm"
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
