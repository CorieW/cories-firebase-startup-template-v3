/**
 * Tests admin server environment helpers.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAdminExternalToolLinks", () => {
  it("returns configured sidebar tool links from ADMIN_EXTERNAL_TOOLS", async () => {
    vi.stubEnv(
      "ADMIN_EXTERNAL_TOOLS",
      JSON.stringify([
        {
          label: " Firebase ",
          href: " https://console.firebase.google.com/project/demo/overview ",
        },
        {
          label: "Autumn",
          href: "https://app.useautumn.com",
        },
        {
          label: "",
          href: "https://example.com/ignored",
        },
      ]),
    );

    const { getAdminExternalToolLinks } = await import("@/lib/server/env");

    expect(getAdminExternalToolLinks()).toEqual([
      {
        label: "Firebase",
        href: "https://console.firebase.google.com/project/demo/overview",
      },
      {
        label: "Autumn",
        href: "https://app.useautumn.com",
      },
    ]);
  });

  it("returns no tools for blank, invalid, or empty config", async () => {
    vi.stubEnv("ADMIN_EXTERNAL_TOOLS", "[]");

    let envModule = await import("@/lib/server/env");
    expect(envModule.getAdminExternalToolLinks()).toEqual([]);

    vi.stubEnv("ADMIN_EXTERNAL_TOOLS", "not-json");
    envModule = await import("@/lib/server/env");
    expect(envModule.getAdminExternalToolLinks()).toEqual([]);

    vi.stubEnv("ADMIN_EXTERNAL_TOOLS", "   ");
    envModule = await import("@/lib/server/env");
    expect(envModule.getAdminExternalToolLinks()).toEqual([]);
  });
});
