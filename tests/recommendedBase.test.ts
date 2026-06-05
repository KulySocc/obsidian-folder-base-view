import { describe, it, expect } from "vitest";
import {
  RECOMMENDED_BASE_FILENAME,
  plannedBasePath,
  recommendedBaseContent,
  resolveBaseFolder,
} from "../src/recommend/recommendedBase";

describe("recommendedBaseContent", () => {
  const content = recommendedBaseContent();

  it("is a views-only base with Cards and Table views", () => {
    expect(content.startsWith("views:")).toBe(true);
    expect(content).toContain("type: cards");
    expect(content).toContain("type: table");
  });

  it("scopes via this.file.folder (recursive) and orders by file.name", () => {
    expect(content).toContain("file.inFolder(this.file.folder)");
    expect(content).toContain("order:");
    expect(content).toContain("- file.name");
  });

  it("has no global filter and no hardcoded folder", () => {
    expect(content).not.toContain('file.folder == "');
    // the only filters present are the relative inFolder ones
    expect(content.match(/filters:/g)?.length).toBe(2);
  });
});

describe("resolveBaseFolder", () => {
  it("treats empty and root as the vault root", () => {
    expect(resolveBaseFolder("")).toBe("");
    expect(resolveBaseFolder("/")).toBe("");
  });

  it("falls back to vault root for relative attachment settings", () => {
    expect(resolveBaseFolder("./")).toBe("");
    expect(resolveBaseFolder("./attachments")).toBe("");
  });

  it("uses an absolute vault folder as-is, trimming trailing slashes", () => {
    expect(resolveBaseFolder("Assets")).toBe("Assets");
    expect(resolveBaseFolder("Assets/Bases/")).toBe("Assets/Bases");
  });
});

describe("plannedBasePath", () => {
  it("places the file at the vault root when folder is empty", () => {
    expect(plannedBasePath("", RECOMMENDED_BASE_FILENAME)).toBe("Folder Index.base");
  });
  it("joins folder and filename otherwise", () => {
    expect(plannedBasePath("Assets", RECOMMENDED_BASE_FILENAME)).toBe("Assets/Folder Index.base");
  });
});
