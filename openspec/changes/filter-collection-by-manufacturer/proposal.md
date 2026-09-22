# Proposal

## Why

The Collection page lists all machines with no way to narrow the view. As the
collection grows, a visitor (mainly me) has no quick way to see only the
machines from one manufacturer.

## What Changes

- Add a manufacturer filter control above the Collection page's machine
  grids.
- Selecting a manufacturer hides non-matching machine cards in both the
  "Current Collection" and "Previously Owned" sections at once.
- An "All" option (default) clears the filter and shows every machine.
- Filtering runs client-side (plain JS); with JS disabled, all machines
  remain visible (progressive enhancement, no broken page).
- Manufacturer options are derived at build time from the distinct
  `manufacturer` values across all machine entries.

## Capabilities

### New Capabilities
- `collection-filtering`: lets a visitor filter the Collection page's
  machine grids by manufacturer, client-side, applied to both the Current
  and Previously Owned sections simultaneously.

### Modified Capabilities
(none — no existing specs cover collection display)

## Impact

- `src/pages/collection.astro`: render filter control, add manufacturer
  data attributes to card wrappers or reuse `MachineCard`.
- `src/components/MachineCard.astro`: expose `manufacturer` as a
  `data-manufacturer` attribute for JS targeting.
- New small client-side script (inline `<script>` or `src/scripts/`) for
  the filter behavior — no new dependency.
- No changes to content schema, `astro.config.mjs`, or the deploy workflow.
