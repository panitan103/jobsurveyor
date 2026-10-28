import test from "node:test";
import assert from "node:assert/strict";
import { PRESETS, detectPreset, getPreset } from "../lib/presets.ts";

test("both presets are present and non-empty", () => {
  assert.equal(PRESETS.length, 2);
  assert.ok(getPreset("manufacturing"));
  assert.ok(getPreset("software-ops"));
  for (const preset of PRESETS) {
    assert.ok(Object.keys(preset.weights).length > 10);
    assert.ok(preset.targetWeight > 0);
  }
});

test("exact weights detect the manufacturing preset", () => {
  const preset = getPreset("manufacturing")!;
  assert.equal(detectPreset(preset.weights, preset.targetWeight), "manufacturing");
});

test("exact weights detect the software-ops preset", () => {
  const preset = getPreset("software-ops")!;
  assert.equal(detectPreset(preset.weights, preset.targetWeight), "software-ops");
});

test("edited weights fall back to custom", () => {
  const preset = getPreset("software-ops")!;
  assert.equal(detectPreset({ ...preset.weights, kubernetes: 50 }, preset.targetWeight), "custom");
  assert.equal(detectPreset(preset.weights, preset.targetWeight + 1), "custom");
});

test("software-ops weights favour devops keywords", () => {
  const preset = getPreset("software-ops")!;
  assert.ok((preset.weights.devops ?? 0) >= 8);
  assert.ok((preset.weights.kubernetes ?? 0) >= 8);
  assert.equal(preset.weights.robotic, undefined);
});
