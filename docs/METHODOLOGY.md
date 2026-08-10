# Vantage — Analytics Methodology

How every number in the Vantage dashboard is produced.

This document exists because a portfolio risk score that cannot be explained is worth
less than no score at all. Every figure below is computed by a deterministic rule that
a reader can re-derive by hand. Nothing is learned, fitted, or back-tested, and no
figure depends on a model whose behaviour we cannot account for.

**Scope note.** Vantage diagnoses a portfolio and describes the category of gap it
finds. It does not forecast returns, rank instruments by expected performance, or give
personalised investment advice. It is a read-only analysis layer and is not a
registered investment adviser.

---

## 1. Design principles

| Principle | How it shows up |
|---|---|
| Rule-based over learned | Every score is arithmetic on disclosed inputs. There is no trained model anywhere in the analytics path. |
| Explanation travels with the number | Every computed object carries a `why` string generated alongside the value, so the UI never has to reconstruct the reasoning. |
| Understate rather than overstate | Where data is partial (fund look-through), figures are reported as floors — "at least this, never less". |
| Separate diagnosis from action | Findings describe what is true. Instrument matching responds to it. The two are computed independently. |
| The AI explains, never calculates | The language model receives finished numbers and is forbidden from producing new ones. |

---

## 2. Normalisation and look-through

Holdings arrive from CAS statements, the Account Aggregator network, EPFO, or manual
entry, and are normalised into a single `UnifiedPortfolio` schema
(`types/portfolio.ts`) before any analysis runs.

Each holding is decomposed into underlying asset classes rather than being filed under
a single label. A hybrid fund is genuinely part equity and part debt, and is counted
that way.

**Asset mix by fund category** (`lib/analytics/fund-taxonomy.ts`) — selected rows:

| Category | Equity | Debt | Gold | Cash |
|---|---|---|---|---|
| Index equity | 0.99 | — | — | 0.01 |
| Large cap | 0.97 | — | — | 0.03 |
| Flexi cap | 0.95 | — | — | 0.05 |
| Small cap | 0.94 | — | — | 0.06 |
| Hybrid aggressive | 0.70 | 0.27 | — | 0.03 |
| Hybrid balanced | 0.50 | 0.47 | — | 0.03 |
| Hybrid conservative | 0.22 | 0.75 | — | 0.03 |
| Corporate bond | — | 0.98 | — | 0.02 |
| Gold ETF | — | — | 1.00 | — |

Direct treatments: EPF, PPF, NPS and fixed deposits count as debt; sovereign gold
bonds and gold ETFs as gold; REITs and InvITs as their own classes.

---

## 3. Risk capacity score

Self-declared risk appetite is unreliable — investors routinely describe themselves as
aggressive while holding a portfolio they could not tolerate a drawdown in. Vantage
therefore computes **capacity** from circumstances and reports it alongside the stated
appetite, flagging any mismatch.

Four sub-scores, each clamped to 0–100:

```
ageScore         = ((60 − age) / 35) × 100
horizonScore     = (horizonYears / 15) × 100
dependentsScore  = 100 − (dependents × 15)
drawdownScore    = (drawdownTolerancePercent / 40) × 100
```

Weighted composite:

```
capacityScore = horizonScore × 0.30
              + ageScore     × 0.25
              + drawdownScore × 0.25
              + dependentsScore × 0.20
```

**Banding:** `< 40` conservative · `40–69` moderate · `≥ 70` aggressive.

Horizon carries the largest weight because time to recovery is the single strongest
determinant of how much volatility a portfolio can absorb.

### Reference allocations

The derived band selects a reference mix. These are conventional planning heuristics,
presented as a reference point rather than a target the investor must hit.

| Band | Equity | Debt | Gold | REIT | InvIT | Cash |
|---|---|---|---|---|---|---|
| Conservative | 30% | 50% | 10% | 5% | 0% | 5% |
| Moderate | 55% | 28% | 8% | 6% | 0% | 3% |
| Aggressive | 75% | 12% | 6% | 4% | 0% | 3% |

