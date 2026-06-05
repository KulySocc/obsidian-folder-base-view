import { describe, it, expect } from "vitest";
import { OnceGuard } from "../src/notice/onceGuard";

describe("OnceGuard", () => {
  it("shows a key the first time and suppresses it afterwards", () => {
    const guard = new OnceGuard();
    expect(guard.shouldShow("a")).toBe(true);
    expect(guard.shouldShow("a")).toBe(false);
    expect(guard.shouldShow("a")).toBe(false);
  });

  it("tracks distinct keys independently", () => {
    const guard = new OnceGuard();
    expect(guard.shouldShow("a")).toBe(true);
    expect(guard.shouldShow("b")).toBe(true);
    expect(guard.shouldShow("a")).toBe(false);
    expect(guard.shouldShow("b")).toBe(false);
  });

  it("allows a key to show again after reset", () => {
    const guard = new OnceGuard();
    expect(guard.shouldShow("a")).toBe(true);
    guard.reset("a");
    expect(guard.shouldShow("a")).toBe(true);
    expect(guard.shouldShow("a")).toBe(false);
  });
});
