// JS mirror of the parsing primitives in `src/release/changelog.ts`, for the
// Node-side release scripts (check + extract). Kept deliberately minimal — only
// what the scripts need. `tests/changelogParity.test.mjs` asserts this stays in
// lockstep with the TS canonical (see ADR-0003).

/** Split a CHANGELOG.md string into { version, body } entries, in document order. */
export function parseEntries(changelog) {
  const parts = changelog.split(/^## (?=\[)/m).slice(1);
  const entries = [];
  for (const part of parts) {
    const match = part.match(/^\[([^\]]+)\]/);
    if (!match) continue;
    const version = match[1].trim();
    if (version.toLowerCase() === "unreleased") continue;
    const newline = part.indexOf("\n");
    const body = newline === -1 ? "" : part.slice(newline + 1).trim();
    entries.push({ version, body });
  }
  return entries;
}

/** The body for one version, or null if the section is absent or empty. */
export function sectionBody(changelog, version) {
  const entry = parseEntries(changelog).find((e) => e.version === version);
  return entry && entry.body.length > 0 ? entry.body : null;
}

/** Compare dotted numeric versions: >0 if a>b, 0 if equal, <0 if a<b. */
export function compareVersions(a, b) {
  const pa = a.split(".").map((n) => Number(n) || 0);
  const pb = b.split(".").map((n) => Number(n) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function isNewer(a, b) {
  return compareVersions(a, b) > 0;
}
