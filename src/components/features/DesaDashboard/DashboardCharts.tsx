'use client'

import React from 'react'
import {
  Users,
  Map,
  Sprout,
  Wheat,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import {
  DistribusiKelompok,
  StatusMusimItem,
  ProduksiPerBulan,
  AktivitasTerbaru,
  MusimMendekatiPanen,
} from '@/services/desaDashboardService'

// ─── 1. KpiCards ─────────────────────────────────────────────────────────────

interface KpiCardsProps {
  totalPetani: number
  totalKelompok: number
  totalLahan: number
  totalLahanAktif: number
  totalLuasM2: number
  musimBerjalan: number
  musimPerencanaan: number
  totalProduksiKg: number
  totalSesiPanen: number
}

export function KpiCards({
  totalPetani,
  totalKelompok,
  totalLahan,
  totalLahanAktif,
  totalLuasM2,
  musimBerjalan,
  musimPerencanaan,
  totalProduksiKg,
  totalSesiPanen,
}: KpiCardsProps) {
  const luasHektar = (totalLuasM2 / 10000).toFixed(2)
  const produksiTon = (totalProduksiKg / 1000).toFixed(1)

  const cards = [
    {
      title: 'Total Petani Terdaftar',
      value: `${totalPetani} Orang`,
      sub: `${totalKelompok} Kelompok Tani Aktif`,
      icon: Users,
      bg: '#ecfdf5',
      color: '#059669',
    },
    {
      title: 'Total Lahan Sawah',
      value: `${totalLahan} Petak`,
      sub: `${luasHektar} Ha (${totalLahanAktif} Aktif)`,
      icon: Map,
      bg: '#f0fdf4',
      color: '#16a34a',
    },
    {
      title: 'Musim Tanam Berjalan',
      value: `${musimBerjalan} Musim`,
      sub: `${musimPerencanaan} Dalam Rencana`,
      icon: Sprout,
      bg: '#e0f2fe',
      color: '#0284c7',
    },
    {
      title: 'Total Realisasi Panen',
      value: `${produksiTon} Ton`,
      sub: `${totalSesiPanen} Sesi Panen (${totalProduksiKg.toLocaleString('id-ID')} kg)`,
      icon: Wheat,
      bg: '#fef3c7',
      color: '#d97706',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: c.bg,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{c.title}</p>
              <h3 style={{ margin: '2px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{c.value}</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{c.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 2. DistribusiKelompokChart ──────────────────────────────────────────────

export function DistribusiKelompokChart({ data }: { data: DistribusiKelompok[] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>Belum ada data kelompok tani.</p>
  }

  const maxPetani = Math.max(...data.map(d => d.jumlahPetani), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
      {data.map(item => {
        const pct = Math.round((item.jumlahPetani / maxPetani) * 100)
        return (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.nama}</span>
              <span style={{ color: '#64748b' }}>{item.jumlahPetani} Petani &middot; {item.jumlahLahan} Lahan</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 3. StatusMusimChart ─────────────────────────────────────────────────────

export function StatusMusimChart({ data }: { data: StatusMusimItem[] }) {
  const total = data.reduce((acc, curr) => acc + curr.jumlah, 0)

  if (total === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>Belum ada musim tanam tercatat.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
      {/* Visual Bar Segment */}
      <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', width: '100%' }}>
        {data.map(item => {
          const pct = (item.jumlah / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={item.status}
              style={{
                width: `${pct}%`,
                backgroundColor: item.warna,
                height: '100%',
              }}
              title={`${item.label}: ${item.jumlah} (${Math.round(pct)}%)`}
            />
          )
        })}
      </div>

      {/* Legend List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {data.map(item => {
          const pct = Math.round((item.jumlah / total) * 100)
          return (
            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.warna, flexShrink: 0 }} />
              <span style={{ color: '#334155', flex: 1 }}>{item.label}</span>
              <strong style={{ color: '#0f172a' }}>{item.jumlah} ({pct}%)</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 4. ProduksiChart ────────────────────────────────────────────────────────

export function ProduksiChart({ data }: { data: ProduksiPerBulan[] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>Belum ada data panen pada tahun ini.</p>
  }

  const maxVal = Math.max(...data.map(d => d.produksiKg), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', paddingTop: '20px', paddingBottom: '8px' }}>
      {data.map((item, idx) => {
        const heightPct = Math.round((item.produksiKg / maxVal) * 130)
        return (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              {item.produksiKg > 0 ? `${(item.produksiKg / 1000).toFixed(1)}t` : '0'}
            </span>
            <div
              style={{
                width: '100%',
                maxWidth: '28px',
                height: `${Math.max(heightPct, 6)}px`,
                backgroundColor: item.produksiKg > 0 ? '#f59e0b' : '#e2e8f0',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.4s ease',
              }}
              title={`${item.bulan}: ${item.produksiKg.toLocaleString('id-ID')} kg (${item.jumlahPanen} sesi)`}
            />
            <span style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {item.bulan.split(' ')[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── 5. RingkasanProduksi ────────────────────────────────────────────────────

export function RingkasanProduksi({ data }: { data: DistribusiKelompok[] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>Belum ada data produksi.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
      {data.map(item => (
        <div
          key={item.id}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #edf2f7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{item.nama}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Wilayah: {item.wilayah}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#b45309' }}>
              {(item.produksiKg / 1000).toFixed(2)} Ton
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {item.produksiKg.toLocaleString('id-ID')} kg
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 6. MusimNearHarvestList ─────────────────────────────────────────────────

export function MusimNearHarvestList({ data }: { data: MusimMendekatiPanen[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 16px', color: '#94a3b8', fontSize: '13px' }}>
        <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
        <span>Tidak ada musim tanam yang mendekati panen dalam 30 hari ke depan.</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
      {data.map(item => (
        <div
          key={item.id}
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e' }}>{item.namaMusim}</div>
            <div style={{ fontSize: '11px', color: '#78350f' }}>
              Petani: {item.petaniNama} &middot; Varietas: {item.varietasPadi}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                backgroundColor: item.hariMenujuPanen <= 7 ? '#ef4444' : '#f59e0b',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {item.hariMenujuPanen <= 0 ? 'Hari Ini' : `${item.hariMenujuPanen} Hari Lagi`}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 7. AktivitasTerbaruList ─────────────────────────────────────────────────

export function AktivitasTerbaruList({ data }: { data: AktivitasTerbaru[] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '13px', padding: '16px', textAlign: 'center' }}>Belum ada catatan aktivitas.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
      {data.map(act => (
        <div
          key={act.id}
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Activity size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>{act.jenisAktivitas}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{act.tanggal}</span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
              {act.petaniNama} ({act.lahanNama}) &middot; {act.deskripsi}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}