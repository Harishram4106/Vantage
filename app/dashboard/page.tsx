import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { MouseGlow } from "@/components/landing/mouse-glow";
import { MOCK_PORTFOLIOS } from "@/data/mock/portfolios";
import { analysePortfolio } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Portfolio intelligence · Vantage",
  description: "Your consolidated holdings, allocation gaps and concentration risks in one view.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ portfolio?: string }>;
}) {
  const { portfolio: requested } = await searchParams;
  const key = requested ?? "aarav";
  const portfolio = MOCK_PORTFOLIOS[key];

  if (!portfolio) notFound();

  const analysis = analysePortfolio(portfolio);
  const asOf = new Date(portfolio.generatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen pb-10">
      <MouseGlow />

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(185,173,255,0.2), transparent 30rem), radial-gradient(circle at 88% 14%, rgba(223,108,207,0.13), transparent 28rem), radial-gradient(circle at 50% 96%, rgba(39,179,134,0.09), transparent 30rem)",
        }}
      />

      <DashboardHero analysis={analysis} activeKey={key} asOf={asOf} />

      <main className="mx-auto max-w-7xl px-5 pt-10 sm:px-6 lg:px-8">
        <DashboardTabs analysis={analysis} portfolio={portfolio} activeKey={key} />

        <footer className="mt-6 rounded-[24px] border border-[#17141c]/8 bg-white/55 px-5 py-4 text-xs leading-relaxed text-[#17141c]/50 backdrop-blur-xl">
          <p>
            <span className="font-semibold text-[#17141c]/68">Prototype using synthetic data.</span> Every holding, value
            and folio number shown here is invented for demonstration. Reference allocations are illustrative rules, not
            personalised investment advice. Vantage is a read-only analysis layer — it never holds, moves or manages your
            money.
          </p>
        </footer>
      </main>
    </div>
  );
}
