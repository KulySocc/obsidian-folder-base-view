import { App, TFile, TFolder, View } from "obsidian";
import { BasesConfigFilter, BasesController, getController, getQuery } from "./basesInternals";
import { LeafManager } from "../leaf/leafManager";

export interface FolderIndexOptions {
  /** Exclude `.base` files from the Folder Index. */
  excludeBaseFiles: boolean;
}

const EXCLUDE_BASE_FILTER = 'file.ext != "base"';

// A non-existent file used purely as `this.file` so `this.file.folder` resolves
// to the Target Folder. Synthetic (not a real vault file) so it never appears as
// a row and is never hidden by a base's `file.name != this.file.name` clause.
const CONTEXT_BASENAME = "__folder-base-view-context__";
const CONTEXT_NAME = `${CONTEXT_BASENAME}.md`;

/**
 * Thin adapter that renders a Folder Index by in-memory scope injection
 * (ADR-0001, verified mechanism): open the Index Base in a pinned reused leaf,
 * then set `this.file` to a file inside the Target Folder so the base's
 * `this.file.folder` views resolve there.
 *
 * Folder scope is context-driven (via `this.file`), never injected as a global
 * folder filter — that would AND with every view and break multi-view bases.
 * The only injected filter is the folder-independent `.base` exclusion, applied
 * on a CLONED query (whose `save()` is a no-op) so nothing is written to disk.
 */
export class BasesInjectionAdapter {
  private readonly leafManager: LeafManager;

  constructor(private readonly app: App) {
    this.leafManager = new LeafManager(app);
  }

  async openFolderIndex(
    basePath: string,
    targetFolderPath: string,
    options: FolderIndexOptions,
  ): Promise<boolean> {
    const baseFile = this.app.vault.getAbstractFileByPath(basePath);
    if (!(baseFile instanceof TFile)) {
      return false;
    }

    const ensured = await this.leafManager.ensureLeaf(baseFile);
    if (!ensured) {
      return false;
    }
    const { leaf, opened } = ensured;
    this.app.workspace.revealLeaf(leaf);

    const controller = getController(leaf.view);
    if (!controller) {
      return false;
    }

    // Apply the (folder-independent) .base exclusion once per fresh open.
    if (opened && options.excludeBaseFiles) {
      this.injectBaseExclusion(leaf.view, controller);
    }

    const contextFile = this.contextFileFor(targetFolderPath);
    try {
      controller.updateCurrentFile(contextFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add `file.ext != "base"` to the base's global filters on a clone (disk-safe),
   * preserving the base's own global filters via AND.
   */
  private injectBaseExclusion(view: View, controller: BasesController): void {
    const query = getQuery(view);
    if (!query || typeof controller.setQuery !== "function") {
      return;
    }
    try {
      const existing = query.getSerializable().filters;
      const combined: BasesConfigFilter = existing
        ? { and: [existing, EXCLUDE_BASE_FILTER] }
        : { and: [EXCLUDE_BASE_FILTER] };
      const clone = query.clone();
      clone.setGlobalFilters(combined);
      controller.setQuery(clone);
    } catch {
      // Leave the base unfiltered rather than risk a broken view.
    }
  }

  /**
   * Build a synthetic `this.file` whose parent is the Target Folder, so the
   * base's `this.file.folder` views resolve there. Synthetic so it is never a
   * result row and is never excluded by a `file.name != this.file.name` clause.
   * Works for folders with only subfolders and for empty folders (empty view).
   * Returns null if the path is not a folder.
   */
  private contextFileFor(folderPath: string): TFile | null {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) {
      return null;
    }
    try {
      const isRoot = folder.path === "" || folder.path === "/";
      const file = Object.create(TFile.prototype) as TFile;
      Object.assign(file, {
        path: isRoot ? CONTEXT_NAME : `${folder.path}/${CONTEXT_NAME}`,
        name: CONTEXT_NAME,
        basename: CONTEXT_BASENAME,
        extension: "md",
        parent: folder,
        vault: this.app.vault,
        stat: { ctime: 0, mtime: 0, size: 0 },
      });
      return file;
    } catch {
      return null;
    }
  }
}
