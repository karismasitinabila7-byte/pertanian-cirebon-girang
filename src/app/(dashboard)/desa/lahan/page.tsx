'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { 
  Search, 
  Eye, 
  Map, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react'

export default function DesaLahanPage() {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalLuasM2: 0,
    totalLuasHektar: 0,
    totalLahan: 0,
    totalAktif: 0,
    totalTidakAktif: 0
  })
  const [kelompokList, setKelompokList] = useState<any[]>([])
  const [petaniList, setPetaniList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('')
  const [petaniFilter, setPetaniFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, limit: 10 })
  const [error, setError] = useState('')

  // Fetch filter options
  const fetchOptions = async () => {
    try {
      const [resKelompok, resPetani] = await Promise.all([
        fetch('/api/kelompok-tani'),
        fetch('/api/petani?limit=200')
      ])
      const [jsonKelompok, jsonPetani] = await Promise.all([
        resKelompok.json(),
        resPetani.json()
      ])
      if (resKelompok.ok) setKelompokList(jsonKelompok.data || [])
      if (resPetani.ok) setPetaniList(jsonPetani.data || [])
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  // Fetch Farmland Data
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (kelompokFilter) params.set('kelompokTaniId', kelompokFilter)
      if (petaniFilter) params.set('petaniId', petaniFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/lahan?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data)
        setStats(json.stats || {})
        setPagination(json.pagination || { total: 0, totalPages: 1, limit: 10 })
      } else {
        setError(json.error || 'Gagal memuat data lahan')
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
  }, [search, kelompokFilter, petaniFilter, statusFilter, page])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Lahan Pertanian Desa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pantau sebaran petak sawah, luas area tanam, dan status produktivitas lahan pertanian Desa Cirebon Girang.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-green-600">
          <div className="p-3 bg-green-50 rounded-xl text-green-700">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Lahan Desa</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalLahan || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-emerald-600">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Luas Lahan</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {stats.totalLuasM2 ? stats.totalLuasM2.toLocaleString('id-ID') : 0} <span className="text-xs font-normal text-gray-500">m²</span>
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">≈ {stats.totalLuasHektar || 0} Hektar (Ha)</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lahan Aktif Produktif</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalAktif || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-amber-600">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tidak Aktif / Masa Bera</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalTidakAktif || 0} <span className="text-xs font-normal text-gray-500">Petak</span></p>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative rounded-md shadow-sm md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari nama lahan, lokasi, petani..."
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
              value={petaniFilter}
              onChange={(e) => {
                setPetaniFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Petani</option>
              {petaniList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaLengkap} {p.kelompokTani ? `(${p.kelompokTani.nama})` : ''}
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
              <option value="">Semua Status</option>
              <option value="AKTIF">Hanya Aktif</option>
              <option value="TIDAK_AKTIF">Tidak Aktif</option>
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
                  Nama Lahan & Lokasi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Petani & Kelompok
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Luas Lahan
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
                      <span>Memuat data lahan pertanian...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <Map className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">Tidak ada data lahan yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.namaLahan}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-xs">{item.lokasi}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.petani?.namaLengkap}</div>
                      <div className="text-xs text-green-700 mt-0.5">
                        {item.petani?.kelompokTani?.nama ? item.petani.kelompokTani.nama : 'Petani Mandiri'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {item.luasLahan.toLocaleString('id-ID')} {item.satuanLuas || 'm²'}
                      </div>
                      {item.satuanLuas === 'm²' && item.luasLahan >= 1000 && (
                        <div className="text-xs text-gray-500">
                          ≈ {(item.luasLahan / 10000).toFixed(2)} Ha
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.status === 'AKTIF' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <XCircle className="h-3 w-3 mr-1" /> Tidak Aktif
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/desa/lahan/${item.id}`}
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
              Halaman <span className="font-medium text-gray-900">{pagination.page}</span> dari <span className="font-medium text-gray-900">{pagination.totalPages}</span> (Total {pagination.total} Lahan)
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
