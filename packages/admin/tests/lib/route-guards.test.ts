/**
 * Tests admin route guard path classification.
 */
import { describe, expect, it } from "vitest";
import {
  isAdminAuthRoute,
  isAdminPublicRoute,
  normalizeAdminPathname,
} from "@/lib/route-guards";

describe("admin route guards", () => {
  it("normalizes empty and trailing-slash paths predictably", () => {
    expect(normalizeAdminPathname("")).toBe("/");
    expect(normalizeAdminPathname("/users/")).toBe("/users");
  });

  it("treats sign-in and auth API paths as public", () => {
    expect(isAdminAuthRoute("/sign-in/email-verification")).toBe(true);
    expect(isAdminPublicRoute("/api/auth/session")).toBe(true);
  });

  it("keeps protected admin routes out of the public allowlist", () => {
    expect(isAdminPublicRoute("/users")).toBe(false);
    expect(isAdminPublicRoute("/audit")).toBe(false);
  });
});
