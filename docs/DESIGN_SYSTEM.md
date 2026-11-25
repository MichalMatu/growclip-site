# GrowClip visual foundation

The embedded product frontend owns the design foundation. This public site consumes a portable, reviewed snapshot of CSS tokens only. No private product source, runtime, settings or dependencies are required for public builds.

- Upstream revision: `64dc7713b0b360d5d56e04b36533a33285e4b688`
- Upstream path: `interface/src/lib/shared/styles/tokens.css`
- Upstream blob: `068aa03b08a49b62dfbbd0419fbf33013e46673f`
- Local snapshot: `src/lib/styles/growclip-tokens.css`
- DaisyUI corporate (light), business (dark), and system selection; use shared semantic tokens instead of a second palette. Keep dependency versions aligned after explicit review.
- Public layout, marketing typography and content are site-owned; LiteGraph follows the selected light/dark canvas theme through the portable public adapter; device-specific renderers are independently simulated, not imported from the private application.
- Update snapshot intentionally from a reviewed upstream revision; record blob and run visual QA. Do not edit the snapshot independently.
