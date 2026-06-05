// Runs inside `npm version` (via the "version" script). Reads the new version
// from npm and keeps manifest.json + versions.json in sync with it.
import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;
if (!targetVersion) {
  throw new Error("npm_package_version is not set — run this via `npm version`.");
}

// Bump manifest.json to the new version.
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, 2) + "\n");

// Record version -> minAppVersion in versions.json (used by Obsidian for
// compatibility), only if this version isn't mapped yet.
const versions = JSON.parse(readFileSync("versions.json", "utf8"));
if (!versions[targetVersion]) {
  versions[targetVersion] = minAppVersion;
  writeFileSync("versions.json", JSON.stringify(versions, null, 2) + "\n");
}
