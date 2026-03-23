import type { Metadata } from "next";
import { Pacifico } from "next/font/google";
import Link from "next/link";
import { ScrollToContentLink } from "@/features/public-content/components/scroll-to-content-link";
import "./globals.css";

const logoFont = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Unitic CMS",
  description: "Unitic CMS public site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  return (
    <html lang="tr">
      <body className={`${logoFont.variable} antialiased`}>
        <div className="relative">
          <header className="relative z-40 px-4 pt-4 pb-1">
            <div className="mx-auto grid w-full max-w-290 grid-cols-1 items-center gap-4 rounded-[18px] border border-[rgba(85,104,146,0.24)] bg-[rgba(10,15,27,0.78)] px-4 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.18)] backdrop-blur-[18px] md:grid-cols-[minmax(0,1fr)_auto]">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Devilyxrd ana sayfa">
                <span
                  className="inline-flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-[14px] border border-[rgba(92,116,171,0.32)] bg-[linear-gradient(145deg,rgba(56,189,248,0.14),rgba(34,197,94,0.12))]"
                  aria-hidden
                >
                  <span className="h-[0.85rem] w-[0.85rem] rounded-full bg-[linear-gradient(135deg,#38bdf8,#22c55e)] shadow-[0_0_0_6px_rgba(56,189,248,0.1)]" />
                </span>
                <div>
                  <p className="brand-logo text-[1.34rem] text-[#d7ebff]">Devilyxrd</p>
                </div>
              </Link>

              <nav
                className="flex flex-wrap items-center justify-start gap-2 rounded-full border border-[rgba(84,101,143,0.18)] bg-[rgba(20,27,44,0.55)] p-1 md:justify-center"
                aria-label="Genel gezinti"
              >
                <Link
                  href="/"
                  className="rounded-full border border-[rgba(97,144,186,0.32)] bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(34,197,94,0.14))] px-4 py-2 text-[0.84rem] font-semibold text-[#eff7ff]"
                >
                  Yayın Akışı
                </Link>
                <ScrollToContentLink
                  className="rounded-full border border-transparent px-4 py-2 text-[0.84rem] font-semibold text-(--text-muted) transition hover:border-[rgba(85,104,146,0.3)] hover:bg-[rgba(37,48,76,0.56)] hover:text-(--text)"
                >
                  İçerikler
                </ScrollToContentLink>
                <a
                  href={`${apiBase}/api/public/all`}
                  className="rounded-full border border-transparent px-4 py-2 text-[0.84rem] font-semibold text-(--text-muted) transition hover:border-[rgba(85,104,146,0.3)] hover:bg-[rgba(37,48,76,0.56)] hover:text-(--text)"
                  target="_blank"
                  rel="noreferrer"
                >
                  Public API
                </a>
              </nav>
            </div>
          </header>

          <main>{children}</main>

          <footer className="px-4 pb-4">
            <div className="mx-auto grid w-full max-w-290 grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[14px] border border-[rgba(67,83,122,0.28)] bg-[rgba(12,17,29,0.72)] p-4">
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#9fddff]">Unitic CMS</p>
                <h2 className="mt-2 max-w-[20ch] text-[clamp(1.02rem,0.95rem+0.5vw,1.3rem)] font-bold leading-[1.08] tracking-[-0.02em] text-(--text)">
                  Yayınlanan içerikler için temiz ve hızlı public katman.
                </h2>
                <p className="mt-2 max-w-[42ch] text-[0.84rem] text-(--text-muted)">
                  Editörden bağımsız, içerik odaklı bir sunum yüzeyi.
                </p>
              </div>

              <div className="rounded-[14px] border border-[rgba(67,83,122,0.28)] bg-[rgba(12,17,29,0.72)] p-4">
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#9fddff]">Bağlantılar</p>
                <div className="mt-3 grid gap-2 text-sm text-(--text)">
                  <Link className="font-medium hover:text-[#c6f7e1]" href="/">
                    Ana sayfa
                  </Link>
                  <ScrollToContentLink className="text-left font-medium hover:text-[#c6f7e1]">
                    İçerik listesi
                  </ScrollToContentLink>
                  <a href={`${apiBase}/api/public/all`} target="_blank" rel="noreferrer">
                    JSON çıktısı
                  </a>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-3 flex w-full max-w-290 flex-col justify-between gap-2 border-t border-[rgba(67,83,122,0.24)] pt-2 text-[0.74rem] text-(--text-muted) md:flex-row">
              <p>Unitic CMS Public Surface</p>
              <p>NestJS API · Next.js Web</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
