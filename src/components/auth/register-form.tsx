"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/auth/credentials";

interface RegisterFormProps {
  callbackUrl: string | null;
}

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(name: keyof typeof initialValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedValues = registerSchema.safeParse(values);

    if (!parsedValues.success) {
      setError(parsedValues.error.issues[0]?.message ?? "Invalid registration details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedValues.data),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to create your account.");
        return;
      }

      const params = new URLSearchParams({
        registered: "1",
        email: parsedValues.data.email,
      });

      if (callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }

      startTransition(() => {
        router.push(`/sign-in?${params.toString()}`);
      });
    } catch {
      setError("Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="name">
          Name
        </label>
        <Input
          autoComplete="name"
          className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
          id="name"
          name="name"
          onChange={(event) => updateValue("name", event.target.value)}
          placeholder="Brad Traversy"
          required
          value={values.name}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
          id="email"
          name="email"
          onChange={(event) => updateValue("email", event.target.value)}
          placeholder="name@example.com"
          required
          type="email"
          value={values.email}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="new-password"
          className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) => updateValue("password", event.target.value)}
          placeholder="Create a password"
          required
          type="password"
          value={values.password}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-slate-200" htmlFor="confirmPassword">
            Confirm password
          </label>
          <Link
            className="text-xs text-slate-400 transition hover:text-white"
            href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
          >
            Already have an account?
          </Link>
        </div>
        <Input
          autoComplete="new-password"
          className="h-11 rounded-2xl border-white/10 bg-[#111216] text-slate-100 placeholder:text-slate-500"
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          onChange={(event) => updateValue("confirmPassword", event.target.value)}
          placeholder="Repeat your password"
          required
          type="password"
          value={values.confirmPassword}
        />
      </div>

      <Button
        className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 hover:bg-slate-200"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
