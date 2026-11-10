import AiChatClient from './AiChatClient'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Bot } from 'lucide-react'
import prisma from '@/lib/prisma'

export const metadata = {
  title: 'AI Assistant Pertanian | Desa Cirebon Girang',
  description:
    'Layanan Chat AI cerdas khusus budidaya padi untuk petani lokal dan pengelola Desa Cirebon Girang.',
}

export default async function AiAssistantPage() {
  const session = await getSession()


  const role = session?.role || 'PETANI'
  const isAdmin = role === 'ADMIN'
  const userName =
    session?.fullName ||
    session?.username ||
    (isAdmin ? 'Karisma Siti Nabila' : 'Bapak Sukardi')

  // Query live database statistics via Prisma for instant display
  let initialStats = {
    totalPetani: 4,
    totalLahan: 8,
    lahanAktif: 8,
    totalPoktan: 3,
    totalPanenTon: 20.0,
    totalUsers: 6,
    musimBerjalan: 6,
  }

  try {
    const [petaniCount, lahanCount, lahanAktif, poktanCount, panenAgg, usersCount, musimBerjalan] =
      await Promise.all([
        prisma.petani.count(),
        prisma.lahan.count(),
        prisma.lahan.count({ where: { status: 'AKTIF' } }),
        prisma.kelompokTani.count(),
        prisma.panen.aggregate({ _sum: { jumlahProduksi: true } }),
        prisma.user.count(),
        prisma.musimTanam.count({ where: { status: 'BERJALAN' } }),
      ])

    const totalPanenKg = panenAgg._sum.jumlahProduksi || 0
    initialStats = {
      totalPetani: petaniCount,
      totalLahan: lahanCount,
      lahanAktif,
      totalPoktan: poktanCount,
      totalPanenTon: Number((totalPanenKg / 1000).toFixed(1)),
      totalUsers: usersCount,
      musimBerjalan,
    }
  } catch (err) {
    console.warn('Gagal memuat statistik awal AI:', err)
  }

  return (
    <div className="ai-page">
      {/* ── Page Header ── */}
      <div className="ai-page-header">
        <div className="ai-page-title">
          <div
            style={{
              background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
              padding: '10px',
              borderRadius: '12px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(22, 101, 52, 0.2)',
            }}
          >
            <Bot size={26} />
          </div>
          <div>
            <h1>
              {isAdmin
                ? 'Asisten Pintar Administrator Pertanian'
                : 'AI Assistant Pertanian Padi'}
            </h1>
            <p className="ai-page-subtitle">
              {isAdmin
                ? 'Pusat Kendali Data Real-Time Database, Supervisi Operasional & Laporan Resmi Desa'
                : 'Konsultasi Budidaya Padi Petani Mandiri · Desa Cirebon Girang'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="ai-provider-badge ai-provider-active">
            <span className="ai-provider-dot" />
            <span>
              {isAdmin
                ? 'Database Live Connected • Akses Penuh'
                : 'AI Siap • Pengetahuan Lokal Aktif'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body: Chat Only (Full Width) ── */}
      <div className="ai-page-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <main className="ai-chat-main" style={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <AiChatClient role={role} userName={userName} initialStats={initialStats} />
        </main>
      </div>
    </div>
  )
}