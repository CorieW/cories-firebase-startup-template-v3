/**
 * Tests admin server environment helpers.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAdminExternalToolLinks", () => {
  it("returns configured sidebar tool links", async () => {
    vi.stubEnv("AUTUMN_ADMIN_URL", " https://app.useautumn.com ");
    vi.stubEnv(
      "FIREBASE_CONSOLE_URL",
      "https://console.firebase.google.com/project/demo/overview",
    );

    const { getAdminExternalToolLinks } = await import("@/lib/server/env");

    expect(getAdminExternalToolLinks()).toEqual({
      autumn: "https://app.useautumn.com",
      firebase: "https://console.firebase.google.com/project/demo/overview",
    });
  });

  it("treats blank values as unavailable", async () => {
    vi.stubEnv("AUTUMN_ADMIN_URL", "   ");
    vi.stubEnv("FIREBASE_CONSOLE_URL", "");

    const { getAdminExternalToolLinks } = await import("@/lib/server/env");

    expect(getAdminExternalToolLinks()).toEqual({
      autumn: undefined,
      firebase: undefined,
    });
  });
});
