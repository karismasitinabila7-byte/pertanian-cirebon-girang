import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import {
  Sprout,
  Map,
  Tractor,
  Wheat,
  Bot,
  Users,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Droplets,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  Compass,
  BookOpen
} from 'lucide-react'
import { EarlyWarningWidget } from '@/components/features/Notifications/EarlyWarningWidget'
import { AgroWeatherWidget } from '@/components/features/Weather/AgroWeatherWidget'

export const metadata = {
  title: 'Dashboard Petani | SI PADI Cirebon Girang',
  description: 'Beranda dan manajemen budidaya padi untuk Petani Desa Cirebon Girang',
}

export default async function PetaniDashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Cari data petani terkait user yang sedang login
  let petani = await prisma.petani.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      kelompokTani: true,
      lahan: {
        include: {
          musimTanam: {
            orderBy: { createdAt: 'desc' },
            include: {
              panen: true,
              aktivitas: {
                orderBy: { tanggal: 'desc' },
                take: 1
              }
            }
          }
        }
      }
    }
  })

  // Fallback demo jika user bukan petani atau belum punya relasi petani
  if (!petani) {
    petani = await prisma.petani.findFirst({
      include: {
        user: true,
        kelompokTani: true,
        lahan: {
          include: {
            musimTanam: {
              orderBy: { createdAt: 'desc' },
              include: {
                panen: true,
                aktivitas: {
                  orderBy: { tanggal: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    })
  }

  const allLahan = petani?.lahan || []
  const lahanAktif = allLahan.filter((l) => l.status === 'AKTIF')
  const totalLuasM2 = allLahan.reduce((sum, l) => sum + (l.luasLahan || 0), 0)
  const totalLuasHektar = (totalLuasM2 / 10000).toFixed(2)

  // Kumpulkan semua musim tanam
  const allMusim = allLahan.flatMap((l) => l.musimTanam)
  const musimBerjalan = allMusim.filter((m) => m.status === 'BERJALAN')
  const musimPerencanaan = allMusim.filter((m) => m.status === 'PERENCANAAN')

  // Kumpulkan seluruh aktivitas terbaru dari lahan milik petani
  const aktivitasTerbaru = await prisma.aktivitasBudidaya.findMany({
    where: {
      musimTanam: {
        lahan: {
          petaniId: petani?.id || 'none'
        }
      }
    },
    take: 5,
    orderBy: { tanggal: 'desc' },
    include: {
      musimTanam: {
        include: { lahan: true }
      }
    }
  }).catch(() => [])

  // Kumpulkan total panen milik petani
  const panenList = await prisma.panen.findMany({
    where: {
      musimTanam: {
        lahan: {
          petaniId: petani?.id || 'none'
        }
      }
    },
    include: {
      musimTanam: {
        include: { lahan: true }
      }
    }
  }).catch(() => [])

  const totalProduksiKg = panenList.reduce((sum, p) => sum + (p.jumlahProduksi || 0), 0)

  // Estimasi hari menuju panen terdekat
  let panenTerdekat = null
  let sisaHariPanen: number | null = null
  if (musimBerjalan.length > 0) {
    const sorted = [...musimBerjalan].sort((a, b) => new Date(a.estimasiPanen).getTime() - new Date(b.estimasiPanen).getTime())
    panenTerdekat = sorted[0]
    const diffMs = new Date(panenTerdekat.estimasiPanen).getTime() - Date.now()
    sisaHariPanen = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src="/avatars/petani.jpg"
              alt={petani?.namaLengkap || 'Bapak Sukardi'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-300 shadow-md flex-shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-900/60 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-2">
                <Sprout size={14} className="text-emerald-400" />
                <span>Portal Mandiri Petani Padi Desa Cirebon Girang</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Selamat Datang, {petani?.namaLengkap || session.username}! 🌾
              </h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
                Kelola lahan sawah Anda, catat tahapan pemupukan dan pengairan, pantau perkiraan jadwal panen, dan konsultasikan masalah tanaman padi dengan AI.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-emerald-200">
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                  <Users size={14} />
                  {petani?.kelompokTani?.nama || 'Kelompok Tani Sri Rejeki'} ({petani?.kelompokTani?.wilayah || 'Blok Manis'})
                </span>
                {petani?.nomorTelepon && (
                  <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md">
                    <Phone size={14} />
                    {petani.nomorTelepon}
                  </span>
                )}
                {petani?.nik && (
                  <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-md font-mono">
                    NIK: {petani.nik}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
            <Link
              href="/petani/lahan"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow transition"
            >
              <Plus size={16} />
              Tambah Petak Lahan
            </Link>
            <Link
              href="/ai"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow transition border border-emerald-400/30"
            >
              <Bot size={16} />
              Tanya AI Pertanian
            </Link>
          </div>
        </div>

        {/* Background decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-40 h-40 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* ── Early Warning System Widget ── */}
      <EarlyWarningWidget role="PETANI" />

      {/* ── Agro-Climatic Weather Forecast & Agricultural Advisory Widget ── */}
      <AgroWeatherWidget role="PETANI" />

      {/* ── KPI Cards Petani ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lahan */}
        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lahan Sawah Saya</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {allLahan.length} <span className="text-sm font-normal text-gray-500">Petak</span>
              </h3>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                {lahanAktif.length} petak aktif ({totalLuasHektar} Ha / {totalLuasM2.toLocaleString('id-ID')} m²)
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Map size={24} />
            </div>
          </div>
        </Card>

        {/* Musim Tanam Berjalan */}
        <Card className="p-5 border-l-4 border-l-teal-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Musim Berjalan</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {musimBerjalan.length} <span className="text-sm font-normal text-gray-500">Musim</span>
              </h3>
              <p className="text-xs text-teal-700 mt-1 font-medium truncate max-w-[180px]">
                {musimBerjalan[0]?.varietasPadi ? `Varietas ${musimBerjalan[0].varietasPadi}` : 'Sedang dalam penanaman'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <Sprout size={24} />
            </div>
          </div>
        </Card>

        {/* Estimasi Panen */}
        <Card className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prediksi Panen</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {sisaHariPanen !== null ? (
                  <>
                    {sisaHariPanen} <span className="text-sm font-normal text-gray-500">Hari Lagi</span>
                  </>
                ) : (
                  <span className="text-lg text-gray-400">Belum Ada MT</span>
                )}
              </h3>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                {panenTerdekat ? new Date(panenTerdekat.estimasiPanen).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Jadwal panen terdekat'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock size={24} />
            </div>
          </div>
        </Card>

        {/* Total Hasil Panen */}
        <Card className="p-5 border-l-4 border-l-yellow-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Hasil Panen</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {totalProduksiKg >= 1000 ? (
                  <>
                    {(totalProduksiKg / 1000).toFixed(1)} <span className="text-sm font-normal text-gray-500">Ton</span>
                  </>
                ) : (
                  <>
                    {totalProduksiKg.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">kg</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-yellow-700 mt-1 font-medium">
                Dari {panenList.length} kali periode panen
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-700">
              <Wheat size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Quick Action Grid ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>Akses Cepat Fitur Petani</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <Link
            href="/petani/lahan"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-sm transition group text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Map size={18} />
            </div>
            <span className="text-xs font-bold text-gray-800">Lahan Saya</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{allLahan.length} Petak</span>
          </Link>

          <Link
            href="/peta"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-emerald-300 hover:border-emerald-500 hover:shadow-sm transition group text-center bg-gradient-to-b from-emerald-50/40 to-white"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-xs">
              <Compass size={18} />
            </div>
            <span className="text-xs font-bold text-emerald-900">Peta GIS</span>
            <span className="text-[10px] text-emerald-700 mt-0.5">Sebaran Lahan</span>
          </Link>

          <Link
            href="/petani/musim-tanam"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-sm transition group text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Sprout size={18} />
            </div>
            <span className="text-xs font-bold text-gray-800">Musim Tanam</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{allMusim.length} Periode MT</span>
          </Link>

          <Link
            href="/petani/aktivitas"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:border-amber-500 hover:shadow-sm transition group text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Tractor size={18} />
            </div>
            <span className="text-xs font-bold text-gray-800">Aktivitas Tani</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Pupuk, Semprot</span>
          </Link>

          <Link
            href="/petani/panen"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:border-yellow-500 hover:shadow-sm transition group text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-yellow-50 text-yellow-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Wheat size={18} />
            </div>
            <span className="text-xs font-bold text-gray-800">Hasil Panen</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{panenList.length} Catatan</span>
          </Link>

          <Link
            href="/edukasi"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-blue-200 hover:border-blue-500 hover:shadow-sm transition group text-center bg-gradient-to-b from-blue-50/40 to-white"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition shadow-xs">
              <BookOpen size={18} />
            </div>
            <span className="text-xs font-bold text-blue-900">Edukasi Tani</span>
            <span className="text-[10px] text-blue-700 mt-0.5">Panduan Hama</span>
          </Link>

          <Link
            href="/petani/kelompok-tani"
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-sm transition group text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Users size={18} />
            </div>
            <span className="text-xs font-bold text-gray-800">Kelompok Tani</span>
            <span className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[85px]">{petani?.kelompokTani?.nama || 'Poktan Desa'}</span>
          </Link>

          <Link
            href="/ai"
            className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl border border-emerald-600 hover:shadow-md transition group text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Bot size={18} />
            </div>
            <span className="text-xs font-bold text-white">AI Konsultasi</span>
            <span className="text-[10px] text-emerald-100 mt-0.5">Solusi Cepat</span>
          </Link>
        </div>
      </div>

      {/* ── Dua Kolom Utama: Lahan Aktif & Aktivitas Terbaru ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Petak Lahan & Musim Tanam Aktif */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Map size={18} className="text-emerald-700" />
              <span>Daftar Petak Lahan Milik Saya</span>
            </h2>
            <Link href="/petani/lahan" className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
              Lihat Semua Lahan <ArrowRight size={12} />
            </Link>
          </div>

          {allLahan.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50 border-dashed">
              <Map className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">Belum Ada Petak Lahan</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Daftarkan petak sawah yang Anda kelola untuk memulai mencatat musim tanam dan jadwal perawatan.
              </p>
              <Link
                href="/petani/lahan"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
              >
                <Plus size={14} /> Tambah Lahan Baru
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {allLahan.map((lahan) => {
                const activeSeason = lahan.musimTanam.find((m) => m.status === 'BERJALAN')
                return (
                  <Card key={lahan.id} className="p-4 hover:border-emerald-400 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{lahan.namaLahan}</h3>
                          {lahan.status === 'AKTIF' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Aktif
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Tidak Aktif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-gray-400" />
                            {lahan.lokasi}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-gray-700">
                            {lahan.luasLahan.toLocaleString('id-ID')} {lahan.satuanLuas || 'm²'}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        {activeSeason ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md">
                              <Sprout size={12} className="text-teal-600" />
                              {activeSeason.namaMusim} ({activeSeason.varietasPadi})
                            </span>
                            <p className="text-[11px] text-gray-500 mt-1">
                              Estimasi Panen: {new Date(activeSeason.estimasiPanen).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        ) : (
                          <Link
                            href={`/petani/musim-tanam?lahanId=${lahan.id}`}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1"
                          >
                            <Plus size={13} /> Mulai Musim Tanam
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* ── Tips Budidaya Padi dari AI ── */}
          <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900">
                  Rekomendasi Budidaya Padi Musim Rendeng Cirebon Girang
                </h3>
                <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                  Pada musim tanam ini, waspadai serangan <strong>Wereng Batang Coklat (WBC)</strong> dan penyakit kresek (BLB) akibat kelembapan tinggi.
                  Terapkan pengairan berselang (<em>intermittent/macak-macak</em>) dan berikan pupuk berimbang sesuai anjuran kelompok tani.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href="/ai"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <Bot size={14} /> Konsultasi Gejala ke AI &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Aktivitas Terakhir & Hasil Panen */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Tractor size={18} className="text-amber-600" />
              <span>Aktivitas Budidaya Terbaru</span>
            </h2>
            <Link href="/petani/aktivitas" className="text-xs font-semibold text-emerald-700 hover:underline">
              Semua
            </Link>
          </div>

          <Card className="p-4">
            {aktivitasTerbaru.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs">
                Belum ada catatan aktivitas budidaya.
                <div className="mt-2">
                  <Link
                    href="/petani/aktivitas"
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    + Catat Aktivitas Baru
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {aktivitasTerbaru.map((akt: any) => (
                  <div key={akt.id} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-gray-800">
                        {akt.jenisAktivitas}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(akt.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {akt.deskripsi}
                    </p>
                    {akt.bahan && (
                      <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                        Bahan: {akt.bahan}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Profil Kelompok Tani */}
          <Card className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Users size={14} className="text-slate-600" />
              Kelompok Tani Anda
            </h3>
            <div className="text-sm font-bold text-slate-900">
              {petani?.kelompokTani?.nama || 'Poktan Sri Rejeki'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Ketua Poktan: <strong>{petani?.kelompokTani?.ketua || 'Bapak Sutarjo'}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Wilayah: {petani?.kelompokTani?.wilayah || 'Dusun Karang Anyar / Blok Manis'}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">Kontak Pengurus:</span>
              <span className="font-semibold text-slate-700">
                {petani?.kelompokTani?.nomorKontak || '0813-9988-7766'}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}