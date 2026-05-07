"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { resetPasswordAction, type ResetPasswordActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_RESET_PASSWORD_ACTION_STATE: ResetPasswordActionState = {
  error: null,
};

interface ResetPasswordFormProps {
  callbackUrl: string | null;
  token: string | null;
  tokenState: "valid" | "invalid" | "expired";
}

function ResetPasswordSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 hover:bg-slate-200"
      disabled={pending}
      type="submit"
    >
      {pending ? "Updating password..." : "Update password"}
    </Button>
  );
}

function getTokenMessage(tokenState: ResetPasswordFormProps["tokenState"]) {
  if (tokenState === "expired") {
    return {
      tone: "error" as const,
      text: "That reset link has expired. Request a new one to continue.",
    };
  }

  if (tokenState === "invalid") {
    return {
      tone: "error" as const,
      text: "That reset link is invalid or has already been used.",
    };
  }

  return null;
}

export function ResetPasswordForm({ callbackUrl, token, tokenState }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    INITIAL_RESET_PASSWORD_ACTION_STATE
  );
  const tokenMessage = getTokenMessage(tokenState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <div className="space-y-4">
      {tokenMessage ? (
        <div
          className={
            tokenMessage.tone === "error"
              ? "rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              : "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          }
        >
          {tokenMessage.text}
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      {tokenState === "valid" && token ? (
        <form action={formAction} className="space-y-4">
          {callbackUrl ? <input name="callbackUrl" type="hidden" value={callbackUrl} /> : null}
          <input name="token" type="hidden" value={token} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="password">
              New password
            </label>
            <Input
              autoComplete="new-password"
              className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
              id="password"
              minLength={8}
              name="password"
              placeholder="Create a new password"
              required
              type="password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="confirmPassword">
              Confirm password
            </label>
            <Input
              autoComplete="new-password"
              className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              placeholder="Repeat your new password"
              required
              type="password"
            />
          </div>

          <ResetPasswordSubmitButton />
        </form>
      ) : null}

      <p className="text-sm text-slate-400">
        Need a new link?{" "}
        <Link
          className="text-white transition hover:text-slate-300"
          href={
            callbackUrl
              ? `/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/forgot-password"
          }
        >
          Request another reset email
        </Link>
      </p>
    </div>
  );
}
