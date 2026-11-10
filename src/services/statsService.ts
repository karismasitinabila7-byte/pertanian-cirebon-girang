import prisma from "@/lib/prisma";
import { SystemOverviewStats } from "@/types";

export async function getSystemOverviewStats(): Promise<SystemOverviewStats> {
  try {
    const [
      totalFarmers,
      totalFarmerGroups,
      farmlandAggregate,
      activePlantingSeasons,
      activeCropCycles,
    ] = await Promise.all([
      prisma.petani.count(),
      prisma.kelompokTani.count(),
      prisma.lahan.aggregate({
        _sum: {
          luasLahan: true,
        },
      }),
      prisma.musimTanam.count({
        where: { status: "BERJALAN" },
      }),
      prisma.musimTanam.count({
        where: {
          status: {
            in: ["PERENCANAAN", "BERJALAN"],
          },
        },
      }),
    ]);

    const totalAreaM2 = farmlandAggregate._sum.luasLahan ?? 0;
    const totalFarmlandAreaHectares = Number((totalAreaM2 / 10000).toFixed(2));

    return {
      totalFarmers,
      totalFarmerGroups,
      totalFarmlandAreaHectares,
      activePlantingSeasons,
      activeCropCycles,
      databaseStatus: "CONNECTED",
      systemVersion: "v1.0.0-alpha",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Gagal mengambil statistik sistem:", error);
    return {
      totalFarmers: 0,
      totalFarmerGroups: 0,
      totalFarmlandAreaHectares: 0,
      activePlantingSeasons: 0,
      activeCropCycles: 0,
      databaseStatus: "ERROR",
      systemVersion: "v1.0.0-alpha",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getVillageSummary() {
  const [farmerGroups, announcements, recentActivities] = await Promise.all([
    prisma.kelompokTani.findMany({
      include: {
        _count: {
          select: { anggota: true },
        },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.informasiPertanian.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.aktivitasBudidaya.findMany({
      include: {
        musimTanam: {
          include: {
            lahan: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
      take: 4,
    }),
  ]);

  return {
    farmerGroups,
    announcements,
    recentActivities,
  };
}
