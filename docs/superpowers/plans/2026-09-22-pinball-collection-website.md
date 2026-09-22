# Pinball Collection Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro website showing Maarten's pinball collection (current + previously owned), deployable to GitHub Pages.

**Architecture:** Astro static site generator. Machine data lives in Markdown files under Astro content collections, validated by a Zod schema at build time. Three route types: home, a single collection page with two sections, and a dynamic per-machine detail page. Dark "retro arcade, balanced" theme via one global stylesheet.

**Tech Stack:** Astro ^4.16 (content collections, `type: 'content'`), plain CSS (no framework), GitHub Actions → GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-22-pinball-collection-design.md`

## Global Constraints

- Static output only — no server, no database, no CMS. Adding a machine means adding one Markdown file plus its photos, then `git push`.
- Content lives in `src/content/machines/*.md`, one file per machine, schema-validated in `src/content/config.ts`.
- A machine with `status: previous` MUST have `soldDate` set — enforced by the content collection schema at build time (build fails on violation).
- Site structure: `/` (home), `/collection` (two sections: Current, Previously Owned — one page, not two), `/machines/[slug]` (detail). No search/filter, no About/contact page, no video embeds.
- Visual style: dark background, "balanced" neon accents (magenta/cyan/amber) on headings/borders/hover only — body text and photos stay legible. Pixel display font (`Press Start 2P` via Google Fonts) for headings/nav only, not body copy.
- Testing convention for this plan: there is no application logic to unit-test, so "test" means `npm run build` succeeding (Astro validates content-collection schemas at build time, so a bad entry fails the build) plus a manual visual check in the browser. This matches the spec's Testing section.
- Deploy: GitHub Actions builds on push to `main`, publishes to GitHub Pages via `actions/deploy-pages`.

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro`

**Interfaces:**
- Produces: a working `npm run build` command that outputs to `dist/`. Later tasks replace `src/pages/index.astro`'s content but keep this build pipeline.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "pinball-collection",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.16.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://your-github-username.github.io',
  base: '/pinball-collection',
});
```

You will change `your-github-username` and `/pinball-collection` to your real GitHub username and repo name in Task 7, once the repo exists on GitHub.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.astro/
```

- [ ] **Step 5: Create minimal `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pinball Collection</title>
  </head>
  <body>
    <h1>Pinball Collection</h1>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 7: Verify the build works**

Run: `npm run build`
Expected: exits 0, `dist/index.html` exists and contains `Pinball Collection`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/pages/index.astro
git commit -m "$(cat <<'EOF'
chore: scaffold Astro project

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Content Collection Schema + Sample Machines

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/machines/twilight-zone.md`
- Create: `src/content/machines/medieval-madness.md`
- Create: `public/images/twilight-zone/cover.svg`
- Create: `public/images/twilight-zone/cabinet.svg`
- Create: `public/images/twilight-zone/playfield.svg`
- Create: `public/images/medieval-madness/cover.svg`
- Create: `public/images/medieval-madness/cabinet.svg`

**Interfaces:**
- Produces: the `machines` content collection. Schema fields: `name: string`, `manufacturer: string`, `year: number`, `status: 'current' | 'previous'`, `acquiredDate: Date`, `soldDate: Date | null (optional)`, `pricePaid: number`, `priceSold: number | null (optional)`, `ipdbUrl: string`, `mods: string[]`, `description: string`, `coverImage: string`, `gallery: string[]`. `soldDate` is required (build fails) when `status: 'previous'`. Later tasks consume this via `getCollection('machines')` and `machine.data.<field>`, `machine.slug`, `machine.render()`.

- [ ] **Step 1: Create the schema**

Create `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const machines = defineCollection({
  type: 'content',
  schema: z
    .object({
      name: z.string(),
      manufacturer: z.string(),
      year: z.number(),
      status: z.enum(['current', 'previous']),
      acquiredDate: z.date(),
      soldDate: z.date().nullable().optional(),
      pricePaid: z.number(),
      priceSold: z.number().nullable().optional(),
      ipdbUrl: z.string().url(),
      mods: z.array(z.string()).default([]),
      description: z.string(),
      coverImage: z.string(),
      gallery: z.array(z.string()).default([]),
    })
    .refine((data) => data.status !== 'previous' || data.soldDate != null, {
      message: 'soldDate is required when status is "previous"',
      path: ['soldDate'],
    }),
});

export const collections = { machines };
```

- [ ] **Step 2: Create the current machine, `twilight-zone.md`**

```markdown
---
name: Twilight Zone
manufacturer: Bally
year: 1993
status: current
acquiredDate: 2021-03-15
soldDate: null
pricePaid: 3200
priceSold: null
ipdbUrl: https://ipdb.org/machine.cgi?id=1231
mods: ["Cliffy protectors", "LED kit"]
description: >
  Sci-fi themed machine designed by Pat Lawlor, released 1993. Known for its
  clock-based multiball and infamous Gumball multiball.
coverImage: /images/twilight-zone/cover.svg
gallery:
  - /images/twilight-zone/cabinet.svg
  - /images/twilight-zone/playfield.svg
---

Bought this one after chasing it for two years. The clock mech alone made it
worth the wait.
```

- [ ] **Step 3: Create the previously-owned machine with an intentionally invalid `soldDate`, `medieval-madness.md`**

```markdown
---
name: Medieval Madness
manufacturer: Williams
year: 1997
status: previous
acquiredDate: 2018-06-01
soldDate: null
pricePaid: 5500
priceSold: 9800
ipdbUrl: https://ipdb.org/machine.cgi?id=3842
mods: ["Shaker motor"]
description: >
  Widely considered one of the greatest pins ever made. Designed by Brian
  Eddy, themed around a castle siege.
coverImage: /images/medieval-madness/cover.svg
gallery:
  - /images/medieval-madness/cabinet.svg
---

Sold this one to fund the Twilight Zone purchase. Miss the trolls.
```

- [ ] **Step 4: Verify the schema catches the invalid entry**

Run: `npm run build`
Expected: build FAILS, error mentions `soldDate is required when status is "previous"` for `medieval-madness.md`.

- [ ] **Step 5: Fix the invalid entry**

In `src/content/machines/medieval-madness.md`, change:

```yaml
soldDate: null
```

to:

```yaml
soldDate: 2022-11-20
```

- [ ] **Step 6: Verify the build passes**

Run: `npm run build`
Expected: exits 0, no schema errors.

- [ ] **Step 7: Create the five placeholder images**

Create `public/images/twilight-zone/cover.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="50%" y="50%" fill="#ff3ec8" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">Twilight Zone</text>
</svg>
```

Create `public/images/twilight-zone/cabinet.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="50%" y="50%" fill="#38e8ff" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">Cabinet</text>
</svg>
```

Create `public/images/twilight-zone/playfield.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 300 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="50%" y="50%" fill="#ffb347" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">Playfield</text>
</svg>
```

Create `public/images/medieval-madness/cover.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="50%" y="50%" fill="#ff3ec8" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">Medieval Madness</text>
</svg>
```

Create `public/images/medieval-madness/cabinet.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="50%" y="50%" fill="#38e8ff" font-family="sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle">Cabinet</text>
</svg>
```

- [ ] **Step 8: Verify the build still passes with images present**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 9: Commit**

```bash
git add src/content public/images
git commit -m "$(cat <<'EOF'
feat: add machine content collection schema and sample entries

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Global Styles + Base Layout

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro` (adopt the layout)

**Interfaces:**
- Produces: `BaseLayout.astro` with `Props { title: string }`, rendering a `<header>` nav (Home / Collection) and a `<slot />` for page content. Later tasks (`index.astro`, `collection.astro`, `machines/[slug].astro`) wrap their content in this layout.

- [ ] **Step 1: Create `src/styles/global.css`**

```css
:root {
  --bg: #0d0d14;
  --surface: #161622;
  --text: #e8e8f0;
  --muted: #9a9ab0;
  --accent-magenta: #ff3ec8;
  --accent-cyan: #38e8ff;
  --accent-amber: #ffb347;
  --font-display: 'Press Start 2P', system-ui, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.5;
}

h1, h2, h3, .logo, nav a {
  font-family: var(--font-display);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--surface);
}

.site-header .logo {
  color: var(--accent-cyan);
  text-decoration: none;
  font-size: 0.9rem;
}

.site-header nav a {
  color: var(--text);
  text-decoration: none;
  margin-left: 1.5rem;
  font-size: 0.7rem;
}

.site-header nav a:hover {
  color: var(--accent-magenta);
}

main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.hero h1 {
  color: var(--accent-magenta);
  font-size: 1.5rem;
}

.stats {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.stat {
  background: var(--surface);
  border: 1px solid var(--accent-cyan);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--accent-amber);
}

.stat-label {
  color: var(--muted);
  font-size: 0.8rem;
}

.machine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0 3rem;
}

.machine-card {
  display: block;
  background: var(--surface);
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  color: var(--text);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.machine-card:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 16px var(--accent-cyan);
}

.machine-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.machine-card h3 {
  font-size: 0.85rem;
  margin: 0.75rem 1rem 0.25rem;
}

.machine-card p {
  margin: 0 1rem 1rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.gallery {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.gallery img {
  height: 220px;
  border-radius: 8px;
}

.facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1rem;
  margin: 1.5rem 0;
}

.facts dt {
  color: var(--muted);
  font-size: 0.8rem;
}

.facts dd {
  margin: 0;
}
```

- [ ] **Step 2: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
}
const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} · Pinball Collection</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  </head>
  <body>
    <header class="site-header">
      <a class="logo" href="/">Pinball Collection</a>
      <nav>
        <a href="/">Home</a>
        <a href="/collection">Collection</a>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 3: Modify `src/pages/index.astro` to use the layout**

Replace the full file contents:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home">
  <h1>Pinball Collection</h1>
</BaseLayout>
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: exits 0, `dist/index.html` contains `Pinball Collection` and `Press+Start+2P`.

- [ ] **Step 5: Manual visual check**

Run: `npm run dev`, open the printed local URL in a browser.
Expected: dark background, nav bar with "Pinball Collection" logo in cyan and "Home"/"Collection" links, pixel-style heading font on the `<h1>`. Stop the dev server (Ctrl+C) when done.

- [ ] **Step 6: Commit**

```bash
git add src/styles src/layouts src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: add retro-arcade base layout and global styles

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Home Page + MachineCard Component

**Files:**
- Create: `src/components/MachineCard.astro`
- Modify: `src/pages/index.astro` (full home page)

**Interfaces:**
- Consumes: `BaseLayout` (Task 3), `getCollection('machines')` and the `machines` schema (Task 2).
- Produces: `MachineCard.astro` with `Props { machine: CollectionEntry<'machines'> }`, rendering a linked card (cover image, name, manufacturer, year) pointed at `/machines/${machine.slug}`. Task 5 (Collection page) reuses this component unchanged.

- [ ] **Step 1: Create `src/components/MachineCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  machine: CollectionEntry<'machines'>;
}
const { machine } = Astro.props;
const { name, year, manufacturer, coverImage } = machine.data;
---
<a class="machine-card" href={`/machines/${machine.slug}`}>
  <img src={coverImage} alt={name} />
  <h3>{name}</h3>
  <p>{manufacturer} · {year}</p>
</a>
```

- [ ] **Step 2: Replace `src/pages/index.astro` with the full home page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MachineCard from '../components/MachineCard.astro';
import { getCollection } from 'astro:content';

const machines = await getCollection('machines');
const current = machines.filter((m) => m.data.status === 'current');
const previous = machines.filter((m) => m.data.status === 'previous');
const featured = current[0] ?? machines[0];
---
<BaseLayout title="Home">
  <section class="hero">
    <h1>My Pinball Collection</h1>
    <p>A running record of every machine that's passed through my garage.</p>
  </section>

  <section class="stats">
    <div class="stat">
      <span class="stat-value">{current.length}</span>
      <span class="stat-label">Current</span>
    </div>
    <div class="stat">
      <span class="stat-value">{previous.length}</span>
      <span class="stat-label">Previously Owned</span>
    </div>
  </section>

  {featured && (
    <section class="featured">
      <h2>Featured</h2>
      <div class="machine-grid">
        <MachineCard machine={featured} />
      </div>
    </section>
  )}
</BaseLayout>
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: exits 0, `dist/index.html` contains `1` (current count) and `Twilight Zone` (the featured machine, since it's the first `current` entry).

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open the local URL.
Expected: hero heading in magenta, two scoreboard-style stat tiles ("1 Current", "1 Previously Owned"), one featured machine card that glows cyan on hover and links to `/machines/twilight-zone`. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/components src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat: build home page with stats and featured machine

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Collection Page

**Files:**
- Create: `src/pages/collection.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 3), `MachineCard` (Task 4), `getCollection('machines')` (Task 2).

- [ ] **Step 1: Create `src/pages/collection.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MachineCard from '../components/MachineCard.astro';
import { getCollection } from 'astro:content';

const machines = await getCollection('machines');
const current = machines.filter((m) => m.data.status === 'current');
const previous = machines.filter((m) => m.data.status === 'previous');
---
<BaseLayout title="Collection">
  <h1>Collection</h1>

  <section>
    <h2>Current Collection</h2>
    <div class="machine-grid">
      {current.map((machine) => <MachineCard machine={machine} />)}
    </div>
  </section>

  <section>
    <h2>Previously Owned</h2>
    <div class="machine-grid">
      {previous.map((machine) => <MachineCard machine={machine} />)}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: exits 0, `dist/collection/index.html` exists and contains both `Twilight Zone` and `Medieval Madness`.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open `/collection`.
Expected: two headed sections, "Current Collection" showing the Twilight Zone card, "Previously Owned" showing the Medieval Madness card. Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/pages/collection.astro
git commit -m "$(cat <<'EOF'
feat: add collection page with current and previously-owned sections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Machine Detail Page

**Files:**
- Create: `src/pages/machines/[slug].astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 3), `getCollection('machines')` and full `machines` schema (Task 2).

- [ ] **Step 1: Create `src/pages/machines/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const machines = await getCollection('machines');
  return machines.map((machine) => ({
    params: { slug: machine.slug },
    props: { machine },
  }));
}

const { machine } = Astro.props;
const { Content } = await machine.render();
const {
  name,
  manufacturer,
  year,
  status,
  acquiredDate,
  soldDate,
  pricePaid,
  priceSold,
  ipdbUrl,
  mods,
  description,
  coverImage,
  gallery,
} = machine.data;
---
<BaseLayout title={name}>
  <article class="machine-detail">
    <h1>{name}</h1>
    <p class="meta">{manufacturer} · {year}</p>

    <div class="gallery">
      <img src={coverImage} alt={name} />
      {gallery.map((src) => <img src={src} alt={name} />)}
    </div>

    <dl class="facts">
      <dt>Status</dt>
      <dd>{status === 'current' ? 'Current' : 'Previously Owned'}</dd>

      <dt>Acquired</dt>
      <dd>{acquiredDate.toDateString()}</dd>

      {soldDate && (
        <>
          <dt>Sold</dt>
          <dd>{soldDate.toDateString()}</dd>
        </>
      )}

      <dt>Price Paid</dt>
      <dd>${pricePaid}</dd>

      {priceSold != null && (
        <>
          <dt>Price Sold</dt>
          <dd>${priceSold}</dd>
        </>
      )}

      <dt>IPDB</dt>
      <dd><a href={ipdbUrl}>{ipdbUrl}</a></dd>

      {mods.length > 0 && (
        <>
          <dt>Mods</dt>
          <dd>{mods.join(', ')}</dd>
        </>
      )}
    </dl>

    <section class="description">
      <p>{description}</p>
    </section>

    <section class="story">
      <Content />
    </section>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Verify the build generates both detail pages**

Run: `npm run build`
Expected: exits 0, `dist/machines/twilight-zone/index.html` and `dist/machines/medieval-madness/index.html` both exist. The Twilight Zone page contains `Cliffy protectors`; the Medieval Madness page contains `Price Sold` and `9800`.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open `/machines/twilight-zone` and `/machines/medieval-madness`.
Expected: each shows its gallery images, the facts list (status/dates/prices/IPDB/mods), the `description` paragraph, then the personal story body below it. Card links from the home page and collection page both navigate here correctly. Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add src/pages/machines
git commit -m "$(cat <<'EOF'
feat: add machine detail page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: GitHub Pages Deploy

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs` (real `site`/`base` values)
- Create: `README.md`

**Interfaces:**
- None — this task wires up CI/deploy for the site built in Tasks 1–6; it doesn't change any page or component contract.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Push the repo to GitHub, then update `astro.config.mjs`**

Create the GitHub repo (e.g. `pinball-collection`) under your account, push this local repo to it, then edit `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://YOUR-USERNAME.github.io',
  base: '/pinball-collection',
});
```

Replace `YOUR-USERNAME` with your actual GitHub username. If you named the repo something other than `pinball-collection`, use that name for `base` instead.

- [ ] **Step 3: Enable GitHub Pages via Actions**

In the GitHub repo settings, under **Pages**, set **Source** to **GitHub Actions**. (This is a one-time manual step in the GitHub UI — it cannot be scripted from here.)

- [ ] **Step 4: Create `README.md`**

```markdown
# Pinball Collection

Personal static site showing my current and previously-owned pinball machines.
Built with [Astro](https://astro.build).

## Development

```bash
npm install
npm run dev
```

## Adding a machine

1. Add a Markdown file under `src/content/machines/<slug>.md` with the
   frontmatter fields described in `src/content/config.ts` (name,
   manufacturer, year, status, acquiredDate, soldDate, pricePaid, priceSold,
   ipdbUrl, mods, description, coverImage, gallery), and a Markdown body for
   your personal story/notes.
2. Add its photos under `public/images/<slug>/`.
3. `npm run build` locally to confirm the schema validates.
4. Commit and push to `main` — GitHub Actions builds and deploys
   automatically.
```

- [ ] **Step 5: Verify the build one more time**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 6: Commit and push**

```bash
git add .github README.md astro.config.mjs
git commit -m "$(cat <<'EOF'
chore: add GitHub Pages deploy workflow and README

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
git push -u origin main
```

- [ ] **Step 7: Confirm the deploy**

In the GitHub repo's **Actions** tab, confirm the "Deploy to GitHub Pages" workflow runs and succeeds. Visit `https://YOUR-USERNAME.github.io/pinball-collection/` and confirm the home page loads.
