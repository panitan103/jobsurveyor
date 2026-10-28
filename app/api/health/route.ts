import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json({ ok: true, jobs: stats.total, tierA: stats.tierA });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
