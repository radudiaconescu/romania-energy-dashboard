# TODOS — Romania Energy Dashboard

## Open

### P1 — Infrastructure

#### [ ] Init git repo + push to GitHub
**What:** `git init && git add -A && git commit -m 'initial'` + GitHub remote. Connect to Netlify for auto-deploy on push.
**Why:** Zero version control = zero rollback beyond Netlify's deploy list. One bad deploy with no git history is unrecoverable locally.
**Effort:** XS (15 min) | **Depends on:** nothing

#### [ ] Custom domain
**What:** Add a memorable domain (e.g. energy.ro, ro-energy.live) via Netlify dashboard + DNS config.
**Why:** `teal-biscotti-3eda90.netlify.app` is not shareable. A real domain makes the dashboard citable and tweetable.
**Effort:** XS (10 min + DNS propagation)

### P1 — Blockers for public deployment

#### [x] Build production CORS proxy
**What:** ~~CF Worker~~ → Shipped as Netlify Function at `netlify/functions/sen-filter.js`. Proxies `/api/sen-filter` via `netlify.toml` redirect. Includes CDN edge caching (`s-maxage=30, stale-while-revalidate=30`) and structured request logging.
**Done:** 2026-04-20 — deployed to `teal-biscotti-3eda90.netlify.app`

#### [x] Add tests for `parseResponse`
**What:** Unit tests for `src/api/transelectrica.ts` covering: happy path (real API response), invalid JSON, missing fields, negative ISPOZ, `"N/A"` string values.
**Why:** The parser is the most brittle code. One upstream format change breaks everything silently. No test means format regressions are invisible until a user reports it.
**Start:** Install vitest, add `src/api/transelectrica.test.ts`, fixture the real JSON response seen on 2026-04-17.
**Effort:** S | **Depends on:** nothing

---

#### [ ] Fix sessionStorage QuotaExceededError (silent failure)
**What:** Wrap `sessionStorage.setItem` in try/catch in `useEnergyData.ts`. On `QuotaExceededError`, trim oldest entries and retry.
**Why:** In Safari private browsing, `sessionStorage.setItem` throws silently. History stops persisting with no indication to the user.
**Effort:** XS | **Priority:** P2

---

### P2 — Quality / accuracy

#### [x] Fix non-retryable error handling for parse failures
**What:** Wrap `JSON.parse` and `ZodSchema.parse` in `parseResponse` with try/catch that re-throws as a non-retryable `ApiError`. Add `retryable: false` flag checked in TanStack Query config.
**Why:** Currently TanStack Query retries parse errors 3× with backoff (~1 min wasted). A format change won't be fixed by retrying. Users wait 1+ min before seeing the error banner.
**Start:** `src/api/client.ts` — add `retryable` field to `ApiError`. In `QueryClient` config, add `retry: (count, err) => err instanceof ApiError && err.retryable !== false && count < 3`.
**Effort:** S

#### [ ] Fix ISPOZ (pumped storage) negative value handling
**What:** Remove `Math.max(0, ...)` clamp from chart rendering. Pumped storage legitimately goes negative (consuming power). Move ISPOZ out of the generation pie chart; show it as a separate "Pumped Storage" indicator in the breakdown that can show both + and −.
**Why:** Clamping to 0 corrupts the chart data during pumping periods. The total production shown diverges from actual generation.
**Effort:** S

#### [ ] Replace default Vite README
**What:** A real README with: project description, screenshot, local dev instructions (`npm install && npm run dev`), CF Worker deploy instructions, data source attribution to Transelectrica.
**Why:** The current README is the Vite template boilerplate. Anyone on GitHub will be confused.
**Effort:** S

---

### P2 — Delight / polish

#### [ ] Carbon intensity badge (g CO₂/kWh)
**What:** Compute grid carbon intensity from mix using IPCC lifecycle factors:
- Nuclear: 12 g CO₂/kWh
- Wind: 11 g CO₂/kWh
- Hydro: 24 g CO₂/kWh
- Solar: 48 g CO₂/kWh
- Biomass: 230 g CO₂/kWh
- Gas: 490 g CO₂/kWh
- Coal: 820 g CO₂/kWh

Show as a badge in the header: e.g. `⚡ 142 g CO₂/kWh` color-coded green/yellow/red.
**Why:** The single number most people care about. Makes the mix data immediately meaningful. Most shareable element.
**Start:** `src/utils/carbonIntensity.ts`, add `CarbonBadge.tsx` component.
**Effort:** S

