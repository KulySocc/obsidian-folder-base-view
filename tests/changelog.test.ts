import { describe, it, expect } from "vitest";
import {
  isNewer,
  notesFor,
  notesSince,
  parseEntries,
  prettifyHeadings,
  sectionBody,
} from "../src/release/changelog";

const SAMPLE = `# Changelog

Intro prose that is not a version section.

## [0.3.0] - 2026-07-01

### Added
- Cumulative thing

## [0.2.0] - 2026-06-06

### Added
- New thing
### Fixed
- Bug thing

## [0.1.0] - 2026-06-05

### Added
- Initial release
`;

describe("parseEntries", () => {
  it("returns released versions in document order, ignoring intro prose", () => {
    expect(parseEntries(SAMPLE).map((e) => e.version)).toEqual([
      "0.3.0",
      "0.2.0",
      "0.1.0",
    ]);
  });

  it("skips an Unreleased section", () => {
    const md = "## [Unreleased]\n\n- wip\n\n## [1.0.0]\n\n### Added\n- ship\n";
    expect(parseEntries(md).map((e) => e.version)).toEqual(["1.0.0"]);
  });
});

describe("sectionBody", () => {
  it("returns the trimmed body for a present version", () => {
    expect(sectionBody(SAMPLE, "0.1.0")).toBe("### Added\n- Initial release");
  });

  it("returns null for an absent version", () => {
    expect(sectionBody(SAMPLE, "9.9.9")).toBeNull();
  });

  it("returns null for an empty section", () => {
    expect(sectionBody("## [1.0.0]\n\n## [0.9.0]\n\n### Added\n- x", "1.0.0")).toBeNull();
  });
});

describe("isNewer", () => {
  it("compares dotted numeric versions", () => {
    expect(isNewer("0.2.0", "0.1.0")).toBe(true);
    expect(isNewer("0.10.0", "0.9.0")).toBe(true);
    expect(isNewer("0.1.0", "0.1.0")).toBe(false);
    expect(isNewer("0.1.0", "0.2.0")).toBe(false);
  });
});

describe("prettifyHeadings", () => {
  it("maps Keep a Changelog headings to curated labels", () => {
    expect(prettifyHeadings("### Added\n- x\n### Changed\n- y\n### Fixed\n- z")).toBe(
      "### ✨ New\n- x\n### 💎 Improvements\n- y\n### 🐞 Fixes\n- z",
    );
  });
});

describe("notesSince", () => {
  it("includes every version newer than `since`, up to `current`, newest first", () => {
    const view = notesSince(SAMPLE, "0.1.0", "0.3.0");
    expect(view.markdown).toContain("# 0.3.0");
    expect(view.markdown).toContain("# 0.2.0");
    expect(view.markdown).not.toContain("# 0.1.0");
    expect(view.markdown).toContain("✨ New");
  });

  it("excludes versions newer than `current`", () => {
    const view = notesSince(SAMPLE, "0.1.0", "0.2.0");
    expect(view.markdown).toContain("# 0.2.0");
    expect(view.markdown).not.toContain("# 0.3.0");
  });

  it("is null when nothing is newer than `since`", () => {
    expect(notesSince(SAMPLE, "0.3.0", "0.3.0").markdown).toBeNull();
  });
});

describe("notesFor", () => {
  it("returns the single version's prettified notes", () => {
    const view = notesFor(SAMPLE, "0.2.0");
    expect(view.markdown).toContain("✨ New");
    expect(view.markdown).toContain("🐞 Fixes");
    expect(view.markdown).not.toContain("# 0.2.0");
  });

  it("is null for an absent version", () => {
    expect(notesFor(SAMPLE, "9.9.9").markdown).toBeNull();
  });
});
