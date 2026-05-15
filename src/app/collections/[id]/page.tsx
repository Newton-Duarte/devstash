import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { auth } from "@/auth";
import { CollectionHeaderActions } from "@/components/collections/collection-header-actions";
import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { CollectionItemsGroupedGrid } from "@/components/items/collection-items-grouped-grid";
import { getCollectionDetailPageData } from "@/lib/db/collections";
import { getDashboardSidebarData } from "@/lib/db/sidebar";

interface CollectionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const collectionDetailPageData = getCollectionDetailPageData(session.user.id, id);
  const dashboardSidebarData = getDashboardSidebarData(session.user.id);

  const [pageData, sidebarData] = await Promise.all([
    collectionDetailPageData,
    dashboardSidebarData,
  ]);

  if (!pageData) {
    notFound();
  }

  return (
    <DashboardAppShell dashboardSidebarData={sidebarData}>
      <div className="max-w-6xl">
        <section
          className="rounded-[2rem] border border-white/10 bg-[#0d0e12] p-8 shadow-2xl shadow-black/20"
          style={{ boxShadow: `inset 3px 0 0 ${pageData.collection.accentColor}` }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                Collection
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {pageData.collection.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                {pageData.collection.description}
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 lg:min-w-[180px]">
                <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                  Total items
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {pageData.collection.itemCount}
                </p>
              </div>
              <CollectionHeaderActions collection={pageData.collection} />
            </div>
          </div>
        </section>

        <section className="mt-6">
          {pageData.items.length > 0 ? (
            <CollectionItemsGroupedGrid
              collectionOptions={sidebarData.collectionOptions}
              groups={pageData.itemGroups}
            />
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#0d0e12] px-8 py-14 text-center shadow-2xl shadow-black/10">
              <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                No items yet
              </p>
              <p className="mt-4 text-lg font-semibold text-white">
                This collection is empty.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Add items to this collection while creating or editing an item.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashboardAppShell>
  );
}
