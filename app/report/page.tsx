import { notFound } from "next/navigation";

import { MOCK_PORTFOLIOS } from "@/data/mock/portfolios";
import { analysePortfolio } from "@/lib/analytics";
import { ReportDocument } from "@/components/report/report-document";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ portfolio?: string }>;
}) {
  const { portfolio: requested } = await searchParams;
  const key = requested ?? "aarav";
  const portfolio = MOCK_PORTFOLIOS[key];

  if (!portfolio) notFound();

  const analysis = analysePortfolio(portfolio);

  return <ReportDocument analysis={analysis} portfolio={portfolio} />;
}
