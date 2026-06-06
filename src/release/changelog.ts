/**
 * Canonical, pure Changelog parser (no Obsidian imports — unit-testable).
 *
 * `CHANGELOG.md` (Keep a Changelog format) is the single source of release
 * notes for three consumers: this in-app modal path, the GitHub release body,
 * and the release-time gate (see [[ADR-0003]]). The node-side scripts use a JS
 * mirror at `scripts/changelog-lib.mjs`; `tests/changelogParity.test.mjs` guards
 * the two against drift.
 */

export interface ChangelogEntry {
  version: string;
  /** Everything under the `## [version]` heading, trimmed. */
  body: string;
}

/** Split a CHANGELOG.md string into entries, in document order (newest first). */
export function parseEntries(changelog: string): ChangelogEntry[] {
  const parts = changelog.split(/^## (?=\[)/m).slice(1);
  const entries: ChangelogEntry[] = [];
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
export function sectionBody(changelog: string, version: string): string | null {
  const entry = parseEntries(changelog).find((e) => e.version === version);
  return entry && entry.body.length > 0 ? entry.body : null;
}

/** Compare dotted numeric versions: >0 if a>b, 0 if equal, <0 if a<b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => Number(n) || 0);
  const pb = b.split(".").map((n) => Number(n) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function isNewer(a: string, b: string): boolean {
  return compareVersions(a, b) > 0;
}

const HEADING_MAP: Record<string, string> = {
  Added: "### ✨ New",
  Changed: "### 💎 Improvements",
  Fixed: "### 🐞 Fixes",
};

/** Map Keep a Changelog headings to the curated in-app display labels. */
export function prettifyHeadings(markdown: string): string {
  return markdown.replace(
    /^### (Added|Changed|Fixed)\b.*$/gm,
    (match, key: string) => HEADING_MAP[key] ?? match,
  );
}

export interface ReleaseNotesView {
  title: string;
  /** Rendered Markdown, or null when there is nothing to show. */
  markdown: string | null;
}

const MAX_VERSIONS = 10;

/**
 * Cumulative notes for every released version newer than `since` and no newer
 * than `current`, joined newest-first. Caps at {@link MAX_VERSIONS} so a long
 * skip does not produce a wall of text.
 */
export function notesSince(
  changelog: string,
  since: string,
  current: string,
): ReleaseNotesView {
  const sections = parseEntries(changelog)
    .filter((e) => isNewer(e.version, since) && !isNewer(e.version, current))
    .slice(0, MAX_VERSIONS)
    .map((e) => `# ${e.version}\n\n${prettifyHeadings(e.body)}`);
  return {
    title: `What's new in Folder Base View ${current}`,
    markdown: sections.length > 0 ? sections.join("\n\n---\n\n") : null,
  };
}

/** Notes for a single version (manual command); null if that version is absent. */
export function notesFor(changelog: string, version: string): ReleaseNotesView {
  const body = sectionBody(changelog, version);
  return {
    title: `Folder Base View ${version}`,
    markdown: body === null ? null : prettifyHeadings(body),
  };
}
