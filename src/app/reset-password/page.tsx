import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getPasswordResetTokenStatus } from "@/lib/auth/password-reset";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.trim() || null;
  const signInHref = callbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-in";
  const token = params.token?.trim() || null;
  const tokenStatus = token ? await getPasswordResetTokenStatus(token) : null;
  const tokenState = tokenStatus?.status ?? "invalid";

  return (
    <AuthShell
      description="Choose a new password to regain access to your DevStash account."
      eyebrow="Reset Password"
      footerHref={signInHref}
      footerLinkLabel="Back to sign in"
      footerText="Already reset your password?"
      title="Create a new password"
    >
      <ResetPasswordForm callbackUrl={callbackUrl} token={token} tokenState={tokenState} />
    </AuthShell>
  );
}
