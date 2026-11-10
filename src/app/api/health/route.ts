import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi koneksi database dengan query sederhana
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      database: "CONNECTED",
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "DEGRADED",
        timestamp: new Date().toISOString(),
        database: "DISCONNECTED",
      },
      { status: 503 }
    );
  }
}

