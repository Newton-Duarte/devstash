import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ItemsListDrawerGrid } from "@/components/items/items-list-drawer-grid";
import { getItemsListPageData } from "@/lib/db/item-list";

interface ItemsListPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function ItemsListPage({ params }: ItemsListPageProps) {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { type } = await params;
  const pageData = await getItemsListPageData(session.user.id, type);

  if (!pageData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050507] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          href="/dashboard"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#0d0e12] p-8 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
                Items
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {pageData.itemType.label}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Browse your saved {pageData.itemType.label.toLowerCase()} in one place.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 lg:min-w-[180px]">
              <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                Total items
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {pageData.items.length}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {pageData.items.length > 0 ? (
            <ItemsListDrawerGrid items={pageData.items} />
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#0d0e12] px-8 py-14 text-center shadow-2xl shadow-black/10">
              <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                No items yet
              </p>
              <p className="mt-4 text-lg font-semibold text-white">
                No {pageData.itemType.label.toLowerCase()} saved yet.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Add your first item from the dashboard to see it here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
