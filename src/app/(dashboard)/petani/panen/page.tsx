"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/Card"
import { Wheat, Plus, Edit2, Trash2, X, PackageCheck } from "lucide-react"

interface MusimOption { id: string; namaMusim: string; varietasPadi: string; lahan: { namaLahan: string }; status: string; panen?: any }
interface PanenItem {
  id: string
  musimTanamId: string
  tanggalPanen: string
  jumlahProduksi: number
  satuan: string
  kualitas?: string | null
  catatan?: string | null
  musimTanam: { namaMusim: string; varietasPadi: string; lahan: { namaLahan: string } }
}

const EMPTY_FORM = { musimTanamId: "", tanggalPanen: "", jumlahProduksi: "", satuan: "kg", kualitas: "", catatan: "" }

const SATUAN_LABELS: Record<string, string> = { kg: "Kilogram (kg)", kuintal: "Kuintal", ton: "Ton" }

function konversiKg(qty: number, satuan: string) {
  if (satuan === "ton") return qty * 1000
  if (satuan === "kuintal") return qty * 100
  return qty
}

export default function PetaniPanenPage() {
  const [data, setData] = useState<PanenItem[]>([])
  const [musimOptions, setMusimOptions] = useState<MusimOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [totalStats, setTotalStats] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/panen?limit=50")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.data || [])
      setTotalStats(json.stats?.totalProduksi || 0)
    } catch (e: any) {
      setError(e.message || "Gagal memuat data panen")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMusim = useCallback(async () => {
    try {
      const res = await fetch("/api/musim-tanam?limit=100")
      const json = await res.json()
      setMusimOptions(json.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchData(); fetchMusim() }, [fetchData, fetchMusim])

  // Filter musim yang belum punya panen untuk form create
  const musimTanpaHasil = musimOptions.filter(m => !m.panen)

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, tanggalPanen: new Date().toISOString().split("T")[0] })
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (p: PanenItem) => {
    setEditId(p.id)
    setForm({
      musimTanamId: p.musimTanamId,
      tanggalPanen: p.tanggalPanen.split("T")[0],
      jumlahProduksi: p.jumlahProduksi.toString(),
      satuan: p.satuan,
      kualitas: p.kualitas || "",
      catatan: p.catatan || ""
    })
    setFormError("")
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError("")
    try {
      const url = editId ? `/api/panen/${editId}` : "/api/panen"
      const method = editId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jumlahProduksi: parseFloat(form.jumlahProduksi) })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setShowModal(false)
      fetchData()
      fetchMusim()
    } catch (e: any) {
      setFormError(e.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Hasil Panen</h1>
          <p className="mt-1 text-sm text-gray-500">Rekap produksi gabah dari setiap musim tanam</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Catat Panen
        </button>
      </div>

      {/* Summary Card */}
      {!loading && data.length > 0 && (
        <Card className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Wheat className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">Total Produksi</p>
              <p className="text-2xl font-bold text-amber-900">
                {totalStats >= 1000 ? `${(totalStats / 1000).toFixed(2)} Ton` : `${totalStats.toLocaleString("id-ID")} kg`}
              </p>
              <p className="text-xs text-amber-600">dari {data.length} catatan panen</p>
            </div>
          </div>
        </Card>
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Data Panen</h3>
          <p className="text-gray-500 text-sm mb-4">Catat hasil panen setelah musim tanam selesai.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
            <Plus className="h-4 w-4" /> Catat Panen
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map(p => {
            const totalKg = konversiKg(p.jumlahProduksi, p.satuan)
            return (
              <Card key={p.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-amber-100 rounded-xl">
                    <Wheat className="h-6 w-6 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {p.jumlahProduksi.toLocaleString("id-ID")} {p.satuan}
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            {p.satuan !== "kg" && `(≈ ${totalKg.toLocaleString("id-ID")} kg)`}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">{p.musimTanam.namaMusim} · {p.musimTanam.varietasPadi}</p>
                        <p className="text-xs text-gray-500">{p.musimTanam.lahan.namaLahan}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 Panen: {new Date(p.tanggalPanen).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      {p.kualitas && <span>⭐ Kualitas: {p.kualitas}</span>}
                    </div>
                    {p.catatan && (
                      <p className="mt-2 text-sm text-gray-500 italic">{p.catatan}</p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editId ? "Edit Data Panen" : "Catat Hasil Panen"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>
              )}
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Musim Tanam <span className="text-red-500">*</span></label>
                  <select
                    value={form.musimTanamId}
                    onChange={e => setForm(f => ({ ...f, musimTanamId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Pilih musim tanam...</option>
                    {musimTanpaHasil.map(m => (
                      <option key={m.id} value={m.id}>{m.namaMusim} — {m.lahan.namaLahan} ({m.varietasPadi})</option>
                    ))}
                  </select>
                  {musimTanpaHasil.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">Semua musim tanam sudah memiliki data panen.</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Panen <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.tanggalPanen}
                  onChange={e => setForm(f => ({ ...f, tanggalPanen: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Produksi <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.jumlahProduksi}
                    onChange={e => setForm(f => ({ ...f, jumlahProduksi: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <select
                    value={form.satuan}
                    onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(SATUAN_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kualitas Gabah (opsional)</label>
                <input
                  type="text"
                  value={form.kualitas}
                  onChange={e => setForm(f => ({ ...f, kualitas: e.target.value }))}
                  placeholder="Contoh: Gabah Super Kering Giling"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <textarea
                  value={form.catatan}
                  onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                  rows={3}
                  placeholder="Catatan tambahan tentang hasil panen..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Batal</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Catat Panen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
