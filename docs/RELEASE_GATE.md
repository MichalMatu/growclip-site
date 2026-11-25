# Final release gate

Scope: standalone public marketing site only.

## Current candidate

- [x] Source baseline a2fa0c8dbaafae42fd572210b30000975df209c8: hover and Number corrections accepted.
- [x] Closeout QA: lint, typecheck, 19 Vitest, 39 Playwright, eight matrix configurations, strict accessibility, static build.
- [x] Compare controls, Number pointer interaction, example non-overlap, documentation synchronization and fresh capture manifest.
- [ ] Inspect current demo and product reference screenshots; review remaining differences in simulated device card renderers. Do not equate automated screenshot capture with visual approval.
- [ ] Owner-authorized deployment and public PL/EN behavioral smoke (do not compare environment-dependent bundle hashes).

Rollback source: 0897aabba6e91ea53851cadf0c8c3ff692d2e7df (historical baseline); pre-closeout candidate a2fa0c8dbaafae42fd572210b30000975df209c8. Preserve historical evidence in Git. Prototype photos without verified provenance remain deferred. No physical device access, live MQTT, Telegram or private runtime in this repository.

Evidence: [release-evidence/README.md](release-evidence/README.md), [NODEFLOW_DEMO_PARITY_AUDIT.md](NODEFLOW_DEMO_PARITY_AUDIT.md).
