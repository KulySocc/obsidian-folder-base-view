// Shared resolver for the test-vault plugin directory.
// Priority: process.env > .env file. Used by esbuild dev watch and deploy.mjs.
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const ENV_KEY = "OBSIDIAN_VAULT_PLUGIN_DIR";

export function resolveVaultPluginDir({ required = true } = {}) {
  let dir = process.env[ENV_KEY];

  if (!dir && existsSync(".env")) {
    const line = readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith(`${ENV_KEY}=`));
    if (line) {
      dir = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
    }
  }

  if (!dir) {
    if (required) {
      throw new Error(
        `${ENV_KEY} is not set. Add it to .env (see .env.example) or export it in your shell.`
      );
    }
    return null;
  }

  return resolve(dir);
}