---

## 4. Portfolio health score

A weighted composite of four independently computed components. Every component is
reported separately in the UI with its own explanation, so the headline number is never
the only thing on screen.

```
healthScore = allocationFit   × 0.35
            + diversification × 0.30
            + downsideBuffer  × 0.20
            + liquidity       × 0.15
```

**Banding:** `< 40` poor · `40–59` fair · `60–79` good · `≥ 80` strong.

### 4.1 Allocation fit (35%)

```
totalAbsoluteDrift = Σ |actualPercent − referencePercent|   across all asset classes
allocationFit      = clamp(100 − totalAbsoluteDrift × 1.2)
```

Absolute drift is used so that being over-allocated is penalised as much as being
under-allocated.

### 4.2 Diversification (30%)

Three penalties, each capped so no single factor can dominate:

```
issuerPenalty   = clamp(herfindahlIndex × 220,                0, 60)
amcPenalty      = clamp(max(0, topAmcShare − 40) × 0.8,       0, 30)
overlapPenalty  = clamp(max(0, overlapOfEquity − 15) × 0.7,   0, 35)

diversification = clamp(100 − issuerPenalty − amcPenalty − overlapPenalty)
```

The **Herfindahl index** is the sum of squared issuer shares of equity exposure. Values
above **0.18** indicate meaningful single-name concentration.

The AMC penalty engages beyond 40% of the fund corpus with one house — holding several
schemes from one fund house is a concentration most investors do not perceive.

The overlap penalty engages beyond 15% and is described in section 5.

### 4.3 Downside buffer (20%)

```
defensiveShare  = debt% + gold% + cash%
targetDefensive = referenceDebt + referenceGold + referenceCash
downsideBuffer  = clamp(100 − max(0, targetDefensive − defensiveShare) × 2.2)
```

Only a shortfall is penalised. Holding more defensive assets than the reference does
not reduce this component.

### 4.4 Liquidity (15%)

```
lockedShare = value in EPF/PPF/NPS, non-breakable FDs, and SGBs ÷ gross portfolio
liquidity   = clamp(100 − max(0, lockedShare − 25) × 1.5)
```

Up to 25% locked is treated as normal for an Indian retail portfolio, given the
structural role of EPF.

---

## 5. Look-through fund overlap

Two funds can carry different names, different mandates and different fund houses, and
still own substantially the same companies. This is the risk retail investors are least
equipped to see, because it is invisible at the fund level.

### 5.1 Attribution

For each fund holding:

```
fundEquityValue = currentValue × categoryEquityWeight
issuerValue     = fundEquityValue × (disclosedWeight ÷ 100)
```

Attributed issuer values are summed with directly held shares to give true exposure per
company. Percentages use **total equity exposure** as the denominator — including the
portion that could not be attributed — so figures are never inflated by only counting
what is visible.

### 5.2 Fund-to-fund overlap

The standard minimum-weight measure:

```
overlap(A, B) = Σ min(weight of issuer i in A, weight of issuer i in B)
```

This answers "what share of these two portfolios is the same book of stocks", which is
the property that makes holding both redundant. A simple count of shared names would
overstate the problem; an intersection of weights understates it. The minimum is the
conventional middle.

### 5.3 Coverage — the honest limitation

Factsheets disclose top holdings, not the complete portfolio. Coverage is reported
explicitly:

```
coveragePercent = attributedFundEquity ÷ totalFundEquity
```

In the worked example below, coverage is **42.1%**. Every overlap figure is therefore a
**floor**: the true duplication is at least what is shown and never less. This is stated
in the UI, not buried here.

---

## 6. Industry concentration

Look-through produces exposure per company. Grouping those companies by the industry
they operate in reveals a bet the investor never consciously placed — several funds,
each looking different, can converge on the same sector.

Aggregation runs on the **full** issuer list, not the top-12 slice sent to the UI:

