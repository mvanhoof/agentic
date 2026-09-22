# Design

## Context

The Collection page (`src/pages/collection.astro`) is fully static: Astro
build-time templating, no client JS today, two sections (`Current
Collection`, `Previously Owned`) each built from `getCollection('machines')`
filtered by `status`. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Filter both sections in place, client-side, no page navigation.
- Zero new npm dependencies; plain DOM APIs only.
- Page remains fully usable (all machines visible) with JS disabled.

**Non-Goals:**
- Server-side or URL-based filter state (no query params, no persistence
  across reloads).
- Multi-select or combined filters (manufacturer + status, etc.) — single
  manufacturer selection only, as scoped in the proposal.
- Sorting — out of scope, separate concern.

## Decisions

- **Filter control markup**: a `<select>` populated at build time from the
  distinct `manufacturer` values across `getCollection('machines')`,
  sorted alphabetically, with a leading "All" option (value `""`). A
  native select needs no JS to render correctly and matches the site's
  minimal-JS approach better than custom button/chip markup, which would
  need extra styling to be reachable/operable.
  - Alternative considered: button group (one button per manufacturer).
    Rejected for v1 — more markup and ARIA work for the same behavior;
    can revisit if the retro-arcade visual design calls for chunkier
    controls later.
- **Filtering mechanism**: each machine card wrapper gets a
  `data-manufacturer="<value>"` attribute (added in `MachineCard.astro`).
  An inline `<script>` on the Collection page listens for the select's
  `change` event and toggles a `hidden` attribute (or a CSS class) on
  card elements whose `data-manufacturer` doesn't match the selected
  value. Plain DOM query (`document.querySelectorAll`), no framework.
  - Alternative considered: Astro view transitions / client island
    component. Rejected — overkill for toggling visibility of a static
    list; adds a hydration boundary for no behavioral gain.
- **Progressive enhancement**: the `<select>` and its `<script>` are both
  additive. Without JS, the script never runs, `hidden` is never set, so
  every card stays visible — satisfies the no-JS requirement without a
  `<noscript>` branch.
- **Manufacturer list derivation**: computed once in the page frontmatter
  via `[...new Set(machines.map(m => m.data.manufacturer))].sort()` —
  no new content-collection field, no separate data file to keep in sync.

## Risks / Trade-offs

- [Manufacturer names must match exactly (case-sensitive) for grouping to
  work] → low risk here: `manufacturer` is free-text in the schema, but
  the collection is manually curated by one person, so consistency is a
  content-authoring discipline concern, not a code concern. Not solving in
  this change.
- [Inline script duplicated if more filterable pages are added later] →
  acceptable for one page; extract to a shared `src/scripts/` file only
  if a second page needs the same behavior (YAGNI).

## Migration Plan

No data migration. Deploy is the normal path: build, GitHub Actions
deploys `dist/` to Pages. No rollback concerns beyond reverting the commit.
