# Content Cleanup Plan

## Summary
Remove specific copy across home, about, and shared chrome components per user request.

## Files to edit

### `src/routes/index.tsx`
1. **Line 93** – Badge text: change `yeah we are open rn · 3pm - 11pm` → `3pm - 11pm`
2. **Lines 100–101** – Remove hero subtitle `<p>` entirely: "Loud vintage. Bolder thrift. Curated by Steve..."
3. **Line 105** – CTA link: change `shop the damn drop` → `shop the drop`
4. **Line 113** – Stat label: change `where tf are we` → `where are we`
5. **Line 114** – Stat sub: change `yes every damn day` → `yes every day`
6. **Lines 112–116** – Stats grid: remove the third `<Stat>` ("the vibe" / "Streetwear x Thrift" / "pizza steve energy only"), change `sm:grid-cols-3` → `sm:grid-cols-2`
7. **Line 280** – Callout strip: change `genuinely your loss, we don't care` → `genuinely your loss`

### `src/routes/about.tsx`
1. **Lines 26–27** – Remove market-banner `<p>` tags: "Out in the wild" and "Market days · Cairo sun · Mr. Pizza Steve"
2. **Lines 39–41** – Remove first story `<p>`: "Mr. Pizza Steve Finds is the vintage and thrift project..."
3. **Lines 42–44** – Remove second story `<p>`: "Every single piece is hand-picked... Pizza Steve energy only."
4. **Line 54** – Aside label: change `where tf are we` → `where are we`
5. **Lines 59–61** – Remove owner lines: `Owner: Steve dos Santos` and `the man himself`; keep the "yes, every damn day" line but change to `yes, every day`
6. **Line 79** – Card title: change `come visit, fr` → `come visit`
7. **Line 89** – DM card text: change `just dm us, we are not scary.` → `just dm us.`

### `src/components/site-chrome.tsx`
1. **Line 8** – Banner array: change `{ label: "fresh off the rack fr fr" }` → `{ label: "fresh off the rack" }`
2. **Line 191** – Footer: remove the `<p>` entirely: `not our fault ur obsessed`

## Open decisions
- None — all copy removals are explicit from the user's request.
