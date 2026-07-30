# Making the NIQS site faster and more immersive

Scoped alongside the AWS API migration (`infra/README.md`). Every item below is
costed in **brotli-compressed JavaScript**, because that is what a visitor in
Lagos on 4G actually pays.

---

## The budget

Measured on this repo, not estimated.

| | Entry chunk, raw | Entry chunk, brotli |
|---|---|---|
| Today (all 60 pages in one bundle) | 1,647,915 | **371,341** |
| With route-level `lazy()` | 250,963 | **72,715** |
| Difference | −85% | **−298,626** |

A homepage visitor today downloads 371 KB before anything renders. After
splitting it is the 73 KB entry plus the Home chunk (4.5 KB brotli) — about
**77 KB, a 4.8× reduction**.

Where the 298 KB goes: `FlyerStudio` alone is **184 KB brotli** (`jspdf` +
`html2canvas` + `jszip`). It is imported only by `pages/admin/FlyerStudio.jsx`,
which sits behind `ProtectedRoute`. Right now every public visitor downloads the
admin PDF toolchain to read a news article.

**So the immersive work is pre-funded.** `framer-motion` is already in the entry
chunk and used in exactly 2 of 75 source files
([LeaderCard.jsx](../client/src/components/common/LeaderCard.jsx),
[President.jsx](../client/src/pages/public/President.jsx)). Its cost is already
paid — using it across the site is marginally free.

---

## Phase 1 — Split the bundle (prerequisite, +0 KB)

Nothing else on this list is worth doing first; richer motion on a 371 KB bundle
just makes the wait more elaborate.

1. Convert the 66 page imports in [App.jsx](../client/src/App.jsx) to
   `lazy(() => import(...))` with a `<Suspense>` boundary.
2. Add `manualChunks` in [vite.config.js](../client/vite.config.js) to pin
   `react`/`react-dom`/`react-router` into a stable vendor chunk so it stays
   cached across deploys.
3. Prefetch on intent: call the route's `import()` on nav-link hover/focus. Costs
   nothing and makes navigation feel instant.

**Verify with:** entry chunk brotli ≤ 80 KB.

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

## Phase 3 — Immersive layer (+0 KB, on the resident library)

All of this runs on the `framer-motion` already in the bundle.

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

| Stage | Entry payload (brotli) |
|---|---|
| Today | 371 KB |
| After Phase 1 | 77 KB |
| After Phases 2–3 | ~79 KB |
| After Phase 4 (with the map) | ~107 KB |

Faster **and** more immersive is not a trade here. The bundle is currently paying
for an admin PDF toolchain most visitors never touch; redirecting that budget
funds the entire experience upgrade with ~260 KB left over.

---

## Sequencing against the AWS work

Independent — different halves of the stack, no shared files. The API migration
touches `server/` and `infra/`; this touches `client/`. Phase 1 is roughly a day,
Phase 2 half a day plus image processing, Phase 3 two to three days, Phase 4 its
own design conversation.
