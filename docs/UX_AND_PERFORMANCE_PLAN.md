# Making the NIQS site faster and more immersive

Scoped alongside the AWS API migration (`infra/README.md`). Every item below is
costed in **brotli-compressed JavaScript**, because that is what a visitor in
Lagos on 4G actually pays.

---

## The budget

Measured on this repo, not estimated.

| | Initial JS, raw | Initial JS, brotli |
|---|---|---|
| Before (all 60 pages in one bundle) | 1,647,915 | **371,341** |
| After Phase 1 (shipped) | 271,640 | **78,473** |
| Difference | −84% | **−292,868 (−78.9%)** |

A homepage visitor previously downloaded 371 KB before anything rendered. It is
now 78.5 KB across three files — the entry chunk, `vendor-react` and
`vendor-router` — verified in the browser as the only JS the homepage requests.

Where the 298 KB goes: `FlyerStudio` alone is **184 KB brotli** (`jspdf` +
`html2canvas` + `jszip`). It is imported only by `pages/admin/FlyerStudio.jsx`,
which sits behind `ProtectedRoute`. Right now every public visitor downloads the
admin PDF toolchain to read a news article.

**Correction after shipping Phase 1.** The original version of this plan said the
immersive work was "pre-funded" because `framer-motion` sat in the entry chunk and
was therefore already paid for. **That is no longer true.** Splitting the routes
moved framer-motion out of the initial payload into its own on-demand chunk
(`proxy-*.js`, **37,878 bytes brotli**), loaded only by the two files that use it —
[LeaderCard.jsx](../client/src/components/common/LeaderCard.jsx) and
[President.jsx](../client/src/pages/public/President.jsx). Confirmed in the
browser: `/president` pulls it, `/` does not.

That is a better outcome, but it re-prices Phase 3 — see the note there.

---

## Phase 1 — Split the bundle ✅ DONE

Target was ≤ 80 KB brotli. Landed at **78,473**.

1. ✅ All 65 pages moved to dynamic imports via a registry,
   [routes/pages.js](../client/src/routes/pages.js), which is the single source of
   truth for both lazy rendering and prefetching. Home stays a static import — it
   is the most common landing page, and lazy-loading it would add a round trip to
   first paint for the sake of 4.5 KB.
2. ✅ `manualChunks` in [vite.config.js](../client/vite.config.js) pins
   `vendor-react` and `vendor-router` so the framework keeps a stable hash across
   deploys instead of being re-downloaded every release.
3. ✅ Prefetch on intent via [useRoutePrefetch.js](../client/src/hooks/useRoutePrefetch.js)
   — one delegated document listener, not 57 per-link handlers. Hover, focus and
   touchstart all trigger it; skipped on 2G or `saveData`.

**Suspense placement is the part worth preserving.** The boundary sits *inside*
`PublicLayout` (and inside the `<Outlet>` of `AdminLayout`/`PortalLayout`), not
around `<Routes>`. A boundary above the layout would unmount the navbar and footer
on every navigation, flashing the whole shell. Verified: nav and footer stay
mounted through a lazy route change.

**Verified in a browser on the production build:** homepage requests exactly 3 JS
files; `/about`, `/president`, `/login`, `/admin` and the 404 route all render;
hovering `/about` prefetches its chunk and a repeat hover does not refetch;
`/admin` redirects to `/login` without ever loading FlyerStudio; no console errors.

---

## Phase 2 — Images ✅ DONE

**This phase was planned on a false premise.** It claimed `client/public/backgrounds`
was 12 MB of page backgrounds and "the largest single transfer win on the site".
Those files are referenced only by `src/flyer/backgrounds.json` — they are flyer
studio backdrops, loaded when an admin opens the picker. **No public visitor has
ever downloaded one.** Optimising them was worth doing, but it saves a visitor
nothing, and the phase was rewritten around what a browser actually requests.

Measured against the production build, a public page downloads exactly **one**
local image: the nav logo.

