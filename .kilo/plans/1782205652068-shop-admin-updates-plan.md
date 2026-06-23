# Shop & Admin Updates Plan

## Summary
Enhance the shop page with add-to-cart and buy-now buttons, denser product grid, smaller typography. Make the product detail page more compact. Add multi-image support for new products in admin. Add shipping policy to the footer.

## Files to modify

### `src/routes/shop.tsx`
1. **Product Card component (memo Card)**
   - Import `useCart` from `@/context/CartContext`
   - Add `product.status === "available"` check
   - Add two new buttons below the price row: ADD TO CART and BUY IT NOW
   - ADD TO CART calls `cart.add({ id, name, price, priceLabel, imageUrl, size, emoji })`
   - BUY IT NOW navigates to `/checkout`
   - Change product name class from `font-display text-base` → `font-display text-xs` (smaller)
   - Reduce card padding from `p-4` → `p-3`
   - Reduce price text from `text-lg` → `text-sm`

2. **More Finds grid**
   - Change `grid-cols-2 lg:grid-cols-3` → `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

3. **Featured Drop section**
   - Consider adding ADD TO CART + BUY IT NOW buttons in info panel for featured product
   - Ensure consistent smaller typography

### `src/routes/product.$id.tsx`
1. Reduce `aspect-[4/5]` → `aspect-[3/4]` (more compact image)
2. Reduce container max-width or padding to make the overall page feel smaller
3. Reduce product name `text-3xl md:text-4xl` → `text-2xl md:text-3xl`
4. Reduce price `text-4xl` → `text-3xl`
5. Reduce CTA button py from `py-4` → `py-3` and `text-base` → `text-sm`

### `src/routes/admin.tsx`
1. **Single add form (around line 610)**
   - After "Upload main image" section, add "Add extra images" area
   - Show thumbnails of images from `form.images`
   - Add `<input type="file" multiple>` that appends URLs to `form.images`
   - Add remove button per extra image

2. **Bulk add row template (around line 637)**
   - Add similar "Add extra images" per bulk item
   - Store extra URLs in `item.images` within `bulkItems` state
   - Ensure `publishBulkDrop` sends `images` array in POST body

### `src/components/site-chrome.tsx`
1. Add after "pieces wont last long babe" in the closedBrand div:
   ```
   <p className="mt-2 text-xs text-zinc-600">shipping with turbo · 3/5 working days</p>
   ```
2. Add links section:
   ```
   <div className="mt-4 flex gap-4">
     <Link to="/shop" className="text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">all products</Link>
     <Link to="/about" className="text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">about</Link>
   </div>
   ```

## Key notes
- Cart deduplication already prevents duplicate IDs — safe to call add repeatedly
- BUY IT NOW should call `router.navigate({ to: "/checkout" })` or `<Link to="/checkout">`
- Bulk product API expects `images` field already — admin just wasn't collecting it during creation
- Product detail already supports `images[]` via `allImages`
