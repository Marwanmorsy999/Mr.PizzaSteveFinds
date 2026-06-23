# Home Page Redesign Plan

## Goal
Replace the hero, marquee, reviews, and footer callout on `src/routes/index.tsx` to match the professional design the user provided, while keeping existing data fetching and review logic intact.

## Context verified
- `public/market.jpg` exists ✓
- `public/opening.mp4` does NOT exist ✓ (new design uses photo, so no issue)
- `Archivo Black` font already loaded via `src/routes/__root.tsx` + `src/style.css` ✓
- `Marquee` export is currently MISSING from `src/components/site-chrome.tsx` (was removed in earlier session, file is now 133 lines)

## Changes per file

### `src/routes/index.tsx`
1. Replace hero section:
   - Swap `<video>` for `<img https://res.cloudinary.com/dnggmrgmu/image/upload/v1782221376/market_sbt1ij.jpg>` with gradient overlays
   - Replace badge text: `open now` → `Drop is live` (keep pulse dot)
   - Replace headline: `Mr. Pizza Steve Finds.` → `PREMIUM SLICE OF A THRIFT.`
   - Replace location stat with inline pill: `30 Hassan Assem St · Zamalek, Cairo · 3 pm – 11 pm daily`
   - Update CTAs to match new styling (same links, different classes)

2. Add `Marquee` import from `@/components/site-chrome` and insert `<Marquee text="fresh off the rack · loud vintage & thrift · zamalek cairo · shop the drop" />` between hero and "Fresh on the rack" section

3. Update "Fresh on the rack" section:
   - Remove `sm:mt-4` stagger offset from middle card
   - Keep product card styling but align with professional tone

4. Replace reviews section:
   - Remove star-button rating input
   - Use `<select>` with numeric options `[5,4,3,2,1]` showing `★`/`☆` strings
   - Update empty state text to: `no reviews yet — be the first one to drop a review 🍕`
   - Keep form validation and localStorage logic unchanged

5. Remove sections:
   - Callout strip (`new drops hit instagram first, no cap`)
   - Rack photo full-bleed section

6. Remove unused `Stat` component at bottom of file

7. Update `<head>` meta:
   - title stays as-is
   - description to: `Premium slice of a thrift. Loud vintage and thrift drops curated by Steve dos Santos in Zamalek, Cairo.`
   - Add `theme-color: #0a0a0a`

### `src/components/site-chrome.tsx`
1. Re-add `Marquee` component export (currently missing)

## Unresolved decision
- **Marquee source:** The new design imports `Marquee` from `site-chrome`, but the current file only exports `RotatingBanner`, `Header`, and `Footer`. Should we:
  a) Re-add the `Marquee` component to `site-chrome.tsx` (matches the import in the new code)?
  b) Remove `Marquee` from the new `index.tsx` import and use `RotatingBanner` instead?

My recommendation: **(a)** Re-add `Marquee` — it matches the exact import in the user's provided code.
