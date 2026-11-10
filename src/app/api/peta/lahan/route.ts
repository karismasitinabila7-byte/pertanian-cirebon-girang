import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/peta/lahan - Endpoint GIS untuk visualisasi peta lahan di Desa Cirebon Girang
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const kelompokTaniId = searchParams.get('kelompokTaniId') || ''
    const status = searchParams.get('status') || ''
    const statusMusim = searchParams.get('statusMusim') || ''

    const whereCondition: any = {}

    // Jika Petani, dia bisa melihat semua lahan di desa dalam mode GIS (sebagai visualisasi peta desa),
    // tetapi kita tandai milik dia sendiri (isOwned = true)
    let currentPetaniId: string | null = null
    if (session.role === 'PETANI') {
      const currentPetani = await prisma.petani.findUnique({
        where: { userId: session.userId }
      })
      if (currentPetani) {
        currentPetaniId = currentPetani.id
      }
    }

    if (kelompokTaniId) {
      whereCondition.petani = {
        kelompokTaniId
      }
    }

    if (status && status !== 'ALL') {
      whereCondition.status = status
    }

    // Ambil seluruh lahan yang memiliki koordinat
    const lahanList = await prisma.lahan.findMany({
      where: whereCondition,
      include: {
        petani: {
          select: {
            id: true,
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

    // Filter tambahan untuk statusMusim bila dipilih
    let filteredList = lahanList
    if (statusMusim && statusMusim !== 'ALL') {
      filteredList = lahanList.filter(l => {
        const activeMusim = l.musimTanam.find(m => m.status === 'BERJALAN') || l.musimTanam[0]
        return activeMusim?.status === statusMusim
      })
    }

    // Transformasi data untuk visualisasi GIS
    const mapped = filteredList.map(l => {
      const activeMusim = l.musimTanam.find(m => m.status === 'BERJALAN') || l.musimTanam[0] || null
      const isOwned = currentPetaniId ? l.petaniId === currentPetaniId : false

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
        petani: l.petani,
        musimAktif: activeMusim,
        riwayatMusim: l.musimTanam,
        isOwned
      }
    })

    // Agregasi statistik GIS untuk info panel
    const totalTitik = mapped.length
    const totalTitikBerkoordinat = mapped.filter(m => m.latitude && m.longitude).length
    const totalLuasM2 = mapped.reduce((acc, curr) => acc + (curr.luasLahan || 0), 0)
    const totalLuasHa = (totalLuasM2 / 10000).toFixed(2)
    const jumlahAktifTanam = mapped.filter(m => m.musimAktif?.status === 'BERJALAN').length

    return NextResponse.json({
      success: true,
      data: mapped,
      summary: {
        totalTitik,
        totalTitikBerkoordinat,
        totalLuasM2,
        totalLuasHa,
        jumlahAktifTanam
      }
    })
  } catch (error: any) {
    console.error('Error fetching peta lahan:', error)
    return NextResponse.json({ error: error.message || 'Gagal memuat data peta' }, { status: 500 })
  }
}
