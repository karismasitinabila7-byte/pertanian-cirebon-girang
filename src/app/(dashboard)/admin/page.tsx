import prisma from '@/lib/prisma'
import { Card } from '@/components/ui/Card'
import {
  Users,
  UserCircle,
  Map,
  Tractor,
  Users as UsersIcon,
  Sprout,
  Wheat,
  UserCheck,
  Bot,
  ArrowRight,
  ShieldCheck,
  LineChart,
  Compass,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { EarlyWarningWidget } from '@/components/features/Notifications/EarlyWarningWidget'
import { AdminAgriculturalTrends, SeasonTrendData, SuccessRateData } from '@/components/features/AdminCharts/AdminAgriculturalTrends'

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const [
    totalUsers,
    totalPetani,
    totalKelompok,
    totalLahanObj,
    totalLahanCount,
    lahanAktifCount,
    musimAktif,
    totalAktivitas,
    totalPanenObj,
    recentActivities,
    musimList,
    panenList
  ] = await Promise.all([
    prisma.user.count(),
    prisma.petani.count(),
    prisma.kelompokTani.count(),
    prisma.lahan.aggregate({ _sum: { luasLahan: true } }),
    prisma.lahan.count(),
    prisma.lahan.count({ where: { status: 'AKTIF' } }),
    prisma.musimTanam.count({ where: { status: 'BERJALAN' } }),
    prisma.aktivitasBudidaya.count(),
    prisma.panen.aggregate({ _sum: { jumlahProduksi: true } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }).catch(() => []),
    prisma.musimTanam.findMany({
      include: {
        panen: true,
        lahan: true
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.panen.findMany({
      include: {
        musimTanam: {
          include: { lahan: true }
        }
      },
      orderBy: { tanggalPanen: 'desc' }
    })
  ])

  const totalLuasLahan = totalLahanObj._sum.luasLahan || 0
  const totalLuasHektar = (totalLuasLahan / 10000).toFixed(2)
  const totalProduksiKg = totalPanenObj._sum.jumlahProduksi || 0

  const stats = [
    { name: 'Total Pengguna', value: `${totalUsers}`, sub: 'Admin, Desa, Petani', icon: UserCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Petani', value: `${totalPetani}`, sub: 'Petani terdaftar', icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Kelompok Tani', value: `${totalKelompok}`, sub: 'Poktan Desa', icon: UsersIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Total Lahan Pertanian', value: `${totalLuasLahan.toLocaleString('id-ID')} m²`, sub: `≈ ${totalLuasHektar} Ha (${lahanAktifCount}/${totalLahanCount} Petak Aktif)`, icon: Map, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Musim Tanam Aktif', value: `${musimAktif}`, sub: 'Sedang berjalan', icon: Sprout, color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: 'Aktivitas Budidaya', value: `${totalAktivitas}`, sub: 'Total aktivitas tercatat', icon: Tractor, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Total Produksi Panen', value: totalProduksiKg >= 1000 ? `${(totalProduksiKg / 1000).toFixed(2)} Ton` : `${totalProduksiKg.toLocaleString('id-ID')} kg`, sub: 'Seluruh musim tanam', icon: Wheat, color: 'text-yellow-700', bg: 'bg-yellow-100' },
  ]

  // Hitung Success Rate dari data database aktual
  const selesaiCount = musimList.filter(m => m.status === 'SELESAI').length
  const berjalanCount = musimList.filter(m => m.status === 'BERJALAN').length
  const rencanaCount = musimList.filter(m => m.status === 'PERENCANAAN').length
  const gagalCount = musimList.filter(m => m.status === 'GAGAL').length

  const successRateData: SuccessRateData = {
    selesai: selesaiCount,
    berjalan: berjalanCount,
    perencanaan: rencanaCount,
    gagal: gagalCount,
    total: musimList.length
  }

  // Siapkan data tren per musim tanam
  const trendData: SeasonTrendData[] = musimList.map(m => {
    let prodTon = 0
    if (m.panen) {
      if (m.panen.satuan === 'ton') prodTon = m.panen.jumlahProduksi
      else if (m.panen.satuan === 'kuintal') prodTon = m.panen.jumlahProduksi / 10
      else prodTon = m.panen.jumlahProduksi / 1000
    } else {
      // Perkiraan estimasi untuk musim berjalan (sekitar 6 ton/ha)
      const luas = m.lahan ? m.lahan.luasLahan / 10000 : 1.5
      prodTon = Number((luas * 6.5).toFixed(1))
    }

    const luasHa = m.lahan ? Number((m.lahan.luasLahan / 10000).toFixed(2)) : 1.5
    const targetTon = Number((luasHa * 6.0).toFixed(1))
    const produktivitasTonHa = luasHa > 0 ? Number((prodTon / luasHa).toFixed(2)) : 6.0

    return {
      namaMusim: m.namaMusim,
      varietas: m.varietasPadi,
      produksiTon: Number(prodTon.toFixed(1)),
      targetTon,
      luasHa,
      produktivitasTonHa,
      status: m.status,
      tahun: new Date(m.tanggalTanam).getFullYear().toString()
    }
  })

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrator</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pusat kendali, monitoring statistik, dan manajemen platform SI PADI Desa Cirebon Girang.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/peta"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
          >
            <Compass size={15} />
            <span>Peta GIS Lahan</span>
          </Link>
          <Link
            href="/edukasi"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition"
          >
            <BookOpen size={15} />
            <span>Edukasi Tani</span>
          </Link>
          <Link
            href="/admin/users"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition"
          >
            <UserCheck size={15} />
            <span>Manajemen Pengguna</span>
          </Link>
          <Link
            href="/ai"
            prefetch={true}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition"
          >
            <Bot size={15} />
            <span>AI Supervisi</span>
          </Link>
        </div>
      </div>

      {/* ── Admin Profile Card ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src="/avatars/admin.jpg"
            alt="Administrator"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{session?.fullName || 'Karisma Siti Nabila'}</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Administrator Sistem</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Pengelola & Pengembang Platform SI PADI · Desa Cirebon Girang</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 inline-flex items-center gap-1"
          >
            <span>{totalUsers} Pengguna Aktif</span>
            <ArrowRight size={12} />
          </Link>
          <Link
            href="/admin/profil"
            className="text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
          >
            Profil Akun
          </Link>
          <Link
            href="/admin/konfigurasi"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs transition"
          >
            <span>⚙️ Konfigurasi Sistem</span>
          </Link>
        </div>
      </div>

      {/* ── Early Warning System Widget ── */}
      <EarlyWarningWidget role="ADMIN" />

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <div className="p-5 flex items-center">
              <div className={`flex-shrink-0 rounded-xl p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-semibold text-gray-500 truncate uppercase">{item.name}</dt>
                  <dd className="text-2xl font-extrabold text-gray-900 mt-0.5">{item.value}</dd>
                  {item.sub && <dd className="text-[11px] text-gray-500 mt-0.5">{item.sub}</dd>}
                </dl>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Grafik Analisis Tren Pertanian Padi (Requirement 2.2) ── */}
      <AdminAgriculturalTrends trendData={trendData} successData={successRateData} />

      {/* ── Aktivitas Audit Log Terbaru ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Aktivitas & Log Sistem Terbaru</h2>
          <span className="text-xs text-gray-500">Pencatatan Audit Trail</span>
        </div>
        <Card className="overflow-hidden">
          {recentActivities.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentActivities.map((log: any) => (
                <li key={log.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          <span className="text-emerald-700 font-bold">{log.action}</span> - {log.entity}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">
                          {new Date(log.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {log.details || `Operasi pada data ${log.entity}`}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Oleh: <strong className="text-gray-700">{log.user?.username || 'Sistem'}</strong>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              Belum ada aktivitas yang dicatat.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
