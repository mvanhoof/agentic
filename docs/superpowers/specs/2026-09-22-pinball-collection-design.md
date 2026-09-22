# Pinball Collection Website — Design

## Purpose

Personal portfolio site showcasing Maarten's pinball machine collection — current
machines and previously owned ones. Visitors: mainly Maarten himself and anyone
he shares the link with. No login, no interactivity beyond browsing.

## Stack

- **Astro** (static site generator). Output is prebuilt static HTML, no server,
  no database.
- **Astro content collections** for machine data — type-checked frontmatter
  schema, defined in `src/content/config.ts`.
- **Deploy:** GitHub Actions builds on push to `main`, publishes to GitHub
  Pages.

## Data model

One Markdown file per machine in `src/content/machines/<slug>.md`.

```yaml
---
name: Twilight Zone
manufacturer: Bally
year: 1993
status: current        # "current" | "previous"
acquiredDate: 2021-03-15
soldDate: null          # set when status is "previous"
pricePaid: 3200
priceSold: null         # set when status is "previous"
ipdbUrl: https://ipdb.org/machine.cgi?id=1231
mods: ["Cliffy protectors", "LED kit"]
description: >
  Sci-fi themed machine designed by Pat Lawlor, released 1993. Known for its
  clock-based multiball and infamous Gumball multiball.
coverImage: /images/twilight-zone/cover.jpg
gallery:
  - /images/twilight-zone/cabinet.jpg
  - /images/twilight-zone/playfield.jpg
---
Free-text Markdown body: personal story, why it was bought, memories,
restoration notes.
```

`description` is factual/reference text about the machine itself (theme,
designer, notable rules) — separate from the Markdown body, which is
Maarten's personal notes/story. The detail page renders both, in that order:
description first, then personal story.

Content collection schema (Zod, in `src/content/config.ts`) enforces required
fields and types; `soldDate`/`priceSold` are optional (present only when
`status: previous`).

Photos live under `public/images/<slug>/` and are referenced by path from
frontmatter. 1–5 photos per machine expected. No image CMS, no upload UI —
adding a machine means adding one Markdown file plus its photo files, then
`git push`.

## Site structure

- **`/`** — Home. Hero image/intro blurb, a featured machine, collection
  stats (e.g. "12 current · 8 previously owned").
- **`/collection`** — Single page, two sections on it:
  - "Current Collection" — grid of cards for machines with `status: current`
  - "Previously Owned" — grid of cards for machines with `status: previous`
  - Each card: cover image, name, year, manufacturer. Click → detail page.
- **`/machines/[slug]`** — Detail page for one machine: image gallery, all
  frontmatter fields rendered (manufacturer, year, dates, prices, mods list,
  IPDB link, description), and the Markdown story body.
- **Nav:** Home / Collection. No search or filter (collection is small-scale,
  browsing two grouped grids is sufficient). No About/contact page.

## Visual design — retro arcade, balanced

- Dark theme: near-black background, neon accent colors (magenta / cyan /
  amber) used on headings, links, card borders, and hover states — not
  applied everywhere, so photos and body text stay legible.
- Display font: a pixel/arcade-style Google Font (e.g. "Press Start 2P") for
  headings and the nav only. Body text uses a normal, readable sans-serif.
- Cards: subtle glow on hover (box-shadow in accent color), rounded corners.
- Collection stats on the home page styled like a digital scoreboard/LED
  readout.
- No literal CRT scanline texture, no pixel font on body copy — "balanced,"
  not maximalist.

## Error handling / edge cases

- A machine with `status: previous` must have `soldDate` set; the content
  collection schema should make this a conditional requirement (validated at
  build time, so a bad entry fails the build rather than shipping silently).
- Missing images: reference paths under `public/images/`; a broken path is a
  build-time content error to catch by eye during review (no runtime image
  fallback needed for a personal site of this size).

## Testing

- `astro build` succeeding (no schema validation errors) is the main
  correctness check — content collections fail the build on schema mismatch.
- Manual visual check of Home, Collection (both sections), and at least one
  detail page for a current and a previous machine, in a browser, before
  calling the site done.

## Out of scope (explicitly not building)

- Search/filter on the Collection page.
- About/contact page.
- CMS or admin UI — machines are added by editing Markdown files directly.
- Database, authentication, comments, or any visitor interactivity.
- Video embeds (photos only, per current scope).