#### [ ] Manual refresh button
**What:** Small refresh icon button (↻) next to the LIVE indicator. Calls `refetch()` from `useEnergyData`. Show a brief spinning state while in-flight.
**Why:** `refetch` is already wired in the hook but never exposed to the user. Power users watching a weather event want immediate refresh.
**Effort:** XS (10 min)

#### [ ] Show Transelectrica's own data timestamp
**What:** Parse `row1_HARTASEN_DATA` from the API response and show it in the footer: "Data recorded: 16:43:15". This makes the ~1.5min latency transparent and honest.
**Why:** Users currently see "Updated 16:44:50" but the data is from 16:43:15. Showing both makes the freshness clear and builds trust.
**Start:** Add `dataRecordedAt` field to `EnergySnapshot`, parse `row1_HARTASEN_DATA`, display in `LiveIndicator`.
**Effort:** S

#### [ ] og:image + custom favicon
**What:** Replace the Vite favicon with a custom SVG (🇷🇴 + ⚡). Add `<meta og:title>`, `<meta og:description>`, and a static `og:image` (1200×630 card with "Romania Energy Dashboard" and current-ish stats).
**Why:** Social share previews currently show nothing. A proper preview card makes links worth sharing.
**Effort:** S

---

### P3 — Future / vision

#### [ ] 30-day persistent history via Cloudflare KV
**What:** Store snapshots in CF KV from the Worker side. Expose `/api/v1/history?hours=24`. Frontend loads history on page open instead of starting cold.
**Why:** sessionStorage means every tab open starts with 0 history. Server-side history would make the timeline meaningful on first load.
**Effort:** L

#### [ ] Public REST API
**What:** Expose `/api/v1/latest` and `/api/v1/history?hours=N` from the CF Worker. Document with OpenAPI spec.
**Why:** Enables third-party apps, bots, and journalists to build on the data. Turns this into a platform.
**Effort:** M | **Depends on:** CF KV history

#### [ ] EU grid comparison sidebar
**What:** Fetch AT, DE, FR data from ENTSO-E transparency platform alongside Romania. Show as a comparison bar or table.
**Why:** Romania in context. Is 340MW export significant? Compared to neighbors, yes.
**Effort:** L

---

## Completed

- [x] MVP dashboard built (2026-04-17): all 8 sources, donut, timeline, breakdown, import/export card
- [x] Vite proxy for local dev CORS bypass
- [x] JSON parser (corrected from plan — endpoint returns JSON not CSV)
- [x] sessionStorage history (120 pts)
- [x] TypeScript clean build
- [x] useState history fix (was useRef — 1 data point behind bug)
- [x] SOURCES constant extracted to src/constants/sources.ts (was 3× duplicated)
- [x] Non-retryable ApiError for parse/Zod failures
- [x] Number.isFinite NaN handling in parseResponse + console.warn
- [x] ImportExportCard visual hierarchy fixed — two-span layout restored (QA 2026-04-17)
- [x] SVG sparkline fixed with viewBox (% coords were invalid)
- [x] refetch() uses refetchQueries (was invalidateQueries)
- [x] 6 vitest parser tests (all passing)

#### [ ] Mobile: Generation Breakdown bars collapse at 375px (Low, QA 2026-04-17)
**What:** On 375px mobile, horizontal bars in GenerationBreakdown collapse to ~51px. Fixed-width label (`w-28`), MW value (`w-24`), and pct (`w-12`) leave little room for the bar itself.
**Fix:** Hide pct on mobile (`hidden sm:inline`) or switch to two-row layout on small screens.
**Effort:** XS | **Priority:** P3

#### [x] Fix SVG sparkline coordinates in ImportExportCard
**What:** `ImportExportCard.tsx` uses `${x}%,${y}` in SVG `<polyline>` `points` attribute. SVG does not support percentages in `points` — most browsers parse `"10%"` as `10`, collapsing all X coordinates to values near 0 (vertical line instead of sparkline).
**Fix:** Add `viewBox="0 0 200 30"` to the `<svg>`, map X to `(i / (spark.length - 1)) * 200` instead of `${x}%`.
**Effort:** XS (5 min) | **Priority:** P2
