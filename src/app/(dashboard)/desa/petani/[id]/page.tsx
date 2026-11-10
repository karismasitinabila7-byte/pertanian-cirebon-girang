'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Users, 
  Calendar, 
  Layers
} from 'lucide-react'

export default function DesaPetaniDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/petani/${id}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
      } else {
        setError(json.error || 'Gagal mengambil detail petani')
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
          <span>Memuat detail profil petani...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/desa/petani" className="inline-flex items-center text-sm text-green-700 hover:text-green-800">
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Petani
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <h2 className="font-semibold text-lg">Terjadi Kesalahan</h2>
          <p className="mt-1 text-sm">{error || 'Data petani tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back navigation */}
      <div>
        <Link
          href="/desa/petani"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Daftar Petani
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <Card className="p-6 bg-gradient-to-r from-emerald-800 to-green-900 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-white text-emerald-800 font-bold text-3xl flex items-center justify-center shadow-md flex-shrink-0">
            {data.namaLengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{data.namaLengkap}</h1>
            <p className="text-emerald-200 text-sm mt-1">
              Petani Terdaftar &bull; Terdaftar sejak {new Date(data.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </Card>

      {/* Detail Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Biodata */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <User className="h-5 w-5 text-green-600 mr-2" />
              Biodata & Informasi Petani
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{data.namaLengkap}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Jenis Kelamin</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {data.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Lahir</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {data.tanggalLahir 
                    ? new Date(data.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nomor Kontak / WhatsApp</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                  <Phone className="h-4 w-4 text-green-600 mr-1.5" />
                  {data.nomorTelepon}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alamat Tinggal</p>
                <p className="text-sm font-semibold text-gray-900 mt-1 flex items-start">
                  <MapPin className="h-4 w-4 text-green-600 mr-1.5 mt-0.5 flex-shrink-0" />
                  {data.alamat}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Kelompok & Lahan stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              Kelompok Tani
            </h3>

            {data.kelompokTani ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-green-800">{data.kelompokTani.nama}</p>
                <p className="text-xs text-gray-600">Wilayah: {data.kelompokTani.wilayah}</p>
                <p className="text-xs text-gray-600">Ketua: {data.kelompokTani.ketua}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Belum tergabung kelompok tani manapun.</p>
            )}
          </Card>

          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
              <Layers className="h-4 w-4 text-green-600 mr-2" />
              Statistik Lahan
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Jumlah Petak</span>
              <span className="text-base font-bold text-gray-900">{data._count?.lahan || 0} Petak</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
