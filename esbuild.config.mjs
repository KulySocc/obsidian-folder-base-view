import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { resolveVaultPluginDir } from "./scripts/resolve-vault-dir.mjs";

const banner = `/*
This file is bundled by esbuild. Edit the source in src/ instead.
*/`;

const production = process.argv[2] === "production";

// Production builds emit main.js into the repo root (picked up as the release
// asset). Dev builds write straight into the test vault so the Hot-Reload
// plugin (pjeby/hot-reload) reloads on every rebuild.
let outfile = "main.js";
let vaultDir = null;
if (!production) {
  vaultDir = resolveVaultPluginDir();
  mkdirSync(vaultDir, { recursive: true });
  outfile = join(vaultDir, "main.js");
}

// On each dev rebuild, mirror manifest.json into the vault and ensure a
// .hotreload marker exists so Hot-Reload watches this plugin.
const hotReloadPlugin = {
  name: "hot-reload-assets",
  setup(build) {
    build.onEnd(() => {
      copyFileSync("manifest.json", join(vaultDir, "manifest.json"));
      const marker = join(vaultDir, ".hotreload");
      if (!existsSync(marker)) writeFileSync(marker, "");
    });
  },
};

const context = await esbuild.context({
  banner: { js: banner },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es2018",
  // Bundle CHANGELOG.md into main.js as a raw string for the release-notes
  // modal (single source of release notes; see ADR-0003).
  loader: { ".md": "text" },
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  outfile,
  plugins: production ? [] : [hotReloadPlugin],
});

if (production) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
