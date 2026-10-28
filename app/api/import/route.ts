import { NextResponse, type NextRequest } from "next/server";
import { rowsToPreview } from "@/lib/csv";
import { upsertJobs } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file larger than 5 MB" }, { status: 413 });
  }

  const text = await file.text();
  const { headers, rows } = rowsToPreview(text);
  const previewOnly = request.nextUrl.searchParams.get("preview") === "1";

  if (previewOnly) {
    const valid = rows.filter((row) => row.ok).length;
    return NextResponse.json({
      headers,
      rows,
      total: rows.length,
      valid,
      invalid: rows.length - valid,
    });
  }

  const validJobs = rows.flatMap((row) => (row.ok && row.job ? [row.job] : []));
  if (validJobs.length === 0) {
    return NextResponse.json({ error: "no valid rows to import" }, { status: 400 });
  }

  const result = upsertJobs(validJobs, file.name || "csv");
  return NextResponse.json(result);
}
