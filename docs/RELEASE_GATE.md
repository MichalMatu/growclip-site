# MVP release — CLOSED (2026-11-25)

Scope: standalone public marketing site only. Owner accepted the MVP scope and requested closure.

- [x] Source and published candidate: `c54cdaafcba2cf7af10049e7d47307499c29c66c`.
- [x] Local Agent QA: lint, typecheck, static build, 19/19 Vitest, 39/39 Playwright; eight release matrix configurations; zero serious/critical accessibility findings.
- [x] Four simulated examples; Number and Compare interaction, non-overlap, hover stability and theme/fullscreen behavior.
- [x] Repository cleanup: one branch (`main`), no open PRs, five unused graphics removed, clean checkout at release.
- [x] Public deployment verified behaviorally by Local Agent task `growclip-site-publish-live-smoke-20261125-v1`: PL/EN × light/dark, Number 280×140, stable panel hover and interactive Compare, using fresh browser contexts and cache-busting URLs.

Public URL: https://michalmatu.github.io/growclip-site/

## Accepted MVP limitations

Full renderer-for-renderer visual parity and independent manual review of all screenshot comparisons are deferred, not claimed complete. Prototype photography without verified provenance is deferred. The demo is simulated only, with no physical device access, private runtime, live MQTT or Telegram operations. No further development is planned within this MVP scope.

Rollback source: a2fa0c8dbaafae42fd572210b30000975df209c8 (pre-closeout candidate). Historical baseline: 0897aabba6e91ea53851cadf0c8c3ff692d2e7df.

Evidence: [release-evidence/README.md](release-evidence/README.md), [NODEFLOW_DEMO_PARITY_AUDIT.md](NODEFLOW_DEMO_PARITY_AUDIT.md).
