import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ConnectFlow } from "@/components/connect/connect-flow";
import { MouseGlow } from "@/components/landing/mouse-glow";

export const metadata: Metadata = {
  title: "Connect your accounts · Vantage",
  description: "Link your holdings through the Account Aggregator network, a CAS statement, or manual entry.",
};

export default function ConnectPage() {
  return (
    <div className="relative min-h-screen">
      <MouseGlow />

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 12% 6%, rgba(185,173,255,0.26), transparent 32rem), radial-gradient(circle at 88% 82%, rgba(223,108,207,0.14), transparent 30rem)",
        }}
      />

      <header className="px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#17141c]/10 bg-white/70 text-[#17141c]/62 transition hover:text-[#17141c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/40"
            aria-label="Back to home"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </Link>
          <Image src="/vantage-logo.png" alt="Vantage" width={130} height={42} className="h-auto w-[104px]" priority />
        </div>
      </header>

      <main>
        <ConnectFlow />
      </main>

      <footer className="px-5 pb-10 sm:px-8">
        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[#17141c]/45">
          Prototype flow. No real accounts are contacted and no live financial data is fetched — the Account Aggregator
          handshake shown here is simulated for demonstration.
        </p>
      </footer>
    </div>
  );
}
