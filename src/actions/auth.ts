"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import {
  createEmailVerificationToken,
  deleteOtherEmailVerificationTokens,
  EmailDeliveryError,
  sendVerificationEmail,
} from "@/lib/auth/email-verification";
import { credentialsSignInSchema } from "@/lib/auth/credentials";
import { prisma } from "@/lib/prisma";

export interface CredentialsActionState {
  error: string | null;
  requiresVerification?: boolean;
  verificationEmail?: string | null;
}

export interface ResendVerificationActionState {
  error: string | null;
  message: string | null;
}

function getRedirectTarget(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") ? value : "/dashboard";
}

function getOriginFromHeaders(headerStore: Pick<Headers, "get">) {
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    throw new Error("Unable to determine request origin.");
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}

export async function signInWithCredentialsAction(
  _previousState: CredentialsActionState,
  formData: FormData
) {
  const parsedCredentials = credentialsSignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    return {
      error: parsedCredentials.error.issues[0]?.message ?? "Invalid email or password.",
    } satisfies CredentialsActionState;
  }

  try {
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: getRedirectTarget(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (
        error.type === "CredentialsSignin" &&
        "code" in error &&
        error.code === "email_not_verified"
      ) {
        return {
          error: "Verify your email before signing in.",
          requiresVerification: true,
          verificationEmail: parsedCredentials.data.email.toLowerCase(),
        } satisfies CredentialsActionState;
      }

      return {
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "Unable to sign in right now.",
      } satisfies CredentialsActionState;
    }

    throw error;
  }

  return { error: null } satisfies CredentialsActionState;
}

const resendVerificationSchema = z.object({
  email: z.string().trim().email(),
});

export async function resendVerificationEmailAction(
  _previousState: ResendVerificationActionState,
  formData: FormData
) {
  const parsedValues = resendVerificationSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsedValues.success) {
    return {
      error: parsedValues.error.issues[0]?.message ?? "Enter a valid email address.",
      message: null,
    } satisfies ResendVerificationActionState;
  }

  const email = parsedValues.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      emailVerified: true,
      name: true,
    },
  });

  const successMessage = "If an unverified account exists for that email, we sent a new verification link.";

  if (!user || user.emailVerified) {
    return {
      error: null,
      message: successMessage,
    } satisfies ResendVerificationActionState;
  }

  try {
    const { token, tokenHash } = await createEmailVerificationToken(user.email);
    const origin = getOriginFromHeaders(await headers());

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
      origin,
    });

    await deleteOtherEmailVerificationTokens(user.email, tokenHash);
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      console.error("Failed to resend verification email", {
        email: user.email,
        details: error.details,
      });

      return {
        error: "Unable to send verification email right now.",
        message: null,
      } satisfies ResendVerificationActionState;
    }

    return {
      error: "Unable to resend the verification email right now.",
      message: null,
    } satisfies ResendVerificationActionState;
  }

  return {
    error: null,
    message: successMessage,
  } satisfies ResendVerificationActionState;
}

export async function signInWithGitHubAction(formData: FormData) {
  await signIn("github", {
    redirectTo: getRedirectTarget(formData.get("callbackUrl")),
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/sign-in",
  });
}
