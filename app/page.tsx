import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import { getStats, listJobs, listProvinces } from "@/lib/db";
import { formatSalary, truncate } from "@/lib/format";
import { JOB_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const lang = await getLang();
  const q = one(params.q);
  const tier = one(params.tier);
  const status = one(params.status);
  const province = one(params.province);

  const jobs = listJobs({ q, tier, status, province });
  const stats = getStats();
  const provinces = listProvinces();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t(lang, "dashboard")}</h1>
          <p className="muted">{t(lang, "tagline")}</p>
        </div>
        <div className="row-actions">
          <Link className="btn btn-ghost" href="/api/export.csv">
            {t(lang, "exportCsv")}
          </Link>
          <Link className="btn" href="/import">
            {t(lang, "import")}
          </Link>
        </div>
      </div>

      <div className="cards">
        <div className="card"><div className="label">{t(lang, "total")}</div><div className="value">{stats.total}</div></div>
        <div className="card"><div className="label">{t(lang, "tierA")}</div><div className="value">{stats.tierA}</div></div>
        <div className="card"><div className="label">{t(lang, "tierB")}</div><div className="value">{stats.tierB}</div></div>
        <div className="card"><div className="label">{t(lang, "tierC")}</div><div className="value">{stats.tierC}</div></div>
        <div className="card"><div className="label">{t(lang, "applied")}</div><div className="value">{stats.applied}</div></div>
        <div className="card"><div className="label">{t(lang, "interview")}</div><div className="value">{stats.interview}</div></div>
      </div>

      <form className="panel filters" method="get" action="/">
        <div className="field" style={{ flex: "1 1 260px" }}>
          <label htmlFor="q">{t(lang, "search")}</label>
          <input id="q" name="q" defaultValue={q} placeholder={t(lang, "searchPlaceholder")} />
        </div>
        <div className="field">
          <label htmlFor="tier">{t(lang, "tier")}</label>
          <select id="tier" name="tier" defaultValue={tier}>
            <option value="">{t(lang, "all")}</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">{t(lang, "status")}</label>
          <select id="status" name="status" defaultValue={status}>
            <option value="">{t(lang, "all")}</option>
            {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="province">{t(lang, "province")}</label>
          <select id="province" name="province" defaultValue={province}>
            <option value="">{t(lang, "all")}</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button type="submit">{t(lang, "filter")}</button>
        <Link className="btn btn-ghost" href="/">{t(lang, "reset")}</Link>
      </form>

      {jobs.length === 0 ? (
        <div className="panel muted">{t(lang, "noJobs")}</div>
      ) : (
        <form action="/compare" method="get">
          <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 34 }}></th>
                  <th className="num" style={{ width: 64 }}>{t(lang, "score")}</th>
                  <th>{t(lang, "title")}</th>
                  <th>{t(lang, "company")}</th>
                  <th>{t(lang, "location")}</th>
                  <th className="num">{t(lang, "salary")}</th>
                  <th>{t(lang, "status")}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td><input type="checkbox" name="ids" value={job.id} aria-label={`select ${job.title}`} /></td>
                    <td className="num">
                      <span className={`score`}>{job.score}</span>{" "}
                      <span className={`badge badge-${job.tier.toLowerCase()}`}>{job.tier}</span>
                    </td>
                    <td>
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      {job.tags.length > 0 && (
                        <div className="small muted">{truncate(job.tags.slice(0, 4).join(" · "), 70)}</div>
                      )}
                    </td>
                    <td>{job.company ?? "—"}</td>
                    <td>{job.province ?? job.location_text ?? "—"}</td>
                    <td className="num">{formatSalary(job.salary_min, job.salary_max)}</td>
                    <td><span className={`badge badge-status badge-${job.status}`}>{job.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row-actions" style={{ marginTop: -6 }}>
            <button type="submit">{t(lang, "compareSelected")}</button>
            <span className="small muted">{jobs.length} / {stats.total}</span>
          </div>
        </form>
      )}

      <div className="notice" style={{ marginTop: 22 }}>
        {t(lang, "disclaimerShort")} <Link href="/disclaimer">{t(lang, "disclaimer")}</Link>
      </div>
    </>
  );
}
