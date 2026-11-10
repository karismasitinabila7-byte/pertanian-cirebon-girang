import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { BarChart2, Users, Sprout, Wheat, Activity, Bell, RefreshCw, Compass, BookOpen } from 'lucide-react'
import { getDesaDashboardData } from '@/services/desaDashboardService'
import { DashboardFilters } from '@/components/features/DesaDashboard/DashboardFilters'
import {
  KpiCards,
  DistribusiKelompokChart,
  StatusMusimChart,
  ProduksiChart,
  AktivitasTerbaruList,
  MusimNearHarvestList,
  RingkasanProduksi,
} from '@/components/features/DesaDashboard/DashboardCharts'
import { EarlyWarningWidget } from '@/components/features/Notifications/EarlyWarningWidget'

export const metadata = {
  title: 'Dashboard Perangkat Desa | SI PADI Cirebon Girang',
  description: 'Monitoring pertanian padi Desa Cirebon Girang untuk Perangkat Desa',
}

interface Props {
  searchParams: Promise<{ kelompok?: string; tahun?: string }>
}

export default async function DesaDashboard({ searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const sp = await searchParams
  const kelompokId = sp.kelompok || ''
  const tahun      = sp.tahun ? parseInt(sp.tahun) : undefined

  const data = await getDesaDashboardData(kelompokId || undefined, tahun)

  const now = new Date()
  const lastUpdated = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const tanggalHari = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const totalMusim = data.kpi.musimBerjalan + data.kpi.musimPerencanaan
    + data.kpi.musimSelesai + data.kpi.musimGagal

  return (
    <div className="desa-dash-page">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="desa-dash-header">
        <div>
          <h1 className="desa-dash-title">Dashboard Perangkat Desa</h1>
          <p className="desa-dash-subtitle">
            Pantau perkembangan pertanian padi Desa Cirebon Girang &middot; {tanggalHari}
          </p>
        </div>
        <div className="desa-dash-header-right">
          <Link
            href="/peta"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
          >
            <Compass size={14} />
            <span>Peta GIS</span>
          </Link>
          <Link
            href="/edukasi"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition"
          >
            <BookOpen size={14} />
            <span>Edukasi Tani</span>
          </Link>
          {data.filterKelompokId && (
            <span className="desa-active-filter-badge">
              {data.kelompokList.find(k => k.id === data.filterKelompokId)?.nama}
            </span>
          )}
          {data.filterTahun && (
            <span className="desa-active-filter-badge desa-badge-gold-outline">
              Tahun {data.filterTahun}
            </span>
          )}
          <span className="desa-updated-at">
            <RefreshCw size={12} />
            Diperbarui {lastUpdated}
          </span>
        </div>
      </div>

      {/* ── Officer Profile Card ── */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <img
          src="/avatars/perangkat.jpg"
          alt="Bapak Karsiman, S.Sos"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs flex-shrink-0"
        />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Bapak Karsiman, S.Sos</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Perangkat Desa Aktif</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Seksi Pelayanan & Pembinaan Pertanian · Kantor Pemerintah Desa Cirebon Girang</p>
        </div>
      </div>

      {/* ── Early Warning System Widget ── */}
      <EarlyWarningWidget role="PERANGKAT_DESA" />

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <DashboardFilters data={data} />
      </Suspense>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <section>
        <KpiCards
          totalPetani={data.kpi.totalPetani}
          totalKelompok={data.kpi.totalKelompok}
          totalLahan={data.kpi.totalLahan}
          totalLahanAktif={data.kpi.totalLahanAktif}
          totalLuasM2={data.kpi.totalLuasM2}
          musimBerjalan={data.kpi.musimBerjalan}
          musimPerencanaan={data.kpi.musimPerencanaan}
          totalProduksiKg={data.kpi.totalProduksiKg}
          totalSesiPanen={data.kpi.totalSesiPanen}
        />
      </section>

      {/* ── Row 1: Distribusi Kelompok + Status Musim ─────────── */}
      <div className="desa-dash-row-2">
        {/* Distribusi Kelompok Tani */}
        <Card className="desa-section-card">
          <div className="desa-section-header">
            <div className="desa-section-title">
              <Users size={18} className="desa-section-icon" />
              Distribusi Petani per Kelompok Tani
            </div>
            <span className="desa-section-count">{data.distribusiKelompok.length} kelompok</span>
          </div>
          <DistribusiKelompokChart data={data.distribusiKelompok} />
        </Card>

        {/* Status Musim Tanam */}
        <Card className="desa-section-card">
          <div className="desa-section-header">
            <div className="desa-section-title">
              <Sprout size={18} className="desa-section-icon" />
              Status Musim Tanam
            </div>
            <span className="desa-section-count">{totalMusim} total</span>
          </div>
          <StatusMusimChart data={data.statusMusim} />

          {/* Mini stats below donut */}
          {totalMusim > 0 && (
            <div className="desa-musim-mini-stats">
              {[
                { label: 'Berjalan', val: data.kpi.musimBerjalan, cls: 'green' },
                { label: 'Rencana', val: data.kpi.musimPerencanaan, cls: 'blue' },
                { label: 'Selesai', val: data.kpi.musimSelesai, cls: 'amber' },
                { label: 'Gagal', val: data.kpi.musimGagal, cls: 'red' },
              ].map(s => (
                <div key={s.label} className={`desa-mini-stat desa-mini-stat-${s.cls}`}>
                  <span className="desa-mini-val">{s.val}</span>
                  <span className="desa-mini-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 2: Produksi Per Bulan + Ringkasan Produksi ────── */}
      <div className="desa-dash-row-2">
        {/* Grafik produksi per bulan */}
        <Card className="desa-section-card">
          <div className="desa-section-header">
            <div className="desa-section-title">
              <BarChart2 size={18} className="desa-section-icon" />
              Tren Produksi Panen
              {data.filterTahun && <span className="desa-section-tag">{data.filterTahun}</span>}
            </div>
            <span className="desa-section-count">per bulan</span>
          </div>
          <ProduksiChart data={data.produksiPerBulan} />
        </Card>

        {/* Ringkasan produksi per kelompok */}
        <Card className="desa-section-card">
          <div className="desa-section-header">
            <div className="desa-section-title">
              <Wheat size={18} className="desa-section-icon" />
              Ringkasan Produksi per Kelompok
            </div>
          </div>
          <RingkasanProduksi data={data.distribusiKelompok} />
        </Card>
      </div>

      {/* ── Row 3: Mendekati Panen + Aktivitas Terbaru ─────────── */}
      <div className="desa-dash-row-2">
        {/* Musim mendekati panen */}
        <Card className="desa-section-card">
          <div className="desa-section-header">
            <div className="desa-section-title">
              <Bell size={18} className="desa-section-icon" />
              Mendekati Estimasi Panen
              <span className="desa-section-tag">30 hari</span>
            </div>
            <span className="desa-section-count">{data.musimMendekatiPanen.length} musim</span>
          </div>
          <MusimNearHarvestList data={data.musimMendekatiPanen} />
        </Card>

        {/* Aktivitas pertanian terbaru */}
        <Card className="desa-section-card">
          <div className="desa-section-header">
            <div className="desa-section-title">
              <Activity size={18} className="desa-section-icon" />
              Aktivitas Pertanian Terbaru
            </div>
            <span className="desa-section-count">8 terakhir</span>
          </div>
          <AktivitasTerbaruList data={data.aktivitasTerbaru} />
        </Card>
      </div>

    </div>
  )
}
