import test from "node:test";
import assert from "node:assert/strict";
import { scoreJob, tierForScore, distanceForProvince, DEFAULT_SETTINGS } from "../lib/scoring.ts";
import type { JobInput, Settings } from "../lib/types.ts";

function job(overrides: Partial<JobInput> = {}): JobInput {
  return {
    source: "test",
    external_id: "1",
    title: "Automation Engineer",
    company: "Example",
    url: null,
    location_text: null,
    province: "Bangkok",
    district: null,
    salary_min: null,
    salary_max: null,
    employment_type: "Full-time",
    tags: ["automation", "PLC"],
    description: "Commission PLC-controlled production lines.",
    analysis: null,
    posted_at: null,
    notes: null,
    ...overrides,
  };
}

const settings: Settings = {
  weights: { automation: 10, plc: 10, robotics: 10 },
  baseProvince: "Bangkok",
  maxKm: 100,
  minSalary: 0,
  targetWeight: 20,
  activePreset: "custom",
};

test("matched keywords raise the score", () => {
  const strong = scoreJob(job(), settings);
  const weak = scoreJob(job({ title: "Accounting Officer", tags: [], description: "Ledger work." }), settings);

  assert.equal(strong.matched.length, 2);
  assert.equal(weak.matched.length, 0);
  assert.ok(strong.score > weak.score);
  assert.equal(weak.score, 0);
});

test("scores are capped at 100", () => {
  const result = scoreJob(
    job({
      title: "Automation PLC Robotics Engineer",
      tags: ["automation", "plc", "robotics"],
      description: "automation plc robotics",
    }),
    settings,
  );
  assert.ok(result.score <= 100);
  assert.equal(result.tier, "A");
});

test("distance beyond the limit applies a penalty", () => {
  const near = scoreJob(job({ province: "Bangkok" }), settings);
  const far = scoreJob(job({ province: "Chiang Mai" }), settings);

  assert.equal(near.distanceKm, 0);
  assert.equal(far.distanceKm, 700);
  assert.ok(far.score < near.score);
  assert.ok(far.penalties.some((p) => p.label.startsWith("distance")));
});

test("salary below the floor applies a penalty", () => {
  const withFloor: Settings = { ...settings, minSalary: 40000 };
  const low = scoreJob(job({ salary_max: 30000 }), withFloor);
  assert.ok(low.penalties.some((p) => p.label.includes("salary")));
});

test("unknown province is neutral", () => {
  assert.equal(distanceForProvince("Atlantis"), null);
  const result = scoreJob(job({ province: "Atlantis" }), settings);
  assert.equal(result.distanceKm, null);
  assert.equal(result.penalties.length, 0);
});

test("tier thresholds", () => {
  assert.equal(tierForScore(80), "A");
  assert.equal(tierForScore(79), "B");
  assert.equal(tierForScore(65), "B");
  assert.equal(tierForScore(64), "C");
});

test("default settings include the core keywords", () => {
  assert.ok(DEFAULT_SETTINGS.weights.automation > 0);
  assert.ok(DEFAULT_SETTINGS.weights.embedded > 0);
});
