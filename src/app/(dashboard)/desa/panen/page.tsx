'use client'

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/Card"
import { Wheat, PackageCheck, Filter } from "lucide-react"
import { ExportButtons } from "@/components/ui/ExportButtons"

interface KelompokOption { id: string; nama: string }
interface PanenItem {
  id: string
  musimTanamId: string
  tanggalPanen: string
  jumlahProduksi: number
  satuan: string
  kualitas?: string | null
  catatan?: string | null
  musimTanam: {
    namaMusim: string
    varietasPadi: string
    lahan: {
      namaLahan: string
      petani: { id: string; namaLengkap: string; kelompokTani?: { id: string; nama: string } | null }
    }
  }
}

function konversiKg(qty: number, satuan: string) {
  if (satuan === "ton") return qty * 1000
  if (satuan === "kuintal") return qty * 100
  return qty
}

export default function DesaPanenPage() {
  const [data, setData] = useState<PanenItem[]>([])
  const [kelompokOptions, setKelompokOptions] = useState<KelompokOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterKelompok, setFilterKelompok] = useState("")
  const [totalProduksi, setTotalProduksi] = useState(0)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      const res = await fetch(`/api/panen?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.data || [])
      setTotal(json.pagination?.total || 0)
      setTotalProduksi(json.stats?.totalProduksi || 0)
    } catch (e: any) {
      setError(e.message || "Gagal memuat data panen")
    } finally {
      setLoading(false)
    }
  }, [page, filterKelompok])

  const fetchKelompok = useCallback(async () => {
    try {
      const res = await fetch("/api/kelompok-tani?limit=100")
      const json = await res.json()
      setKelompokOptions(json.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchData(); fetchKelompok() }, [fetchData, fetchKelompok])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Hasil Panen Padi</h1>
          <p className="mt-1 text-sm text-gray-500">Data produksi gabah seluruh kelompok tani Desa Cirebon Girang</p>
        </div>
        <ExportButtons
          title="Laporan Rekapitulasi Hasil Panen Padi Desa Cirebon Girang"
          fileName="rekap-panen-desa-cirebon-girang"
          columns={[
            { header: "Nama Petani", key: "petani", render: (r) => r.musimTanam?.lahan?.petani?.namaLengkap || "—" },
            { header: "Kelompok Tani", key: "poktan", render: (r) => r.musimTanam?.lahan?.petani?.kelompokTani?.nama || "Mandiri" },
            { header: "Musim Tanam", key: "musim", render: (r) => r.musimTanam?.namaMusim || "—" },
            { header: "Varietas Padi", key: "varietas", render: (r) => r.musimTanam?.varietasPadi || "—" },
            { header: "Petak Lahan", key: "lahan", render: (r) => r.musimTanam?.lahan?.namaLahan || "—" },
            { header: "Tanggal Panen", key: "tanggal", render: (r) => new Date(r.tanggalPanen).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
            { header: "Jumlah Produksi", key: "produksi", render: (r) => `${r.jumlahProduksi.toLocaleString("id-ID")} ${r.satuan}` },
            { header: "Kualitas Gabah", key: "kualitas", render: (r) => r.kualitas || "Gabah Kering Panen" }
          ]}
          data={data}
          summaryStats={[
            { label: "Total Produksi Gabah", value: totalProduksi >= 1000 ? `${(totalProduksi / 1000).toFixed(2)} Ton` : `${totalProduksi.toLocaleString("id-ID")} kg` },
            { label: "Total Musim Panen", value: `${total} Periode Panen` },
            { label: "Rata-rata per Panen", value: total > 0 ? `${Math.round(totalProduksi / total).toLocaleString("id-ID")} kg` : "—" }
          ]}
        />
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wheat className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium">Total Produksi</p>
                <p className="text-xl font-bold text-amber-900">
                  {totalProduksi >= 1000000 ? `${(totalProduksi / 1000).toFixed(1)} ton` :
                   totalProduksi >= 1000 ? `${(totalProduksi / 1000).toFixed(2)} ton` :
                   `${totalProduksi.toLocaleString("id-ID")} kg`}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PackageCheck className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Musim Panen</p>
                <p className="text-xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wheat className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Rata-rata per Panen</p>
                <p className="text-xl font-bold text-gray-900">
                  {total > 0 ? `${Math.round(totalProduksi / total).toLocaleString("id-ID")} kg` : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchData} className="mt-3 text-sm text-amber-600 hover:underline">Coba lagi</button>
        </Card>
      ) : data.length === 0 ? (
        <Card className="p-12 text-center">
          <PackageCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada data panen yang tercatat.</p>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Petani</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Musim Tanam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lahan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal Panen</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Produksi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kualitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map(p => {
                  const totalKg = konversiKg(p.jumlahProduksi, p.satuan)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{p.musimTanam.lahan.petani.namaLengkap}</p>
                        {p.musimTanam.lahan.petani.kelompokTani && (
                          <p className="text-xs text-gray-500">{p.musimTanam.lahan.petani.kelompokTani.nama}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{p.musimTanam.namaMusim}</p>
                        <p className="text-xs text-gray-500">{p.musimTanam.varietasPadi}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.musimTanam.lahan.namaLahan}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(p.tanggalPanen).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-amber-700">{p.jumlahProduksi.toLocaleString("id-ID")} {p.satuan}</p>
                        {p.satuan !== "kg" && (
                          <p className="text-xs text-gray-500">{totalKg.toLocaleString("id-ID")} kg</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.kualitas || "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">‹ Sebelumnya</button>
              <span className="px-3 py-1.5 text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Berikutnya ›</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
