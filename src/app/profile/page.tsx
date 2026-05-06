import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/shared/user-avatar";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-[#050507] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          href="/dashboard"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#0d0e12] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <UserAvatar
              className="ring-4 ring-white/5"
              email={session.user.email}
              image={session.user.image ?? null}
              name={session.user.name ?? null}
              size="lg"
            />

            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                {session.user.name?.trim() || session.user.email}
              </h1>
              <p className="mt-2 text-slate-400">{session.user.email}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
