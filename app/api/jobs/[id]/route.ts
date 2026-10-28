import { NextResponse, type NextRequest } from "next/server";
import { updateJobState } from "@/lib/db";
import { JOB_STATUSES, type JobStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const form = await request.formData();
  const rawStatus = String(form.get("status") ?? "");
  const notesRaw = form.get("notes");
  const status = (JOB_STATUSES as string[]).includes(rawStatus)
    ? (rawStatus as JobStatus)
    : undefined;

  const job = updateJobState(jobId, {
    status,
    notes: notesRaw === null ? undefined : String(notesRaw),
  });
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.redirect(new URL(`/jobs/${jobId}?updated=1`, request.url), 303);
}
