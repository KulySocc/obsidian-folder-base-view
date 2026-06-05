import { describe, it, expect } from "vitest";
import {
  CapabilityFlags,
  capabilityNoticeMessage,
  decideCapability,
} from "../src/capability/capabilityDecision";

const ok: CapabilityFlags = {
  isDesktop: true,
  basesEnabled: true,
  internalsPresent: true,
};

describe("decideCapability", () => {
  it("arms when desktop, Bases enabled, and internals present", () => {
    expect(decideCapability(ok)).toEqual({ armed: true });
  });

  it("stays inert on mobile regardless of other flags", () => {
    expect(
      decideCapability({ isDesktop: false, basesEnabled: true, internalsPresent: true }),
    ).toEqual({ armed: false, reason: "mobile" });
  });

  it("reports bases-disabled when Bases is off (on desktop)", () => {
    expect(
      decideCapability({ isDesktop: true, basesEnabled: false, internalsPresent: true }),
    ).toEqual({ armed: false, reason: "bases-disabled" });
  });

  it("reports internals-missing when only the internals are absent", () => {
    expect(
      decideCapability({ isDesktop: true, basesEnabled: true, internalsPresent: false }),
    ).toEqual({ armed: false, reason: "internals-missing" });
  });

  it("prefers the most fundamental reason when several checks fail", () => {
    expect(
      decideCapability({ isDesktop: false, basesEnabled: false, internalsPresent: false }),
    ).toEqual({ armed: false, reason: "mobile" });
    expect(
      decideCapability({ isDesktop: true, basesEnabled: false, internalsPresent: false }),
    ).toEqual({ armed: false, reason: "bases-disabled" });
  });
});

describe("capabilityNoticeMessage", () => {
  it("returns a distinct, sentence-cased message per reason", () => {
    const mobile = capabilityNoticeMessage("mobile");
    const bases = capabilityNoticeMessage("bases-disabled");
    const internals = capabilityNoticeMessage("internals-missing");

    for (const msg of [mobile, bases, internals]) {
      expect(msg.length).toBeGreaterThan(0);
      expect(msg.endsWith(".")).toBe(true);
    }
    expect(new Set([mobile, bases, internals]).size).toBe(3);
  });
});
