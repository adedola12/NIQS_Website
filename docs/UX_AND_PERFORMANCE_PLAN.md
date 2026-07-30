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

## Phase 2 — Images (−11 MB transfer, +0 KB JS)

`client/public/backgrounds` is 12 MB of PNG. These are photographs in a lossless
format:

```
3,594,862  dark-bg-3.png
2,053,965  light-bg-2.png
1,691,415  dark-bg-2.png
```

- Convert to AVIF with WebP fallback via `<picture>`. Expect ~90% smaller.
- `srcset` at 640/1280/1920 so phones stop downloading desktop backdrops.
- `fetchpriority="high"` on the hero image, `loading="lazy"` on everything
  below the fold.
- Inline ~200-byte blurred LQIP placeholders so hero areas never flash empty.

This is the largest single transfer win on the site and adds no JavaScript.

---

## Phase 3 — Immersive layer (re-priced after Phase 1)

All of this runs on `framer-motion`, which is already a dependency — but read the
correction above: after splitting, it is a **37.9 KB brotli on-demand chunk**, not
entry-resident. So the marginal cost depends entirely on *where* motion is used:

- **On any page that already loads it** (`/president`, anything using `LeaderCard`)
  — genuinely 0 KB.
- **On other inner pages** — the 37.9 KB chunk loads once, then is cached for the
  rest of the session. Cheap.
- **On the homepage** — this is the decision that matters. Using framer-motion
  above the fold pulls it into the initial payload, taking it from 78.5 KB to
  ~116 KB. Still 3.2× better than before Phase 1, but it spends a third of what
  Phase 1 saved.

**Recommendation:** use CSS transitions and the existing IntersectionObserver
`.reveal` mechanism (already in `App.jsx`) for the homepage hero and above-the-fold
motion, and reserve framer-motion for inner pages where it is already loaded or
where the interaction genuinely needs layout animation. That keeps the 78.5 KB
entry intact.

The table below assumes that split — 0 KB entries mean "no *additional* initial
payload", not "no code".

| Upgrade | Where | JS cost |
|---|---|---|
| Page transitions on route change (`AnimatePresence`) | App shell | 0 KB |
| Scroll-reveal for sections (`whileInView`, once) | Home, About, Membership | 0 KB |
| Staggered card entrance | Leadership, Chapters, News grids | 0 KB |
| Shared-element portrait → detail transition (`layoutId`) | Council, Trustees, Past Presidents | 0 KB |
| Hero parallax (`useScroll` + `useTransform`) | Home | 0 KB |
| Animated statistics counters | About, Membership | 0 KB |
| Skeleton placeholders instead of spinners | every API-backed page | ~2 KB |

**Non-negotiable:** gate all of it behind `prefers-reduced-motion`. Framer's
`useReducedMotion()` handles this. Motion must never gate content — the text
renders, then moves.

The shared-element portrait transition is the highest-impact single item. The
leadership portraits are already normalised onto a common backdrop, so a
`layoutId` morph from grid card to detail page will look deliberate rather than
accidental.

---

## Phase 4 — The one item worth real budget

**Interactive Nigeria chapters map.** Chapters are currently a list; a clickable
state map is the natural way to present a national institute and would be the
site's signature moment.

- Inline SVG of Nigeria's 36 states + FCT: **~20–30 KB brotli** for the path data.
- Zero JS if hover/active states are CSS and transitions use resident framer-motion.
- Only two chapters have full profiles today (Katsina, Osun), so the map needs a
  clear "profile coming soon" state for the rest — worth designing up front rather
  than discovering at launch.

Budget it explicitly: **+30 KB.** Even with it, the initial payload lands around
107 KB brotli — still 3.5× lighter than today.

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
| After Phase 2 (images) | ~78.5 KB | JS unchanged; −11 MB of image transfer |
| After Phase 3, homepage motion in CSS | ~81 KB | projected |
| After Phase 3, framer-motion on the homepage | ~116 KB | projected — avoid |
| After Phase 4 (chapters map) | ~108 KB | projected |

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
