import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const panen = await prisma.panen.findUnique({
      where: { id },
      include: {
        musimTanam: {
          include: {
            lahan: {
              include: {
                petani: { select: { id: true, namaLengkap: true, userId: true, kelompokTani: { select: { id: true, nama: true } } } }
              }
            }
          }
        }
      }
    })

    if (!panen) return NextResponse.json({ error: "Data panen tidak ditemukan" }, { status: 404 })

    if (session.role === "PETANI" && panen.musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ data: panen })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.role === "PERANGKAT_DESA") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const panen = await prisma.panen.findUnique({
      where: { id },
      include: { musimTanam: { include: { lahan: { include: { petani: true } } } } }
    })

    if (!panen) return NextResponse.json({ error: "Data panen tidak ditemukan" }, { status: 404 })
    if (session.role === "PETANI" && panen.musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { tanggalPanen, jumlahProduksi, satuan, kualitas, catatan, dokumentasi } = body

    const validSatuan = ["kg", "kuintal", "ton"]
    const qty = jumlahProduksi !== undefined ? parseFloat(jumlahProduksi) : undefined

    if (qty !== undefined && (isNaN(qty) || qty <= 0)) {
      return NextResponse.json({ error: "Jumlah produksi harus berupa angka positif" }, { status: 400 })
    }

    const updated = await prisma.panen.update({
      where: { id },
      data: {
        ...(tanggalPanen && { tanggalPanen: new Date(tanggalPanen) }),
        ...(qty !== undefined && { jumlahProduksi: qty }),
        ...(satuan && validSatuan.includes(satuan) && { satuan }),
        ...(kualitas !== undefined && { kualitas }),
        ...(catatan !== undefined && { catatan }),
        ...(dokumentasi !== undefined && { dokumentasi }),
      }
    })

    return NextResponse.json({ data: updated, message: "Data panen berhasil diperbarui" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal memperbarui data panen" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.role === "PERANGKAT_DESA") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const panen = await prisma.panen.findUnique({
      where: { id },
      include: { musimTanam: { include: { lahan: { include: { petani: true } } } } }
    })

    if (!panen) return NextResponse.json({ error: "Data panen tidak ditemukan" }, { status: 404 })
    if (session.role === "PETANI" && panen.musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.panen.delete({ where: { id } })

    return NextResponse.json({ message: "Data panen berhasil dihapus" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus data panen" }, { status: 500 })
  }
}
