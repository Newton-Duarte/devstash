"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { GitBranch } from "lucide-react";

import {
  resendVerificationEmailAction,
  signInWithCredentialsAction,
  signInWithGitHubAction,
} from "@/actions/auth";
import type {
  CredentialsActionState,
  ResendVerificationActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_CREDENTIALS_ACTION_STATE: CredentialsActionState = {
  error: null,
};

const INITIAL_RESEND_ACTION_STATE: ResendVerificationActionState = {
  error: null,
  message: null,
};

interface SignInFormProps {
  callbackUrl: string;
  authError: string | null;
  verificationEmail: string | null;
  verificationState: string | null;
}

function CredentialsSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 hover:bg-slate-200"
      disabled={pending}
      type="submit"
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

function GitHubSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-11 w-full rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/[0.05]"
      disabled={pending}
      type="submit"
      variant="outline"
    >
      <GitBranch className="size-4" />
      {pending ? "Connecting..." : "Sign in with GitHub"}
    </Button>
  );
}

function ResendVerificationButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-10 rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/[0.05]"
      disabled={pending}
      type="submit"
      variant="outline"
    >
      {pending ? "Sending..." : "Resend verification email"}
    </Button>
  );
}

function getVerificationMessage(
  verificationState: string | null,
  verificationEmail: string | null
) {
  if (verificationState === "sent" && verificationEmail) {
    return {
      tone: "success" as const,
      text: `Account created for ${verificationEmail}. Check your inbox and verify your email before signing in.`,
    };
  }

  if (verificationState === "verified") {
    return {
      tone: "success" as const,
      text: "Email verified. You can sign in now.",
    };
  }

  if (verificationState === "expired") {
    return {
      tone: "error" as const,
      text: "That verification link has expired. Request a new one to continue.",
    };
  }

  if (verificationState === "invalid") {
    return {
      tone: "error" as const,
      text: "That verification link is invalid or has already been used.",
    };
  }

  return null;
}

export function SignInForm({
  callbackUrl,
  authError,
  verificationEmail,
  verificationState,
}: SignInFormProps) {
  const [state, formAction] = useActionState(
    signInWithCredentialsAction,
    INITIAL_CREDENTIALS_ACTION_STATE
  );
  const [resendState, resendAction] = useActionState(
    resendVerificationEmailAction,
    INITIAL_RESEND_ACTION_STATE
  );
  const verificationMessage = getVerificationMessage(verificationState, verificationEmail);
  const error = state.error ?? authError;
  const resendEmail = state.verificationEmail ?? verificationEmail;
  const shouldShowResend =
    state.requiresVerification ||
    verificationState === "sent" ||
    verificationState === "expired" ||
    verificationState === "invalid" ||
    (authError === "Verify your email before signing in." && Boolean(verificationEmail));

  return (
    <>
      {verificationMessage ? (
        <div
          className={
            verificationMessage.tone === "success"
              ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              : "rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          }
        >
          {verificationMessage.text}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {resendState.message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {resendState.message}
        </div>
      ) : null}

      {resendState.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {resendState.error}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="email">
            Email
          </label>
          <Input
            autoComplete="email"
            className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
            defaultValue={verificationEmail ?? undefined}
            id="email"
            name="email"
            placeholder="name@example.com"
            required
            type="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-slate-200" htmlFor="password">
              Password
            </label>
            <Link
              className="text-xs text-slate-400 transition hover:text-white"
              href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              Need an account?
            </Link>
          </div>
          <Input
            autoComplete="current-password"
            className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
            id="password"
            minLength={8}
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </div>

        <CredentialsSubmitButton />
      </form>

      {shouldShowResend && resendEmail ? (
        <form action={resendAction} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <input name="email" type="hidden" value={resendEmail} />
          <p className="text-sm text-slate-300">Need another verification link?</p>
          <ResendVerificationButton />
        </form>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs tracking-[0.22em] text-slate-500 uppercase">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form action={signInWithGitHubAction}>
        <input name="callbackUrl" type="hidden" value={callbackUrl} />
        <GitHubSubmitButton />
      </form>
    </>
  );
}
