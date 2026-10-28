export type Tier = "A" | "B" | "C";

export type JobStatus =
  | "new"
  | "shortlisted"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

export const JOB_STATUSES: JobStatus[] = [
  "new",
  "shortlisted",
  "applied",
  "interview",
  "offer",
  "rejected",
  "archived",
];

export interface JobInput {
  source: string;
  external_id: string | null;
  title: string;
  company: string | null;
  url: string | null;
  location_text: string | null;
  province: string | null;
  district: string | null;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  tags: string[];
  description: string | null;
  analysis: string | null;
  posted_at: string | null;
  notes: string | null;
}

export interface Job extends JobInput {
  id: number;
  fingerprint: string;
  score: number;
  tier: Tier;
  matched: string[];
  status: JobStatus;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  weights: Record<string, number>;
  baseProvince: string;
  maxKm: number;
  minSalary: number;
  /** Matched keyword weight that counts as a full 100. */
  targetWeight: number;
}

export interface CsvIssue {
  line: number;
  field?: string;
  message: string;
}

export interface ParsedCsvRow {
  line: number;
  ok: boolean;
  issues: CsvIssue[];
  job?: JobInput;
}

export interface ImportPreview {
  headers: string[];
  rows: ParsedCsvRow[];
  total: number;
  valid: number;
  invalid: number;
}
