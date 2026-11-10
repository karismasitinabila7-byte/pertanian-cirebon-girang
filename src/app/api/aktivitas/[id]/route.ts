import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const aktivitas = await prisma.aktivitasBudidaya.findUnique({
      where: { id },
      include: {
        musimTanam: {
          include: {
            lahan: {
              include: {
                petani: {
                  select: { id: true, namaLengkap: true, userId: true, kelompokTani: { select: { id: true, nama: true } } }
                }
              }
            }
          }
        }
      }
    })

    if (!aktivitas) return NextResponse.json({ error: "Aktivitas tidak ditemukan" }, { status: 404 })

    if (session.role === "PETANI" && aktivitas.musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ data: aktivitas })
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

    const aktivitas = await prisma.aktivitasBudidaya.findUnique({
      where: { id },
      include: { musimTanam: { include: { lahan: { include: { petani: true } } } } }
    })

    if (!aktivitas) return NextResponse.json({ error: "Aktivitas tidak ditemukan" }, { status: 404 })
    if (session.role === "PETANI" && aktivitas.musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden: Anda tidak memiliki akses pada aktivitas ini" }, { status: 403 })
    }

    const body = await req.json()
    const { jenisAktivitas, tanggal, deskripsi, foto, biaya, bahan } = body

    const validJenis = ["Persiapan Lahan", "Penanaman", "Pemupukan", "Pengairan", "Penyemprotan", "Pengendalian Hama", "Panen", "Lainnya"]

    const updated = await prisma.aktivitasBudidaya.update({
      where: { id },
      data: {
        ...(jenisAktivitas && validJenis.includes(jenisAktivitas) && { jenisAktivitas }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(deskripsi && { deskripsi }),
        ...(foto !== undefined && { foto }),
        ...(biaya !== undefined && { biaya: biaya ? parseFloat(biaya) : null }),
        ...(bahan !== undefined && { bahan }),
      }
    })

    return NextResponse.json({ data: updated, message: "Aktivitas berhasil diperbarui" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal memperbarui aktivitas" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.role === "PERANGKAT_DESA") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const aktivitas = await prisma.aktivitasBudidaya.findUnique({
      where: { id },
      include: { musimTanam: { include: { lahan: { include: { petani: true } } } } }
    })

    if (!aktivitas) return NextResponse.json({ error: "Aktivitas tidak ditemukan" }, { status: 404 })
    if (session.role === "PETANI" && aktivitas.musimTanam.lahan.petani.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.aktivitasBudidaya.delete({ where: { id } })

    return NextResponse.json({ message: "Aktivitas berhasil dihapus" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus aktivitas" }, { status: 500 })
  }
}
