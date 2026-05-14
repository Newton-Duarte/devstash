import { redirect } from "next/navigation";
import { connection } from "next/server";

import { auth } from "@/auth";
import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { ProfileAccountActions } from "@/components/profile/profile-account-actions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getProfilePageData } from "@/lib/db/profile";
import { getDashboardSidebarData } from "@/lib/db/sidebar";

function formatAccountCreatedDate(createdAt: Date) {
  return createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const profilePageData = getProfilePageData(session.user.id);
  const dashboardSidebarData = getDashboardSidebarData(session.user.id);

  const [profileData, sidebarData] = await Promise.all([
    profilePageData,
    dashboardSidebarData,
  ]);

  if (!profileData) {
    redirect("/sign-in");
  }

  const displayName = profileData.user.name?.trim() || profileData.user.email;
  const accountCreatedLabel = formatAccountCreatedDate(profileData.user.createdAt);

  return (
    <DashboardAppShell dashboardSidebarData={sidebarData}>
      <div className="max-w-5xl">
        <section className="rounded-[2rem] border border-white/10 bg-[#0d0e12] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <UserAvatar
                className="ring-4 ring-white/5"
                email={profileData.user.email}
                image={profileData.user.image}
                name={profileData.user.name}
                size="lg"
              />

              <div>
                <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                  Profile
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {displayName}
                </h1>
                <p className="mt-2 text-slate-400">{profileData.user.email}</p>
                <p className="mt-3 text-sm text-slate-500">Joined {accountCreatedLabel}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                  Total items
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {profileData.stats.totalItems}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                  Collections
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {profileData.stats.totalCollections}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-[#0d0e12] p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
              Usage stats
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
              Item type breakdown
            </h2>
            <p className="text-sm text-slate-400">
              A quick snapshot of the content types currently stored in your workspace.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {profileData.stats.itemTypeBreakdown.map((itemType) => (
              <article
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4"
                key={itemType.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{itemType.label}</p>
                    <p className="mt-1 text-xs text-slate-500">Saved {itemType.label.toLowerCase()}</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-1 size-3 rounded-full border border-white/10"
                    style={{ backgroundColor: itemType.color ?? "#334155" }}
                  />
                </div>

                <p className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {itemType.count}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <ProfileAccountActions canChangePassword={profileData.user.hasPassword} />
        </section>
      </div>
    </DashboardAppShell>
  );
}
