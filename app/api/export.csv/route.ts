import { listJobs, getSettings } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = [
  "id",
  "score",
  "tier",
  "status",
  "title",
  "company",
  "province",
  "district",
  "location_text",
  "salary_min",
  "salary_max",
  "employment_type",
  "tags",
  "url",
  "source",
  "external_id",
  "posted_at",
  "applied_at",
  "matched",
  "analysis",
  "notes",
];

export async function GET() {
  getSettings(); // ensure db is initialised
  const jobs = listJobs({ limit: 100000 });
  const body = toCsv(
    HEADERS,
    jobs.map((job) => [
      job.id,
      job.score,
      job.tier,
      job.status,
      job.title,
      job.company,
      job.province,
      job.district,
      job.location_text,
      job.salary_min,
      job.salary_max,
      job.employment_type,
      job.tags.join(";"),
      job.url,
      job.source,
      job.external_id,
      job.posted_at,
      job.applied_at,
      job.matched.join(";"),
      job.analysis,
      job.notes,
    ]),
  );

  return new Response("\uFEFF" + body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="jobsurveyor-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
