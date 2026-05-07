import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

interface ForgotPasswordPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const signInHref = params.callbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(params.callbackUrl)}`
    : "/sign-in";

  return (
    <AuthShell
      description="Enter your email and we'll send a reset link if the account is eligible."
      eyebrow="Forgot Password"
      footerHref={signInHref}
      footerLinkLabel="Back to sign in"
      footerText="Remember your password?"
      title="Reset your password"
    >
      <ForgotPasswordForm callbackUrl={params.callbackUrl ?? null} />
    </AuthShell>
  );
}
