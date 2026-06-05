import { describe, it, expect } from "vitest";
import {
  decideInteraction,
  InteractionConfig,
} from "../src/interaction/interactionPolicy";

const single: InteractionConfig = { trigger: "single", alsoExpandOnOpen: false };
const dbl: InteractionConfig = { trigger: "double", alsoExpandOnOpen: false };
const mod: InteractionConfig = { trigger: "modifier", alsoExpandOnOpen: false };

describe("decideInteraction", () => {
  it("chevron clicks are always native, whatever the trigger", () => {
    for (const cfg of [single, dbl, mod]) {
      expect(
        decideInteraction({ target: "chevron", clickType: "single", modifier: false }, cfg),
      ).toEqual({ kind: "native" });
    }
  });

  it("non-folder targets are native", () => {
    expect(
      decideInteraction({ target: "other", clickType: "single", modifier: false }, single),
    ).toEqual({ kind: "native" });
  });

  describe("single trigger", () => {
    it("opens on a plain single click", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "single", modifier: false }, single),
      ).toEqual({ kind: "open-folder-index", alsoExpand: false });
    });
    it("is native on a modifier click (leaves multiselect alone)", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "single", modifier: true }, single),
      ).toEqual({ kind: "native" });
    });
    it("is native on a double click", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "double", modifier: false }, single),
      ).toEqual({ kind: "native" });
    });
  });

  describe("double trigger", () => {
    it("opens on a double click", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "double", modifier: false }, dbl),
      ).toEqual({ kind: "open-folder-index", alsoExpand: false });
    });
    it("is native on a single click", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "single", modifier: false }, dbl),
      ).toEqual({ kind: "native" });
    });
  });

  describe("modifier trigger", () => {
    it("opens on a modifier click", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "single", modifier: true }, mod),
      ).toEqual({ kind: "open-folder-index", alsoExpand: false });
    });
    it("is native without a modifier", () => {
      expect(
        decideInteraction({ target: "folder-name", clickType: "single", modifier: false }, mod),
      ).toEqual({ kind: "native" });
    });
  });

  it("propagates alsoExpandOnOpen into the action", () => {
    expect(
      decideInteraction(
        { target: "folder-name", clickType: "single", modifier: false },
        { trigger: "single", alsoExpandOnOpen: true },
      ),
    ).toEqual({ kind: "open-folder-index", alsoExpand: true });
  });
});
