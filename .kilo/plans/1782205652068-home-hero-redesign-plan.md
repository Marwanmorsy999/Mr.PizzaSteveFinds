# Home Page Hero Redesign Plan

## Goal
Update ONLY the hero/top section of `src/routes/index.tsx` with the new design. All sections below the hero remain untouched.

## Scope — what changes
**`src/routes/index.tsx` — hero section only (lines ~78–113)**
1. Swap `<video src="/opening.mp4">` → `<img src="/market.jpg">` with gradient overlays
2. Badge: `open now` → `Drop is live` (keep pulse dot)
3. Headline: `Mr. Pizza Steve Finds.` → `PREMIUM SLICE OF A THRIFT.`
4. Location: remove `Stat` component row, replace with inline pill text: `30 Hassan Assem St · Zamalek, Cairo · 3 pm – 11 pm daily`
5. CTAs: keep `shop the drop` + `@mr.pizzastevefinds` links, update class styling to match new design
6. Add `<Marquee text="fresh off the rack · loud vintage & thrift · zamalek cairo · shop the drop" />` between hero and "Fresh on the rack"
7. Update `<head>` meta description to: `Premium slice of a thrift. Loud vintage and thrift drops curated by Steve dos Santos in Zamalek, Cairo.`
8. Add `theme-color: #0a0a0a` meta tag
9. Remove unused `Stat` component (lines 291–299) since it's only used in the hero

## Scope — what DOES NOT change
- "Fresh on the rack" section (unchanged)
- Reviews section (unchanged)
- Rack photo / callout strip (unchanged)
- Footer (unchanged)
- All data fetching, state, and event handlers (unchanged)

## Prerequisites verified
- `public/market.jpg` exists ✓
- `public/opening.mp4` does NOT exist ✓ (no fallback needed)
- `Archivo Black` font already loaded via `src/routes/__root.tsx` + `src/style.css` ✓

## Dependency
**`src/components/site-chrome.tsx`** must re-export `Marquee` (currently missing — was removed in earlier session).
