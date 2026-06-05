/**
 * Pure interaction-policy logic (issue 02, extended in issue 03).
 *
 * Decides what a file-explorer click should do, given a description of what was
 * clicked plus the user's trigger configuration. No Obsidian imports —
 * unit-testable.
 *
 * - A click on the collapse chevron (or any non-folder-name target) is always
 *   left to Obsidian's native handling, so expand/collapse keeps working.
 * - A click on a folder *name* opens the Folder Index only when it matches the
 *   configured trigger (single / double / modifier).
 */

export type ExplorerTarget = "folder-name" | "chevron" | "other";

export type TriggerMode = "single" | "double" | "modifier";

export interface ClickContext {
  /** Which part of the file-explorer row was clicked. */
  target: ExplorerTarget;
  /** Whether this was a single or double click. */
  clickType: "single" | "double";
  /** Whether a modifier key (Cmd/Ctrl) was held. */
  modifier: boolean;
}

export interface InteractionConfig {
  trigger: TriggerMode;
  alsoExpandOnOpen: boolean;
}

export type InteractionAction =
  | { kind: "open-folder-index"; alsoExpand: boolean }
  | { kind: "native" };

const NATIVE: InteractionAction = { kind: "native" };

export function decideInteraction(
  ctx: ClickContext,
  config: InteractionConfig,
): InteractionAction {
  if (ctx.target !== "folder-name") {
    return NATIVE;
  }

  let matches = false;
  switch (config.trigger) {
    case "single":
      // Plain single click; a modifier click is left native (e.g. multiselect).
      matches = ctx.clickType === "single" && !ctx.modifier;
      break;
    case "double":
      matches = ctx.clickType === "double";
      break;
    case "modifier":
      matches = ctx.modifier;
      break;
  }

  return matches
    ? { kind: "open-folder-index", alsoExpand: config.alsoExpandOnOpen }
    : NATIVE;
}
