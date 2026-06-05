/**
 * Pure capability-decision logic for the Capability-Gate (issue 01).
 *
 * Given a snapshot of the environment, decide whether the plugin may arm its
 * folder-click interception or must stay inert. Kept free of any Obsidian
 * imports so it is unit-testable without an Obsidian runtime. The thin adapter
 * that produces {@link CapabilityFlags} from the live `App` lives in
 * `capabilityGate.ts`.
 *
 * See ADR-0001: the plugin depends on undocumented internals, so a missing
 * capability must degrade to native navigation rather than break the explorer.
 */

export interface CapabilityFlags {
  /** Running on a desktop platform (mobile is deferred). */
  isDesktop: boolean;
  /** The core Bases plugin is enabled. */
  basesEnabled: boolean;
  /** The internal hooks required for in-memory scope injection are present. */
  internalsPresent: boolean;
}

/** Why the plugin could not arm. Drives the one-time degradation notice. */
export type DegradationReason = "mobile" | "bases-disabled" | "internals-missing";

export type CapabilityDecision =
  | { armed: true }
  | { armed: false; reason: DegradationReason };

/**
 * Decide whether to arm folder-click interception.
 *
 * Checks are ordered most-fundamental first: platform, then Bases, then the
 * injection internals. The first failing check wins, so the reported reason is
 * the most fundamental cause.
 */
export function decideCapability(flags: CapabilityFlags): CapabilityDecision {
  if (!flags.isDesktop) {
    return { armed: false, reason: "mobile" };
  }
  if (!flags.basesEnabled) {
    return { armed: false, reason: "bases-disabled" };
  }
  if (!flags.internalsPresent) {
    return { armed: false, reason: "internals-missing" };
  }
  return { armed: true };
}

/** User-facing message for a degradation reason. */
export function capabilityNoticeMessage(reason: DegradationReason): string {
  switch (reason) {
    case "mobile":
      return "Folder Index is desktop-only for now and stays inactive on mobile.";
    case "bases-disabled":
      return "Folder Index needs the core Bases plugin enabled. Folder clicks use Obsidian's default behavior until then.";
    case "internals-missing":
      return "Folder Index isn't compatible with this version of Obsidian. Folder clicks use Obsidian's default behavior.";
  }
}
