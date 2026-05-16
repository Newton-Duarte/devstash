import { redirect } from "next/navigation";
import { connection } from "next/server";

import { auth } from "@/auth";
import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { SettingsAccountActions } from "@/components/settings/settings-account-actions";
import { getGlobalSearchData } from "@/lib/db/global-search";
import { getProfilePageData } from "@/lib/db/profile";
import { getDashboardSidebarData } from "@/lib/db/sidebar";

export default async function SettingsPage() {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const profilePageData = getProfilePageData(session.user.id);
  const dashboardSidebarData = getDashboardSidebarData(session.user.id);
  const globalSearchData = getGlobalSearchData(session.user.id);

  const [profileData, sidebarData, searchData] = await Promise.all([
    profilePageData,
    dashboardSidebarData,
    globalSearchData,
  ]);

  if (!profileData) {
    redirect("/sign-in");
  }

  return (
    <DashboardAppShell dashboardSidebarData={sidebarData} searchData={searchData}>
      <div className="max-w-5xl">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
            Settings
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
            Account actions
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Manage password access and permanent account deletion from one protected settings page.
          </p>
        </div>

        <SettingsAccountActions canChangePassword={profileData.user.hasPassword} />
      </div>
    </DashboardAppShell>
  );
}
