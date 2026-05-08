import { afterEach, describe, expect, it } from "vitest";

import { isEmailVerificationEnabled } from "@/lib/auth/email-verification-config";

const originalValue = process.env.EMAIL_VERIFICATION_ENABLED;

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env.EMAIL_VERIFICATION_ENABLED;
    return;
  }

  process.env.EMAIL_VERIFICATION_ENABLED = originalValue;
});

describe("isEmailVerificationEnabled", () => {
  it("defaults to enabled when the environment variable is missing", () => {
    delete process.env.EMAIL_VERIFICATION_ENABLED;

    expect(isEmailVerificationEnabled()).toBe(true);
  });

  it("treats common false-like values as disabled", () => {
    process.env.EMAIL_VERIFICATION_ENABLED = " false ";
    expect(isEmailVerificationEnabled()).toBe(false);

    process.env.EMAIL_VERIFICATION_ENABLED = "OFF";
    expect(isEmailVerificationEnabled()).toBe(false);
  });

  it("keeps verification enabled for other configured values", () => {
    process.env.EMAIL_VERIFICATION_ENABLED = "true";
    expect(isEmailVerificationEnabled()).toBe(true);

    process.env.EMAIL_VERIFICATION_ENABLED = "yes";
    expect(isEmailVerificationEnabled()).toBe(true);
  });
});
