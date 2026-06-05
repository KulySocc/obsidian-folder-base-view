# Folder scope is context-driven, not filter-injected

The **Folder Index** scopes to the **Target Folder** by setting the base's `this.file` context (`controller.updateCurrentFile`) to a file inside that folder, so the base's own `this.file.folder` / `file.inFolder(this.file.folder)` views resolve there. We deliberately do **not** inject a global folder filter (e.g. `file.inFolder("X")`), even though it is technically possible in memory on a cloned query.

A global filter ANDs with **every** view in the base. Many real bases contain views deliberately scoped to *other* folders (e.g. a "Company" view filtering `file.folder == "Company"`); a global `file.inFolder(clickedFolder)` would empty all of them. Context injection leaves those views intact and only re-points the `this.file`-relative views.

**Consequence:** recursion (direct children vs. recursive) is governed by the **Index Base's view design** (`file.folder == this.file.folder` vs. `file.inFolder(this.file.folder)`), not by a plugin toggle. The recommended base (issue 05) will ship a recursive view by default. The only filter the plugin injects is the folder-independent `.base` exclusion, which is safe because it does not depend on the clicked folder (applied on a cloned, save-less query — no disk write).

## Considered options

- **Inject the folder scope as a global filter** on a cloned query (`setGlobalFilters`) — verified to work in memory with no disk write, but rejected: it corrupts multi-view bases as described above.
- **Custom view via `registerBasesView`** — already rejected in ADR-0001 (loses native layouts).
