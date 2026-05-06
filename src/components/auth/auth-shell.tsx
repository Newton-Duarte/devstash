import Link from "next/link";

import { cn } from "@/lib/utils";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  children: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  footerText,
  footerHref,
  footerLinkLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.14),_transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <p className="text-sm font-medium tracking-[0.28em] text-slate-400 uppercase">
                {eyebrow}
              </p>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-white">
                Your developer knowledge hub, without the tab sprawl.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Save snippets, prompts, notes, commands, and links in one calm workspace
                built for daily reuse.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  "Private by default",
                  "GitHub + credentials auth",
                  "Fast dashboard access",
                ].map((feature) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300"
                    key={feature}
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/10 bg-[#0d0e12]/90 p-6 shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur xl:p-8">
              <Link
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
                href="/"
              >
                <span className="flex size-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-sm font-semibold text-white">
                  ▤
                </span>
                DevStash
              </Link>

              <div className="mt-8">
                <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                  {eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
              </div>

              <div className={cn("mt-8 space-y-6")}>{children}</div>

              <p className="mt-8 text-sm text-slate-400">
                {footerText}{" "}
                <Link className="text-white transition hover:text-slate-300" href={footerHref}>
                  {footerLinkLabel}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
