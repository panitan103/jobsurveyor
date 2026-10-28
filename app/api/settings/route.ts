import { NextResponse, type NextRequest } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { publicUrl } from "@/lib/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function num(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const current = getSettings();
  const weights: Record<string, number> = { ...current.weights };

  for (const [key, value] of form.entries()) {
    const match = /^w\[(.+)\]$/.exec(key);
    if (!match) continue;
    weights[match[1]] = num(value, 0);
  }

  const newKeyword = String(form.get("newKeyword") ?? "").trim().toLowerCase();
  const newWeight = num(form.get("newWeight"), 0);
  if (newKeyword && newWeight > 0) weights[newKeyword] = newWeight;

  saveSettings({
    weights,
    baseProvince: String(form.get("baseProvince") || current.baseProvince),
    maxKm: num(form.get("maxKm"), current.maxKm),
    minSalary: num(form.get("minSalary"), current.minSalary),
    targetWeight: num(form.get("targetWeight"), current.targetWeight),
    activePreset: "custom",
  });

  return NextResponse.redirect(publicUrl(request, "/settings?saved=1"), 303);
}
