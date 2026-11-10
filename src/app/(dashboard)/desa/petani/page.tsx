'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  Search, 
  Eye, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  MapPin,
  Filter
} from 'lucide-react'

export default function DesaPetaniPage() {
  const [data, setData] = useState<any[]>([])
  const [kelompokList, setKelompokList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, limit: 10 })
  const [error, setError] = useState('')

  // Fetch Kelompok Tani options for filter dropdown
  const fetchKelompokOptions = async () => {
    try {
      const res = await fetch('/api/kelompok-tani')
      const json = await res.json()
      if (res.ok) {
        setKelompokList(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching kelompok tani:', err)
    }
  }

  // Fetch Farmers Data
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (kelompokFilter) params.set('kelompokTaniId', kelompokFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/petani?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setPagination(json.pagination)
      } else {
        setError(json.error || 'Gagal memuat data petani')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelompokOptions()
  }, [])

  useEffect(() => {
    fetchData()
  }, [search, kelompokFilter, page])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Petani Desa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitoring direktori petani dan keanggotaan kelompok tani di Desa Cirebon Girang.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative rounded-md shadow-sm md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari nama petani, NIK, kontak, alamat..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="relative">
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
                  Nama Petani
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelompok Tani
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
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
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data petani...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">Tidak ada data petani.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {item.namaLengkap.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.namaLengkap}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.kelompokTani ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.kelompokTani.nama}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Mandiri (Belum ada)
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {item.nomorTelepon}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600 flex items-center max-w-xs truncate">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{item.alamat}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.user?.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/desa/petani/${item.id}`}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Detail
                      </Link>
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
              Halaman <span className="font-medium text-gray-900">{pagination.page}</span> dari <span className="font-medium text-gray-900">{pagination.totalPages}</span> (Total {pagination.total} Petani)
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
    </div>
  )
}
