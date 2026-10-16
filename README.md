# Portfolio

Personal portfolio for Shashank Chikattimala, built with [Astro](https://astro.build). Static output, no client-side JavaScript.

## Develop

Requires Node 22.22 or newer.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Add a project

Add a Markdown file to `src/content/projects/`. The frontmatter is validated by `src/content.config.ts`:

```md
---
title: Project name
summary: One sentence.
stack: [Python, FastAPI]
status: planned   # planned | in-progress | shipped
order: 7
repo: https://github.com/...   # optional
demo: https://...              # optional
---
```

Projects with status `planned` appear on the Projects page only. The home page shows the others.

## Deploy

Cloudflare Pages: build command `npm run build`, output directory `dist`, environment variable `NODE_VERSION=22`.
