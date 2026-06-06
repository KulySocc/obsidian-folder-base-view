# CHANGELOG.md is the single source for release notes

A single root `CHANGELOG.md` (Keep a Changelog format: `## [x.y.z]` sections with `### Added/Changed/Fixed`) is the only place release notes are authored. It feeds **three** consumers through one shared `split(/^## \[/m)` parser: the in-app release-notes `Modal` (bundled into `main.js` via esbuild's `text` loader, rendered with `MarkdownRenderer`, shown once per update for all versions newer than the persisted `lastShownReleaseVersion`), the GitHub release body (`gh release create --notes-file`, replacing `--generate-notes`), and a release-time gate that aborts `npm version` if the new version has no non-empty changelog section. We chose this over the obvious `--generate-notes` (commit-list auto-notes — can't produce the curated New/Improvements/Fixes categories, and would drift from whatever the in-app modal shows) and over a bundled JSON changelog (would still need MD conversion for both the modal and the GitHub body, and loses GitHub's native CHANGELOG.md rendering). The cost we accept: the curated changelog must be hand-authored at release time, and the auto-generated "Full Changelog" compare link is reconstructed by the extract script rather than provided by GitHub.

## Consequences

- The version that introduces this mechanism is silent: pre-feature installs never recorded `lastShownReleaseVersion`, so on upgrade it reads `null`, is treated as a fresh install, and shows no modal. Its notes live in the GitHub release and README instead.
- The release-time gate (`scripts/check-changelog.mjs`, wired as the first step of the `version` npm script) is the safeguard that makes "single source" reliable — without it, a forgotten `## [x.y.z]` section yields an empty GitHub body *and* an empty modal, undetected until after release. It runs where `npm_package_version` is already the new version but the git tag does not yet exist, so a failure aborts cleanly.

## Considered options

- **`gh release create --generate-notes`** (status quo) — auto commit-list. Rejected: can't be curated/categorized, and decouples the GitHub notes from the in-app modal (two divergent sources).
- **Bundled JSON changelog** — structured, but both the modal and the GitHub body want Markdown, so it would be authored as JSON only to be rendered straight back to Markdown for every consumer; also forfeits GitHub's automatic CHANGELOG.md rendering.
