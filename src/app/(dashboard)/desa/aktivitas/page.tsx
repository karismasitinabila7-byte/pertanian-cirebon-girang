'use client'

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/Card"
import { Tractor, Filter, Leaf, Droplets, Bug, Sun, Sprout, Wheat, Settings, Search } from "lucide-react"
import { ExportButtons } from "@/components/ui/ExportButtons"

const JENIS_OPTIONS = [
  { value: "Persiapan Lahan", icon: Settings, color: "bg-gray-100 text-gray-700" },
  { value: "Penanaman", icon: Sprout, color: "bg-green-100 text-green-700" },
  { value: "Pemupukan", icon: Leaf, color: "bg-yellow-100 text-yellow-700" },
  { value: "Pengairan", icon: Droplets, color: "bg-blue-100 text-blue-700" },
  { value: "Penyemprotan", icon: Bug, color: "bg-orange-100 text-orange-700" },
  { value: "Pengendalian Hama", icon: Bug, color: "bg-red-100 text-red-700" },
  { value: "Panen", icon: Wheat, color: "bg-amber-100 text-amber-700" },
  { value: "Lainnya", icon: Sun, color: "bg-purple-100 text-purple-700" },
]

const getJenisStyle = (jenis: string) => JENIS_OPTIONS.find(j => j.value === jenis) || JENIS_OPTIONS[JENIS_OPTIONS.length - 1]

interface KelompokOption { id: string; nama: string }
interface Aktivitas {
  id: string
  musimTanamId: string
  jenisAktivitas: string
  tanggal: string
  deskripsi: string
  biaya?: number | null
  bahan?: string | null
  musimTanam: {
    namaMusim: string
    varietasPadi: string
    lahan: {
      namaLahan: string
      petani: { id: string; namaLengkap: string; kelompokTani?: { id: string; nama: string } | null }
    }
  }
}

export default function DesaAktivitasPage() {
  const [data, setData] = useState<Aktivitas[]>([])
  const [kelompokOptions, setKelompokOptions] = useState<KelompokOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterJenis, setFilterJenis] = useState("SEMUA")
  const [filterKelompok, setFilterKelompok] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (filterJenis !== "SEMUA") params.set("jenisAktivitas", filterJenis)
      const res = await fetch(`/api/aktivitas?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.data || [])
      setTotal(json.pagination?.total || 0)
    } catch (e: any) {
      setError(e.message || "Gagal memuat data aktivitas")
    } finally {
      setLoading(false)
    }
  }, [filterJenis, filterKelompok, page])

  const fetchKelompok = useCallback(async () => {
    try {
      const res = await fetch("/api/kelompok-tani?limit=100")
      const json = await res.json()
      setKelompokOptions(json.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchData(); fetchKelompok() }, [fetchData, fetchKelompok])

  // Group by date
  const groupedByDate = data.reduce((acc, a) => {
    const date = new Date(a.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    if (!acc[date]) acc[date] = []
    acc[date].push(a)
    return acc
  }, {} as Record<string, Aktivitas[]>)

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring Aktivitas Budidaya</h1>
          <p className="mt-1 text-sm text-gray-500">Pantau seluruh kegiatan pertanian desa secara real-time</p>
        </div>
        <ExportButtons
          title="Laporan Rekapitulasi Aktivitas Budidaya & Pemupukan Padi"
          fileName="rekap-aktivitas-budidaya-desa-cirebon-girang"
          columns={[
            { header: "Tanggal", key: "tanggal", render: (r) => new Date(r.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
            { header: "Jenis Aktivitas", key: "jenisAktivitas" },
            { header: "Nama Petani", key: "petani", render: (r) => r.musimTanam?.lahan?.petani?.namaLengkap || "—" },
            { header: "Kelompok Tani", key: "poktan", render: (r) => r.musimTanam?.lahan?.petani?.kelompokTani?.nama || "Mandiri" },
            { header: "Musim Tanam", key: "musim", render: (r) => r.musimTanam?.namaMusim || "—" },
            { header: "Petak Lahan", key: "lahan", render: (r) => r.musimTanam?.lahan?.namaLahan || "—" },
            { header: "Deskripsi", key: "deskripsi" },
            { header: "Bahan & Dosis", key: "bahan", render: (r) => r.bahan || "—" },
            { header: "Biaya Operasional", key: "biaya", render: (r) => r.biaya ? `Rp ${r.biaya.toLocaleString("id-ID")}` : "—" }
          ]}
          data={data}
          summaryStats={[
            { label: "Total Aktivitas", value: `${total} Kegiatan` },
            { label: "Filter Aktif", value: filterJenis }
          ]}
        />
      </div>

      {/* Stats */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <Tractor className="h-5 w-5 text-green-700" />
          <span className="text-sm font-medium text-green-800">Total {total} aktivitas tercatat</span>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={filterJenis}
          onChange={e => { setFilterJenis(e.target.value); setPage(1) }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="SEMUA">Semua Jenis Aktivitas</option>
          {JENIS_OPTIONS.map(j => <option key={j.value} value={j.value}>{j.value}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchData} className="mt-3 text-sm text-green-600 hover:underline">Coba lagi</button>
        </Card>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center">
          <Tractor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada aktivitas budidaya yang tercatat.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, activities]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">{date}</h3>
              <div className="space-y-3">
                {activities.map(a => {
                  const style = getJenisStyle(a.jenisAktivitas)
                  const Icon = style.icon
                  return (
                    <Card key={a.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${style.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">{a.jenisAktivitas}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {a.musimTanam.lahan.petani.namaLengkap}
                                {a.musimTanam.lahan.petani.kelompokTani && ` · ${a.musimTanam.lahan.petani.kelompokTani.nama}`}
                              </p>
                              <p className="text-xs text-gray-400">{a.musimTanam.namaMusim} · {a.musimTanam.lahan.namaLahan}</p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{a.deskripsi}</p>
                          {(a.bahan || a.biaya) && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                              {a.bahan && <span>📦 {a.bahan}</span>}
                              {a.biaya && <span>💰 Rp {a.biaya.toLocaleString("id-ID")}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ‹ Sebelumnya
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Berikutnya ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
