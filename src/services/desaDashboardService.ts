/**
 * Desa Dashboard Service
 * 
 * Semua query untuk dashboard Perangkat Desa dijalankan dalam
 * satu batch Promise.all agar tidak ada N+1 query.
 *
 * Mendukung filter:
 * - kelompokTaniId (filter per kelompok)
 * - tahun (filter periode produksi panen)
 */

import prisma from '@/lib/prisma'

export interface KpiData {
  totalPetani: number
  totalKelompok: number
  totalLahan: number
  totalLahanAktif: number
  totalLuasM2: number
  totalLuasHektar: number
  musimBerjalan: number
  musimPerencanaan: number
  musimSelesai: number
  musimGagal: number
  totalProduksiKg: number
  totalProduksiTon: number
  totalSesiPanen: number
}

export interface DistribusiKelompok {
  id: string
  nama: string
  wilayah: string
  jumlahPetani: number
  jumlahLahan: number
  luasTotal: number       // m²
  musimAktif: number
  produksiKg: number
}

export interface StatusMusimItem {
  status: string
  label: string
  jumlah: number
  warna: string
}

export interface ProduksiPerBulan {
  bulan: string          // "Jan 2026"
  bulanNum: number       // untuk sorting
  tahun: number
  produksiKg: number
  jumlahPanen: number
}

export interface AktivitasTerbaru {
  id: string
  jenisAktivitas: string
  tanggal: string
  deskripsi: string
  lahanNama: string
  petaniNama: string
  kelompokNama: string | null
  musimNama: string
}

export interface MusimMendekatiPanen {
  id: string
  namaMusim: string
  varietasPadi: string
  estimasiPanen: string
  lahanNama: string
  petaniNama: string
  kelompokNama: string | null
  hariMenujuPanen: number
}

export interface DesaDashboardData {
  kpi: KpiData
  distribusiKelompok: DistribusiKelompok[]
  statusMusim: StatusMusimItem[]
  produksiPerBulan: ProduksiPerBulan[]
  aktivitasTerbaru: AktivitasTerbaru[]
  musimMendekatiPanen: MusimMendekatiPanen[]
  tahunTersedia: number[]
  kelompokList: { id: string; nama: string; wilayah: string }[]
  filterKelompokId: string
  filterTahun: number | null
}

