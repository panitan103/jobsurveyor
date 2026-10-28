import { SAMPLE_CSV } from "@/lib/csv";

export const runtime = "nodejs";

export async function GET() {
  return new Response("\uFEFF" + SAMPLE_CSV, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="jobsurveyor-template.csv"',
    },
  });
}
