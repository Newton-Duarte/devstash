"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { GitBranch } from "lucide-react";

import {
  signInWithCredentialsAction,
  signInWithGitHubAction,
} from "@/actions/auth";
import type { CredentialsActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_CREDENTIALS_ACTION_STATE: CredentialsActionState = {
  error: null,
};

interface SignInFormProps {
  callbackUrl: string;
  authError: string | null;
  registeredEmail: string | null;
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

export function SignInForm({ callbackUrl, authError, registeredEmail }: SignInFormProps) {
  const [state, formAction] = useActionState(
    signInWithCredentialsAction,
    INITIAL_CREDENTIALS_ACTION_STATE
  );
  const error = state.error ?? authError;

  return (
    <>
      {registeredEmail ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Account created for {registeredEmail}. Sign in to continue.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
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