```
sectorValue          = Σ value of every attributed company in that industry
sectorPercentOfEquity = sectorValue ÷ total equity exposure
```

The denominator is total equity exposure, including the portion that could not be
attributed, so a sector's share is never inflated by only counting visible holdings.

### Concentration bands

Thresholds deliberately mirror the health-score bands, so a colour means the same thing
everywhere in the product:

| Band | Share of equity |
|---|---|
| Low | under 10% |
| Moderate | 10–20% |
| High | 20–35% |
| Very high | over 35% |

A **sector Herfindahl index** squares and sums each industry's share. Above **0.25**
indicates equity leaning heavily on a few industries.

A finding is raised at **≥ 25%** in a single industry, escalating to critical at
**≥ 35%**. The 20–25% range is surfaced visually in the Industries view but kept out of
the findings feed to avoid crowding it.

---

## 7. Shape comparison against risk bands

**This is not a peer benchmark.** Vantage holds no data on what other investors own, and
the reference allocations are conventional planning heuristics rather than observed
behaviour. Describing them as "what investors like you hold" would be a fabricated
statistic, so the product never does.

What is computed instead is more useful: the portfolio is measured against the reference
mix for **every** risk band, and the closest match identified.

```
distance(band) = Σ |actualPercent − referencePercent(band)|   across all asset classes
closestBand    = the band with the lowest distance
shapeMismatch  = closestBand ≠ derivedBand
```

The divergence is the finding. An investor's circumstances can point to one band while
the portfolio they have actually built resembles another — and the direction of that
divergence changes the advice entirely.

The resulting finding is **critical** when the portfolio resembles the aggressive
reference while circumstances point elsewhere (carrying more risk than supported), and a
**warning** in the opposite direction (carrying less risk than the horizon could
support).

---

## 8. Instrument matching

Matching responds to a diagnosed gap. It is explicitly **not** a recommendation engine
and contains no view on which instrument will perform better.

### 6.1 Gap detection

```
shortfallPercent = referencePercent − actualPercent
gap exists when shortfallPercent ≥ 3 percentage points
shortfallValue   = totalPortfolioValue × shortfallPercent ÷ 100
```

Candidates are filtered to instruments whose asset class fills the gap **and** whose
suitability band includes the investor's derived risk capacity.

### 6.2 Fit score

Additive, capped at 100, with every point traceable to a stated reason:

| Factor | Points |
|---|---|
| Fills the identified gap | 40 |
| Maturity within horizon, or perpetual with horizon ≥ 5 yrs | 20 |
| Perpetual with horizon < 5 yrs | 8 |
| Maturity beyond horizon | 6 |
| Sovereign credit | 20 |
| AAA credit | 17 |
| AA-grade credit | 10 |
| Not credit rated (equity-like) | 8 |
| Highly liquid | 10 |
| Moderately liquid | 7 (4 if liquidity is already tight) |
| Thinly traded | 2 |
| Minimum investment within the shortfall | 10 |

**No factor rewards past or expected return.** Ordering is fit to the gap, not a
performance ranking. At most three instruments are shown per gap.

---

## 9. Finding thresholds

| Finding | Triggers when | Escalates to critical |
|---|---|---|
| Equity overweight | ≥ 10 pts above reference | ≥ 25 pts above |
| Equity underweight | ≥ 10 pts below reference | ≥ 30 pts below and horizon ≥ 10 yrs |
| Fixed income underweight | ≥ 10 pts below reference | debt < 5% of portfolio |
| Fund-house concentration | ≥ 50% of fund corpus in one AMC, ≥ 2 schemes | — |
| Single-issuer concentration | ≥ 15% of equity | ≥ 25% of equity |
| Hidden duplication | company reached via ≥ 2 routes | ≥ 25% of equity |
| Fund pair overlap | ≥ 12% overlap | — |
| No REIT/InvIT exposure | < 1% held against a non-zero reference | — |
| Liquidity locked | liquidity component < 60 | — |

