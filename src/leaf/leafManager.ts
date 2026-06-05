import { App, TFile, WorkspaceLeaf } from "obsidian";
import { getViewFile, isBasesView } from "../bases/basesInternals";

export interface EnsuredLeaf {
  leaf: WorkspaceLeaf;
  /** True if the base file was (re)opened this call, false if reused as-is. */
  opened: boolean;
}

/**
 * Owns the single, reused, pinned Folder Index leaf.
 *
 * Pinning is load-bearing (ADR-0001): a pinned bases leaf does not auto-reset
 * its `this.file` context on focus changes, which is what lets injected scope
 * survive. The leaf is reused across folder clicks; if the user closed it, the
 * next call transparently recreates it.
 */
export class LeafManager {
  private leafId: string | null = null;

  constructor(private readonly app: App) {}

  private findExisting(): WorkspaceLeaf | null {
    if (!this.leafId) return null;
    let found: WorkspaceLeaf | null = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if ((leaf as { id?: string }).id === this.leafId) {
        found = leaf;
      }
    });
    return found;
  }

  /**
   * Get-or-create the reused leaf, showing `baseFile` as a pinned bases view.
   * Returns the leaf and whether it was freshly opened, or null if it could not
   * be shown as a bases view.
   */
  async ensureLeaf(baseFile: TFile): Promise<EnsuredLeaf | null> {
    let leaf = this.findExisting();
    if (!leaf) {
      leaf = this.app.workspace.getLeaf("tab");
      this.leafId = (leaf as { id?: string }).id ?? null;
    }

    const alreadyShowing = isBasesView(leaf.view) && getViewFile(leaf.view)?.path === baseFile.path;
    let opened = false;
    if (!alreadyShowing) {
      // Open unpinned so navigation is allowed, then pin to disable the
      // standalone view's this.file auto-reset.
      leaf.setPinned(false);
      await leaf.openFile(baseFile, { active: true });
      opened = true;
    }
    leaf.setPinned(true);

    return isBasesView(leaf.view) ? { leaf, opened } : null;
  }
}