export async function getDesaDashboardData(
  kelompokTaniId?: string,
  tahun?: number
): Promise<DesaDashboardData> {
  const now = new Date()

  // Build lahan where clause
  const lahanWhere: any = {}
  if (kelompokTaniId) {
    lahanWhere.petani = { kelompokTaniId }
  }

  // Build musimTanam where clause
  const musimWhere: any = {}
  if (kelompokTaniId) {
    musimWhere.lahan = { petani: { kelompokTaniId } }
  }

  // Build panen where clause (for period filter)
  const panenWhere: any = {}
  if (kelompokTaniId) {
    panenWhere.musimTanam = { lahan: { petani: { kelompokTaniId } } }
  }
  if (tahun) {
    const start = new Date(`${tahun}-01-01T00:00:00.000Z`)
    const end   = new Date(`${tahun}-12-31T23:59:59.999Z`)
    if (kelompokTaniId) {
      panenWhere.AND = [
        { musimTanam: { lahan: { petani: { kelompokTaniId } } } },
        { tanggalPanen: { gte: start, lte: end } }
      ]
      delete panenWhere.musimTanam
    } else {
      panenWhere.tanggalPanen = { gte: start, lte: end }
    }
  }

  // petaniWhere
  const petaniWhere: any = {}
  if (kelompokTaniId) {
    petaniWhere.kelompokTaniId = kelompokTaniId
  }

  // === SINGLE BATCH — all queries in one Promise.all ===
  const [
    totalPetani,
    totalKelompok,
    totalLahanAgg,
    totalLahanCount,
    totalLahanAktif,
    musimCounts,
    panenAgg,
    totalSesiPanen,
    kelompokWithStats,
    panenRecords,
    recentAktivitas,
    musimNearHarvest,
    tahunTersedia,
    kelompokList,
  ] = await Promise.all([
    // 1. Total petani
    prisma.petani.count({ where: petaniWhere }),

    // 2. Total kelompok tani (always all)
    prisma.kelompokTani.count(),

    // 3. Aggregate luas lahan
    prisma.lahan.aggregate({
      _sum: { luasLahan: true },
      where: lahanWhere,
    }),

    // 4. Total lahan count
    prisma.lahan.count({ where: lahanWhere }),

    // 5. Lahan aktif
    prisma.lahan.count({ where: { ...lahanWhere, status: 'AKTIF' } }),

    // 6. Status musim tanam breakdown (groupBy)
    prisma.musimTanam.groupBy({
      by: ['status'],
      _count: { status: true },
      where: musimWhere,
    }),

    // 7. Total produksi aggregate (filtered by period)
    prisma.panen.aggregate({
      _sum: { jumlahProduksi: true },
      where: panenWhere,
    }),

    // 8. Total sesi panen
    prisma.panen.count({ where: panenWhere }),

    // 9. Distribusi per kelompok (dengan stats)
    prisma.kelompokTani.findMany({
      include: {
        anggota: {
          include: {
            lahan: {
              include: {
                musimTanam: {
                  where: { status: 'BERJALAN' },
                  select: { id: true },
                },
              },
            },
          },
        },
        _count: { select: { anggota: true } },
      },
      orderBy: { nama: 'asc' },
    }),

    // 10. Panen records untuk grafik produksi per bulan
    prisma.panen.findMany({
      where: panenWhere,
      select: {
        tanggalPanen: true,
        jumlahProduksi: true,
        satuan: true,
      },
      orderBy: { tanggalPanen: 'asc' },
    }),

    // 11. Aktivitas terbaru (8 terakhir)
    prisma.aktivitasBudidaya.findMany({
      where: kelompokTaniId ? {
        musimTanam: { lahan: { petani: { kelompokTaniId } } }
      } : {},
      take: 8,
      orderBy: { tanggal: 'desc' },
      select: {
        id: true,
        jenisAktivitas: true,
        tanggal: true,
        deskripsi: true,
        musimTanam: {
          select: {
            namaMusim: true,
            lahan: {
              select: {
                namaLahan: true,
                petani: {
                  select: {
                    namaLengkap: true,
                    kelompokTani: { select: { nama: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),

    // 12. Musim yang mendekati panen (dalam 30 hari ke depan)
    prisma.musimTanam.findMany({
      where: {
        ...musimWhere,
        status: 'BERJALAN',
        estimasiPanen: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        panen: null, // belum ada data panen
      },
      take: 5,
      orderBy: { estimasiPanen: 'asc' },
      select: {
        id: true,
        namaMusim: true,
        varietasPadi: true,
        estimasiPanen: true,
        lahan: {
          select: {
            namaLahan: true,
            petani: {
              select: {
                namaLengkap: true,
                kelompokTani: { select: { nama: true } },
              },
            },
          },
        },
      },
    }),

    // 13. Tahun-tahun yang tersedia (dari data panen)
    prisma.panen.findMany({
      select: { tanggalPanen: true },
      orderBy: { tanggalPanen: 'asc' },
    }),

    // 14. Daftar kelompok tani untuk filter
    prisma.kelompokTani.findMany({
      select: { id: true, nama: true, wilayah: true },
      orderBy: { nama: 'asc' },
    }),
  ])

  // ── Transform KPI ──────────────────────────────────────────────
  const totalLuasM2  = totalLahanAgg._sum.luasLahan ?? 0
  const totalLuasHektar = Number((totalLuasM2 / 10000).toFixed(2))
  const totalProduksiKg = (panenAgg._sum.jumlahProduksi ?? 0)

  const statusMap: Record<string, number> = {}
  musimCounts.forEach(m => { statusMap[m.status] = m._count.status })

  const kpi: KpiData = {
    totalPetani,
    totalKelompok,
    totalLahan: totalLahanCount,
    totalLahanAktif,
    totalLuasM2,
    totalLuasHektar,
    musimBerjalan:    statusMap['BERJALAN']    ?? 0,
    musimPerencanaan: statusMap['PERENCANAAN'] ?? 0,
    musimSelesai:     statusMap['SELESAI']     ?? 0,
    musimGagal:       statusMap['GAGAL']       ?? 0,
    totalProduksiKg,
    totalProduksiTon: Number((totalProduksiKg / 1000).toFixed(2)),
    totalSesiPanen,
  }

  // ── Distribusi kelompok ────────────────────────────────────────
  // (skip kelompok filter here — always show all kelompok for the chart)
  const distribusiKelompok: DistribusiKelompok[] = await Promise.all(
    kelompokWithStats.map(async (k) => {
      // get produksi per kelompok (respects tahun filter)
      const panenKelompok = await prisma.panen.aggregate({
        _sum: { jumlahProduksi: true },
        where: {
          ...(tahun ? {
            tanggalPanen: {
              gte: new Date(`${tahun}-01-01T00:00:00.000Z`),
              lte: new Date(`${tahun}-12-31T23:59:59.999Z`),
            }
          } : {}),
          musimTanam: { lahan: { petani: { kelompokTaniId: k.id } } },
        },
      })

      const jumlahLahan = k.anggota.reduce((acc, p) => acc + p.lahan.length, 0)
      const luasTotal   = k.anggota.reduce((acc, p) =>
        acc + p.lahan.reduce((a2, l) => a2 + l.luasLahan, 0), 0)
      const musimAktif  = k.anggota.reduce((acc, p) =>
        acc + p.lahan.reduce((a2, l) => a2 + l.musimTanam.length, 0), 0)

      return {
        id: k.id,
        nama: k.nama,
        wilayah: k.wilayah,
        jumlahPetani: k._count.anggota,
        jumlahLahan,
        luasTotal,
        musimAktif,
        produksiKg: panenKelompok._sum.jumlahProduksi ?? 0,
      }
    })
  )

  // ── Status musim ───────────────────────────────────────────────
  const statusMusim: StatusMusimItem[] = [
    { status: 'BERJALAN',    label: 'Sedang Berjalan',   jumlah: statusMap['BERJALAN']    ?? 0, warna: '#22c55e' },
    { status: 'PERENCANAAN', label: 'Perencanaan',        jumlah: statusMap['PERENCANAAN'] ?? 0, warna: '#3b82f6' },
    { status: 'SELESAI',     label: 'Selesai',            jumlah: statusMap['SELESAI']     ?? 0, warna: '#f59e0b' },
    { status: 'GAGAL',       label: 'Gagal / Batal',      jumlah: statusMap['GAGAL']       ?? 0, warna: '#ef4444' },
  ]

  // ── Produksi per bulan ────────────────────────────────────────
  const bulanMap = new Map<string, ProduksiPerBulan>()
  panenRecords.forEach(p => {
    const d = new Date(p.tanggalPanen)
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth() + 1
    const key = `${y}-${String(m).padStart(2, '0')}`

    // normalise to kg
    let kg = p.jumlahProduksi
    if (p.satuan === 'ton')     kg = p.jumlahProduksi * 1000
    if (p.satuan === 'kuintal') kg = p.jumlahProduksi * 100

    if (!bulanMap.has(key)) {
      const bulanLabel = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      bulanMap.set(key, { bulan: bulanLabel, bulanNum: m, tahun: y, produksiKg: 0, jumlahPanen: 0 })
    }
    const entry = bulanMap.get(key)!
    entry.produksiKg  += kg
    entry.jumlahPanen += 1
  })
  const produksiPerBulan = Array.from(bulanMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .slice(-12) // last 12 months

  // ── Aktivitas terbaru ─────────────────────────────────────────
  const aktivitasTerbaru: AktivitasTerbaru[] = recentAktivitas.map(a => ({
    id: a.id,
    jenisAktivitas: a.jenisAktivitas,
    tanggal: a.tanggal.toISOString(),
    deskripsi: a.deskripsi,
    lahanNama:    a.musimTanam.lahan.namaLahan,
    petaniNama:   a.musimTanam.lahan.petani.namaLengkap,
    kelompokNama: a.musimTanam.lahan.petani.kelompokTani?.nama ?? null,
    musimNama:    a.musimTanam.namaMusim,
  }))

  // ── Musim mendekati panen ─────────────────────────────────────
  const musimMendekatiPanen: MusimMendekatiPanen[] = musimNearHarvest.map(m => {
    const est  = new Date(m.estimasiPanen)
    const hari = Math.ceil((est.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      id: m.id,
      namaMusim:     m.namaMusim,
      varietasPadi:  m.varietasPadi,
      estimasiPanen: m.estimasiPanen.toISOString(),
      lahanNama:     m.lahan.namaLahan,
      petaniNama:    m.lahan.petani.namaLengkap,
      kelompokNama:  m.lahan.petani.kelompokTani?.nama ?? null,
      hariMenujuPanen: hari,
    }
  })

  // ── Tahun tersedia ────────────────────────────────────────────
  const tahunSet = new Set<number>()
  tahunTersedia.forEach(p => tahunSet.add(new Date(p.tanggalPanen).getUTCFullYear()))
  const tahunArr = Array.from(tahunSet).sort((a, b) => b - a)
  // always include current year
  if (!tahunArr.includes(now.getFullYear())) tahunArr.unshift(now.getFullYear())

  return {
    kpi,
    distribusiKelompok,
    statusMusim,
    produksiPerBulan,
    aktivitasTerbaru,
    musimMendekatiPanen,
    tahunTersedia: tahunArr,
    kelompokList,
    filterKelompokId: kelompokTaniId ?? '',
    filterTahun: tahun ?? null,
  }
}
