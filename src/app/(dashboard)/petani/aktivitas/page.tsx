"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/Card"
import { Tractor, Plus, Edit2, Trash2, ChevronDown, X, Filter, Leaf, Droplets, Bug, Sun, Sprout, Wheat, Settings } from "lucide-react"

const JENIS_OPTIONS = [
  { value: "Persiapan Lahan", label: "Persiapan Lahan", icon: Settings, color: "bg-gray-100 text-gray-700" },
  { value: "Penanaman", label: "Penanaman", icon: Sprout, color: "bg-green-100 text-green-700" },
  { value: "Pemupukan", label: "Pemupukan", icon: Leaf, color: "bg-yellow-100 text-yellow-700" },
  { value: "Pengairan", label: "Pengairan", icon: Droplets, color: "bg-blue-100 text-blue-700" },
  { value: "Penyemprotan", label: "Penyemprotan", icon: Bug, color: "bg-orange-100 text-orange-700" },
  { value: "Pengendalian Hama", label: "Pengendalian Hama", icon: Bug, color: "bg-red-100 text-red-700" },
  { value: "Panen", label: "Panen", icon: Wheat, color: "bg-amber-100 text-amber-700" },
  { value: "Lainnya", label: "Lainnya", icon: Sun, color: "bg-purple-100 text-purple-700" },
]

const getJenisStyle = (jenis: string) => {
  return JENIS_OPTIONS.find(j => j.value === jenis) || JENIS_OPTIONS[JENIS_OPTIONS.length - 1]
}

interface MusimOption { id: string; namaMusim: string; varietasPadi: string; lahan: { namaLahan: string } }
interface Aktivitas {
  id: string
  musimTanamId: string
  jenisAktivitas: string
  tanggal: string
  deskripsi: string
  foto?: string | null
  biaya?: number | null
  bahan?: string | null
  musimTanam: { namaMusim: string; lahan: { namaLahan: string } }
}

const EMPTY_FORM = { musimTanamId: "", jenisAktivitas: "Penanaman", tanggal: "", deskripsi: "", biaya: "", bahan: "" }

export default function PetaniAktivitasPage() {
  const [data, setData] = useState<Aktivitas[]>([])
  const [musimOptions, setMusimOptions] = useState<MusimOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterJenis, setFilterJenis] = useState("SEMUA")
  const [filterMusim, setFilterMusim] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ limit: "50" })
      if (filterJenis !== "SEMUA") params.set("jenisAktivitas", filterJenis)
      if (filterMusim) params.set("musimTanamId", filterMusim)
      const res = await fetch(`/api/aktivitas?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.data || [])
    } catch (e: any) {
      setError(e.message || "Gagal memuat data aktivitas")
    } finally {
      setLoading(false)
    }
  }, [filterJenis, filterMusim])

  const fetchMusim = useCallback(async () => {
    try {
      const res = await fetch("/api/musim-tanam?limit=100")
      const json = await res.json()
      setMusimOptions(json.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchData(); fetchMusim() }, [fetchData, fetchMusim])

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, tanggal: new Date().toISOString().split("T")[0] })
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (a: Aktivitas) => {
    setEditId(a.id)
    setForm({
      musimTanamId: a.musimTanamId,
      jenisAktivitas: a.jenisAktivitas,
      tanggal: a.tanggal.split("T")[0],
      deskripsi: a.deskripsi,
      biaya: a.biaya?.toString() || "",
      bahan: a.bahan || ""
    })
    setFormError("")
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError("")
    try {
      const url = editId ? `/api/aktivitas/${editId}` : "/api/aktivitas"
      const method = editId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          biaya: form.biaya ? parseFloat(form.biaya) : null
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setShowModal(false)
      fetchData()
    } catch (e: any) {
      setFormError(e.message || "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/aktivitas/${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setDeleteId(null)
      fetchData()
    } catch (e: any) {
      alert(e.message || "Gagal menghapus")
    }
  }

  const groupedByDate = data.reduce((acc, a) => {
    const date = new Date(a.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    if (!acc[date]) acc[date] = []
    acc[date].push(a)
    return acc
  }, {} as Record<string, Aktivitas[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aktivitas Budidaya</h1>
          <p className="mt-1 text-sm text-gray-500">Catatan kegiatan pertanian Anda</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Catat Aktivitas
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
        </div>
        <select
          value={filterMusim}
          onChange={e => setFilterMusim(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Semua Musim Tanam</option>
          {musimOptions.map(m => (
            <option key={m.id} value={m.id}>{m.namaMusim} — {m.lahan.namaLahan}</option>
          ))}
        </select>
        <select
          value={filterJenis}
          onChange={e => setFilterJenis(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="SEMUA">Semua Jenis</option>
          {JENIS_OPTIONS.map(j => (
            <option key={j.value} value={j.value}>{j.label}</option>
          ))}
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Aktivitas</h3>
          <p className="text-gray-500 text-sm mb-4">Mulai catat aktivitas budidaya padi Anda.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            <Plus className="h-4 w-4" /> Catat Aktivitas
          </button>
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
                    <Card key={a.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${style.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">{a.jenisAktivitas}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{a.musimTanam.namaMusim} · {a.musimTanam.lahan.namaLahan}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">{a.deskripsi}</p>
                          {(a.bahan || a.biaya) && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                              {a.bahan && <span>📦 Bahan: {a.bahan}</span>}
                              {a.biaya && <span>💰 Biaya: Rp {a.biaya.toLocaleString("id-ID")}</span>}
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
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editId ? "Edit Aktivitas" : "Catat Aktivitas Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Musim Tanam <span className="text-red-500">*</span></label>
                <select
                  value={form.musimTanamId}
                  onChange={e => setForm(f => ({ ...f, musimTanamId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!!editId}
                >
                  <option value="">Pilih musim tanam...</option>
                  {musimOptions.map(m => (
                    <option key={m.id} value={m.id}>{m.namaMusim} — {m.lahan.namaLahan} ({m.varietasPadi})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Aktivitas <span className="text-red-500">*</span></label>
                <select
                  value={form.jenisAktivitas}
                  onChange={e => setForm(f => ({ ...f, jenisAktivitas: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {JENIS_OPTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Catatan <span className="text-red-500">*</span></label>
                <textarea
                  value={form.deskripsi}
                  onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                  rows={3}
                  placeholder="Contoh: Pemupukan dasar dengan Urea 50 kg/bata..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahan yang Digunakan (opsional)</label>
                <input
                  type="text"
                  value={form.bahan}
                  onChange={e => setForm(f => ({ ...f, bahan: e.target.value }))}
                  placeholder="Contoh: Urea 50kg, NPK Phonska 25kg"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya (Rp, opsional)</label>
                <input
                  type="number"
                  value={form.biaya}
                  onChange={e => setForm(f => ({ ...f, biaya: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Catat Aktivitas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hapus Aktivitas?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Data aktivitas ini akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
