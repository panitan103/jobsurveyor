import type { JobInput, Settings, Tier } from "./types";

/** Default keyword weights. Editable from /settings; stored per instance. */
export const DEFAULT_WEIGHTS: Record<string, number> = {
  automation: 9,
  robotic: 11,
  robot: 7,
  embedded: 9,
  firmware: 7,
  plc: 5,
  scada: 4,
  "machine vision": 5,
  vision: 3,
  python: 3,
  "c++": 3,
  iot: 3,
  commissioning: 5,
  "test engineer": 4,
  mechatronic: 8,
  ros: 6,
  rov: 6,
  sensor: 3,
  electrical: 3,
  control: 4,
};

/** Approximate road distance in km from Bangkok. Used only when the job province is known. */
export const PROVINCE_DISTANCE_KM: Record<string, number> = {
  bangkok: 0,
  "krung thep maha nakhon": 0,
  "กรุงเทพมหานคร": 0,
  nonthaburi: 20,
  นนทบุรี: 20,
  "pathum thani": 40,
  ปทุมธานี: 40,
  "samut prakan": 30,
  สมุทรปราการ: 30,
  "samut sakhon": 50,
  สมุทรสาคร: 50,
  "samut songkhram": 75,
  สมุทรสงคราม: 75,
  "nakhon pathom": 60,
  นครปฐม: 60,
  ayutthaya: 75,
  พระนครศรีอยุธยา: 75,
  "phra nakhon si ayutthaya": 75,
  saraburi: 105,
  สระบุรี: 105,
  chachoengsao: 85,
  ฉะเชิงเทรา: 85,
  chonburi: 80,
  ชลบุรี: 80,
  rayong: 180,
  ระยอง: 180,
  lopburi: 150,
  ลพบุรี: 150,
  kanchanaburi: 130,
  กาญจนบุรี: 130,
  ratchaburi: 100,
  ราชบุรี: 100,
  "nakhon ratchasima": 260,
  นครราชสีมา: 260,
  "khon kaen": 450,
  ขอนแก่น: 450,
  "chiang mai": 700,
  เชียงใหม่: 700,
  phuket: 860,
  ภูเก็ต: 860,
  "songkhla": 950,
  สงขลา: 950,
};

export const DEFAULT_SETTINGS: Settings = {
  weights: DEFAULT_WEIGHTS,
  baseProvince: "Bangkok",
  maxKm: 120,
  minSalary: 0,
  targetWeight: 48,
  activePreset: "manufacturing",
};

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function distanceForProvince(province: string | null | undefined): number | null {
  const key = normalizeText(province);
  if (!key) return null;
  if (key in PROVINCE_DISTANCE_KM) return PROVINCE_DISTANCE_KM[key];
  // tolerate "Mueang Nonthaburi" / "Amphoe ..." prefixes
  for (const [name, km] of Object.entries(PROVINCE_DISTANCE_KM)) {
    if (key.includes(name)) return km;
  }
  return null;
}

export interface ScoreResult {
  score: number;
  tier: Tier;
  matched: string[];
  distanceKm: number | null;
  penalties: { label: string; points: number }[];
}

export function scoreJob(job: JobInput, settings: Settings): ScoreResult {
  const titleText = normalizeText([job.title, job.tags.join(" "), job.employment_type].join(" "));
  const descriptionText = normalizeText(job.description);
  const title = normalizeText(job.title);

  const weights = settings.weights ?? {};
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + Math.max(0, w), 0);

  const matched: string[] = [];
  let matchedWeight = 0;
  let titleWeight = 0;

  for (const [keyword, weight] of Object.entries(weights)) {
    if (weight <= 0) continue;
    const needle = normalizeText(keyword);
    if (!needle) continue;

    const inTitleOrTags = titleText.includes(needle);
    const inDescription = descriptionText.includes(needle);
    if (!inTitleOrTags && !inDescription) continue;

    matched.push(keyword);
    // A keyword only mentioned in a long description counts half: it signals context,
    // not that the role is actually about that skill.
    matchedWeight += inTitleOrTags ? weight : weight * 0.5;
    if (title.includes(needle)) titleWeight += weight;
  }

  const target = settings.targetWeight > 0 ? settings.targetWeight : Math.max(1, totalWeight * 0.45);
  const coverage = Math.min(1, matchedWeight / target);
  const titleBonus = Math.min(10, titleWeight / 2);
  let score = coverage * 100 + titleBonus;

  const penalties: { label: string; points: number }[] = [];
  const distanceKm = distanceForProvince(job.province);
  if (distanceKm !== null && settings.maxKm > 0 && distanceKm > settings.maxKm) {
    const over = distanceKm - settings.maxKm;
    const points = Math.min(30, 5 + over / 10);
    penalties.push({ label: `distance +${Math.round(over)}km`, points });
  }
  if (settings.minSalary > 0 && job.salary_max !== null && job.salary_max < settings.minSalary) {
    penalties.push({ label: "salary below minimum", points: 20 });
  }

  score -= penalties.reduce((sum, p) => sum + p.points, 0);
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    tier: tierForScore(score),
    matched,
    distanceKm,
    penalties,
  };
}

export function tierForScore(score: number): Tier {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  return "C";
}
