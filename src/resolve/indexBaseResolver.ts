/**
 * Pure Index-Base resolution (issue 02, extended in issue 04).
 *
 * Given a Target Folder and the relevant settings, decide which `.base` is the
 * Index Base for that folder:
 *   exact-match Folder Override Base  >  Default Index Base  >  none.
 *
 * The override mapping is **exact-match**: it applies only to the exact folder
 * path, never inherited by subfolders. No Obsidian imports — unit-testable.
 */

export interface FolderOverride {
  /** Exact folder path this override applies to. */
  folder: string;
  /** Path to the Folder Override Base for that folder. */
  base: string;
}

export interface ResolverSettings {
  /** Path to the globally-configured Default Index Base, or null if unset. */
  defaultIndexBasePath: string | null;
  /** Exact-match folder → base overrides. */
  overrides: FolderOverride[];
}

export type ResolvedIndexBase =
  | { kind: "resolved"; basePath: string }
  | { kind: "none" };

export function resolveIndexBase(
  folderPath: string,
  settings: ResolverSettings,
): ResolvedIndexBase {
  const override = settings.overrides.find((o) => o.folder === folderPath && o.base);
  if (override) {
    return { kind: "resolved", basePath: override.base };
  }
  if (settings.defaultIndexBasePath) {
    return { kind: "resolved", basePath: settings.defaultIndexBasePath };
  }
  return { kind: "none" };
}
