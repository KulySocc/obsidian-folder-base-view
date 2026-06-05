import { App, normalizePath } from "obsidian";
import {
  RECOMMENDED_BASE_FILENAME,
  plannedBasePath,
  recommendedBaseContent,
  resolveBaseFolder,
} from "./recommendedBase";

/**
 * Thin adapter (issue 05): resolve Obsidian's attachment folder and create the
 * recommended Index Base there. All constructed paths go through
 * `normalizePath`.
 */

function readAttachmentSetting(app: App): string {
  try {
    const value = (app.vault as { getConfig?: (key: string) => unknown }).getConfig?.(
      "attachmentFolderPath",
    );
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}

/** The normalized path where the recommended base would be created (pre-uniqueness). */
export function plannedRecommendedBasePath(app: App): string {
  const folder = resolveBaseFolder(readAttachmentSetting(app));
  return normalizePath(plannedBasePath(folder, RECOMMENDED_BASE_FILENAME));
}

/** Create the recommended base (with a unique name) and return its path. */
export async function createRecommendedBase(app: App): Promise<string> {
  const path = await uniquePath(app, plannedRecommendedBasePath(app));
  await app.vault.create(path, recommendedBaseContent());
  return path;
}

async function uniquePath(app: App, path: string): Promise<string> {
  if (!app.vault.getAbstractFileByPath(path)) {
    return path;
  }
  const dot = path.lastIndexOf(".");
  const stem = path.slice(0, dot);
  const ext = path.slice(dot);
  let i = 1;
  while (app.vault.getAbstractFileByPath(normalizePath(`${stem} ${i}${ext}`))) {
    i++;
  }
  return normalizePath(`${stem} ${i}${ext}`);
}
