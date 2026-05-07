import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getAppOrigin } from "@/lib/auth/app-origin";
import { EmailDeliveryError } from "@/lib/auth/email-verification";
import { prisma } from "@/lib/prisma";

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;
const PASSWORD_RESET_REQUEST_COOLDOWN_MS = 1000 * 60;
const PASSWORD_RESET_IDENTIFIER_PREFIX = "password-reset:";
const DEFAULT_FROM_EMAIL = "DevStash <onboarding@resend.dev>";

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createPasswordResetTokenValue() {
  return randomBytes(32).toString("hex");
}

function getPasswordResetExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MS);
}

function createPasswordResetIdentifier(email: string) {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

function getEmailFromPasswordResetIdentifier(identifier: string) {
  if (!identifier.startsWith(PASSWORD_RESET_IDENTIFIER_PREFIX)) {
    return null;
  }

  return identifier.slice(PASSWORD_RESET_IDENTIFIER_PREFIX.length);
}

function getPasswordResetCooldownThreshold() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MS - PASSWORD_RESET_REQUEST_COOLDOWN_MS);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function createPasswordResetRequest(email: string) {
  const identifier = createPasswordResetIdentifier(email);

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${identifier}))`;

    const recentToken = await tx.verificationToken.findFirst({
      where: {
        identifier,
        expires: {
          gt: getPasswordResetCooldownThreshold(),
        },
      },
      orderBy: {
        expires: "desc",
      },
    });

    if (recentToken) {
      return null;
    }

    const token = createPasswordResetTokenValue();
    const expires = getPasswordResetExpiryDate();
    const tokenHash = hashPasswordResetToken(token);

    await tx.verificationToken.create({
      data: {
        identifier,
        token: tokenHash,
        expires,
      },
    });

    await tx.verificationToken.deleteMany({
      where: {
        identifier,
        token: {
          not: tokenHash,
        },
      },
    });

    return { token, tokenHash, expires, identifier };
  });
}

export async function getPasswordResetTokenStatus(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token: hashPasswordResetToken(token),
    },
  });

  if (!verificationToken) {
    return {
      status: "invalid",
      email: null,
    } as const;
  }

  const email = getEmailFromPasswordResetIdentifier(verificationToken.identifier);

  if (!email) {
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
      email,
    } as const;
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: verificationToken.identifier,
      },
    });

    return {
      status: "invalid",
      email,
    } as const;
  }

  return {
    status: "valid",
    email,
  } as const;
}

export async function resetPasswordWithToken(token: string, passwordHash: string) {
  const tokenHash = hashPasswordResetToken(token);

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${tokenHash}))`;

    const verificationToken = await tx.verificationToken.findUnique({
      where: {
        token: tokenHash,
      },
    });

    if (!verificationToken) {
      return {
        status: "invalid",
        email: null,
      } as const;
    }

    const email = getEmailFromPasswordResetIdentifier(verificationToken.identifier);

    if (!email) {
      return {
        status: "invalid",
        email: null,
      } as const;
    }

    if (verificationToken.expires < new Date()) {
      await tx.verificationToken.delete({
        where: {
          token: verificationToken.token,
        },
      });

      return {
        status: "expired",
        email,
      } as const;
    }

    const user = await tx.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      await tx.verificationToken.deleteMany({
        where: {
          identifier: verificationToken.identifier,
        },
      });

      return {
        status: "invalid",
        email,
      } as const;
    }

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    await tx.verificationToken.deleteMany({
      where: {
        identifier: verificationToken.identifier,
      },
    });

    return {
      status: "reset",
      email,
    } as const;
  });
}

export async function sendPasswordResetEmail({
  callbackUrl,
  email,
  name,
  token,
}: {
  callbackUrl?: string | null;
  email: string;
  name: string | null;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const requestOrigin = getAppOrigin();
  const resetUrl = new URL("/reset-password", requestOrigin);

  resetUrl.searchParams.set("token", token);

  if (callbackUrl) {
    resetUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  const recipientName = name?.trim() || "there";
  const safeRecipientName = escapeHtml(recipientName);
  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;
  const subject = "Reset your DevStash password";
  const text = [
    `Hi ${recipientName},`,
    "",
    "Reset your DevStash password by clicking the link below:",
    resetUrl.toString(),
    "",
    "This link expires in 1 hour.",
  ].join("\n");
  const html = `
    <p>Hi ${safeRecipientName},</p>
    <p>Reset your DevStash password by clicking the link below:</p>
    <p><a href="${resetUrl.toString()}">Reset your password</a></p>
    <p>This link expires in 1 hour.</p>
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
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
      name?: string;
    } | null;
    const errorMessage = errorBody?.message ?? "Unable to send password reset email.";

    throw new EmailDeliveryError(errorMessage);
  }
}
