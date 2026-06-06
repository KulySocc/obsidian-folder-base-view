# Folder Base View

Click a folder in the file explorer to open a chosen `.base` as its table of contents — scoped to that folder, with no companion note required.

## Requirements

Obsidian 1.13+ (desktop) with the core **Bases** plugin enabled.

## Setup

1. **Settings → Folder Base View → Create recommended Index Base** (one click) — or pick any `.base` as the Default Index Base.
2. Click a folder name in the file explorer.

The folder's contents render through your base's layout, scoped to that folder. The chevron still expands/collapses the tree.

## Settings

- **Default Index Base** — base used for any folder.
- **Folder overrides** — map specific folders to their own base (exact-match).
- **Open trigger** — single / double / Cmd·Ctrl + click.
- **Also expand on open**, **Exclude `.base` files**.

## Development

Copy `.env.example` to `.env` and set `OBSIDIAN_VAULT_PLUGIN_DIR` to this plugin's
folder inside a test vault (`…/.obsidian/plugins/folder-base-view`).

```bash
npm install
npm run dev      # esbuild watch → writes into the vault; reloads via the
                 # Hot-Reload plugin (pjeby/hot-reload) on each save
npm run deploy   # one-shot build + copy into the vault (no Hot-Reload needed)
```

## Releasing

Add a `## [x.y.z]` section to [`CHANGELOG.md`](CHANGELOG.md) first — `npm version`
aborts if the new version has no notes (see [ADR-0003](docs/adr/0003-changelog-single-source.md)).

```bash
npm version patch   # or minor / major
```

Builds, bumps `manifest.json` + `versions.json`, tags (no `v` prefix), pushes
`main`, and creates a GitHub release with `main.js` + `manifest.json`, using the
changelog section as the release body. Requires the `gh` CLI to be authenticated.

The same `CHANGELOG.md` feeds the in-app what's-new dialog shown once after an update.

## License

[MIT](LICENSE)
