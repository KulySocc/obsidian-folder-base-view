// Guards that package.json, manifest.json and versions.json agree.
// Run manually with `npm run check:version`; version-bump.mjs normally keeps
// these in sync, this just catches drift from manual edits.
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const versions = JSON.parse(readFileSync("versions.json", "utf8"));

const version = pkg.version;
const errors = [];

if (!version) {
  errors.push("package.json has no version");
}
if (manifest.version !== version) {
  errors.push(
    `manifest.json version (${manifest.version}) does not match package.json (${version})`
  );
}
if (!manifest.minAppVersion) {
  errors.push("manifest.json has no minAppVersion");
}
if (versions[version] !== manifest.minAppVersion) {
  errors.push(
    `versions.json entry for ${version} must be ${manifest.minAppVersion} (got ${versions[version] ?? "missing"})`
  );
}

if (errors.length) {
  console.error("Version check failed:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}

console.log(`Version check passed for ${version}`);
