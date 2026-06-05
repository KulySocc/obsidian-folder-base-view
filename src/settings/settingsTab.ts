import { App, Notice, PluginSettingTab, Setting, TFile, TFolder } from "obsidian";
import type FolderIndexPlugin from "../main";
import { TriggerMode } from "../interaction/interactionPolicy";
import {
  createRecommendedBase,
  plannedRecommendedBasePath,
} from "../recommend/recommendedBaseInstaller";

/**
 * Settings UI (issues 02–04). The recommended-base button (issue 05) extends
 * this tab later.
 */
export class FolderIndexSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: FolderIndexPlugin) {
    super(app, plugin);
  }

  private baseFiles(): TFile[] {
    return this.app.vault.getFiles().filter((f) => f.extension === "base");
  }

  private folders(): string[] {
    return this.app.vault
      .getAllLoadedFiles()
      .filter((f): f is TFolder => f instanceof TFolder)
      .map((f) => f.path)
      .filter((p) => p !== "/")
      .sort();
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const bases = this.baseFiles();

    new Setting(containerEl)
      .setName("Default Index Base")
      .setDesc(
        "The .base used as the table of contents for any folder without an override. " +
          (bases.length === 0 ? "No .base files found in this vault yet." : ""),
      )
      .addDropdown((dropdown) => {
        dropdown.addOption("", "— none —");
        for (const file of bases) {
          dropdown.addOption(file.path, file.path);
        }
        dropdown.setValue(this.plugin.settings.defaultIndexBasePath ?? "");
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultIndexBasePath = value === "" ? null : value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Create recommended Index Base")
      .setDesc(
        `Generates a Cards + Table base and sets it as the Default Index Base. ` +
          `Will be created at: ${plannedRecommendedBasePath(this.app)}`,
      )
      .addButton((button) => {
        button
          .setButtonText("Create")
          .setCta()
          .onClick(async () => {
            try {
              const created = await createRecommendedBase(this.app);
              this.plugin.settings.defaultIndexBasePath = created;
              await this.plugin.saveSettings();
              new Notice(`Created ${created} and set it as the Default Index Base.`);
              this.display();
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              new Notice(`Could not create the recommended base: ${message}`);
            }
          });
      });

    new Setting(containerEl)
      .setName("Open trigger")
      .setDesc("Which click on a folder name opens the Folder Index.")
      .addDropdown((dropdown) => {
        const options: Record<TriggerMode, string> = {
          single: "Single click",
          double: "Double click",
          modifier: "Cmd/Ctrl + click",
        };
        for (const [value, label] of Object.entries(options)) {
          dropdown.addOption(value, label);
        }
        dropdown.setValue(this.plugin.settings.trigger);
        dropdown.onChange(async (value) => {
          this.plugin.settings.trigger = value as TriggerMode;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Also expand folder on open")
      .setDesc("When opening the Folder Index, also expand the folder in the tree.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.alsoExpandOnOpen);
        toggle.onChange(async (value) => {
          this.plugin.settings.alsoExpandOnOpen = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Exclude .base files")
      .setDesc("Hide .base files from the Folder Index so a base never lists itself.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.excludeBaseFiles);
        toggle.onChange(async (value) => {
          this.plugin.settings.excludeBaseFiles = value;
          await this.plugin.saveSettings();
        });
      });

    this.renderOverrides(containerEl);
  }

  private renderOverrides(containerEl: HTMLElement): void {
    new Setting(containerEl).setName("Folder overrides").setHeading();
    containerEl.createEl("p", {
      text:
        "Map a specific folder to its own Index Base. Exact-match only — subfolders use the default.",
      cls: "setting-item-description",
    });

    const bases = this.baseFiles();
    const folders = this.folders();

    this.plugin.settings.overrides.forEach((override, index) => {
      const row = new Setting(containerEl);

      row.addDropdown((dropdown) => {
        dropdown.addOption("", "— folder —");
        for (const path of folders) {
          dropdown.addOption(path, path);
        }
        dropdown.setValue(override.folder);
        dropdown.onChange(async (value) => {
          override.folder = value;
          await this.plugin.saveSettings();
        });
      });

      row.addDropdown((dropdown) => {
        dropdown.addOption("", "— base —");
        for (const file of bases) {
          dropdown.addOption(file.path, file.path);
        }
        dropdown.setValue(override.base);
        dropdown.onChange(async (value) => {
          override.base = value;
          await this.plugin.saveSettings();
        });
      });

      row.addExtraButton((button) => {
        button
          .setIcon("trash")
          .setTooltip("Remove override")
          .onClick(async () => {
            this.plugin.settings.overrides.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          });
      });
    });

    new Setting(containerEl).addButton((button) => {
      button.setButtonText("Add override").onClick(async () => {
        this.plugin.settings.overrides.push({ folder: "", base: "" });
        await this.plugin.saveSettings();
        this.display();
      });
    });
  }
}
