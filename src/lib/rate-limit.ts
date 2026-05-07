import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type AuthRateLimitName =
  | "credentialsSignIn"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "resendVerification";

interface RateLimitCheckOptions {
  identifier?: string | null;
}

export interface RateLimitCheckResult {
  success: boolean;
  remaining: number | null;
  reset: number | null;
  retryAfter: number;
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ratelimits = redis
  ? {
      credentialsSignIn: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "devstash:auth:sign-in",
      }),
      register: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "devstash:auth:register",
      }),
      forgotPassword: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        prefix: "devstash:auth:forgot-password",
      }),
      resetPassword: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "devstash:auth:reset-password",
      }),
      resendVerification: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "15 m"),
        prefix: "devstash:auth:resend-verification",
      }),
    }
  : null;

function normalizeIdentifier(identifier?: string | null) {
  if (!identifier) {
    return null;
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();

  return normalizedIdentifier.length > 0 ? normalizedIdentifier : null;
}

export function getRequestIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [firstAddress] = forwardedFor.split(",");
    const address = firstAddress?.trim();

    if (address) {
      return address;
    }
  }

  const realIp = headers.get("x-real-ip") ?? headers.get("cf-connecting-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function getRateLimitErrorMessage(retryAfter: number) {
  const retryAfterMinutes = Math.max(1, Math.ceil(retryAfter / 60));
  const unit = retryAfterMinutes === 1 ? "minute" : "minutes";

  return `Too many attempts. Please try again in ${retryAfterMinutes} ${unit}.`;
}

export async function checkRateLimit(
  name: AuthRateLimitName,
  headers: Headers,
  options: RateLimitCheckOptions = {}
): Promise<RateLimitCheckResult> {
  if (!ratelimits) {
    return {
      success: true,
      remaining: null,
      reset: null,
      retryAfter: 0,
    };
  }

  const limiter = ratelimits[name];
  const ip = getRequestIp(headers);
  const identifier = normalizeIdentifier(options.identifier);
  const key = [ip, identifier].filter(Boolean).join(":");

  try {
    const result = await limiter.limit(key || ip);
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

    void result.pending.catch(() => undefined);

    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter,
    };
  } catch (error) {
    console.error("Rate limit check failed; allowing auth request to continue.", {
      error,
      name,
    });

    return {
      success: true,
      remaining: null,
      reset: null,
      retryAfter: 0,
    };
  }
}
