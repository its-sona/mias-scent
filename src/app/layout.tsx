import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Mia's Scent — Elegance in every drop",
  description: "Perfumes, body mists, perfume oils and gift sets from Mia's Scent.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-blush/60 py-8 text-center text-sm text-taupe">
          <p className="font-serif text-base text-mocha">Mia&apos;s Scent</p>
          <p className="mt-1">Elegance in every drop. · Demo shop for HNG — no real payments.</p>
        </footer>
      </body>
    </html>
  );
}
