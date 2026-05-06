import type { NextRequest } from "next/server";

import { verifyEmailVerificationToken } from "@/lib/auth/email-verification";

function createSignInRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/sign-in", request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return Response.redirect(url);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return createSignInRedirect(request, {
      verification: "invalid",
    });
  }

  const result = await verifyEmailVerificationToken(token);

  if (result.status === "verified") {
    return createSignInRedirect(request, {
      verification: "verified",
    });
  }

  if (result.status === "expired") {
    const params: Record<string, string> = {
      verification: "expired",
    };

    if (result.email) {
      params.email = result.email;
    }

    return createSignInRedirect(request, params);
  }

  const params: Record<string, string> = {
    verification: "invalid",
  };

  if (result.email) {
    params.email = result.email;
  }

  return createSignInRedirect(request, params);
}
