# In-memory scope injection via undocumented Bases internals

To render a **Folder Index** the moment a folder is clicked, the plugin opens the resolved **Index Base** in a single reused leaf and scopes it to the **Target Folder** **in memory**, rather than writing a scoped working-copy `.base` to disk. This was chosen because *instant, zero-latency* rendering is a hard product requirement, and a disk round-trip (write → file-watcher → re-parse → render) introduces perceptible delay.

The approach depends on **undocumented internal Bases APIs** and **undocumented file-explorer DOM** (folder-title classes, intercepted clicks). These may break on any Obsidian update. This is accepted deliberately, mitigated by **feature-detection at load with graceful degradation**: if the required internals are absent (or the Bases core plugin is disabled), folder-click interception is never activated, native expand/collapse stays fully intact, and the user sees a one-time notice — never a broken file explorer.

## Verified mechanism (Obsidian 1.13.0)

The in-memory approach was validated empirically against a live vault (the public `obsidian.d.ts` hides the relevant surface; these were confirmed by introspection):

1. Open the Index Base in a leaf and **pin it**. The standalone Bases view auto-resets its `this.file` context to the base file itself on every active-leaf change (`view.updateCurrentFile` → `controller.updateCurrentFile(null)`), which is exactly why standalone `this.file.folder` filters show nothing. That reset is **skipped when the leaf is pinned or grouped** — so pinning disables the clobber.
2. Call `controller.updateCurrentFile(targetFile)` with a `TFile` located in the **Target Folder**. The controller rebuilds its evaluation context (`ctx = buildBasesContext(viewFilters)`, which `AND`s the base's global + view filters) and re-runs the query in memory.
3. The user's existing `this.file.folder` / `file.inFolder(this.file.folder)` views now resolve to the Target Folder. Confirmed: a 5-file folder rendered exactly its 4 siblings (the chosen `this.file` excluded by the base's own `file.name != this.file.name` clause), all directly in the folder, with no disk write.

This is **better than filter-string injection**: it drives the user's existing `this.file`-based views directly. For bases that do *not* use `this.file`, the scope can instead be layered via `query.setGlobalFilters` using the Scope-Composition output (`file.inFolder("…")`). Key internal symbols relied upon (all feature-detected, per the graceful-degradation posture): `leaf.view.getViewType() === "bases"`, `view.controller`, `controller.updateCurrentFile`, `controller.selectView`, `WorkspaceLeaf.setPinned`.

Resolved during build: `this.file` is **always a synthetic** (non-existent) `TFile` whose parent is the Target Folder (`Object.create(TFile.prototype)` + assigned `path`/`name`/`parent`), rather than a real child file. This (a) scopes folders that have only subfolders or are empty, and (b) avoids a real file being hidden by a base's `file.name != this.file.name` clause, since the synthetic name matches nothing real. Verified live against Obsidian 1.13.0.

## Considered options

- **Managed working-copy file per click** — generate a scoped `.base` on disk on each click, then open it. Rejected: the disk round-trip violates the instant-render requirement, and it pollutes the vault / Git.
- **Custom view via `registerBasesView`** (the *documented* extension point) — rejected: a custom view type would force reimplementing Bases' rendering, removing the user's ability to configure native Bases layouts (table/cards/list/map), which is a core feature of this plugin.

## Consequences

- Ongoing maintenance burden: internals must be re-verified against each Obsidian release.
- Reliance on internal APIs is tolerated but scrutinised in community-plugin review; the graceful-degradation posture is what keeps it acceptable and protects the plugin's health/rating after breaking updates.
