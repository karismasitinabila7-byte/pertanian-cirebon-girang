import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { sendEmailNotification } from "@/lib/email"

// GET /api/panen - List panen records
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const musimTanamId = searchParams.get("musimTanamId") || ""
    const petaniId = searchParams.get("petaniId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const whereCondition: any = {}

    if (session.role === "PETANI") {
      const petani = await prisma.petani.findUnique({ where: { userId: session.userId } })
      if (!petani) {
        return NextResponse.json({ data: [], stats: { totalProduksi: 0 }, pagination: { total: 0, page: 1, limit, totalPages: 0 } })
      }
      whereCondition.musimTanam = { lahan: { petaniId: petani.id } }
    } else {
      if (musimTanamId) whereCondition.musimTanamId = musimTanamId
      else if (petaniId) whereCondition.musimTanam = { lahan: { petaniId } }
    }

    if (musimTanamId && session.role !== "PETANI") {
      whereCondition.musimTanamId = musimTanamId
    }

    const [total, data] = await Promise.all([
      prisma.panen.count({ where: whereCondition }),
      prisma.panen.findMany({
        where: whereCondition,
        include: {
          musimTanam: {
            include: {
              lahan: {
                include: {
                  petani: {
                    select: { id: true, namaLengkap: true, kelompokTani: { select: { id: true, nama: true } } }
                  }
                }
              }
            }
          }
        },
        orderBy: { tanggalPanen: "desc" },
        skip,
        take: limit
      })
    ])

    // Hitung total produksi (kg)
    const allPanen = await prisma.panen.findMany({ where: whereCondition, select: { jumlahProduksi: true, satuan: true } })
    const totalProduksiKg = allPanen.reduce((acc, p) => {
      if (p.satuan === "ton") return acc + p.jumlahProduksi * 1000
      if (p.satuan === "kuintal") return acc + p.jumlahProduksi * 100
      return acc + p.jumlahProduksi
    }, 0)

    return NextResponse.json({
      data,
      stats: { totalProduksi: totalProduksiKg },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error: any) {
    console.error("Error fetching panen:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// POST /api/panen - Record new panen
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.role === "PERANGKAT_DESA") return NextResponse.json({ error: "Forbidden: Perangkat Desa tidak memiliki izin mencatat panen" }, { status: 403 })

    const body = await req.json()
    const { musimTanamId, tanggalPanen, jumlahProduksi, satuan = "kg", kualitas, catatan, dokumentasi } = body

    if (!musimTanamId || !tanggalPanen || jumlahProduksi === undefined || jumlahProduksi === null) {
      return NextResponse.json({ error: "Musim tanam, tanggal panen, dan jumlah produksi wajib diisi" }, { status: 400 })
    }

    const qty = parseFloat(jumlahProduksi)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Jumlah produksi harus berupa angka positif" }, { status: 400 })
    }

    const validSatuan = ["kg", "kuintal", "ton"]
    if (!validSatuan.includes(satuan)) {
      return NextResponse.json({ error: "Satuan tidak valid. Gunakan: kg, kuintal, atau ton" }, { status: 400 })
    }

    const dPanen = new Date(tanggalPanen)
    if (isNaN(dPanen.getTime())) {
      return NextResponse.json({ error: "Format tanggal panen tidak valid" }, { status: 400 })
    }

    const musim = await prisma.musimTanam.findUnique({
      where: { id: musimTanamId },
      include: { lahan: { include: { petani: true } }, panen: true }
    })

    if (!musim) return NextResponse.json({ error: "Musim tanam tidak ditemukan" }, { status: 404 })
    if (musim.panen) return NextResponse.json({ error: "Data panen untuk musim tanam ini sudah ada" }, { status: 400 })

    if (session.role === "PETANI" && musim.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden: Anda hanya dapat mencatat panen pada musim tanam milik Anda sendiri" }, { status: 403 })
    }

    if (dPanen < musim.tanggalTanam) {
      return NextResponse.json({ error: "Tanggal panen tidak boleh sebelum tanggal penanaman" }, { status: 400 })
    }

    const newPanen = await prisma.panen.create({
      data: {
        musimTanamId,
        tanggalPanen: dPanen,
        jumlahProduksi: qty,
        satuan,
        kualitas: kualitas?.trim() || null,
        catatan: catatan?.trim() || null,
        dokumentasi: dokumentasi?.trim() || null
      },
      include: {
        musimTanam: { include: { lahan: { include: { petani: { select: { id: true, namaLengkap: true } } } } } }
      }
    })

    // Auto-update status musim tanam to SELESAI
    await prisma.musimTanam.update({
      where: { id: musimTanamId },
      data: { status: "SELESAI" }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE",
        entity: "Panen",
        entityId: newPanen.id,
        details: `Mencatat panen ${qty} ${satuan} pada musim ${musim.namaMusim}`
      }
    }).catch(() => {})

    // Notifikasi Otomatis ke Email Admin (karismasitinabila7@gmail.com)
    sendEmailNotification({
      to: 'karismasitinabila7@gmail.com',
      subject: `[SI PADI] Panen Berhasil Dicatat: Musim ${musim.namaMusim}`,
      title: `Hasil Panen Padi Dicatat: ${qty} ${satuan}`,
      message: `Data panen telah berhasil dicatat untuk musim "${musim.namaMusim}" dengan total gabah ${qty} ${satuan}. Kualitas: ${kualitas || 'Standar Gabah Kering Panen'}.`,
      type: 'PANEN_BARU',
      severity: 'INFO',
      lahanNama: musim.lahan?.namaLahan,
      petaniNama: musim.lahan?.petani?.namaLengkap,
      actionUrl: `/admin/panen`,
      actionLabel: 'Tinjau Rekapitulasi Panen'
    }).catch(err => console.error('Gagal mengirim email panen:', err))

    return NextResponse.json({ data: newPanen, message: "Data panen berhasil dicatat" }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating panen:", error)
    return NextResponse.json({ error: error.message || "Gagal mencatat panen" }, { status: 500 })
  }
}
