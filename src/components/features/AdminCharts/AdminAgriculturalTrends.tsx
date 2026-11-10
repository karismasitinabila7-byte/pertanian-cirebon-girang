'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Wheat,
  Sprout,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react'

export interface SeasonTrendData {
  namaMusim: string
  varietas: string
  produksiTon: number
  targetTon: number
  luasHa: number
  produktivitasTonHa: number
  status: string
  tahun: string
}

export interface SuccessRateData {
  selesai: number
  berjalan: number
  perencanaan: number
  gagal: number
  total: number
}

interface AdminAgriculturalTrendsProps {
  trendData?: SeasonTrendData[]
  successData?: SuccessRateData
}

export function AdminAgriculturalTrends({
  trendData: initialTrends,
  successData: initialSuccess,
}: AdminAgriculturalTrendsProps) {
  const [activeTab, setActiveTab] = useState<'PANEN' | 'KEBERHASILAN' | 'VARIETAS'>('PANEN')
  const [unit, setUnit] = useState<'TON' | 'KG'>('TON')
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)

  // Default demo dataset if props are empty
  const trends: SeasonTrendData[] = initialTrends && initialTrends.length > 0 ? initialTrends : [
    { namaMusim: 'MT1 2024/2025', varietas: 'Inpari 32', produksiTon: 18.4, targetTon: 17.0, luasHa: 2.8, produktivitasTonHa: 6.57, status: 'SELESAI', tahun: '2025' },
    { namaMusim: 'MT2 Gadu 2025', varietas: 'Ciherang', produksiTon: 15.8, targetTon: 15.0, luasHa: 2.6, produktivitasTonHa: 6.08, status: 'SELESAI', tahun: '2025' },
    { namaMusim: 'MT1 2025/2026', varietas: 'Inpari 32', produksiTon: 19.8, targetTon: 18.5, luasHa: 3.0, produktivitasTonHa: 6.60, status: 'SELESAI', tahun: '2026' },
    { namaMusim: 'MT2 Gadu 2026', varietas: 'Ciherang', produksiTon: 20.0, targetTon: 18.0, luasHa: 3.15, produktivitasTonHa: 6.35, status: 'SELESAI', tahun: '2026' },
    { namaMusim: 'MT1 2026/2027', varietas: 'Inpari 32', produksiTon: 23.5, targetTon: 21.0, luasHa: 3.5, produktivitasTonHa: 6.71, status: 'BERJALAN', tahun: '2026/2027' },
  ]

  const successRate: SuccessRateData = initialSuccess || {
    selesai: 4,
    berjalan: 3,
    perencanaan: 1,
    gagal: 0,
    total: 8,
  }

  // Calculate success rate percentage
  const finishedTotal = successRate.selesai + successRate.gagal
  const successPercentage = finishedTotal > 0
    ? Math.round((successRate.selesai / finishedTotal) * 100)
    : 100

  // Max value for bar chart height
  const maxProduksi = Math.max(...trends.map(t => Math.max(t.produksiTon, t.targetTon))) * 1.15

  // Donut chart angles calculation
  const totalItems = successRate.total || 1
  const degSelesai = (successRate.selesai / totalItems) * 360
  const degBerjalan = (successRate.berjalan / totalItems) * 360
  const degPerencanaan = (successRate.perencanaan / totalItems) * 360
  const degGagal = (successRate.gagal / totalItems) * 360

  return (
    <Card className="p-6 border border-gray-200 shadow-xs bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Grafik Analisis Tren Pertanian Padi
              </h2>
              <p className="text-xs text-gray-500">
                Visualisasi statistik tren produksi gabah per musim tanam dan rasio keberhasilan panen desa.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('PANEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'PANEN'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={14} />
            <span>Tren Hasil Panen</span>
          </button>
          <button
            onClick={() => setActiveTab('KEBERHASILAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'KEBERHASILAN'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PieChart size={14} />
            <span>Tingkat Keberhasilan</span>
          </button>
          <button
            onClick={() => setActiveTab('VARIETAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'VARIETAS'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sprout size={14} />
            <span>Varietas Padi</span>
          </button>
        </div>
      </div>

      {/* Content: TAB 1 - TREN HASIL PANEN */}
      {activeTab === 'PANEN' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                <span className="font-semibold text-gray-700">Realisasi Panen (Ton)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
                <span className="font-semibold text-gray-700">Target Dinas / Rencana (Ton)</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setUnit('TON')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  unit === 'TON' ? 'bg-emerald-700 text-white' : 'text-gray-600'
                }`}
              >
                Ton
              </button>
              <button
                onClick={() => setUnit('KG')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  unit === 'KG' ? 'bg-emerald-700 text-white' : 'text-gray-600'
                }`}
              >
                Kg
              </button>
            </div>
          </div>

          {/* SVG Multi-Bar & Area Chart */}
          <div className="bg-gradient-to-b from-gray-50/60 to-white p-5 rounded-2xl border border-gray-100">
            <div className="h-64 flex items-end justify-between gap-4 sm:gap-8 pt-6 pb-2 px-2 relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-x-0 top-6 border-b border-dashed border-gray-200" />
              <div className="absolute inset-x-0 top-24 border-b border-dashed border-gray-200" />
              <div className="absolute inset-x-0 top-44 border-b border-dashed border-gray-200" />

              {trends.map((item, idx) => {
                const heightAktual = Math.round((item.produksiTon / maxProduksi) * 100)
                const heightTarget = Math.round((item.targetTon / maxProduksi) * 100)
                const isHovered = hoveredBarIndex === idx
                const valAktual = unit === 'TON' ? `${item.produksiTon} Ton` : `${(item.produksiTon * 1000).toLocaleString('id-ID')} kg`
                const valTarget = unit === 'TON' ? `${item.targetTon} Ton` : `${(item.targetTon * 1000).toLocaleString('id-ID')} kg`

                return (
                  <div
                    key={item.namaMusim}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-xl shadow-xl pointer-events-none whitespace-nowrap text-center animate-fade-in border border-slate-700">
                        <p className="font-bold text-emerald-300">{item.namaMusim} ({item.varietas})</p>
                        <p className="text-gray-200">Realisasi: <strong>{valAktual}</strong> | Target: {valTarget}</p>
                        <p className="text-[10px] text-gray-400">Produktivitas: {item.produktivitasTonHa} Ton/Ha</p>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Target bar */}
                      <div
                        style={{ height: `${heightTarget}%` }}
                        className="w-4 sm:w-7 bg-amber-300/80 hover:bg-amber-400 rounded-t-md transition-all duration-300"
                        title={`Target: ${valTarget}`}
                      />
                      {/* Actual bar */}
                      <div
                        style={{ height: `${heightAktual}%` }}
                        className={`w-4 sm:w-7 rounded-t-md transition-all duration-300 ${
                          item.status === 'BERJALAN'
                            ? 'bg-gradient-to-t from-teal-600 to-teal-400 opacity-90'
                            : 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-xs'
                        } ${isHovered ? 'scale-y-105 filter brightness-110' : ''}`}
                        title={`Realisasi: ${valAktual}`}
                      />
                    </div>

                    {/* Label below bar */}
                    <div className="mt-3 text-center">
                      <p className="text-xs font-bold text-gray-800 truncate max-w-[85px] sm:max-w-none">
                        {item.namaMusim.split(' ')[0]} {item.namaMusim.split(' ')[1] || ''}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {item.varietas}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Highlights KPI bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-200/80 rounded-lg text-emerald-800">
                <Wheat size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 uppercase">Tren Produktivitas Rata-rata</p>
                <p className="text-base font-extrabold text-emerald-950 mt-0.5">6.46 Ton / Hektar</p>
                <p className="text-[10px] text-emerald-700 flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> Naik +8.2% dibanding tahun lalu
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center gap-3">
              <div className="p-2 bg-teal-200/80 rounded-lg text-teal-800">
                <Sprout size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-teal-800 uppercase">Varietas Unggulan Utama</p>
                <p className="text-base font-extrabold text-teal-950 mt-0.5">Inpari 32 (Ciherang Sub-1)</p>
                <p className="text-[10px] text-teal-700">Tahan rebah & tahan wereng coklat</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center gap-3">
              <div className="p-2 bg-amber-200/80 rounded-lg text-amber-800">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-amber-800 uppercase">Ketercapaian Target Musim</p>
                <p className="text-base font-extrabold text-amber-950 mt-0.5">107.5% Terlampaui</p>
                <p className="text-[10px] text-amber-700">Surplus gabah kering panen desa</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content: TAB 2 - TINGKAT KEBERHASILAN TANAM */}
      {activeTab === 'KEBERHASILAN' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Donut SVG Chart */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200/60">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG circular progress */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  {/* Selesai / Berhasil (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(degSelesai / 360) * 251.2} 251.2`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Sedang Berjalan (Teal) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#0d9488"
                    strokeWidth="12"
                    strokeDasharray={`${(degBerjalan / 360) * 251.2} 251.2`}
                    strokeDashoffset={`-${(degSelesai / 360) * 251.2}`}
                    strokeLinecap="round"
                  />
                  {/* Perencanaan (Blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeDasharray={`${(degPerencanaan / 360) * 251.2} 251.2`}
                    strokeDashoffset={`-${((degSelesai + degBerjalan) / 360) * 251.2}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center metric */}
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-gray-900">{successPercentage}%</span>
                  <span className="block text-[11px] font-semibold text-emerald-700">Tingkat Berhasil</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Berdasarkan evaluasi seluruh siklus tanam padi terdaftar di Desa Cirebon Girang.
              </p>
            </div>

            {/* Breakdown stats */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Rincian Status Siklus Pertanian</h3>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Musim Panen Sukses (Selesai)</p>
                    <p className="text-[11px] text-gray-500">Hasil gabah memenuhi standar mutu GKP</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-emerald-800">{successRate.selesai} Musim</span>
              </div>

              <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-600"></span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Sedang Berjalan (Aktif)</p>
                    <p className="text-[11px] text-gray-500">Dalam fase vegetatif & generatif sawah</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-teal-800">{successRate.berjalan} Musim</span>
              </div>

              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Tahap Perencanaan / Persemaian</p>
                    <p className="text-[11px] text-gray-500">Persiapan bibit & olah tanah pembajakan</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-blue-800">{successRate.perencanaan} Musim</span>
              </div>

              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Gagal / Puso (Risiko Cuaca & Hama)</p>
                    <p className="text-[11px] text-gray-500">Kekeringan parah atau serangan wereng masif</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-rose-800">{successRate.gagal} Musim</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content: TAB 3 - ANALISIS PRODUKTIVITAS PER VARIETAS */}
      {activeTab === 'VARIETAS' && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Perbandingan produktivitas rata-rata gabah kering panen (GKP) dan ketahanan varietas padi yang ditanam oleh kelompok tani Desa Cirebon Girang:
          </p>

          <div className="space-y-4">
            {/* Inpari 32 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-900">Inpari 32 HDB</span>
                  <span className="ml-2 text-xs text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                    Varietas Paling Diminati (62% Petani)
                  </span>
                </div>
                <span className="font-extrabold text-emerald-900">6.8 Ton / Ha</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-[11px] text-gray-500">
                Karakteristik: Batang kokoh tahan rebah saat angin kencang, tahan hawar daun bakteri (kresek) strain III & IV.
              </p>
            </div>

            {/* Ciherang */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-900">Ciherang Unggul</span>
                  <span className="ml-2 text-xs text-teal-800 bg-teal-100 font-semibold px-2 py-0.5 rounded-full">
                    Kualitas Beras Pulen (28% Petani)
                  </span>
                </div>
                <span className="font-extrabold text-teal-900">6.2 Ton / Ha</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: '77%' }}></div>
              </div>
              <p className="text-[11px] text-gray-500">
                Karakteristik: Nasi sangat pulen, rasa disukai konsumen lokal, memerlukan pengamatan ekstra terhadap wereng batang coklat biotipe 3.
              </p>
            </div>

            {/* Sintanur / Mekongga */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-900">Mekongga / Sintanur</span>
                  <span className="ml-2 text-xs text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                    Aromatik & Rendah Gula (10% Petani)
                  </span>
                </div>
                <span className="font-extrabold text-amber-900">5.8 Ton / Ha</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <p className="text-[11px] text-gray-500">
                Karakteristik: Aroma wangi pandan, nilai jual beras tinggi di pasar premium Cirebon.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
