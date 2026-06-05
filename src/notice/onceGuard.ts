/**
 * Pure de-duplication guard so a given notice is shown at most once per
 * session. Keyed by an arbitrary string so different conditions
 * (capability degradation, missing default base, ...) each get their own slot.
 *
 * No Obsidian imports — unit-testable. The thin adapter that actually shows a
 * `Notice` lives in `notifier.ts`.
 */
export class OnceGuard {
  private readonly shown = new Set<string>();

  /**
   * Returns true the first time a key is seen, false on every subsequent call.
   * Marks the key as shown as a side effect.
   */
  shouldShow(key: string): boolean {
    if (this.shown.has(key)) {
      return false;
    }
    this.shown.add(key);
    return true;
  }

  /** Forget a key so it may be shown again (e.g. after settings change). */
  reset(key: string): void {
    this.shown.delete(key);
  }
}
