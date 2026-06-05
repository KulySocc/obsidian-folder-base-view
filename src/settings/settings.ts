import { TriggerMode } from "../interaction/interactionPolicy";
import { FolderOverride } from "../resolve/indexBaseResolver";

/**
 * Plugin settings.
 *
 * Recursion is intentionally NOT a setting: scope is context-driven via the
 * base's `this.file` views, and a universal recursive filter cannot be injected
 * safely without corrupting multi-view bases — so recursion is governed by the
 * Index Base itself (see ADR-0002). The Folder Override mapping arrives in
 * issue 04.
 */
export interface FolderBaseViewSettings {
  /** Path to the Default Index Base, or null if unset. */
  defaultIndexBasePath: string | null;
  /** Which click opens the Folder Index. */
  trigger: TriggerMode;
  /** Also expand the folder in the tree when opening the Folder Index. */
  alsoExpandOnOpen: boolean;
  /** Exclude `.base` files from the Folder Index (folder-independent filter). */
  excludeBaseFiles: boolean;
  /** Exact-match Folder Override Bases (folder path → base path). */
  overrides: FolderOverride[];
}

export const DEFAULT_SETTINGS: FolderBaseViewSettings = {
  defaultIndexBasePath: null,
  trigger: "single",
  alsoExpandOnOpen: false,
  excludeBaseFiles: true,
  overrides: [],
};
