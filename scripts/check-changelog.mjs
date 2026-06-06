// Release gate: aborts `npm version` if CHANGELOG.md has no non-empty section
// for the version being released. Wired as the FIRST step of the `version`
// script, where npm_package_version is already the new version but the git tag
// does not yet exist — so a failure aborts before anything is tagged or pushed
// (see ADR-0003).
import { readFileSync } from "fs";
import { sectionBody } from "./changelog-lib.mjs";

const version = process.env.npm_package_version;
if (!version) {
  throw new Error("npm_package_version is not set — run this via `npm version`.");
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
if (!sectionBody(changelog, version)) {
  console.error(
    `Changelog check failed:\n` +
      `  - CHANGELOG.md has no non-empty "## [${version}]" section.\n` +
      `    Add the release notes for ${version} before tagging.`,
  );
  process.exit(1);
}

console.log(`Changelog check passed for ${version}`);
