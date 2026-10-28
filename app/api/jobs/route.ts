import { NextResponse, type NextRequest } from "next/server";
import { listJobs, type JobFilters } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const filters: JobFilters = {
    q: sp.get("q") ?? undefined,
    tier: sp.get("tier") ?? undefined,
    status: sp.get("status") ?? undefined,
    province: sp.get("province") ?? undefined,
  };
  return NextResponse.json({ jobs: listJobs(filters) });
}
