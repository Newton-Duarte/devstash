"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  requestPasswordResetAction,
  type ForgotPasswordActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_FORGOT_PASSWORD_ACTION_STATE: ForgotPasswordActionState = {
  error: null,
  message: null,
};

interface ForgotPasswordFormProps {
  callbackUrl: string | null;
}

function ForgotPasswordSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 hover:bg-slate-200"
      disabled={pending}
      type="submit"
    >
      {pending ? "Sending reset link..." : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm({ callbackUrl }: ForgotPasswordFormProps) {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    INITIAL_FORGOT_PASSWORD_ACTION_STATE
  );

  return (
    <form action={formAction} className="space-y-4">
      {callbackUrl ? <input name="callbackUrl" type="hidden" value={callbackUrl} /> : null}

      {state.message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state.message}
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

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

      <ForgotPasswordSubmitButton />
    </form>
  );
}