| | before | after | |
|---|---|---|---|
| `NIQS-LOGO-PNG-NAV.png` | 92.0 KB | **8.3 KB** | −91%, every page |
| `NIQS-LOGO-SQUARE.png` | 62.7 KB | **11.7 KB** | −81%, favicon on cold visits |
| `public/backgrounds/*` | 11.6 MB | **1.2 MB** | −89%, flyer studio + deploy size |

The nav logo was 828×869 rendered at 50–64px — roughly 13× oversized.

**Palette PNG beat both modern formats**, which is the opposite of the usual
advice. At 256px wide: 128-colour PNG **8.3 KB**, AVIF q=60 9.7 KB, WebP q=85
15.3 KB. The logo has 1,254 distinct colours, so quantising to 128 gives an RMSE
of 1.40 against the resized original — below perceptibility — and it needs no
`<picture>` element, no format negotiation and no fallback chain. Photographs tip
the other way; flat brand artwork does not. Worth re-measuring rather than
assuming next time.

Two coupling problems surfaced and are now handled:

- `build-og-image.py` rendered its 1200px artwork *from* the nav logo, so the
  served copy could not simply be downscaled. The full-resolution original now
  lives at `client/scripts/assets/niqs-logo-source.png`, outside `public/` so it
  is never served. Verified the og artwork is still byte-identical.
- That same script also *generates* `NIQS-LOGO-SQUARE.png`, so it silently
  overwrote the first optimisation pass. The quantisation moved into the point of
  generation; both scripts are now idempotent.

Settings are committed as `client/scripts/optimize-images.py` and
`optimize-flyer-backgrounds.py` so they can be re-run after an asset changes.

### Still open — a content problem, not a performance one

Public pages pull their imagery from **Unsplash stock photos**: ~90 references
across 29 files, 6 requests on the homepage alone. Hero backdrops, news
thumbnails, job listing logos, webinar and workshop cards, chapter photos.

A `preconnect` for `images.unsplash.com` now saves the first request a DNS + TCP +
TLS round trip, but that is a mitigation. These are placeholders awaiting real
NIQS photography, and on a live institutional site they are a credibility issue
before they are a speed one. Replacing them is a content decision for NIQS, and
also the single largest remaining transfer win on public pages — real images can
be served from the S3 + CloudFront bucket the API migration provisions.

Not touched, deliberately: `og-image.jpg` and `og-square.jpg` are fetched by
crawlers, never during a page load.

---

## Phase 3 — Immersive layer ✅ DONE

Built entirely in CSS. **framer-motion was not used**, so it stays out of the
initial payload as the Phase 1 measurement required. Total cost: **539 bytes of
CSS**. The entry chunk came out 15 bytes smaller.

| Delivered | How | Cost |
|---|---|---|
| Reduced-motion support | media query, unlayered so it wins the cascade | 0 |
| `.js-reveal` fallback gate | content defaults visible, hides only when the observer exists | 0 |
| `.stagger` grid cascade | `nth-child` custom properties, capped at 10 | 0 |
| Skeleton placeholders | `.sk*` classes + `Skeleton.jsx` | ~340 B |
| Hero parallax | `animation-timeline: view()` behind `@supports` | ~90 B |

**Reduced motion was entirely absent.** The trap in every "disable all animation"
snippet applies here: `.reveal` starts at `opacity: 0` and is only revealed by a
JS-added class, so removing its transition alone leaves content permanently
invisible. The reveal state is forced open explicitly. Spinners are exempted —
a frozen spinner reads as "crashed", not "loading".

**A latent fragility was fixed.** The stylesheet hid `.reveal` unconditionally and
depended on an IntersectionObserver to undo it, so any failure of that observer
left 15 homepage sections invisible with no symptom. Hiding now lives behind
`.js-reveal`, added by `App.jsx` only after the API is confirmed and the observer
built. Verified both directions.

**Not done:** the `layoutId` shared-element portrait transition and animated
counters from the original table. Both want framer-motion, and both sit on pages
where it is already loaded — worth doing, but they are additive polish rather than
the structural work, and were left rather than rushed.

### Verification limit worth knowing

