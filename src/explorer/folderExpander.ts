import { App } from "obsidian";

/**
 * Expand a folder in the file explorer tree (issue 03, "also expand on open").
 *
 * Uses the undocumented file-explorer internal `fileItems[path].setCollapsed`.
 * Fully guarded: if the internals are absent it silently does nothing.
 */
export function expandFolder(app: App, folderPath: string): void {
  try {
    const explorer = app.workspace.getLeavesOfType("file-explorer")[0];
    const fileItems = (explorer?.view as { fileItems?: Record<string, FileItem> } | undefined)
      ?.fileItems;
    const item = fileItems?.[folderPath];
    if (item && typeof item.setCollapsed === "function") {
      item.setCollapsed(false);
    }
  } catch {
    // No-op: native behaviour is preserved if the internals changed.
  }
}

interface FileItem {
  setCollapsed?(collapsed: boolean): void;
}
