import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

import { credentialsFields } from "@/lib/auth/credentials";

export default {
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: credentialsFields,
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
