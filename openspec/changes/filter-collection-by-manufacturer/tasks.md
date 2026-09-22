# Tasks

## 1. Data plumbing

- [ ] 1.1 Add `data-manufacturer="<manufacturer>"` to the machine card's
      wrapper element in `src/components/MachineCard.astro` and verify
      `npm run build` output HTML includes the attribute for each machine
- [ ] 1.2 In `src/pages/collection.astro`, derive the sorted, de-duplicated
      manufacturer list from `getCollection('machines')` and verify by
      logging/inspecting build output that it matches the manufacturers in
      `src/content/machines/*.md`

## 2. Filter control

- [ ] 2.1 Render a `<select>` above the machine grids listing "All"
      (default, value `""`) plus one `<option>` per manufacturer from task
      1.2, and verify it renders in `npm run dev` with the correct options
- [ ] 2.2 Add an inline `<script>` on the Collection page that listens for
      the select's `change` event and toggles the `hidden` attribute on
      card wrapper elements whose `data-manufacturer` doesn't match the
      selected value (matching all when "All" is selected), and verify
      manually in the browser: selecting a manufacturer hides non-matching
      cards in both sections, selecting "All" restores every card

## 3. No-JS fallback and verification

- [ ] 3.1 Verify with browser JS disabled (or by inspecting the script
      logic) that every machine card remains visible when the script
      never runs — no `hidden` attribute is present by default in the
      server-rendered HTML
- [ ] 3.2 Run `npm run build` and confirm it completes with no errors;
      spot-check `dist/collection/index.html` for the `data-manufacturer`
      attributes and the `<select>` markup
