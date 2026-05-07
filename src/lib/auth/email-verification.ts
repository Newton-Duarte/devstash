import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getAppOrigin } from "@/lib/auth/app-origin";
import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const DEFAULT_FROM_EMAIL = "DevStash <onboarding@resend.dev>";

export class EmailDeliveryError extends Error {
  details: string | null;

  constructor(details: string | null = null) {
    super("Unable to send verification email right now.");
    this.name = "EmailDeliveryError";
    this.details = details;
  }
}

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createVerificationTokenValue() {
  return randomBytes(32).toString("hex");
}

function getVerificationExpiryDate() {
  return new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function createEmailVerificationToken(identifier: string) {
  const token = createVerificationTokenValue();
  const expires = getVerificationExpiryDate();
  const tokenHash = hashVerificationToken(token);

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: tokenHash,
      expires,
    },
  });

  return { token, tokenHash, expires };
}

export async function deleteEmailVerificationTokens(identifier: string) {
  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
    },
  });
}

export async function deleteOtherEmailVerificationTokens(
  identifier: string,
  tokenHash: string
) {
  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
      token: {
        not: tokenHash,
      },
    },
  });
}

export async function verifyEmailVerificationToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token: hashVerificationToken(token),
    },
  });

  if (!verificationToken) {
    return {
      status: "invalid",
      email: null,
    } as const;
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        token: verificationToken.token,
      },
    });

    return {
      status: "expired",
      email: verificationToken.identifier,
    } as const;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: verificationToken.identifier,
    },
    select: {
      emailVerified: true,
    },
  });

  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: verificationToken.identifier,
      },
    });

    return {
      status: "invalid",
      email: verificationToken.identifier,
    } as const;
  }

  if (user.emailVerified) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: verificationToken.identifier,
      },
    });

    return {
      status: "verified",
      email: verificationToken.identifier,
    } as const;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        email: verificationToken.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    }),
    prisma.verificationToken.deleteMany({
      where: {
        identifier: verificationToken.identifier,
      },
    }),
  ]);

  return {
    status: "verified",
    email: verificationToken.identifier,
  } as const;
}

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string | null;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const requestOrigin = getAppOrigin();
  const verificationUrl = new URL("/verify-email", requestOrigin);

  verificationUrl.searchParams.set("token", token);

  const recipientName = name?.trim() || "there";
  const safeRecipientName = escapeHtml(recipientName);
  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;
  const subject = "Verify your DevStash email";
  const text = [
    `Hi ${recipientName},`,
    "",
    "Verify your DevStash account by clicking the link below:",
    verificationUrl.toString(),
    "",
    "This link expires in 24 hours.",
  ].join("\n");
  const html = `
    <p>Hi ${safeRecipientName},</p>
    <p>Verify your DevStash account by clicking the link below:</p>
    <p><a href="${verificationUrl.toString()}">Verify your email</a></p>
    <p>This link expires in 24 hours.</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as {
      message?: string;
      name?: string;
    } | null;
    const errorMessage = errorBody?.message ?? "Unable to send verification email.";

    throw new EmailDeliveryError(errorMessage);
  }
}
