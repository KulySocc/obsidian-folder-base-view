/**
 * Pure recommended-base generation (issue 05).
 *
 * NOTE (deviation from the issue text): the recommended base intentionally uses
 * `file.inFolder(this.file.folder)`. Scope is context-driven via `this.file`
 * (ADR-0002), so the base *must* reference `this.file.folder` to be scoped to
 * the clicked folder — and `inFolder` makes it recursive by default, which is
 * how recursion is governed (ADR-0002). No Obsidian imports — unit-testable.
 */

export const RECOMMENDED_BASE_FILENAME = "Folder Index.base";

/** YAML for a fresh recommended Index Base: Cards + Table, ordered by name. */
export function recommendedBaseContent(): string {
  return [
    "views:",
    "  - type: cards",
    "    name: Cards",
    "    filters:",
    "      and:",
    "        - file.inFolder(this.file.folder)",
    "    order:",
    "      - file.name",
    "  - type: table",
    "    name: Table",
    "    filters:",
    "      and:",
    "        - file.inFolder(this.file.folder)",
    "    order:",
    "      - file.name",
    "",
  ].join("\n");
}

/**
 * The folder a generated base should be written to, derived from Obsidian's
 * `attachmentFolderPath` setting. A relative setting (starts with ".") or
 * root/empty falls back to the vault root (returned as "").
 */
export function resolveBaseFolder(rawAttachmentSetting: string): string {
  const raw = rawAttachmentSetting.trim();
  if (raw === "" || raw === "/" || raw.startsWith(".")) {
    return "";
  }
  return raw.replace(/\/+$/, "");
}

/** Join a (possibly empty = root) folder and a filename into a vault path. */
export function plannedBasePath(folder: string, filename: string): string {
  return folder === "" ? filename : `${folder}/${filename}`;
}
