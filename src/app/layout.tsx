import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Newsreader, Public_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Miralvento CRM", template: "%s · Miralvento CRM" },
  description: "Un CRM que convierte datos sucios en fichas claras.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${publicSans.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Saltar al contenido
        </a>

        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-baseline gap-2 rounded-sm">
              <span className="font-serif text-xl font-medium tracking-tight text-ink">Miralvento</span>
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-ink-subtle uppercase">CRM</span>
            </Link>
            <p className="hidden text-sm text-ink-muted sm:block">Datos sucios, fichas claras.</p>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-6 text-xs text-ink-subtle sm:flex-row sm:justify-between sm:px-6">
            <p>Dataset ficticio de una inmobiliaria madrileña. Ningún contacto es real.</p>
            <a
              href="https://github.com/PVmendez/real-estate-crm"
              className="underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              Código fuente en GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
