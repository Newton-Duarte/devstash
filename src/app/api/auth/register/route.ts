import { hash } from "bcryptjs";
import type { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import {
  createEmailVerificationToken,
  deleteOtherEmailVerificationTokens,
  EmailDeliveryError,
  sendVerificationEmail,
} from "@/lib/auth/email-verification";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification-config";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/auth/credentials";
import { checkRateLimit, getRateLimitErrorMessage } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit("register", request.headers);

  if (!rateLimit.success) {
    return Response.json(
      { error: getRateLimitErrorMessage(rateLimit.retryAfter) },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    const firstIssue = parsedBody.error.issues[0];

    return Response.json(
      { error: firstIssue?.message ?? "Invalid registration data." },
      { status: 400 },
    );
  }

  const email = parsedBody.data.email.toLowerCase();
  const emailVerificationEnabled = isEmailVerificationEnabled();
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return Response.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsedBody.data.password, 12);
  let createdUserEmail: string | null = null;

  try {
    const createdUser = await prisma.user.create({
      data: {
        name: parsedBody.data.name,
        email,
        emailVerified: emailVerificationEnabled ? undefined : new Date(),
        passwordHash,
      },
      select: {
        email: true,
        name: true,
      },
    });

    createdUserEmail = createdUser.email;

    if (emailVerificationEnabled) {
      const { token, tokenHash } = await createEmailVerificationToken(createdUser.email);

      await deleteOtherEmailVerificationTokens(createdUser.email, tokenHash);

      await sendVerificationEmail({
        email: createdUser.email,
        name: createdUser.name,
        token,
      });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    if (createdUserEmail) {
      await prisma.$transaction([
        prisma.user.deleteMany({
          where: {
            email: createdUserEmail,
            emailVerified: null,
          },
        }),
        prisma.verificationToken.deleteMany({
          where: {
            identifier: createdUserEmail,
          },
        }),
      ]);
    }

    const errorMessage =
      error instanceof EmailDeliveryError
        ? "Unable to send verification email right now. Please try again later."
        : "Unable to create your account right now.";

    if (error instanceof EmailDeliveryError) {
      console.error("Failed to send verification email during registration", {
        email,
        details: error.details,
      });
    }

    return Response.json({ error: errorMessage }, { status: 500 });
  }

  return Response.json(
    {
      success: true,
      requiresEmailVerification: emailVerificationEnabled,
      message: emailVerificationEnabled
        ? "Registration successful. Verify your email to continue."
        : "Registration successful. You can sign in now.",
    },
    { status: 201 },
  );
}
