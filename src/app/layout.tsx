import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accountability Challenge - Escrow Commitments",
  description: "Stake XLM on your personal goals and commitments. Decided by you, verified by your partner, locked in secure escrow on Stellar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-600 bg-neutral-950/20">
            &copy; {new Date().getFullYear()} Accountability Challenge. Powered by Soroban & Stellar.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
