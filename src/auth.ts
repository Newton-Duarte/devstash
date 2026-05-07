import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { CredentialsSignin } from "next-auth";

import authConfig from "@/auth.config";
import { credentialsFields, credentialsSignInSchema } from "@/lib/auth/credentials";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification-config";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

function invalidateToken(token: JWT) {
  delete token.sub;
  delete token.email;
  delete token.name;
  delete token.picture;
  delete token.sessionVersion;

  return token;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const userId = typeof user?.id === "string" ? user.id : token.sub;

      if (typeof userId !== "string") {
        return token;
      }

      const currentUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          updatedAt: true,
        },
      });

      if (!currentUser) {
        return invalidateToken(token);
      }

      const currentSessionVersion = currentUser.updatedAt.toISOString();

      if (typeof token.sessionVersion !== "string") {
        token.sub = userId;
        token.sessionVersion = currentSessionVersion;

        return token;
      }

      if (token.sessionVersion !== currentSessionVersion) {
        return invalidateToken(token);
      }

      token.sub = userId;

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
  providers: [
    GitHub,
    Credentials({
      credentials: credentialsFields,
      authorize: async (credentials, request) => {
        const parsedCredentials = credentialsSignInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const email = parsedCredentials.data.email.toLowerCase();
        const rateLimit = await checkRateLimit("credentialsSignIn", request.headers, {
          identifier: email,
        });

        if (!rateLimit.success) {
          throw new RateLimitedError();
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValidPassword = await compare(
          parsedCredentials.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        if (isEmailVerificationEnabled() && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
});
