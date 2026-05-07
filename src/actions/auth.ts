"use server";

import { compare, hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth, signIn, signOut } from "@/auth";
import {
  createEmailVerificationToken,
  deleteOtherEmailVerificationTokens,
  EmailDeliveryError,
  sendVerificationEmail,
} from "@/lib/auth/email-verification";
import {
  changePasswordSchema,
  credentialsSignInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/auth/credentials";
import {
  createPasswordResetRequest,
  getPasswordResetTokenStatus,
  resetPasswordWithToken,
  sendPasswordResetEmail,
} from "@/lib/auth/password-reset";
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

export interface ForgotPasswordActionState {
  error: string | null;
  message: string | null;
}

export interface ResetPasswordActionState {
  error: string | null;
}

export interface ChangePasswordActionState {
  error: string | null;
}

export interface DeleteAccountActionState {
  error: string | null;
}

function getRedirectTarget(value: FormDataEntryValue | null) {
  return isSafeRelativePath(value) ? value : "/dashboard";
}

function getOptionalCallbackUrl(value: FormDataEntryValue | null) {
  return isSafeRelativePath(value) ? value : null;
}

function isSafeRelativePath(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
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

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
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

export async function requestPasswordResetAction(
  _previousState: ForgotPasswordActionState,
  formData: FormData
) {
  const parsedValues = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsedValues.success) {
    return {
      error: parsedValues.error.issues[0]?.message ?? "Enter a valid email address.",
      message: null,
    } satisfies ForgotPasswordActionState;
  }

  const email = parsedValues.data.email.toLowerCase();
  const callbackUrl = getOptionalCallbackUrl(formData.get("callbackUrl"));
  const successMessage = "If the email is valid, it will receive a password reset email.";
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      name: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      error: null,
      message: successMessage,
    } satisfies ForgotPasswordActionState;
  }

  let resetRequest: Awaited<ReturnType<typeof createPasswordResetRequest>> = null;

  try {
    resetRequest = await createPasswordResetRequest(user.email);

    if (!resetRequest) {
      return {
        error: null,
        message: successMessage,
      } satisfies ForgotPasswordActionState;
    }

    await sendPasswordResetEmail({
      callbackUrl,
      email: user.email,
      name: user.name,
      token: resetRequest.token,
    });
  } catch (error) {
    if (resetRequest?.tokenHash) {
      await prisma.verificationToken.deleteMany({
        where: {
          token: resetRequest.tokenHash,
        },
      });
    }

    if (error instanceof EmailDeliveryError) {
      console.error("Failed to send password reset email", {
        email: user.email,
        details: error.details,
      });
    }

    return {
      error: "Unable to send reset email right now.",
      message: null,
    } satisfies ForgotPasswordActionState;
  }

  return {
    error: null,
    message: successMessage,
  } satisfies ForgotPasswordActionState;
}

export async function resetPasswordAction(
  _previousState: ResetPasswordActionState,
  formData: FormData
) {
  const parsedValues = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsedValues.success) {
    return {
      error: parsedValues.error.issues[0]?.message ?? "Enter a valid password.",
    } satisfies ResetPasswordActionState;
  }

  const tokenStatus = await getPasswordResetTokenStatus(parsedValues.data.token);

  if (tokenStatus.status === "expired") {
    return {
      error: "That reset link has expired. Request a new one to continue.",
    } satisfies ResetPasswordActionState;
  }

  if (tokenStatus.status === "invalid") {
    return {
      error: "That reset link is invalid or has already been used.",
    } satisfies ResetPasswordActionState;
  }

  const passwordHash = await hash(parsedValues.data.password, 12);
  const result = await resetPasswordWithToken(parsedValues.data.token, passwordHash);

  if (result.status === "expired") {
    return {
      error: "That reset link has expired. Request a new one to continue.",
    } satisfies ResetPasswordActionState;
  }

  if (result.status === "invalid") {
    return {
      error: "That reset link is invalid or has already been used.",
    } satisfies ResetPasswordActionState;
  }

  const params = new URLSearchParams({
    reset: "success",
  });
  const callbackUrl = getOptionalCallbackUrl(formData.get("callbackUrl"));

  if (callbackUrl) {
    params.set("callbackUrl", callbackUrl);
  }

  redirect(`/sign-in?${params.toString()}`);
}

export async function changePasswordAction(
  _previousState: ChangePasswordActionState | undefined,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const parsedValues = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsedValues.success) {
    return {
      error: parsedValues.error.issues[0]?.message ?? "Enter a valid password.",
    } satisfies ChangePasswordActionState;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      error: "Password changes are only available for email/password accounts.",
    } satisfies ChangePasswordActionState;
  }

  const isValidPassword = await compare(parsedValues.data.currentPassword, user.passwordHash);

  if (!isValidPassword) {
    return {
      error: "Your current password is incorrect.",
    } satisfies ChangePasswordActionState;
  }

  const passwordHash = await hash(parsedValues.data.password, 12);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  await signOut({
    redirectTo: "/sign-in?reset=success",
  });
}

export async function deleteAccountAction(
  _previousState: DeleteAccountActionState | undefined,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/sign-in");
  }

  const confirmation = formData.get("confirmation");

  if (confirmation !== "DELETE") {
    return {
      error: 'Type "DELETE" to confirm account deletion.',
    } satisfies DeleteAccountActionState;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: {
        identifier: user.email,
      },
    }),
    prisma.user.delete({
      where: {
        id: user.id,
      },
    }),
  ]);

  await signOut({
    redirectTo: "/sign-in",
  });
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
