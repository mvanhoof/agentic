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
