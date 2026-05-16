import { redirect } from "next/navigation";
import { connection } from "next/server";

import { auth } from "@/auth";
import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { getFavoritesPageData } from "@/lib/db/favorites";
import { getGlobalSearchData } from "@/lib/db/global-search";
import { getDashboardSidebarData } from "@/lib/db/sidebar";

export default async function FavoritesPage() {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const favoritesPageData = getFavoritesPageData(session.user.id);
  const dashboardSidebarData = getDashboardSidebarData(session.user.id);
  const globalSearchData = getGlobalSearchData(session.user.id);

  const [pageData, sidebarData, searchData] = await Promise.all([
    favoritesPageData,
    dashboardSidebarData,
    globalSearchData,
  ]);

  return (
    <DashboardAppShell dashboardSidebarData={sidebarData} searchData={searchData}>
      <div className="max-w-5xl">
        <section className="mb-6 border border-white/10 bg-[#08090c] px-5 py-5 font-mono">
          <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">Favorites</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                Starred workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                A compact index of the items and collections you reach for most.
              </p>
            </div>
            <div className="flex gap-2 text-xs text-slate-500">
              <span className="border border-white/10 bg-white/[0.03] px-3 py-2">
                {pageData.items.length} items
              </span>
              <span className="border border-white/10 bg-white/[0.03] px-3 py-2">
                {pageData.collections.length} collections
              </span>
            </div>
          </div>
        </section>

        <FavoritesList collectionOptions={sidebarData.collectionOptions} data={pageData} />
      </div>
    </DashboardAppShell>
  );
}
