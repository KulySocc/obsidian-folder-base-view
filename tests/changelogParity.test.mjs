// Guards the JS mirror (scripts/changelog-lib.mjs) against drifting from the TS
// canonical (src/release/changelog.ts). Written as .mjs so tsc never has to
// resolve a .mjs import from a .ts file; vitest runs it all the same.
import { describe, it, expect } from "vitest";
import * as js from "../scripts/changelog-lib.mjs";
import * as ts from "../src/release/changelog.ts";

const SAMPLE = `# Changelog

## [0.10.0] - 2026-08-01

### Added
- Ten

## [0.2.0] - 2026-06-06

### Added
- Two
### Fixed
- Bug

## [0.1.0] - 2026-06-05

### Added
- One
`;

describe("changelog-lib.mjs ↔ changelog.ts parity", () => {
  it("parseEntries agrees", () => {
    expect(js.parseEntries(SAMPLE)).toEqual(ts.parseEntries(SAMPLE));
  });

  it("sectionBody agrees", () => {
    for (const v of ["0.10.0", "0.2.0", "0.1.0", "9.9.9"]) {
      expect(js.sectionBody(SAMPLE, v)).toEqual(ts.sectionBody(SAMPLE, v));
    }
  });

  it("isNewer agrees", () => {
    const pairs = [
      ["0.2.0", "0.1.0"],
      ["0.10.0", "0.9.0"],
      ["0.1.0", "0.1.0"],
      ["0.1.0", "0.2.0"],
    ];
    for (const [a, b] of pairs) {
      expect(js.isNewer(a, b)).toEqual(ts.isNewer(a, b));
    }
  });
});
