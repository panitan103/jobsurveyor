import type { Metadata } from "next";
import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import { LangToggle } from "./components/lang-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "jobsurveyor",
  description: "Local-first job scoring and comparison dashboard.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand">
              <span className="brand-mark">◆</span> jobsurveyor
            </Link>
            <nav className="nav">
              <Link href="/">{t(lang, "dashboard")}</Link>
              <Link href="/import">{t(lang, "import")}</Link>
              <Link href="/settings">{t(lang, "settings")}</Link>
              <Link href="/compare">{t(lang, "compare")}</Link>
            </nav>
            <LangToggle lang={lang} />
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          <span>{t(lang, "footer")}</span>
          <span className="footer-links">
            <Link href="/terms">{t(lang, "terms")}</Link>
            <Link href="/privacy">{t(lang, "privacy")}</Link>
            <Link href="/disclaimer">{t(lang, "disclaimer")}</Link>
          </span>
        </footer>
      </body>
    </html>
  );
}
