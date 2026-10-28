import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS, scoreJob } from "./scoring";
import { detectPreset } from "./presets";
import { fingerprintFor } from "./csv";
import type { Job, JobInput, JobStatus, Settings, Tier } from "./types";

type Row = Record<string, unknown>;

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "jobsurveyor.db");

declare global {
  // eslint-disable-next-line no-var
  var __jobsurveyorDb: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (globalThis.__jobsurveyorDb) return globalThis.__jobsurveyorDb;
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fingerprint TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL,
      external_id TEXT,
      title TEXT NOT NULL,
      company TEXT,
      url TEXT,
      location_text TEXT,
      province TEXT,
      district TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      employment_type TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      description TEXT,
      analysis TEXT,
      posted_at TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      applied_at TEXT,
      score REAL NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT 'C',
      matched TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score DESC);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_province ON jobs(province);

    CREATE TABLE IF NOT EXISTS import_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      total INTEGER NOT NULL,
      inserted INTEGER NOT NULL,
      updated INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  globalThis.__jobsurveyorDb = db;
  return db;
}

function now(): string {
  return new Date().toISOString();
}

export function getSettings(): Settings {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'app'").get() as Row | undefined;
  if (!row) return { ...DEFAULT_SETTINGS, weights: { ...DEFAULT_SETTINGS.weights } };
  try {
    const parsed = JSON.parse(String(row.value)) as Partial<Settings>;
    const storedWeights =
      parsed.weights && typeof parsed.weights === "object" ? parsed.weights : { ...DEFAULT_SETTINGS.weights };
    return {
      weights: storedWeights,
      baseProvince: parsed.baseProvince || DEFAULT_SETTINGS.baseProvince,
      maxKm: typeof parsed.maxKm === "number" ? parsed.maxKm : DEFAULT_SETTINGS.maxKm,
      minSalary: typeof parsed.minSalary === "number" ? parsed.minSalary : DEFAULT_SETTINGS.minSalary,
      targetWeight: typeof parsed.targetWeight === "number" ? parsed.targetWeight : DEFAULT_SETTINGS.targetWeight,
      activePreset: parsed.activePreset || detectPreset(
        storedWeights,
        typeof parsed.targetWeight === "number" ? parsed.targetWeight : DEFAULT_SETTINGS.targetWeight,
      ),
    };
  } catch {
    return { ...DEFAULT_SETTINGS, weights: { ...DEFAULT_SETTINGS.weights } };
  }
}

export function saveSettings(settings: Settings): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO settings(key, value) VALUES('app', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(JSON.stringify(settings));
  rescoreAll();
}

