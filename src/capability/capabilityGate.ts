import { App, Platform } from "obsidian";
import { CapabilityFlags } from "./capabilityDecision";

/**
 * Thin Obsidian adapter that snapshots the live environment into
 * {@link CapabilityFlags}. All decision logic lives in the pure
 * `capabilityDecision` module; this file only reads (partly undocumented)
 * Obsidian state.
 */

const BASES_PLUGIN_ID = "bases";
const BASE_FILE_EXTENSION = "base";

export function gatherCapabilityFlags(app: App): CapabilityFlags {
  return {
    isDesktop: Platform.isDesktop,
    basesEnabled: isBasesEnabled(app),
    internalsPresent: detectInjectionInternals(app),
  };
}

/** Whether the core Bases plugin is enabled. Uses the internal plugin registry. */
function isBasesEnabled(app: App): boolean {
  const internalPlugins = (app as unknown as InternalPluginsHost).internalPlugins;
  if (!internalPlugins) {
    return false;
  }
  if (typeof internalPlugins.getEnabledPluginById === "function") {
    return internalPlugins.getEnabledPluginById(BASES_PLUGIN_ID) != null;
  }
  return internalPlugins.plugins?.[BASES_PLUGIN_ID]?.enabled === true;
}

/**
 * Whether the internal hooks needed for in-memory scope injection are present.
 *
 * The precise internal surface used to inject a folder scope into a running
 * Bases view is wired in the core-tracer slice (issue 02, per ADR-0001). Here
 * we conservatively confirm the prerequisite: the `.base` view type is
 * registered. This check is intentionally widened in issue 02 once the exact
 * internals are known.
 */
function detectInjectionInternals(app: App): boolean {
  const viewRegistry = (app as unknown as ViewRegistryHost).viewRegistry;
  const typeByExtension = viewRegistry?.typeByExtension;
  return Boolean(typeByExtension && typeByExtension[BASE_FILE_EXTENSION]);
}

/* --- Minimal shapes for the undocumented internals we read. --- */

interface InternalPluginsHost {
  internalPlugins?: {
    getEnabledPluginById?: (id: string) => unknown;
    plugins?: Record<string, { enabled?: boolean } | undefined>;
  };
}

interface ViewRegistryHost {
  viewRegistry?: {
    typeByExtension?: Record<string, string | undefined>;
  };
}
