import { Plugin } from "obsidian";
import {
  ClickContext,
  ExplorerTarget,
  InteractionConfig,
  decideInteraction,
} from "../interaction/interactionPolicy";

/**
 * Thin file-explorer adapter (issue 02, extended in issue 03).
 *
 * Intercepts clicks on folder rows using delegated, capture-phase listeners
 * (registered via `registerDomEvent` for automatic cleanup) for both single and
 * double clicks. It distinguishes folder-name vs chevron via the undocumented
 * file-explorer DOM classes, delegates the decision to the pure interaction
 * policy, and only suppresses native behaviour when it will actually open a
 * Folder Index — so chevron expand/collapse and non-matching triggers stay
 * native.
 */

const FOLDER_TITLE = ".nav-folder-title";
const COLLAPSE_INDICATOR = ".nav-folder-collapse-indicator, .collapse-icon";

export interface FolderClickCallbacks {
  /** Current trigger configuration (read fresh per click). */
  getConfig(): InteractionConfig;
  /** Sync, cheap check: should this folder open a Folder Index at all? */
  shouldHandle(folderPath: string): boolean;
  /** Perform the (async) open / re-scope. */
  onOpen(folderPath: string, alsoExpand: boolean): void;
  /** The trigger matched but nothing is configured to open. Native continues. */
  onUnconfigured(folderPath: string): void;
}

export function registerFileExplorerObserver(plugin: Plugin, callbacks: FolderClickCallbacks): void {
  const handle = (evt: MouseEvent, clickType: ClickContext["clickType"]): void => {
    const target = evt.target as HTMLElement | null;
    if (!target) {
      return;
    }
    const titleEl = target.closest(FOLDER_TITLE) as HTMLElement | null;
    if (!titleEl) {
      return;
    }

    const explorerTarget: ExplorerTarget = target.closest(COLLAPSE_INDICATOR)
      ? "chevron"
      : "folder-name";
    const action = decideInteraction(
      { target: explorerTarget, clickType, modifier: evt.metaKey || evt.ctrlKey },
      callbacks.getConfig(),
    );
    if (action.kind !== "open-folder-index") {
      return;
    }

    const folderPath = titleEl.getAttribute("data-path");
    if (folderPath === null) {
      return;
    }
    if (!callbacks.shouldHandle(folderPath)) {
      // The user tried to open a Folder Index but nothing is configured: nudge
      // them once, and leave the click native (folder still expands/collapses).
      callbacks.onUnconfigured(folderPath);
      return;
    }

    evt.preventDefault();
    evt.stopPropagation();
    callbacks.onOpen(folderPath, action.alsoExpand);
  };

  plugin.registerDomEvent(document, "click", (evt) => handle(evt, "single"), { capture: true });
  plugin.registerDomEvent(document, "dblclick", (evt) => handle(evt, "double"), { capture: true });
}
