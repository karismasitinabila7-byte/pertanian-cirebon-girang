import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSystemOverviewStats } from "@/services/statsService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getSystemOverviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data ringkasan sistem" },
      { status: 500 }
    );
  }
}

