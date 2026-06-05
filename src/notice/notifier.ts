import { Notice } from "obsidian";
import { OnceGuard } from "./onceGuard";

/**
 * Thin adapter over Obsidian's `Notice`, backed by an {@link OnceGuard} so a
 * given keyed message is shown at most once per session (no notice spam).
 */
export class Notifier {
  private readonly guard = new OnceGuard();

  /** Show `message` only if `key` has not been shown yet this session. */
  notifyOnce(key: string, message: string): void {
    if (this.guard.shouldShow(key)) {
      new Notice(message);
    }
  }

  /** Allow a keyed message to be shown again later. */
  reset(key: string): void {
    this.guard.reset(key);
  }
}
