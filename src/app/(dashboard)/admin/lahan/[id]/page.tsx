'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  Map, 
  MapPin, 
  User, 
  Phone, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Power, 
  Trash2, 
  Sprout, 
  FileText,
  Clock,
  Layers
} from 'lucide-react'

export default function AdminLahanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/lahan/${id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
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
    if (!confirm(`Apakah Anda yakin ingin ${actionText} status lahan "${data.namaLahan}"?`)) return

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

  const handleDelete = async () => {
    if (!confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus petak lahan "${data.namaLahan}"? Seluruh data yang terkait akan ikut terhapus.`)) return

    try {
      const res = await fetch(`/api/lahan/${id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus lahan')

      router.push('/admin/lahan')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat detail lahan pertanian...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/lahan" className="inline-flex items-center text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Lahan
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <h2 className="font-semibold text-lg">Terjadi Kesalahan</h2>
          <p className="mt-1 text-sm">{error || 'Data lahan tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/lahan"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Daftar Lahan
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${
              data.status === 'AKTIF'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Power className="h-4 w-4 mr-1.5" />
            {data.status === 'AKTIF' ? 'Nonaktifkan Lahan' : 'Aktifkan Lahan'}
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Hapus Lahan
          </button>
        </div>
      </div>

      {/* Main Banner Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-800 to-green-900 text-white shadow-lg overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white text-green-800 font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            <Map className="h-10 w-10 text-green-800" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{data.namaLahan}</h1>
              {data.status === 'AKTIF' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-300" /> Lahan Produktif
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-100 border border-amber-400/30">
                  <XCircle className="h-3 w-3 mr-1 text-amber-300" /> Masa Bera / Istirahat
                </span>
              )}
            </div>
            <p className="text-emerald-200 text-sm mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              {data.lokasi}
            </p>
          </div>
        </div>
      </Card>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Lahan Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Layers className="h-5 w-5 text-green-600 mr-2" />
              Spesifikasi Petak Lahan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama / Label Petak</p>
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

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Satuan Pengukuran</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{data.satuanLuas || 'm²'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status Operasional</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {data.status === 'AKTIF' ? 'Aktif (Siap Tanam)' : 'Tidak Aktif (Istirahat)'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lokasi / Blok Lahan</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 flex items-start">
                  <MapPin className="h-4 w-4 text-green-600 mr-1.5 mt-0.5 flex-shrink-0" />
                  {data.lokasi}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Catatan Tambahan</p>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {data.catatan || 'Tidak ada catatan tambahan untuk lahan ini.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Musim Tanam Terkait */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span className="flex items-center">
                <Sprout className="h-5 w-5 text-green-600 mr-2" />
                Riwayat Musim Tanam
              </span>
              <span className="text-xs font-normal text-gray-500">
                {data.musimTanam?.length || 0} Musim Tercatat
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
                <p className="text-sm text-gray-600 font-medium">Belum ada musim tanam yang tercatat di lahan ini.</p>
                <p className="text-xs text-gray-400 mt-1">Musim tanam dapat didaftarkan pada modul Musim Tanam.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Farmer Info & Timestamps */}
        <div className="space-y-6">
          {/* Farmer Card */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <User className="h-5 w-5 text-green-600 mr-2" />
              Petani Pemilik Lahan
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.petani?.namaLengkap}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kontak / WhatsApp</p>
                <p className="text-sm text-gray-800 mt-0.5 flex items-center">
                  <Phone className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                  {data.petani?.nomorTelepon}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kelompok Tani</p>
                {data.petani?.kelompokTani ? (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {data.petani.kelompokTani.nama}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{data.petani.kelompokTani.wilayah}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1 italic">Belum tergabung kelompok tani</p>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href={`/admin/petani/${data.petani?.id}`}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center"
                >
                  Lihat Profil Petani &rarr;
                </Link>
              </div>
            </div>
          </Card>

          {/* Timestamps Card */}
          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <Clock className="h-4 w-4 text-green-600 mr-1.5" />
              Informasi Audit
            </h3>
            <div className="space-y-3 text-xs text-gray-600">
              <div>
                <span className="block text-gray-400">Didata Pada:</span>
                <span className="font-medium text-gray-800">
                  {new Date(data.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div>
                <span className="block text-gray-400">Pembaruan Terakhir:</span>
                <span className="font-medium text-gray-800">
                  {new Date(data.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
