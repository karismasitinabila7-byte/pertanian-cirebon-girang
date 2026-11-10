import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import EdukasiPortalClient from '@/components/features/Edukasi/EdukasiPortalClient'

export const metadata = {
  title: 'Pusat Edukasi & Panduan Tani | SI PADI Cirebon Girang',
  description: 'Artikel, panduan budidaya padi, penanggulangan hama wereng, dan rekomendasi pemupukan Desa Cirebon Girang.',
}

export default async function EdukasiPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Ambil artikel edukasi yang sudah terbit dari database
  const rawArticles = await prisma.informasiPertanian.findMany({
    where: {
      status: 'PUBLISHED'
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format data artikel
  const formattedArticles = rawArticles.map((art) => {
    const wordsCount = art.isi.split(/\s+/).length
    const readTimeMinutes = Math.max(2, Math.ceil(wordsCount / 180))

    return {
      id: art.id,
      judul: art.judul,
      isi: art.isi,
      kategori: art.kategori,
      gambar: art.gambar,
      status: art.status,
      tanggalPublikasi: art.tanggalPublikasi ? art.tanggalPublikasi.toISOString() : null,
      namaPenulis: art.namaPenulis,
      readTime: `${readTimeMinutes} menit baca`,
      createdAt: art.createdAt.toISOString()
    }
  })

  return (
    <div>
      <EdukasiPortalClient
        initialArticles={formattedArticles}
        userRole={session.role}
      />
    </div>
  )
}
