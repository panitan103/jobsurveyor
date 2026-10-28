import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, getSettings } from "@/lib/db";
import { getLang, t } from "@/lib/i18n";
import { formatDate, formatSalary } from "@/lib/format";
import { scoreJob } from "@/lib/scoring";
import { JOB_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(Number(id));
  if (!job) notFound();

  const lang = await getLang();
  const settings = getSettings();
  const breakdown = scoreJob(job, settings);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="small muted"><Link href="/">← {t(lang, "back")}</Link></p>
          <h1>{job.title}</h1>
          <p className="muted">
            {job.company ?? "—"} · {job.province ?? job.location_text ?? "—"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{job.score}</div>
          <span className={`badge badge-${job.tier.toLowerCase()}`}>Tier {job.tier}</span>
        </div>
      </div>

      <div className="grid-side">
        <div className="stack">
          <div className="panel">
            <h2>{t(lang, "description")}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{job.description ?? "—"}</p>
            {job.analysis && (
              <>
                <h2 style={{ marginTop: 20 }}>{t(lang, "analysis")}</h2>
                <p style={{ whiteSpace: "pre-wrap" }}>{job.analysis}</p>
              </>
            )}
            {job.url && (
              <p style={{ marginTop: 14 }}>
                <a href={job.url} target="_blank" rel="noreferrer noopener">
                  {t(lang, "openOriginal")} ↗
                </a>
              </p>
            )}
          </div>

          <div className="panel">
            <h2>{t(lang, "matched")}</h2>
            {breakdown.matched.length === 0 ? (
              <p className="muted">—</p>
            ) : (
              <div>{breakdown.matched.map((m) => <span className="tag" key={m}>{m}</span>)}</div>
            )}
            <p className="small muted" style={{ marginTop: 10 }}>
              weighted coverage {Math.round(breakdown.score)} / 100
              {breakdown.distanceKm !== null ? ` · ~${breakdown.distanceKm} km` : ""}
              {breakdown.penalties.length > 0
                ? ` · penalties: ${breakdown.penalties.map((p) => `${p.label} (-${Math.round(p.points)})`).join(", ")}`
                : ""}
            </p>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <h2>{t(lang, "detail")}</h2>
            <dl className="kv">
              <dt>{t(lang, "company")}</dt><dd>{job.company ?? "—"}</dd>
              <dt>{t(lang, "location")}</dt><dd>{job.location_text ?? job.province ?? "—"}</dd>
              <dt>{t(lang, "salary")}</dt><dd>{formatSalary(job.salary_min, job.salary_max)}</dd>
              <dt>{t(lang, "schema")}</dt><dd>{job.source}{job.external_id ? ` · ${job.external_id}` : ""}</dd>
              <dt>Posted</dt><dd>{formatDate(job.posted_at, lang)}</dd>
              <dt>Updated</dt><dd>{formatDate(job.updated_at, lang)}</dd>
            </dl>
            {job.tags.length > 0 && (
              <div style={{ marginTop: 12 }}>{job.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
            )}
          </div>

          <div className="panel">
            <h2>{t(lang, "status")}</h2>
            <form action={`/api/jobs/${job.id}`} method="post" className="stack">
              <div className="field">
                <label htmlFor="status">{t(lang, "status")}</label>
                <select id="status" name="status" defaultValue={job.status}>
                  {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="notes">{t(lang, "notes")}</label>
                <textarea id="notes" name="notes" defaultValue={job.notes ?? ""} />
              </div>
              <button type="submit">{t(lang, "save")}</button>
            </form>
            {job.applied_at && <p className="small muted" style={{ marginTop: 10 }}>Applied: {formatDate(job.applied_at, lang)}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
