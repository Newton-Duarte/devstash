import { redirect } from "next/navigation";
import { connection } from "next/server";

import { auth } from "@/auth";
import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { DashboardCollectionCard } from "@/components/dashboard/dashboard-collection-card";
import { getCollectionsPageData } from "@/lib/db/collections";
import { getGlobalSearchData } from "@/lib/db/global-search";
import { getDashboardSidebarData } from "@/lib/db/sidebar";

export default async function CollectionsPage() {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const collectionsPageData = getCollectionsPageData(session.user.id);
  const dashboardSidebarData = getDashboardSidebarData(session.user.id);
  const globalSearchData = getGlobalSearchData(session.user.id);

  const [pageData, sidebarData, searchData] = await Promise.all([
    collectionsPageData,
    dashboardSidebarData,
    globalSearchData,
  ]);

  return (
    <DashboardAppShell dashboardSidebarData={sidebarData} searchData={searchData}>
      <div className="max-w-6xl">
        <section className="rounded-[2rem] border border-white/10 bg-[#0d0e12] p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                Collections
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                All collections
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Browse every collection you use to organize snippets, prompts, files,
                links, and notes.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                  Total
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {pageData.stats.totalCollections}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                  Favorites
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {pageData.stats.favoriteCollections}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {pageData.collections.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pageData.collections.map((collection) => (
                <DashboardCollectionCard
                  collection={collection}
                  href={`/collections/${collection.id}`}
                  key={collection.id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#0d0e12] px-8 py-14 text-center shadow-2xl shadow-black/10">
              <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                No collections yet
              </p>
              <p className="mt-4 text-lg font-semibold text-white">
                Create your first collection.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Use the New Collection button in the top bar to start organizing items.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashboardAppShell>
  );
}
