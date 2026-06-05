# Folder Index

An Obsidian plugin that turns a folder click in the file explorer into a live, Bases-powered table of contents for that folder — without requiring any companion note or per-folder file.

## Language

**Index Base**:
Umbrella term for the `.base` *resolved* for a given **Target Folder** — i.e. whichever base is actually used to render its **Folder Index**. Resolved as: **Folder Override Base** if one is mapped, otherwise the **Default Index Base**. Owned entirely by the user; the plugin never edits it, only scopes it.
_Avoid_: template, folder note, dashboard, companion file.

**Default Index Base**:
The single, globally-configured `.base` (chosen in settings) used for every **Target Folder** that has no **Folder Override Base**. The common case: most folders need no per-folder configuration at all.
_Avoid_: global base, fallback base.

**Folder Override Base**:
An optional `.base` associated with a specific folder via a **settings mapping** (folder path → base path), *not* by placing a file in the folder. The mapping is **exact-match**: it applies only to that one folder, never inherited by subfolders. When mapped, it fully replaces the Default Index Base for that folder (its own layout *and* filters, e.g. a curated `folder == true`). Used only for folders the user deliberately curates.
_Avoid_: folder note, local base, in-folder base.

**Target Folder**:
The folder the user clicked in the file explorer, whose contents are currently being presented.
_Avoid_: active folder, current directory.

**Folder Index**:
The rendered result shown to the user = the resolved **Index Base**'s layout, scoped to the **Target Folder** by setting the base's `this.file` context to a file in that folder (so the base's `this.file.folder` views resolve there). Recursion (direct children vs. recursive) is governed by the base's view design, not the plugin (see [[ADR-0002]]). `.base` files are excluded from the results by default.
_Avoid_: folder view, index page.

## Example dialogue

> **Dev:** User clicks `/Notes/Trips`. There's no override for it. What renders?
> **Domain:** The Default Index Base, scoped recursively to `/Notes/Trips`. No file lives in that folder.
> **Dev:** And `/Projects`, which the user curates with `folder == true`?
> **Domain:** That folder is mapped to a Folder Override Base in settings — its layout and filters win, and the plugin still ANDs in the folder scope.
> **Dev:** Does the override's own `.base` file show up as a row?
> **Domain:** No — `.base` files are excluded from the Folder Index.