The reveal transitions could not be exercised in the dev harness: the browser pane
does not composite frames, so IntersectionObserver never fires and CSS transitions
never progress — confirmed with a control observer on a clearly-intersecting
element. Assertions were made against resolved computed styles with transitions
neutralised, plus a static check that all eight critical rules survive into the
shipped stylesheet. **Eyeball the reveal and parallax in a real browser before
release.**

---

## Phase 4 — Chapter map ✅ DONE

Budgeted at ~30 KB brotli of inline SVG path data. **Delivered for 569 bytes of
CSS and a 2.3 KB Chapters chunk**, entry bundle untouched — the map sits on a lazy
route.

**It is not an SVG outline of Nigeria, deliberately.** Accurate admin-1 boundary
data is not in this repo, and hand-approximating 37 state borders would put a map
with *wrong borders* on a national institute's website — authoritative-looking and
incorrect, which is worse than no map. A tile grid makes no boundary claim, and
says so in visible copy rather than leaving the reader to infer it.

It is also the better instrument. On a true map Lagos is a speck and Niger is
enormous, which inverts their importance to NIQS — the smallest state carries the
largest membership. Equal tiles give every chapter equal presence.

Positions are relative, not projected: column 1 west, column 7 east, row 1 north,
row 8 south. **If licensed boundary data is ever approved, only the `GRID`
constant in `ChapterMap.jsx` needs replacing** — everything else reads from
chapter data.

Other decisions worth keeping:

- **Profiled status is derived, not hardcoded** — a chairperson, about text,
  address, or non-zero member count. The map updates itself as NIQS seeds more
  chapters. Ten currently qualify (not two, as an earlier note recorded).
- **Pending chapters still link through.** `ChapterDetail` renders a sensible
  fallback for any state, so a dead tile would be worse. The distinction lives in
  the styling and the accessible name — a screen reader hears "full profile not
  yet published".
- **Zone filtering is lifted into `Chapters.jsx`** so the map and the list below
  filter together rather than disagreeing.
- **Hover and focus are CSS, not React state.** Tracking hover would re-render all
  37 tiles per pointer move for what `:hover` does free; `:focus-visible` gets the
  same treatment so keyboard users get the affordance.
- Colour is never the only signal — every tile is labelled, the legend repeats
  each zone name in text.
- Below 560px the grid gives way to the searchable list, which carries the same
  information and suits a phone better.

---

## Explicitly not doing this

"Immersive" pulls toward libraries that would undo the entire Phase 1 win:

| Tempting | Cost | Verdict |
|---|---|---|
| three.js / WebGL hero | ~600 KB | Costs 2× the whole current bundle. No. |
| Lottie animations | ~250 KB | Use framer-motion + SVG instead. |
| GSAP | ~70 KB | Duplicates a library already in the bundle. |
| AOS / react-reveal | ~15 KB | `whileInView` already does this for 0 KB. |

---

## Running total

| Stage | Initial payload (brotli) | Status |
|---|---|---|
| Before | 371 KB | — |
| After Phase 1 | **78.5 KB** | ✅ measured |
| After Phase 2 (images) | **78.5 KB** JS + **8.3 KB** image | ✅ measured; was 92 KB of image |
| After Phase 3 (all CSS, no framer-motion) | **78.5 KB** JS + **11.1 KB** CSS | ✅ measured; +539 B |
| ~~Phase 3 with framer-motion on the homepage~~ | ~116 KB | avoided — see Phase 3 |
| After Phase 4 (chapters map) | **78.5 KB** JS + **11.7 KB** CSS | ✅ measured; map is on a lazy route |

Faster **and** more immersive is not a trade here, but it is not automatic either.
Phase 1 freed 293 KB by moving an admin PDF toolchain off the public path. Phases
3 and 4 should spend a fraction of that, not all of it — the running total above
is the thing to check before merging any of it.

---

## Sequencing against the AWS work

Independent — different halves of the stack, no shared files. The API migration
touches `server/` and `infra/`; this touches `client/`. Phase 1 is roughly a day,
Phase 2 half a day plus image processing, Phase 3 two to three days, Phase 4 its
own design conversation.
