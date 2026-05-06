import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

interface RegisterPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <AuthShell
      description="Create an account to save snippets, prompts, notes, commands, files, and links in one place."
      eyebrow="Register"
      footerHref="/sign-in"
      footerLinkLabel="Sign in"
      footerText="Already have an account?"
      title="Create your account"
    >
      <RegisterForm callbackUrl={params.callbackUrl ?? null} />
    </AuthShell>
  );
}
