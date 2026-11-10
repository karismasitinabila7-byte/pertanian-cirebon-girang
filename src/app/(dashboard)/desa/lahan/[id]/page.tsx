'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  Map, 
  MapPin, 
  User, 
  Phone, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Sprout, 
  Clock,
  Layers
} from 'lucide-react'

export default function DesaLahanDetailPage() {
  const params = useParams()
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
        <Link href="/desa/lahan" className="inline-flex items-center text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Monitoring Lahan
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
      <div>
        <Link
          href="/desa/lahan"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Monitoring Lahan
        </Link>
      </div>

      {/* Main Banner Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-800 to-green-900 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
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
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Satuan</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{data.satuanLuas || 'm²'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status Produktivitas</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {data.status === 'AKTIF' ? 'Aktif (Siap Tanam)' : 'Tidak Aktif (Masa Bera)'}
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
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Catatan</p>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {data.catatan || 'Tidak ada catatan tambahan.'}
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
                <p className="text-sm text-gray-600 font-medium">Belum ada catatan musim tanam di lahan ini.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Farmer Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <User className="h-5 w-5 text-green-600 mr-2" />
              Petani Pengelola
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{data.petani?.namaLengkap}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kontak Petani</p>
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
                    <p className="text-xs text-gray-500 mt-1">Wilayah: {data.petani.kelompokTani.wilayah}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1 italic">Belum tergabung kelompok</p>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href={`/desa/petani/${data.petani?.id}`}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center"
                >
                  Lihat Profil Petani &rarr;
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <Clock className="h-4 w-4 text-green-600 mr-1.5" />
              Informasi Pendataan
            </h3>
            <div className="text-xs text-gray-600 space-y-2">
              <div>
                <span className="text-gray-400 block">Terdaftar pada:</span>
                <span className="font-medium text-gray-800">
                  {new Date(data.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
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