Single-issuer concentration is **suppressed** when look-through already reports the same
company, so the investor is never shown two different figures for one holding.

---

## 10. AI explanation layer

The narrative is generated by Gemini 2.5 Flash and is constrained by a system prompt with
five hard rules:

1. Every number stated must appear in the supplied JSON. No new calculation, no
   estimation, no rounding that changes meaning.
2. No return forecasts or projections of future value.
3. No instruction to buy or sell any specific security, fund or scheme.
4. No invented context about the investor.
5. No manufactured concern when the portfolio is genuinely sound.

The payload sent to the model contains allocation, drift, risk profile, health
components, concentration, overlap, findings, and **gap categories with amounts only —
never instrument names**, so the model cannot be led into naming a security.

The model receives finished figures and returns prose. It performs no arithmetic and
has no access to the analytics engine.

---

## 11. Known limitations

Stated plainly, because a methodology that only lists strengths is not a methodology.

| Limitation | Consequence |
|---|---|
| Factsheet coverage is partial (~25–55% of fund equity in current fixtures) | Overlap and issuer concentration are floors, not exact figures |
| Factsheets are monthly | Look-through lags actual holdings by up to a month |
| Reference allocations are planning heuristics | They are a reference point, not a personalised target |
| Fund asset mixes are category-typical | A fund holding unusual cash or derivatives will be slightly misattributed |
| Instrument yields are indicative | Live pricing is required before any real onboarding |
| Market-cap split for funds uses category profiles | Directly held stocks are exact; fund-held stocks are approximated |
| No tax treatment modelled | Post-tax outcomes will differ across instruments |
| Risk capacity ignores income stability and existing insurance | Both materially affect true capacity |

---

## 12. Worked example

**Aarav Sharma** — the figures below are reproducible from the fixtures in
`data/mock/portfolios.ts` and can be checked by hand.

Portfolio: ₹16,65,000 across three equity funds, three directly held stocks, EPF and
savings.

**Risk capacity**

```
age 32        → ((60 − 32) / 35) × 100 = 80
horizon 20    → (20 / 15) × 100 = 133 → clamped to 100
dependents 1  → 100 − 15 = 85
drawdown 30%  → (30 / 40) × 100 = 75

capacityScore = 100(0.30) + 80(0.25) + 75(0.25) + 85(0.20)
              = 30 + 20 + 18.75 + 17 = 85.75 → 86  → aggressive
```

Stated appetite was *moderate*, so a mismatch is flagged.

**Allocation vs aggressive reference**

| Class | Actual | Reference | Drift |
|---|---|---|---|
| Equity | 73.8% | 75% | −1.2 |
| Debt | 18.6% | 12% | +6.6 |
| Gold | 0% | 6% | −6.0 |
| REIT | 0% | 4% | −4.0 |
| Cash | 7.6% | 3% | +4.6 |

```
totalAbsoluteDrift = 22.4
allocationFit      = 100 − (22.4 × 1.2) = 73.1 → 73
```

**Look-through**

HDFC Bank is reached three ways — bought directly, held inside HDFC Flexi Cap, and held
inside ICICI Prudential Bluechip:

```
direct                      ₹2,00,000
HDFC Flexi Cap    ₹4,20,000 × 0.95 × 9.2%  = ₹36,708
ICICI Bluechip    ₹1,95,000 × 0.97 × 9.5%  = ₹17,969
                                     total = ₹2,54,677

total equity exposure = ₹3,75,000 direct + ₹8,54,150 via funds = ₹12,29,150
HDFC Bank share       = 2,54,677 ÷ 12,29,150 = 20.7%
```

Counting only directly held shares, HDFC Bank appeared to be **16.3%** of equity. True
exposure is **20.7%**. Coverage is 42.1%, so even that is a floor.

HDFC Flexi Cap and ICICI Bluechip overlap **38.7%** by the minimum-weight measure.
Notably, the two HDFC funds overlap **0%** — same fund house, genuinely different
mandates — which is why AMC concentration and holdings overlap are scored separately.

