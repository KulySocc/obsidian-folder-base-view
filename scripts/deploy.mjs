// One-shot deploy of the built plugin into a vault's plugin folder.
// Backup path for vaults without the Hot-Reload plugin; `npm run dev` is the
// primary loop. Never touches data.json (user/plugin settings).
import { copyFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { resolveVaultPluginDir } from "./resolve-vault-dir.mjs";

const target = resolveVaultPluginDir();
mkdirSync(target, { recursive: true });

// Required artifacts — fail loudly if the build hasn't run.
for (const file of ["main.js", "manifest.json"]) {
  if (!existsSync(file)) {
    throw new Error(`Missing ${file}. Run "npm run build" first.`);
  }
  copyFileSync(file, join(target, file));
}

// styles.css is optional: copy if present, remove a stale one otherwise.
const styleTarget = join(target, "styles.css");
if (existsSync("styles.css")) {
  copyFileSync("styles.css", styleTarget);
} else if (existsSync(styleTarget)) {
  rmSync(styleTarget);
}

console.log(`Deployed to ${target}`);
