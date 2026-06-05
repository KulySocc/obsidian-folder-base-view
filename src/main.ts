import { Plugin } from "obsidian";
import {
  capabilityNoticeMessage,
  decideCapability,
} from "./capability/capabilityDecision";
import { gatherCapabilityFlags } from "./capability/capabilityGate";
import { Notifier } from "./notice/notifier";
import { DEFAULT_SETTINGS, FolderIndexSettings } from "./settings/settings";
import { FolderIndexSettingTab } from "./settings/settingsTab";
import { resolveIndexBase } from "./resolve/indexBaseResolver";
import { BasesInjectionAdapter } from "./bases/basesInjectionAdapter";
import { registerFileExplorerObserver } from "./explorer/fileExplorerObserver";
import { expandFolder } from "./explorer/folderExpander";

/**
 * Folder Index.
 *
 * Issue 01: scaffold + Capability-Gate (graceful inert load).
 * Issue 02: core tracer — a folder-name click opens the Default Index Base in a
 * pinned reused leaf, scoped to that folder via in-memory injection (ADR-0001).
 */
export default class FolderIndexPlugin extends Plugin {
  settings: FolderIndexSettings = { ...DEFAULT_SETTINGS };

  private armed = false;
  private readonly notifier = new Notifier();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new FolderIndexSettingTab(this.app, this));

    const decision = decideCapability(gatherCapabilityFlags(this.app));
    if (!decision.armed) {
      this.notifier.notifyOnce(
        `capability:${decision.reason}`,
        capabilityNoticeMessage(decision.reason),
      );
      return;
    }

    this.armed = true;
    const adapter = new BasesInjectionAdapter(this.app);

    this.app.workspace.onLayoutReady(() => {
      registerFileExplorerObserver(this, {
        getConfig: () => ({
          trigger: this.settings.trigger,
          alsoExpandOnOpen: this.settings.alsoExpandOnOpen,
        }),
        shouldHandle: (folderPath) =>
          resolveIndexBase(folderPath, this.settings).kind === "resolved",
        onOpen: (folderPath, alsoExpand) => {
          const resolved = resolveIndexBase(folderPath, this.settings);
          if (resolved.kind !== "resolved") {
            return;
          }
          void adapter.openFolderIndex(resolved.basePath, folderPath, {
            excludeBaseFiles: this.settings.excludeBaseFiles,
          });
          if (alsoExpand) {
            expandFolder(this.app, folderPath);
          }
        },
        onUnconfigured: () => {
          this.notifier.notifyOnce(
            "no-default",
            "Folder Index: choose a Default Index Base in settings to use folder clicks.",
          );
        },
      });
    });
  }

  onunload(): void {
    // Nothing to tear down explicitly. Do not detach leaves here (community
    // guideline); the reused Folder Index leaf is left as the user left it.
  }

  isArmed(): boolean {
    return this.armed;
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
