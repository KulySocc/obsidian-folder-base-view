import { describe, it, expect } from "vitest";
import { resolveIndexBase } from "../src/resolve/indexBaseResolver";

describe("resolveIndexBase", () => {
  it("resolves to the Default Index Base when no override matches", () => {
    expect(
      resolveIndexBase("Notes/Trips", {
        defaultIndexBasePath: "Assets/index.base",
        overrides: [],
      }),
    ).toEqual({ kind: "resolved", basePath: "Assets/index.base" });
  });

  it("prefers an exact-match Folder Override Base over the default", () => {
    expect(
      resolveIndexBase("Projects", {
        defaultIndexBasePath: "Assets/index.base",
        overrides: [{ folder: "Projects", base: "Assets/curated.base" }],
      }),
    ).toEqual({ kind: "resolved", basePath: "Assets/curated.base" });
  });

  it("does not inherit a parent's override into subfolders (exact-match only)", () => {
    expect(
      resolveIndexBase("Projects/Web", {
        defaultIndexBasePath: "Assets/index.base",
        overrides: [{ folder: "Projects", base: "Assets/curated.base" }],
      }),
    ).toEqual({ kind: "resolved", basePath: "Assets/index.base" });
  });

  it("resolves the matching entry, ignoring non-matching ones", () => {
    expect(
      resolveIndexBase("Areas", {
        defaultIndexBasePath: "Assets/index.base",
        overrides: [
          { folder: "Projects", base: "Assets/p.base" },
          { folder: "Areas", base: "Assets/a.base" },
        ],
      }),
    ).toEqual({ kind: "resolved", basePath: "Assets/a.base" });
  });

  it("ignores override entries with an empty base, falling back to default", () => {
    expect(
      resolveIndexBase("Projects", {
        defaultIndexBasePath: "Assets/index.base",
        overrides: [{ folder: "Projects", base: "" }],
      }),
    ).toEqual({ kind: "resolved", basePath: "Assets/index.base" });
  });

  it("returns none when no override matches and no default is set", () => {
    expect(
      resolveIndexBase("Notes", { defaultIndexBasePath: null, overrides: [] }),
    ).toEqual({ kind: "none" });
  });
});
