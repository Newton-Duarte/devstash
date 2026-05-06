import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getAuthErrorMessage } from "@/lib/auth/error-messages";

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    email?: string;
    error?: string;
    registered?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const registeredEmail = params.registered === "1" ? params.email ?? null : null;

  return (
    <AuthShell
      description="Use your email and password or continue with GitHub to access your dashboard."
      eyebrow="Sign In"
      footerHref="/register"
      footerLinkLabel="Create an account"
      footerText="New to DevStash?"
      title="Welcome back"
    >
      <SignInForm
        authError={getAuthErrorMessage(params.error ?? null)}
        callbackUrl={params.callbackUrl ?? "/dashboard"}
        registeredEmail={registeredEmail}
      />
    </AuthShell>
  );
}
