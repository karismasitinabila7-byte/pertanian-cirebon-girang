import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import FarmMap from '@/components/features/Map/FarmMapWrapper'
import {
  Map,
  Compass,
  Layers,
  Sprout,
  Wheat,
  Users,
  MapPin,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react'

export const metadata = {
  title: 'Peta Interaktif Lahan GIS | SI PADI Cirebon Girang',
  description: 'Peta sebaran geospasial petak lahan pertanian padi di wilayah Desa Cirebon Girang.',
}

export default async function PetaLahanPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Ambil seluruh data lahan dengan relasi petani, kelompok tani, dan musim tanam
  const allLahan = await prisma.lahan.findMany({
    include: {
      petani: {
        select: {
          id: true,
          userId: true,
          namaLengkap: true,
          nomorTelepon: true,
          alamat: true,
          kelompokTani: {
            select: {
              id: true,
              nama: true,
              wilayah: true,
              ketua: true
            }
          }
        }
      },
      musimTanam: {
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          namaMusim: true,
          varietasPadi: true,
          tanggalTanam: true,
          estimasiPanen: true,
          status: true,
          panen: {
            select: {
              jumlahProduksi: true,
              satuan: true,
              tanggalPanen: true
            }
          }
        }
      }
    },
    orderBy: { namaLahan: 'asc' }
  })

  // Format data untuk peta
  const formattedPlots = allLahan.map((l) => {
    const activeMusim = l.musimTanam.find((m) => m.status === 'BERJALAN') || l.musimTanam[0] || null
    const isOwned = session.role === 'PETANI' && l.petani?.userId === session.userId

    return {
      id: l.id,
      namaLahan: l.namaLahan,
      luasLahan: l.luasLahan,
      satuanLuas: l.satuanLuas,
      luasHektar: Number((l.luasLahan / 10000).toFixed(2)),
      lokasi: l.lokasi,
      latitude: l.latitude,
      longitude: l.longitude,
      status: l.status,
      catatan: l.catatan,
      isOwned,
      petani: l.petani,
      musimAktif: activeMusim
        ? {
            ...activeMusim,
            tanggalTanam: activeMusim.tanggalTanam.toISOString(),
            estimasiPanen: activeMusim.estimasiPanen.toISOString()
          }
        : null
    }
  })

  const totalLuasM2 = allLahan.reduce((sum, l) => sum + (l.luasLahan || 0), 0)
  const totalLuasHa = (totalLuasM2 / 10000).toFixed(2)
  const lahanDenganKoordinat = allLahan.filter((l) => l.latitude && l.longitude).length
  const totalMusimAktif = allLahan.filter((l) =>
    l.musimTanam.some((m) => m.status === 'BERJALAN')
  ).length

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Compass size={14} className="text-emerald-700" />
            <span>Sistem Informasi Geografis (GIS) Pertanian</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Peta Sebaran Lahan Sawah Desa Cirebon Girang
          </h1>
          <p className="mt-1 text-sm text-gray-600 max-w-3xl">
            Monitoring spasial persebaran petak sawah, kelompok tani pengelola, varietas padi unggul (Inpari 32, Ciherang, Mekongga), dan zonasi blok pertanian Desa Cirebon Girang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {session.role !== 'PERANGKAT_DESA' && (
            <Link
              href={session.role === 'ADMIN' ? '/admin/lahan' : '/petani/lahan'}
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition"
            >
              <Plus size={15} />
              <span>Daftarkan Lahan</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI Metric Highlights ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Titik Lahan Terdata</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {lahanDenganKoordinat} <span className="text-xs font-normal text-gray-500">Petak GIS</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MapPin size={20} />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 mt-2 font-medium">
            100% Terpetakan dengan koordinat GPS
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Luas Hamparan</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {totalLuasHa} <span className="text-xs font-normal text-gray-500">Hektar</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Layers size={20} />
            </div>
          </div>
          <p className="text-[11px] text-teal-700 mt-2 font-medium">
            {totalLuasM2.toLocaleString('id-ID')} m² lahan produktif
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Musim Aktif Tanam</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {totalMusimAktif} <span className="text-xs font-normal text-gray-500">Petak MT</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sprout size={20} />
            </div>
          </div>
          <p className="text-[11px] text-amber-700 mt-2 font-medium">
            Varietas dominan Inpari 32 & Ciherang
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Zonasi Blok Sawah</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                3 <span className="text-xs font-normal text-gray-500">Blok Dusun</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Compass size={20} />
            </div>
          </div>
          <p className="text-[11px] text-blue-700 mt-2 font-medium">
            Blok Manis, Blok Wage, Blok Pahing
          </p>
        </Card>
      </div>

      {/* ── Interactive GIS Map Component ── */}
      <FarmMap
        initialPlots={formattedPlots}
        height="640px"
        showControls={true}
      />

      {/* ── Directory Table: Ringkasan Seluruh Petak Lahan Terpetakan ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Katalog Petak Lahan & Koordinat Geospasial
            </h2>
            <p className="text-xs text-gray-500">
              Daftar lengkap lahan pertanian padi di wilayah administratif Desa Cirebon Girang
            </p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left">Nama Lahan & Lokasi</th>
                  <th scope="col" className="px-5 py-3 text-left">Petani & Poktan</th>
                  <th scope="col" className="px-5 py-3 text-left">Luas Petak</th>
                  <th scope="col" className="px-5 py-3 text-left">Koordinat GPS</th>
                  <th scope="col" className="px-5 py-3 text-left">Komoditas / MT</th>
                  <th scope="col" className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-xs">
                {formattedPlots.map((plot) => (
                  <tr key={plot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{plot.namaLahan}</span>
                        {plot.isOwned && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Saya
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-gray-400" />
                        {plot.lokasi}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800">{plot.petani?.namaLengkap || 'Petani Mandiri'}</div>
                      <div className="text-emerald-700 text-[11px] font-medium">
                        {plot.petani?.kelompokTani?.nama || '-'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-gray-900">{plot.luasHektar} Ha</span>
                      <span className="text-gray-400 text-[11px] block">{plot.luasLahan.toLocaleString('id-ID')} m²</span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-gray-600">
                      {plot.latitude && plot.longitude ? (
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {plot.latitude.toFixed(4)}, {plot.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Belum disetel</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {plot.musimAktif ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                            <Sprout size={11} className="text-teal-600" />
                            {plot.musimAktif.varietasPadi}
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Status: {plot.musimAktif.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Masa Bera / Istirahat</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/lahan/${plot.id}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline"
                      >
                        Detail <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
