import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource-variable/inter-tight";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vantage | See Everything. Invest Smarter.",
  description:
    "AI-powered unified portfolio intelligence for investors across brokers, mutual funds, EPF, bonds, gold, REITs, and InvITs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
