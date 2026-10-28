"use client";

import { useState } from "react";
import Link from "next/link";
import type { ImportPreview } from "@/lib/types";

type Labels = {
  chooseFile: string;
  preview: string;
  commit: string;
  valid: string;
  invalid: string;
  inserted: string;
  updated: string;
  rows: string;
};

type CommitResult = { inserted: number; updated: number };

export function ImportClient({ labels }: { labels: Labels }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(previewOnly: boolean) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/import${previewOnly ? "?preview=1" : ""}`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (previewOnly) {
        setPreview(data as ImportPreview);
      } else {
        setResult(data as CommitResult);
        setPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div className="panel">
        <div className="dropzone">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setPreview(null);
              setResult(null);
              setError(null);
            }}
          />
          <p className="small muted" style={{ marginTop: 10 }}>
            {file ? `${file.name} · ${file.size.toLocaleString()} bytes` : "CSV · UTF-8 · schema v1"}
          </p>
        </div>
        <div className="row-actions" style={{ marginTop: 14 }}>
          <button type="button" className="btn-ghost" disabled={!file || busy} onClick={() => run(true)}>
            {busy ? "…" : labels.preview}
          </button>
          <button type="button" disabled={!file || busy || !preview || preview.valid === 0} onClick={() => run(false)}>
            {labels.commit}
          </button>
        </div>
        {error && <div className="notice" style={{ marginTop: 14 }}>{error}</div>}
        {result && (
          <div className="notice notice-ok" style={{ marginTop: 14 }}>
            {labels.inserted}: {result.inserted} · {labels.updated}: {result.updated} —{" "}
            <Link href="/">Dashboard</Link>
          </div>
        )}
      </div>

      {preview && (
        <div className="panel" style={{ overflowX: "auto" }}>
          <h2>
            {labels.rows}: {preview.total} · {labels.valid}: {preview.valid} · {labels.invalid}: {preview.invalid}
          </h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Company</th>
                <th>Province</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.slice(0, 50).map((row) => (
                <tr key={row.line}>
                  <td>{row.line}</td>
                  <td>{row.job?.title ?? "—"}</td>
                  <td>{row.job?.company ?? "—"}</td>
                  <td>{row.job?.province ?? "—"}</td>
                  <td className="small" style={{ color: row.ok ? undefined : "#fca5a5" }}>
                    {row.ok ? "OK" : row.issues.map((issue) => `${issue.field ?? "row"}: ${issue.message}`).join("; ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
