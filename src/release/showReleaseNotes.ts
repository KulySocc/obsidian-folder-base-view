import { Notice } from "obsidian";
import type FolderBaseViewPlugin from "../main";
import { notesFor, notesSince } from "./changelog";
import { ReleaseNotesModal } from "./releaseNotesModal";

/**
 * Auto path: once after an update, show the cumulative notes for every version
 * newer than the one last seen, then persist the current version. A fresh
 * install (nothing recorded) is recorded silently and never shown — release
 * notes are an *update* artifact (see [[ADR-0003]]). Runs independently of the
 * capability gate: an inert install still benefits from "what changed".
 */
export async function maybeShowReleaseNotes(
  plugin: FolderBaseViewPlugin,
  changelog: string,
): Promise<void> {
  try {
    const current = plugin.manifest.version;
    const since = plugin.settings.lastShownReleaseVersion;

    // Fresh install, or opted out: keep the marker current (so a later opt-in
    // doesn't dump a backlog) and show nothing.
    if (since === null || !plugin.settings.showReleaseNotes) {
      await persistSeen(plugin, current);
      return;
    }

    const view = notesSince(changelog, since, current);
    if (view.markdown !== null) {
      new ReleaseNotesModal(plugin.app, plugin, view.title, view.markdown).open();
    }
    await persistSeen(plugin, current);
  } catch (error) {
    console.error("Folder Base View: failed to show release notes", error);
  }
}

/** Manual command: show the current version's notes on demand; do not persist. */
export function showReleaseNotesForCurrent(
  plugin: FolderBaseViewPlugin,
  changelog: string,
): void {
  const current = plugin.manifest.version;
  const view = notesFor(changelog, current);
  if (view.markdown === null) {
    new Notice(`Folder Base View: no release notes found for ${current}.`);
    return;
  }
  new ReleaseNotesModal(plugin.app, plugin, view.title, view.markdown).open();
}

async function persistSeen(
  plugin: FolderBaseViewPlugin,
  version: string,
): Promise<void> {
  if (plugin.settings.lastShownReleaseVersion !== version) {
    plugin.settings.lastShownReleaseVersion = version;
    await plugin.saveSettings();
  }
}
