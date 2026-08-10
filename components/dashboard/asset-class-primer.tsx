"use client";

import { Building2, Landmark, Route, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Panel } from "@/components/dashboard/panel";
import type { ActionPlan } from "@/types/analysis";
import type { AssetClass } from "@/types/portfolio";

type PrimerCard = {
  key: AssetClass;
  title: string;
  icon: typeof Landmark;
  accent: string;
  soft: string;
  whatItIs: string;
  howYouEarn: string;
  whatCanGoWrong: string;
  versusShares: string;
};

const PRIMERS: PrimerCard[] = [
  {
    key: "debt",
    title: "Bonds and government securities",
    icon: Landmark,
    accent: "#5bb7c9",
    soft: "rgba(91,183,201,0.12)",
    whatItIs:
      "You are lending money — to the government, or to a company — for a fixed period. They agree in advance what they will pay you and when they will return your money.",
    howYouEarn:
      "Interest, at a rate fixed on the day you buy. It does not depend on the company doing well, only on it staying solvent.",
    whatCanGoWrong:
      "The borrower fails to repay, which is what a credit rating measures. If you sell before maturity, the price will have moved with interest rates.",
    versusShares:
      "Shares pay you only if the business prospers. A bond pays the same whether the market rises or falls, which is why it holds steady when shares do not.",
  },
  {
    key: "reit",
    title: "REITs — property, without buying property",
    icon: Building2,
    accent: "#df6ccf",
    soft: "rgba(223,108,207,0.11)",
    whatItIs:
      "A REIT owns a portfolio of commercial buildings — offices or malls — and sells small units of that ownership on the stock exchange. Buying one unit makes you a part-owner of the whole portfolio.",
    howYouEarn:
      "Rent. SEBI rules require REITs to distribute the large majority of what they collect to unit holders, usually every quarter.",
    whatCanGoWrong:
      "If tenants leave or renew at lower rents, distributions fall. The unit price also moves during the day like a share.",
    versusShares:
      "Income comes from rent contracts rather than company profits, so it does not usually rise and fall in step with the stock market.",
  },
  {
    key: "invit",
    title: "InvITs — roads, power lines and pipelines",
    icon: Route,
    accent: "#27b386",
    soft: "rgba(39,179,134,0.11)",
    whatItIs:
      "The same idea as a REIT, but the assets are infrastructure — power transmission lines, toll roads, gas pipelines — rather than buildings.",
    howYouEarn:
      "Regulated charges and tolls, paid out quarterly. Much of it is contracted years in advance, which is why the income tends to be predictable.",
    whatCanGoWrong:
      "These assets have a finite operating life, so part of what you receive is your own capital coming back rather than pure income. Some trade thinly.",
    versusShares:
      "Revenue is set by regulation or traffic rather than by earnings growth, which makes it one of the least stock-market-like things on an Indian exchange.",
  },
];

export function AssetClassPrimer({ actionPlan }: { actionPlan: ActionPlan | null }) {
  const reduceMotion = useReducedMotion();

  const gapClasses = new Set(actionPlan?.gaps.map((gap) => gap.assetClass) ?? []);
  const relevant = PRIMERS.filter((primer) => gapClasses.has(primer.key));
  const cards = relevant.length > 0 ? relevant : PRIMERS;

  return (
    <Panel
      title="What these actually are"
      subtitle="Most people skip bonds, REITs and InvITs because nobody explained them, not because they decided against them."
      action={<ShieldCheck size={18} className="text-[#27b386]" aria-hidden="true" />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article
              key={card.key}
              className="flex flex-col rounded-[24px] border border-[#17141c]/8 bg-white/68 p-5"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-full"
                style={{ backgroundColor: card.soft, color: card.accent }}
              >
                <Icon size={18} aria-hidden="true" />
              </span>

              <h3 className="mt-4 text-[15px] font-semibold leading-snug text-[#17141c]">{card.title}</h3>

              <div className="mt-4 space-y-3.5">
                {[
                  ["What it is", card.whatItIs],
                  ["How you get paid", card.howYouEarn],
                  ["What can go wrong", card.whatCanGoWrong],
                  ["Why it behaves differently", card.versusShares],
                ].map(([label, body]) => (
                  <div key={label}>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: card.accent }}
                    >
                      {label}
                    </p>
                    <p className="mt-1 text-sm leading-[1.65] text-[#17141c]/65">{body}</p>
                  </div>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>

      <p className="mt-6 rounded-2xl bg-[#17141c]/4 px-4 py-3.5 text-xs leading-relaxed text-[#17141c]/58">
        All three are regulated by SEBI and traded on NSE and BSE, the same exchanges as shares. None of this is a
        recommendation to buy — it is background so the matches below mean something to you.
      </p>
    </Panel>
  );
}
