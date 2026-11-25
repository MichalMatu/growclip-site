# GrowClip Marketing Site

Public marketing/demo site for **GrowClip**, a private ESP32-S3 local automation platform.

The firmware, device authentication, API implementation and full Nodeflow runtime remain private. This repository contains the standalone public-facing site, marketing-only LiteGraph demo and public mockups.

**Live site:** https://michalmatu.github.io/growclip-site/

## Source ownership

This repository is the canonical source for the public marketing site. Product positioning and internal release evidence belong in the private GrowClip repository; do not maintain a second editable copy of this site there. Keep public claims aligned with the product's verified capabilities. The demo is illustrative and uses mock data only.

## Stack

- SvelteKit 2 + static adapter
- Svelte 5
- Vite 5
- TypeScript
- Tailwind CSS 4 + DaisyUI
- Vitest content and demo contract checks
- Playwright + Axe smoke, responsive, visual and accessibility tests

## Run locally

```bash
npm ci
npm run dev
```

Verification:

```bash
npm run check
npm run lint
npm run test
npm run test:e2e
npm run build
```

Additional browser checks are available through the Playwright scripts in `package.json`.

Current acceptance and release criteria: [docs/RELEASE_GATE.md](docs/RELEASE_GATE.md). Run full QA on the Local Agent. Keep routine changes on main with no automatic deployment; authorize publication separately.

## GitHub Pages

Production builds use the `/growclip-site` base path. `.github/workflows/pages.yml` builds the static SvelteKit output and deploys the `build/` directory to GitHub Pages.

## Content

The original public product copy is kept in `src/lib/content/product-base.ts`. `src/lib/content/product.ts` is a small public-site adapter that adds the GitHub Pages asset prefix and the public contact address.

The site supports Polish and English and includes the original light/dark theme behavior.

## Media

Public media lives in `static/media/`, including the hero artwork, product concept, web panel, Nodeflow flow, timeline and archive mockups.

## LiteGraph demo

The demo under `src/lib/features/litegraph/` is marketing-only. Four deterministic IPO examples use typed simulated inputs, interactive numeric thresholds and comparison operators. See [node parity audit](docs/NODEFLOW_DEMO_PARITY_AUDIT.md) for intentional differences and outstanding visual review. It does not connect to an ESP32, save device flows, call private APIs or expose the full private Nodeflow runtime.
