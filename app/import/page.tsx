import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import { ImportClient } from "./import-client";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const lang = await getLang();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t(lang, "importTitle")}</h1>
          <p className="muted">{t(lang, "importHint")}</p>
        </div>
        <div className="row-actions">
          <Link className="btn btn-ghost" href="/api/csv/template">{t(lang, "downloadTemplate")}</Link>
          <Link className="btn btn-ghost" href="/skill.md" target="_blank">{t(lang, "downloadSkill")}</Link>
        </div>
      </div>
      <ImportClient
        labels={{
          chooseFile: t(lang, "chooseFile"),
          preview: t(lang, "preview"),
          commit: t(lang, "commit"),
          valid: t(lang, "valid"),
          invalid: t(lang, "invalid"),
          inserted: t(lang, "inserted"),
          updated: t(lang, "updated"),
          rows: t(lang, "rows"),
        }}
      />
    </>
  );
}
