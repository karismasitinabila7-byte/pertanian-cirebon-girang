import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET /api/aktivitas - List aktivitas budidaya
export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const musimTanamId = searchParams.get("musimTanamId") || ""
    const lahanId = searchParams.get("lahanId") || ""
    const petaniId = searchParams.get("petaniId") || ""
    const jenisAktivitas = searchParams.get("jenisAktivitas") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const whereCondition: any = {}

    if (session.role === "PETANI") {
      const petani = await prisma.petani.findUnique({ where: { userId: session.userId } })
      if (!petani) {
        return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } })
      }
      whereCondition.musimTanam = { lahan: { petaniId: petani.id } }
      if (musimTanamId) {
        const musim = await prisma.musimTanam.findFirst({
          where: { id: musimTanamId, lahan: { petaniId: petani.id } }
        })
        if (musim) {
          whereCondition.musimTanamId = musimTanamId
          delete whereCondition.musimTanam
        }
      }
    } else {
      if (musimTanamId) whereCondition.musimTanamId = musimTanamId
      else if (lahanId) whereCondition.musimTanam = { lahanId }
      else if (petaniId) whereCondition.musimTanam = { lahan: { petaniId } }
    }

    if (jenisAktivitas && jenisAktivitas !== "SEMUA") {
      whereCondition.jenisAktivitas = jenisAktivitas
    }

    const [total, data] = await Promise.all([
      prisma.aktivitasBudidaya.count({ where: whereCondition }),
      prisma.aktivitasBudidaya.findMany({
        where: whereCondition,
        include: {
          musimTanam: {
            include: {
              lahan: {
                include: {
                  petani: {
                    select: {
                      id: true,
                      namaLengkap: true,
                      kelompokTani: { select: { id: true, nama: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { tanggal: "desc" },
        skip,
        take: limit
      })
    ])

    return NextResponse.json({
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    })
  } catch (error: any) {
    console.error("Error fetching aktivitas:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// POST /api/aktivitas - Create new aktivitas budidaya
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role === "PERANGKAT_DESA") {
      return NextResponse.json({
        error: "Forbidden: Perangkat Desa tidak memiliki izin mencatat aktivitas budidaya"
      }, { status: 403 })
    }

    const body = await req.json()
    const { musimTanamId, jenisAktivitas, tanggal, deskripsi, foto, biaya, bahan } = body

    if (!musimTanamId || !jenisAktivitas?.trim() || !tanggal || !deskripsi?.trim()) {
      return NextResponse.json({
        error: "Musim tanam, jenis aktivitas, tanggal, dan deskripsi wajib diisi"
      }, { status: 400 })
    }

    const validJenis = ["Persiapan Lahan", "Penanaman", "Pemupukan", "Pengairan", "Penyemprotan", "Pengendalian Hama", "Panen", "Lainnya"]
    if (!validJenis.includes(jenisAktivitas)) {
      return NextResponse.json({ error: "Jenis aktivitas tidak valid" }, { status: 400 })
    }

    const dTanggal = new Date(tanggal)
    if (isNaN(dTanggal.getTime())) {
      return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 })
    }

    const musim = await prisma.musimTanam.findUnique({
      where: { id: musimTanamId },
      include: { lahan: { include: { petani: true } } }
    })

    if (!musim) {
      return NextResponse.json({ error: "Musim tanam tidak ditemukan" }, { status: 404 })
    }

    if (session.role === "PETANI" && musim.lahan.petani.userId !== session.userId) {
      return NextResponse.json({
        error: "Forbidden: Anda hanya dapat mencatat aktivitas pada musim tanam milik Anda sendiri"
      }, { status: 403 })
    }

    const newAktivitas = await prisma.aktivitasBudidaya.create({
      data: {
        musimTanamId,
        jenisAktivitas: jenisAktivitas.trim(),
        tanggal: dTanggal,
        deskripsi: deskripsi.trim(),
        foto: foto?.trim() || null,
        biaya: biaya ? parseFloat(biaya) : null,
        bahan: bahan?.trim() || null
      },
      include: {
        musimTanam: {
          include: { lahan: { include: { petani: { select: { id: true, namaLengkap: true } } } } }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE",
        entity: "AktivitasBudidaya",
        entityId: newAktivitas.id,
        details: `Mencatat aktivitas "${jenisAktivitas}" pada musim ${musim.namaMusim}`
      }
    }).catch((err) => console.error("AuditLog error:", err))

    return NextResponse.json({ data: newAktivitas, message: "Aktivitas budidaya berhasil dicatat" }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating aktivitas:", error)
    return NextResponse.json({ error: error.message || "Gagal mencatat aktivitas" }, { status: 500 })
  }
}
