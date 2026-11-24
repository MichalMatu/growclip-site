# Website redesign — 2026-11-24

Scope: public growclip-site only. Product UI is visual reference, not a modification target. Source main, Local Agent + GitHub Connector, no routine GitHub Actions.

- [x] S0 — shared visual foundation, theme semantics, static HTML, mobile navigation, truthful private-beta wording; local acceptance passed; source published.
- [x] S1 — PL/EN claim audit against current product, concise narrative, distinguish validated/optional/deferred capabilities, dedicated locale routes.
- [x] S2 — Asset Factory: four actual product UI screenshots with synthetic fixtures, optimized WebP, SHA-256 manifest, local QA (13 Vitest, 17 Playwright; zero serious/critical accessibility findings). Owner-provenance prototype photography remains an explicit deferred item; final visual review is part of S6.
- [x] S3 — extracted 11 typed landing sections, retained shared design tokens, prioritized workflow and interactive demo ahead of comparison. Integrated QA: 13 Vitest, 17 Playwright, zero serious/critical accessibility findings.
- [x] S4 — browser-only causal IPO for four scenarios, stale/offline inputs, midnight time gates, reset/resize and graph disposal, hydration-safe theme controls. QA: 16 Vitest, 20 Playwright; 12 repeated foundation checks; zero serious/critical accessibility findings. No hardware access.
- [ ] S5 — static SEO, metadata, sitemap, accessible mobile controls, performance budgets.
- [ ] S6 — visual screenshot comparison and full PL/EN light/dark responsive QA; record release evidence. Deploy separately only on explicit authorization.
