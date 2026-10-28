import { createHash } from "node:crypto";
import type { CsvIssue, JobInput, ParsedCsvRow } from "./types";

export const CSV_HEADERS = [
  "schema_version",
  "source",
  "external_id",
  "title",
  "company",
  "url",
  "location_text",
  "province",
  "district",
  "salary_min",
  "salary_max",
  "employment_type",
  "tags",
  "description",
  "analysis",
  "posted_at",
  "notes",
] as const;

export const SCHEMA_VERSION = "1";

export const SAMPLE_CSV = `schema_version,source,external_id,title,company,url,location_text,province,district,salary_min,salary_max,employment_type,tags,description,analysis,posted_at,notes
1,manual,sample-001,Automation Engineer,Example Manufacturing,https://example.com/jobs/1,Chonburi,Chonburi,Si Racha,35000,55000,Full-time,"automation;PLC;commissioning",Design and commission PLC-controlled production lines with robotic cells.,Strong fit: hands-on commissioning and PLC work.,2026-10-01,
1,manual,sample-002,Embedded Firmware Engineer,Example Robotics,https://example.com/jobs/2,Bangkok,Bangkok,Chatuchak,40000,65000,Full-time,"embedded;firmware;C++;sensor",Firmware for sensor hubs and motor controllers. ROS exposure is a plus.,Good fit on firmware; slightly less on robotics integration.,2026-10-03,
1,manual,sample-003,Mechanical Draftsperson,Example Studio,https://example.com/jobs/3,Nonthaburi,Nonthaburi,Mueang,22000,30000,Full-time,"CAD;drafting",2D/3D drawings for building systems.,Not aligned with the target profile.,2026-10-05,`;


/** Minimal RFC4180 parser: quotes, escaped quotes, CRLF, embedded newlines, BOM. */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  return rows;
}

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const cleaned = value.replace(/[,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function splitTags(value: string): string[] {
  return value
    .split(/[;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function fingerprintFor(job: Pick<JobInput, "source" | "external_id" | "title" | "company" | "province">): string {
  const base = job.external_id
    ? `${job.source}|${job.external_id}`
    : `${job.title}|${job.company ?? ""}|${job.province ?? ""}`;
  return createHash("sha1").update(base.toLowerCase()).digest("hex");
}

export function rowsToPreview(text: string): { headers: string[]; rows: ParsedCsvRow[] } {
  const table = parseCsv(text);
  if (table.length === 0) return { headers: [], rows: [] };

  const headers = table[0].map((h) => h.trim().toLowerCase());
  const rows: ParsedCsvRow[] = [];

  for (let r = 1; r < table.length; r += 1) {
    const cells = table[r];
    const line = r + 1;
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? "").trim();
    });

    const issues: CsvIssue[] = [];
    if (!record.title) issues.push({ line, field: "title", message: "title is required" });
    if (!record.source) issues.push({ line, field: "source", message: "source is required" });

    const salaryMin = toNumber(record.salary_min ?? "");
    const salaryMax = toNumber(record.salary_max ?? "");
    if (record.salary_min && salaryMin === null) {
      issues.push({ line, field: "salary_min", message: "not a number" });
    }
    if (record.salary_max && salaryMax === null) {
      issues.push({ line, field: "salary_max", message: "not a number" });
    }
    if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
      issues.push({ line, field: "salary_max", message: "salary_max is lower than salary_min" });
    }
    if (record.url && !/^https?:\/\//i.test(record.url)) {
      issues.push({ line, field: "url", message: "url must start with http(s)://" });
    }

    const job: JobInput = {
      source: record.source || "csv",
      external_id: record.external_id || null,
      title: record.title ?? "",
      company: record.company || null,
      url: record.url || null,
      location_text: record.location_text || null,
      province: record.province || null,
      district: record.district || null,
      salary_min: salaryMin,
      salary_max: salaryMax,
      employment_type: record.employment_type || null,
      tags: splitTags(record.tags ?? ""),
      description: record.description || null,
      analysis: record.analysis || null,
      posted_at: record.posted_at || null,
      notes: record.notes || null,
    };

    rows.push({ line, ok: issues.length === 0, issues, job: issues.length === 0 ? job : undefined });
  }

  return { headers, rows };
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (value: string | number | null | undefined): string => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n") + "\n";
}
