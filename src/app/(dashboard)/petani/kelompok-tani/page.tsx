'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Users, User, MapPin, Phone, Info } from 'lucide-react'

export default function PetaniKelompokTani() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kelompok-tani')
        const json = await res.json()
        if (res.ok) {
          if (json.data && json.data.length > 0) {
            setData(json.data[0]) // Petani expects 1 group
          } else {
            setData(null)
          }
        } else {
          setError(json.error)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat data kelompok tani...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelompok Tani Saya</h1>
        </div>
        <Card className="p-8 text-center bg-white border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900">Belum Tergabung Kelompok</h2>
          <p className="mt-1 text-gray-500">Anda belum didaftarkan ke dalam kelompok tani manapun. Silakan hubungi pengurus desa.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelompok Tani Saya</h1>
        <p className="mt-1 text-sm text-gray-500">
          Informasi kelompok tani di mana Anda tergabung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{data.nama}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Ketua Kelompok</p>
                  <p className="text-base text-gray-900">{data.ketua}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Wilayah / Dusun</p>
                  <p className="text-base text-gray-900">{data.wilayah}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Kontak</p>
                  <p className="text-base text-gray-900">{data.nomorKontak || '-'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Jumlah Anggota</p>
                  <p className="text-base text-gray-900">{data._count?.anggota || 0} Petani</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Deskripsi Kelompok</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {data.deskripsi || 'Tidak ada deskripsi.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 bg-green-50 border-green-100">
            <h3 className="font-semibold text-green-900 mb-2">Informasi</h3>
            <p className="text-sm text-green-800">
              Sebagai anggota kelompok tani, Anda berhak menerima informasi terkini seputar bantuan pertanian, jadwal pembagian air irigasi, dan jadwal pertemuan kelompok yang dikoordinir oleh ketua.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
