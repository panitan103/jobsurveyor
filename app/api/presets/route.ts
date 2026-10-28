import { NextResponse, type NextRequest } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { getPreset } from "@/lib/presets";
import { publicUrl } from "@/lib/redirect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = String(form.get("preset") ?? "");
  const preset = getPreset(id);

  if (!preset) {
    return NextResponse.json({ error: "unknown preset" }, { status: 400 });
  }

  const current = getSettings();
  saveSettings({
    ...current,
    weights: { ...preset.weights },
    targetWeight: preset.targetWeight,
    activePreset: preset.id,
  });

  return NextResponse.redirect(publicUrl(request, `/settings?preset=${preset.id}`), 303);
}
