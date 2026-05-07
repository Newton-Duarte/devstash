"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  changePasswordAction,
  deleteAccountAction,
  type ChangePasswordActionState,
  type DeleteAccountActionState,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const INITIAL_CHANGE_PASSWORD_ACTION_STATE: ChangePasswordActionState = {
  error: null,
};

const INITIAL_DELETE_ACCOUNT_ACTION_STATE: DeleteAccountActionState = {
  error: null,
};

interface ProfileAccountActionsProps {
  canChangePassword: boolean;
}

function ActionMessage({ children, tone }: { children: string; tone: "error" | "muted" }) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        tone === "error"
          ? "border border-red-500/20 bg-red-500/10 text-red-200"
          : "border border-white/10 bg-white/[0.03] text-slate-400"
      )}
    >
      {children}
    </div>
  );
}

function ChangePasswordSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-11 rounded-2xl bg-white text-sm font-semibold text-slate-900 hover:bg-slate-200"
      disabled={pending}
      type="submit"
    >
      {pending ? "Updating password..." : "Update password"}
    </Button>
  );
}

function DeleteAccountConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-11 rounded-2xl bg-red-500 text-sm font-semibold text-white hover:bg-red-400"
      disabled={pending}
      type="submit"
    >
      {pending ? "Deleting account..." : "Delete account permanently"}
    </Button>
  );
}

export function ProfileAccountActions({ canChangePassword }: ProfileAccountActionsProps) {
  const [changePasswordState, changePasswordFormAction] = useActionState(
    changePasswordAction,
    INITIAL_CHANGE_PASSWORD_ACTION_STATE
  );
  const [deleteAccountState, deleteAccountFormAction] = useActionState(
    deleteAccountAction,
    INITIAL_DELETE_ACCOUNT_ACTION_STATE
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[2rem] border border-white/10 bg-[#0d0e12] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
            Password management
          </p>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Change password</h2>
          <p className="text-sm text-slate-400">
            Update your password for this account. You&apos;ll be signed out after saving so you can
            sign back in with the new password.
          </p>
        </div>

        <div className="mt-6">
          {canChangePassword ? (
            <form action={changePasswordFormAction} className="space-y-4">
              {changePasswordState?.error ? (
                <ActionMessage tone="error">{changePasswordState.error}</ActionMessage>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="currentPassword">
                  Current password
                </label>
                <Input
                  autoComplete="current-password"
                  className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
                  id="currentPassword"
                  minLength={8}
                  name="currentPassword"
                  placeholder="Enter your current password"
                  required
                  type="password"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              <ChangePasswordSubmitButton />
            </form>
          ) : (
            <ActionMessage tone="muted">
              Password changes are unavailable for GitHub-only accounts.
            </ActionMessage>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-red-500/20 bg-[#140b0d] p-6 shadow-2xl shadow-black/20">
        <div className="flex h-full flex-col justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-[0.24em] text-red-200/70 uppercase">
              Danger zone
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Delete account</h2>
            <p className="text-sm text-slate-300">
              Permanently remove your account and all owned DevStash data. This action cannot be
              undone.
            </p>
          </div>

          {deleteAccountState?.error ? (
            <ActionMessage tone="error">{deleteAccountState.error}</ActionMessage>
          ) : null}

          <Button
            className="h-11 rounded-2xl border-red-400/30 bg-red-500/15 text-sm font-semibold text-red-100 hover:bg-red-500/25"
            onClick={() => setIsDeleteDialogOpen(true)}
            type="button"
            variant="outline"
          >
            Delete account
          </Button>
        </div>
      </section>

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0d0e12] p-6 shadow-2xl shadow-black/40">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.24em] text-red-200/70 uppercase">
                Confirm deletion
              </p>
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">
                Delete your account permanently
              </h3>
              <p className="text-sm text-slate-400">
                Type <span className="font-semibold text-white">DELETE</span> to confirm. This
                removes your account, items, collections, tags, and sessions.
              </p>
            </div>

            <form action={deleteAccountFormAction} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="confirmation">
                  Confirmation
                </label>
                <Input
                  autoComplete="off"
                  className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
                  id="confirmation"
                  name="confirmation"
                  placeholder="Type DELETE"
                  required
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  className="h-11 rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/[0.05]"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <DeleteAccountConfirmButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
