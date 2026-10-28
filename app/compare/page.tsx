import Link from "next/link";
import { getJobsByIds } from "@/lib/db";
import { getLang, t } from "@/lib/i18n";
import { formatSalary } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toIds(value: string | string[] | undefined): number[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v > 0);
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const lang = await getLang();
  const ids = toIds(params.ids);
  const jobs = getJobsByIds(ids);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t(lang, "compareTitle")}</h1>
          <p className="muted">{t(lang, "compareHint")}</p>
        </div>
        <Link className="btn btn-ghost" href="/">{t(lang, "back")}</Link>
      </div>

      <form className="panel filters" method="get" action="/compare">
        <div className="field" style={{ flex: "1 1 320px" }}>
          <label htmlFor="ids">IDs</label>
          <input id="ids" name="ids" defaultValue={ids.join(",")} placeholder="1,2,3" />
        </div>
        <button type="submit">{t(lang, "compare")}</button>
      </form>

      {jobs.length === 0 ? (
        <div className="panel muted">{t(lang, "noJobs")}</div>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>{t(lang, "title")}</th>
                {jobs.map((job) => (
                  <th key={job.id}>
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    <div className="small muted">{job.company ?? "—"}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td>{t(lang, "score")}</td>{jobs.map((j) => <td key={j.id}><strong>{j.score}</strong> <span className={`badge badge-${j.tier.toLowerCase()}`}>{j.tier}</span></td>)}</tr>
              <tr><td>{t(lang, "location")}</td>{jobs.map((j) => <td key={j.id}>{j.province ?? j.location_text ?? "—"}</td>)}</tr>
              <tr><td>{t(lang, "salary")}</td>{jobs.map((j) => <td key={j.id}>{formatSalary(j.salary_min, j.salary_max)}</td>)}</tr>
              <tr><td>{t(lang, "status")}</td>{jobs.map((j) => <td key={j.id}><span className={`badge badge-status badge-${j.status}`}>{j.status}</span></td>)}</tr>
              <tr><td>{t(lang, "matched")}</td>{jobs.map((j) => <td key={j.id}>{j.matched.slice(0, 8).map((m) => <span className="tag" key={m}>{m}</span>)}</td>)}</tr>
              <tr><td>{t(lang, "analysis")}</td>{jobs.map((j) => <td key={j.id} className="small">{j.analysis ?? "—"}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
