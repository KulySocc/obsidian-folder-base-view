import { TFile, View } from "obsidian";

/**
 * Thin shim over the UNDOCUMENTED internal Bases API used for in-memory scope
 * injection (see ADR-0001, "Verified mechanism"). Everything here is guarded
 * and feature-detected; if a symbol is missing the caller degrades gracefully.
 *
 * Verified against Obsidian 1.13.0 by live introspection — not present in the
 * public `obsidian.d.ts`. Re-verify against new Obsidian releases.
 */

export const BASES_VIEW_TYPE = "bases";

/** The internal query controller behind a standalone Bases view. */
export interface BasesController {
  /** Set `this.file`; rebuilds the evaluation context and re-runs the query. */
  updateCurrentFile(file: TFile | null): void;
  getCurrentFile?(): TFile | null;
  /** Switch the active named view within the base. */
  selectView?(name: string): void;
  /** Replace the controller's query (then re-renders). */
  setQuery?(query: BasesQuery): void;
}

/** The internal query object. A clone has no `saveFn`, so mutating it is disk-safe. */
export interface BasesQuery {
  clone(): BasesQuery;
  getSerializable(): { filters?: BasesConfigFilter };
  setGlobalFilters(filter: BasesConfigFilter | null): void;
}

/** Serialized Bases filter: an expression string or a boolean combinator. */
export type BasesConfigFilter =
  | string
  | { and: BasesConfigFilter[] }
  | { or: BasesConfigFilter[] }
  | { not: BasesConfigFilter[] };

interface BasesViewInternals extends View {
  controller?: BasesController;
  query?: BasesQuery;
  file?: TFile;
}

export function getViewType(view: View | null | undefined): string | null {
  try {
    return (view as { getViewType?: () => string } | null | undefined)?.getViewType?.() ?? null;
  } catch {
    return null;
  }
}

export function isBasesView(view: View | null | undefined): boolean {
  return getViewType(view) === BASES_VIEW_TYPE;
}

export function getViewFile(view: View | null | undefined): TFile | null {
  return (view as BasesViewInternals | null | undefined)?.file ?? null;
}

export function getController(view: View | null | undefined): BasesController | null {
  const controller = (view as BasesViewInternals | null | undefined)?.controller;
  if (controller && typeof controller.updateCurrentFile === "function") {
    return controller;
  }
  return null;
}

/** The view's query, only if it exposes the disk-safe clone/filter surface. */
export function getQuery(view: View | null | undefined): BasesQuery | null {
  const query = (view as BasesViewInternals | null | undefined)?.query;
  if (
    query &&
    typeof query.clone === "function" &&
    typeof query.getSerializable === "function" &&
    typeof query.setGlobalFilters === "function"
  ) {
    return query;
  }
  return null;
}
