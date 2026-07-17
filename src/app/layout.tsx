import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miralvento CRM — Contactos",
  description: "Ficha de contactos — reto técnico Kontaktu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <Link
          href="/"
          className="border-b border-zinc-200 bg-white px-6 py-3 text-sm font-semibold tracking-tight text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        >
          Miralvento <span className="font-normal text-zinc-400">· CRM</span>
        </Link>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
