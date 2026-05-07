import "server-only";

const CONFIGURED_ORIGIN =
  process.env.APP_BASE_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

export function getAppOrigin() {
  if (CONFIGURED_ORIGIN) {
    return new URL(CONFIGURED_ORIGIN).origin;
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`).origin;
  }

  throw new Error("APP_BASE_URL, AUTH_URL, NEXTAUTH_URL, or VERCEL_URL must be configured.");
}
