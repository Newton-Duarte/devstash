import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "@/lib/auth/error-messages";

describe("getAuthErrorMessage", () => {
  it("returns null when there is no error", () => {
    expect(getAuthErrorMessage(null)).toBeNull();
  });

  it("prefers credentials-specific error codes when provided", () => {
    expect(getAuthErrorMessage("CredentialsSignin", "email_not_verified")).toBe(
      "Verify your email before signing in."
    );
    expect(getAuthErrorMessage("CredentialsSignin", "rate_limited")).toBe(
      "Too many attempts. Please try again in 15 minutes."
    );
  });

  it("falls back to the base credentials message for unknown credentials codes", () => {
    expect(getAuthErrorMessage("CredentialsSignin", "unknown_code")).toBe(
      "Invalid email or password."
    );
  });

  it("returns a generic fallback for unmapped auth errors", () => {
    expect(getAuthErrorMessage("UnexpectedError")).toBe("Unable to sign in right now.");
  });
});
