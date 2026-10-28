"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const next: Lang = lang === "th" ? "en" : "th";

  function switchLang() {
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <button type="button" className="btn-ghost" onClick={switchLang} title="Switch language">
      {lang === "th" ? "EN" : "TH"}
    </button>
  );
}
