import { getSettings, listImportRuns } from "@/lib/db";
import { getLang, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { PRESETS } from "@/lib/presets";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const lang = await getLang();
  const settings = getSettings();
  const runs = listImportRuns(8);
  const saved = params.saved === "1";

  const weights = Object.entries(settings.weights).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t(lang, "settingsTitle")}</h1>
          <p className="muted">{t(lang, "weightsHint")}</p>
        </div>
      </div>

      {saved && <div className="notice notice-ok">{t(lang, "saved")} — {t(lang, "rescored")}</div>}
      {params.preset && (
        <div className="notice notice-ok">
          {lang === "th" ? "โหลด preset แล้วและคำนวณคะแนนใหม่ทั้งฐาน" : "Preset loaded and all jobs rescored"}
        </div>
      )}

      <div className="panel">
        <h2>{lang === "th" ? "ชุดน้ำหนัก (Preset)" : "Weight presets"}</h2>
        <p className="small muted">
          {lang === "th"
            ? "สลับชุดน้ำหนักตามสายงานที่กำลังหาอยู่ ระบบจะคำนวณคะแนนใหม่ทั้งฐานทันที"
            : "Switch the weight set for the kind of role you are chasing. All jobs are rescored immediately."}
        </p>
        <div className="row-actions">
          {PRESETS.map((preset) => {
            const active = settings.activePreset === preset.id;
            return (
              <form action="/api/presets" method="post" key={preset.id}>
                <input type="hidden" name="preset" value={preset.id} />
                <button type="submit" className={active ? undefined : "btn-ghost"}>
                  {active ? "✓ " : ""}{preset.label[lang]}
                </button>
              </form>
            );
          })}
          {settings.activePreset === "custom" && (
            <span className="badge">{lang === "th" ? "แก้ไขเอง (Custom)" : "Custom"}</span>
          )}
        </div>
        <p className="small muted" style={{ marginTop: 10 }}>
          {PRESETS.find((preset) => preset.id === settings.activePreset)?.description[lang] ??
            (lang === "th"
              ? "คุณแก้ไขน้ำหนักเอง ชุดนี้จึงไม่ตรงกับ preset ใด"
              : "Weights were edited manually, so they no longer match a preset.")}
        </p>
      </div>

      <form action="/api/settings" method="post" className="stack">
        <div className="panel">
          <h2>{t(lang, "weights")}</h2>
          <div className="weight-grid">
            {weights.map(([keyword, value]) => (
              <label className="weight-item" key={keyword}>
                <span>{keyword}</span>
                <input type="number" min={0} max={50} step={1} name={`w[${keyword}]`} defaultValue={value} />
              </label>
            ))}
          </div>
          <div className="filters" style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="newKeyword">+ keyword</label>
              <input id="newKeyword" name="newKeyword" placeholder="e.g. lidar" />
            </div>
            <div className="field">
              <label htmlFor="newWeight">weight</label>
              <input id="newWeight" name="newWeight" type="number" min={0} max={50} defaultValue={5} />
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Baseline</h2>
          <div className="filters">
            <div className="field">
              <label htmlFor="baseProvince">{t(lang, "baseProvince")}</label>
              <input id="baseProvince" name="baseProvince" defaultValue={settings.baseProvince} />
            </div>
            <div className="field">
              <label htmlFor="maxKm">{t(lang, "maxKm")}</label>
              <input id="maxKm" name="maxKm" type="number" min={0} max={2000} defaultValue={settings.maxKm} />
            </div>
            <div className="field">
              <label htmlFor="minSalary">{t(lang, "minSalary")}</label>
              <input id="minSalary" name="minSalary" type="number" min={0} step={1000} defaultValue={settings.minSalary} />
            </div>
            <div className="field">
              <label htmlFor="targetWeight">Full score at weight</label>
              <input id="targetWeight" name="targetWeight" type="number" min={1} max={200} defaultValue={settings.targetWeight} />
            </div>
          </div>
        </div>

        <div><button type="submit">{t(lang, "save")}</button></div>
      </form>

      <div className="panel" style={{ marginTop: 20 }}>
        <h2>{t(lang, "importRuns")}</h2>
        {runs.length === 0 ? (
          <p className="muted">—</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t(lang, "file")}</th>
                <th className="num">{t(lang, "rows")}</th>
                <th className="num">{t(lang, "inserted")}</th>
                <th className="num">{t(lang, "updated")}</th>
                <th>{t(lang, "at")}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{run.filename}</td>
                  <td className="num">{run.total}</td>
                  <td className="num">{run.inserted}</td>
                  <td className="num">{run.updated}</td>
                  <td>{formatDate(run.created_at, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
