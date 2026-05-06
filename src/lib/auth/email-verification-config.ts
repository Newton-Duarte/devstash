import "server-only";

const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

export function isEmailVerificationEnabled() {
  const value = process.env.EMAIL_VERIFICATION_ENABLED?.trim().toLowerCase();

  if (!value) {
    return true;
  }

  return !FALSE_VALUES.has(value);
}
