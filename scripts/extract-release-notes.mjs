// Writes `.release-notes.md` — the GitHub release body for the current version,
// taken straight from CHANGELOG.md (single source; see ADR-0003) and footed with
// a reconstructed "Full Changelog" compare link. Consumed by `postversion` via
// `gh release create --notes-file`.
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { parseEntries, sectionBody } from "./changelog-lib.mjs";

const OUTFILE = ".release-notes.md";

const version = process.env.npm_package_version;
if (!version) {
  throw new Error("npm_package_version is not set — run this via `npm version`.");
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
const body = sectionBody(changelog, version);
if (!body) {
  // Should never happen: check-changelog.mjs gates this during `version`.
  throw new Error(`CHANGELOG.md has no "## [${version}]" section.`);
}

const compareLink = buildCompareLink(changelog, version);
const notes = compareLink ? `${body}\n\n---\n\n${compareLink}` : body;
writeFileSync(OUTFILE, notes + "\n");
console.log(`Wrote ${OUTFILE} for ${version}`);

/** "**Full Changelog:** owner/repo/compare/<prev>...<version>", or "" if undeterminable. */
function buildCompareLink(changelog, version) {
  const entries = parseEntries(changelog);
  const index = entries.findIndex((e) => e.version === version);
  const previous = index >= 0 ? entries[index + 1]?.version : undefined;
  if (!previous) return "";

  const repo = githubSlug();
  if (!repo) return "";

  return `**Full Changelog:** https://github.com/${repo}/compare/${previous}...${version}`;
}

/** "owner/repo" from the origin remote, or null. Tags are unprefixed (e.g. 0.2.0). */
function githubSlug() {
  try {
    const remote = execSync("git config --get remote.origin.url", {
      encoding: "utf8",
    }).trim();
    const match = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
