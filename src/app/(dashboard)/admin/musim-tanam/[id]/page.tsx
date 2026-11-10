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
  Map, 
  User, 
  Phone, 
  Users, 
  Clock, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react'

export default function AdminMusimTanamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/musim-tanam/${id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
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
    if (!confirm(`Ubah status musim tanam menjadi ${newStatus}?`)) return

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

  const handleDelete = async () => {
    if (!confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus data musim tanam "${data.namaMusim}"?`)) return

    try {
      const res = await fetch(`/api/musim-tanam/${id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus musim tanam')

      router.push('/admin/musim-tanam')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat informasi musim tanam...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/musim-tanam" className="inline-flex items-center text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Musim Tanam
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <h2 className="font-semibold text-lg">Terjadi Kesalahan</h2>
          <p className="mt-1 text-sm">{error || 'Data musim tanam tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/musim-tanam"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Daftar Musim Tanam
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Hapus Musim
          </button>
        </div>
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
              Varietas: <strong>{data.varietasPadi}</strong> &bull; Lahan: <strong>{data.lahan?.namaLahan}</strong> ({data.lahan?.petani?.namaLengkap})
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
        {/* Left: Spesifikasi Budidaya */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Spesifikasi Jadwal & Varietas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Musim</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{data.namaMusim}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Varietas Benih Padi</p>
                <p className="text-sm font-bold text-green-700 mt-1">{data.varietasPadi}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Mulai Persiapan</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(data.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Penanaman</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(data.tanggalTanam).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estimasi Waktu Panen</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(data.estimasiPanen).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status Siklus</p>
                <div className="mt-1">
                  <select
                    value={data.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white cursor-pointer focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="PERENCANAAN">PERENCANAAN (Persiapan Lahan / Persemaian)</option>
                    <option value="BERJALAN">BERJALAN (Masa Tanam / Vegetatif-Generatif)</option>
                    <option value="SELESAI">SELESAI (Panen Berhasil)</option>
                    <option value="GAGAL">GAGAL (Puso / Bencana)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Catatan Tambahan</p>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {data.catatan || 'Tidak ada catatan tambahan untuk musim tanam ini.'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Lahan & Petani Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Map className="h-5 w-5 text-green-600 mr-2" />
              Lahan & Petani Pengelola
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lahan Sawah</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.lahan?.namaLahan}</p>
                <p className="text-xs text-gray-500">{data.lahan?.luasLahan} {data.lahan?.satuanLuas} &bull; {data.lahan?.lokasi}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Petani Pemilik</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.lahan?.petani?.namaLengkap}</p>
                <p className="text-xs text-gray-500">{data.lahan?.petani?.nomorTelepon}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kelompok Tani</p>
                <p className="text-sm text-green-800 font-medium mt-0.5">
                  {data.lahan?.petani?.kelompokTani?.nama || 'Petani Mandiri'}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/admin/lahan/${data.lahan?.id}`}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center"
                >
                  Lihat Detail Lahan &rarr;
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <Clock className="h-4 w-4 text-green-600 mr-1.5" />
              Informasi Pendaftaran
            </h3>
            <p className="text-xs text-gray-600">
              Didaftarkan pada: {new Date(data.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
