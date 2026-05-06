"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { credentialsSignInSchema } from "@/lib/auth/credentials";

export interface CredentialsActionState {
  error: string | null;
}

function getRedirectTarget(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") ? value : "/dashboard";
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