**Health score**

```
allocationFit    73 × 0.35 = 25.55
diversification  37 × 0.30 = 11.10
downsideBuffer  100 × 0.20 = 20.00
liquidity       100 × 0.15 = 15.00
                             ──────
                             71.65 → 72  (good)
```

Diversification derivation:

```
issuerPenalty  = 0.0373 × 220        = 8.2
amcPenalty     = (78.2 − 40) × 0.8   = 30.6 → capped at 30
overlapPenalty = (50.9 − 15) × 0.7   = 25.1
diversification = 100 − 8.2 − 30 − 25.1 = 36.7 → 37
```

Without look-through, diversification would score 62 and the headline health score 79.
Seeing inside the funds costs this portfolio 7 points — which is the entire argument for
building the overlap engine.

**Industry concentration**

Grouping every attributed company by industry:

| Industry | Share of equity | Companies | Band |
|---|---|---|---|
| Financial Services | 30.4% | 7 | High |
| Energy | 11.6% | 1 | Moderate |
| Information Technology | 9.5% | 4 | Low |

Sector Herfindahl index **0.116** — below the 0.25 caution line, because the tail is
genuinely spread even though the head is not.

The 30.4% in Financial Services is spread across seven separate banks and financial
firms reached through three funds plus direct holdings. It was never chosen as a bet on
one industry; it is what the portfolio adds up to.

Attributed industries total **59.9%**, which reconciles exactly with coverage:
₹3,75,000 direct equity (fully attributed) plus ₹3,59,765 of attributed fund equity,
over ₹12,29,150 total equity = 59.8%.

**Shape comparison**

Distance from each band's reference mix:

| Band | Distance |
|---|---|
| Conservative | 92.8 pts |
| Moderate | 46.8 pts |
| **Aggressive** | **22.4 pts** ← closest |

Closest band is aggressive, which matches the derived capacity band, so no shape
mismatch is raised for this portfolio.

**Contrast — Sunita Rao**

The same calculation on a different portfolio produces the opposite verdict:

| Band | Distance |
|---|---|
| Conservative | 115.6 pts |
| Moderate | 69.6 pts |
| **Aggressive** | **29.6 pts** ← closest |

Her circumstances (age 58, 4-year horizon, two dependents, 12% stated drawdown
tolerance) derive a **conservative** capacity. Her portfolio sits 29.6 points from the
aggressive reference and 115.6 from the conservative one. She has built an aggressive
portfolio on conservative circumstances — a critical finding, and one that no single
percentage on its own would have surfaced.

Her largest industry is Information Technology at **21.2%** across 3 companies, with a
sector Herfindahl of **0.0528**.

---

## Source map

| Component | File |
|---|---|
| Input schema | `types/portfolio.ts` |
| Output schema | `types/analysis.ts` |
| Asset mixes | `lib/analytics/fund-taxonomy.ts` |
| Risk capacity | `lib/analytics/risk-profile.ts` |
| Allocation and drift | `lib/analytics/allocation.ts` |
| Concentration and HHI | `lib/analytics/concentration.ts` |
| Look-through overlap | `lib/analytics/overlap.ts` |
| Industry concentration | `lib/analytics/overlap.ts` (`aggregateSectors`) |
| Shape comparison | `lib/analytics/benchmark.ts` |
| What-if simulation | `lib/analytics/simulate.ts` |
| Health score | `lib/analytics/health-score.ts` |
| Findings | `lib/analytics/findings.ts` |
| Instrument matching | `lib/analytics/instrument-match.ts` |
| AI guardrails | `lib/ai/narrative-prompt.ts` |

**Data provenance.** Fund names, company names, ISINs, instrument names and exchanges are
real. Holding weights, yields, unit counts, folio numbers and portfolio values in the
current fixtures are synthetic and labelled as such at the top of each data file. The
engines read live data through the same interfaces without modification.
