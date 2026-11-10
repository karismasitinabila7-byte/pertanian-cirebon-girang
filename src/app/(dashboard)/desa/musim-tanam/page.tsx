'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { MusimTimeline } from '@/components/features/MusimTimeline'
import { 
  Search, 
  Eye, 
  Sprout, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Filter
} from 'lucide-react'
import { ExportButtons } from '@/components/ui/ExportButtons'

export default function DesaMusimTanamPage() {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalMusim: 0,
    totalPerencanaan: 0,
    totalBerjalan: 0,
    totalSelesai: 0,
    totalGagal: 0
  })
  const [kelompokList, setKelompokList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, limit: 10 })
  const [error, setError] = useState('')

  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/kelompok-tani')
      const json = await res.json()
      if (res.ok) setKelompokList(json.data || [])
    } catch (err) {
      console.error('Error fetching kelompok options:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (kelompokFilter) params.set('kelompokTaniId', kelompokFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (yearFilter) params.set('year', yearFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/musim-tanam?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        setData(json.data || [])
        setStats(json.stats || {})
        setPagination(json.pagination || { total: 0, totalPages: 1, limit: 10 })
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
    fetchOptions()
  }, [])

  useEffect(() => {
    fetchData()
  }, [search, kelompokFilter, statusFilter, yearFilter, page])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Musim Tanam Desa</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pantau status siklus tanam padi, sebaran varietas bibit, dan estimasi panen seluruh wilayah Desa Cirebon Girang.
          </p>
        </div>
        <ExportButtons
          title="Laporan Rekapitulasi Siklus Musim Tanam Padi Desa Cirebon Girang"
          fileName="rekap-musim-tanam-desa-cirebon-girang"
          columns={[
            { header: "Musim Tanam", key: "namaMusim" },
            { header: "Varietas Padi", key: "varietasPadi" },
            { header: "Petak Lahan", key: "lahan", render: (r) => r.lahan?.namaLahan || "—" },
            { header: "Nama Petani", key: "petani", render: (r) => r.lahan?.petani?.namaLengkap || "—" },
            { header: "Kelompok Tani", key: "poktan", render: (r) => r.lahan?.petani?.kelompokTani?.nama || "Mandiri" },
            { header: "Tgl Persiapan", key: "tMulai", render: (r) => new Date(r.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
            { header: "Tgl Penanaman", key: "tTanam", render: (r) => new Date(r.tanggalTanam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
            { header: "Estimasi Panen", key: "tPanen", render: (r) => new Date(r.estimasiPanen).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
            { header: "Status Siklus", key: "status" }
          ]}
          data={data}
          summaryStats={[
            { label: "Total Musim", value: stats.totalMusim || 0 },
            { label: "Sedang Berjalan", value: stats.totalBerjalan || 0 },
            { label: "Selesai Panen", value: stats.totalSelesai || 0 },
            { label: "Tahap Perencanaan", value: stats.totalPerencanaan || 0 }
          ]}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-gray-600">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Musim</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalMusim || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-blue-600 uppercase">Perencanaan</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalPerencanaan || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Sedang Berjalan</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{stats.totalBerjalan || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <p className="text-xs font-semibold text-purple-600 uppercase">Selesai Panen</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{stats.totalSelesai || 0}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600 col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-rose-600 uppercase">Gagal / Puso</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{stats.totalGagal || 0}</p>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari musim, varietas, petani..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Status Siklus</option>
              <option value="PERENCANAAN">Tahap Perencanaan</option>
              <option value="BERJALAN">Sedang Berjalan (Aktif)</option>
              <option value="SELESAI">Selesai Panen</option>
              <option value="GAGAL">Gagal Panen</option>
            </select>
          </div>

          <div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Semua Tahun Tanam</option>
              <option value="2027">Tahun 2027</option>
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
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
                  Musim & Varietas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lahan & Petani
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline Siklus
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
                      <span>Memuat data musim tanam...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <Sprout className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">Tidak ada data musim tanam yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{item.namaMusim}</div>
                      <div className="text-xs text-green-700 font-medium mt-0.5 flex items-center">
                        <Sprout className="h-3 w-3 mr-1" />
                        Varietas: {item.varietasPadi}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{item.lahan?.namaLahan}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.lahan?.petani?.namaLengkap} &bull; {item.lahan?.petani?.kelompokTani?.nama || 'Mandiri'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-52">
                        <MusimTimeline
                          tanggalMulai={item.tanggalMulai}
                          tanggalTanam={item.tanggalTanam}
                          estimasiPanen={item.estimasiPanen}
                          status={item.status}
                          compact={true}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'BERJALAN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'PERENCANAAN'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'SELESAI'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/desa/musim-tanam/${item.id}`}
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
              Halaman <span className="font-medium text-gray-900">{pagination.page}</span> dari <span className="font-medium text-gray-900">{pagination.totalPages}</span> (Total {pagination.total} Musim)
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