function mapJob(row: Row): Job {
  return {
    id: Number(row.id),
    fingerprint: String(row.fingerprint),
    source: String(row.source),
    external_id: row.external_id ? String(row.external_id) : null,
    title: String(row.title),
    company: row.company ? String(row.company) : null,
    url: row.url ? String(row.url) : null,
    location_text: row.location_text ? String(row.location_text) : null,
    province: row.province ? String(row.province) : null,
    district: row.district ? String(row.district) : null,
    salary_min: row.salary_min === null ? null : Number(row.salary_min),
    salary_max: row.salary_max === null ? null : Number(row.salary_max),
    employment_type: row.employment_type ? String(row.employment_type) : null,
    tags: safeArray(row.tags),
    description: row.description ? String(row.description) : null,
    analysis: row.analysis ? String(row.analysis) : null,
    posted_at: row.posted_at ? String(row.posted_at) : null,
    notes: row.notes ? String(row.notes) : null,
    status: String(row.status) as JobStatus,
    applied_at: row.applied_at ? String(row.applied_at) : null,
    score: Number(row.score),
    tier: String(row.tier) as Tier,
    matched: safeArray(row.matched),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function safeArray(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export interface JobFilters {
  q?: string;
  tier?: string;
  status?: string;
  province?: string;
  limit?: number;
}

export function listJobs(filters: JobFilters = {}): Job[] {
  const db = getDb();
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filters.q) {
    where.push("(lower(title) LIKE ? OR lower(company) LIKE ? OR lower(tags) LIKE ?)");
    const q = `%${filters.q.toLowerCase()}%`;
    params.push(q, q, q);
  }
  if (filters.tier && ["A", "B", "C"].includes(filters.tier)) {
    where.push("tier = ?");
    params.push(filters.tier);
  }
  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.province) {
    where.push("lower(province) = ?");
    params.push(filters.province.toLowerCase());
  }

  const sql = `SELECT * FROM jobs ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY score DESC, id DESC LIMIT ?`;
  params.push(filters.limit ?? 500);
  return (db.prepare(sql).all(...params) as Row[]).map(mapJob);
}

export function getJob(id: number): Job | null {
  const row = getDb().prepare("SELECT * FROM jobs WHERE id = ?").get(id) as Row | undefined;
  return row ? mapJob(row) : null;
}

export function getJobsByIds(ids: number[]): Job[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return (getDb()
    .prepare(`SELECT * FROM jobs WHERE id IN (${placeholders}) ORDER BY score DESC`)
    .all(...ids) as Row[]).map(mapJob);
}

export interface UpsertResult {
  inserted: number;
  updated: number;
}

export function upsertJobs(inputs: JobInput[], filename = "csv"): UpsertResult {
  const db = getDb();
  const settings = getSettings();
  const timestamp = now();
  let inserted = 0;
  let updated = 0;

  const select = db.prepare("SELECT id FROM jobs WHERE fingerprint = ?");
  const insert = db.prepare(`
    INSERT INTO jobs (
      fingerprint, source, external_id, title, company, url, location_text, province, district,
      salary_min, salary_max, employment_type, tags, description, analysis, posted_at, notes,
      status, score, tier, matched, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new',?,?,?,?,?)
  `);
  const update = db.prepare(`
    UPDATE jobs SET
      source = ?, external_id = ?, title = ?, company = ?, url = ?, location_text = ?,
      province = ?, district = ?, salary_min = ?, salary_max = ?, employment_type = ?,
      tags = ?, description = ?, analysis = COALESCE(?, analysis), posted_at = ?,
      score = ?, tier = ?, matched = ?, updated_at = ?
    WHERE id = ?
  `);

  db.exec("BEGIN");
  try {
    for (const job of inputs) {
      const fingerprint = fingerprintFor(job);
      const scored = scoreJob(job, settings);
      const tags = JSON.stringify(job.tags);
      const matched = JSON.stringify(scored.matched);
      const existing = select.get(fingerprint) as Row | undefined;
      if (existing) {
        update.run(
          job.source, job.external_id, job.title, job.company, job.url, job.location_text,
          job.province, job.district, job.salary_min, job.salary_max, job.employment_type,
          tags, job.description, job.analysis, job.posted_at,
          scored.score, scored.tier, matched, timestamp, Number(existing.id),
        );
        updated += 1;
      } else {
        insert.run(
          fingerprint, job.source, job.external_id, job.title, job.company, job.url,
          job.location_text, job.province, job.district, job.salary_min, job.salary_max,
          job.employment_type, tags, job.description, job.analysis, job.posted_at, job.notes,
          scored.score, scored.tier, matched, timestamp, timestamp,
        );
        inserted += 1;
      }
    }
    db.prepare("INSERT INTO import_runs(filename, total, inserted, updated, created_at) VALUES (?,?,?,?,?)")
      .run(filename, inputs.length, inserted, updated, timestamp);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { inserted, updated };
}

export function rescoreAll(): void {
  const db = getDb();
  const settings = getSettings();
  const rows = db.prepare("SELECT * FROM jobs").all() as Row[];
  const update = db.prepare("UPDATE jobs SET score = ?, tier = ?, matched = ?, updated_at = ? WHERE id = ?");
  const timestamp = now();
  db.exec("BEGIN");
  try {
    for (const row of rows) {
      const job = mapJob(row);
      const scored = scoreJob(job, settings);
      update.run(scored.score, scored.tier, JSON.stringify(scored.matched), timestamp, job.id);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function updateJobState(
  id: number,
  patch: { status?: JobStatus; notes?: string | null },
): Job | null {
  const db = getDb();
  const current = getJob(id);
  if (!current) return null;

  const status = patch.status ?? current.status;
  const notes = patch.notes === undefined ? current.notes : patch.notes;
  const appliedAt =
    status === "applied" && !current.applied_at ? now() : current.applied_at;

  db.prepare("UPDATE jobs SET status = ?, notes = ?, applied_at = ?, updated_at = ? WHERE id = ?")
    .run(status, notes, appliedAt, now(), id);
  return getJob(id);
}

export interface Stats {
  total: number;
  tierA: number;
  tierB: number;
  tierC: number;
  applied: number;
  interview: number;
  offer: number;
}

export function getStats(): Stats {
  const row = getDb().prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN tier = 'A' THEN 1 ELSE 0 END) AS tierA,
      SUM(CASE WHEN tier = 'B' THEN 1 ELSE 0 END) AS tierB,
      SUM(CASE WHEN tier = 'C' THEN 1 ELSE 0 END) AS tierC,
      SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) AS applied,
      SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) AS interview,
      SUM(CASE WHEN status = 'offer' THEN 1 ELSE 0 END) AS offer
    FROM jobs
  `).get() as Row;
  return {
    total: Number(row.total ?? 0),
    tierA: Number(row.tierA ?? 0),
    tierB: Number(row.tierB ?? 0),
    tierC: Number(row.tierC ?? 0),
    applied: Number(row.applied ?? 0),
    interview: Number(row.interview ?? 0),
    offer: Number(row.offer ?? 0),
  };
}

export function listProvinces(): string[] {
  const rows = getDb()
    .prepare("SELECT DISTINCT province FROM jobs WHERE province IS NOT NULL AND province != '' ORDER BY province")
    .all() as Row[];
  return rows.map((r) => String(r.province));
}

export function listImportRuns(limit = 10): { id: number; filename: string; total: number; inserted: number; updated: number; created_at: string }[] {
  const rows = getDb().prepare("SELECT * FROM import_runs ORDER BY id DESC LIMIT ?").all(limit) as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    filename: String(r.filename ?? "csv"),
    total: Number(r.total),
    inserted: Number(r.inserted),
    updated: Number(r.updated),
    created_at: String(r.created_at),
  }));
}
