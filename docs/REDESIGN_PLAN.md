# Website redesign — 2026-11-24

Scope: public growclip-site only. Product UI is visual reference, not a modification target. Source main, Local Agent + GitHub Connector, no routine GitHub Actions.

- [x] S0 — shared visual foundation, theme semantics, static HTML, mobile navigation, truthful private-beta wording; local acceptance passed; source published.
- [x] S1 — PL/EN claim audit against current product, concise narrative, distinguish validated/optional/deferred capabilities, dedicated locale routes.
- [x] S2 — Asset Factory: four actual product UI screenshots with synthetic fixtures, optimized WebP, SHA-256 manifest, local QA (13 Vitest, 17 Playwright; zero serious/critical accessibility findings). Owner-provenance prototype photography remains an explicit deferred item; final visual review is part of S6.
- [x] S3 — extracted 11 typed landing sections, retained shared design tokens, prioritized workflow and interactive demo ahead of comparison. Integrated QA: 13 Vitest, 17 Playwright, zero serious/critical accessibility findings.
- [x] S4 — browser-only causal IPO for four scenarios, stale/offline inputs, midnight time gates, reset/resize and graph disposal, hydration-safe theme controls. QA: 16 Vitest, 20 Playwright; 12 repeated foundation checks; zero serious/critical accessibility findings. No hardware access.
- [x] S5 — prerendered PL/EN metadata, canonical/social URLs and sitemap; mobile keyboard navigation and close-on-selection; build budgets (JS gzip 100 kB, CSS gzip 30 kB, gallery 200 kB, hero 100 kB, lazy vendor 1 MB).
- [ ] S6 — visual screenshot comparison and full PL/EN light/dark responsive QA; record release evidence. Deploy separately only on explicit authorization.

- [ ] S6C — compact landing requested after production screenshots: remove duplicated proof/problem/comparison/workflow and palette, single real-product gallery, concise beta and FAQ, refresh Zigbee and e-paper Charts claims. Re-run QA; prior visual evidence superseded by new candidate.

- [x] S6C.1 — owner-approved demo-first visual refinement: unchanged hero, compact selected-node library immediately under the four browser examples, remove repeated demo labels. Product library preview is informational (not a claim that every listed node is implemented in the browser demo). Further capability grouping and technical hierarchy require owner review. Product reference 64dc7713b0b360d5d56e04b36533a33285e4b688.

S6C.1 automated acceptance passed (15 Vitest, 34 Playwright including all 8 release matrix configurations); owner visual review remains pending. No production deployment.

- [x] S6C.2 — owner-approved demo-only style parity: canonical GrowClip canvas theme and card proportions, flat title bars, semantic port colors, less intrusive IPO groups and native fullscreen toggle. Product visual source: 64dc7713b0b360d5d56e04b36533a33285e4b688. No device runtime copied. No other sections changed. Visual owner review and publication separate.

S6C.2: automated acceptance of visual adapter and fullscreen controls, including denied-native viewport fallback with Escape; 15 Vitest and 36 Playwright. Owner visual review pending; no production deployment. Rollback source 0897aabba6e91ea53851cadf0c8c3ff692d2e7df.
