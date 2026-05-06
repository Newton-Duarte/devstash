import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardCollectionsData } from "@/lib/db/collections";
import { getDashboardItemsData } from "@/lib/db/items";
import { getDashboardSidebarData } from "@/lib/db/sidebar";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const dashboardCollectionsData = getDashboardCollectionsData(session.user.id);
  const dashboardItemsData = getDashboardItemsData(session.user.id);
  const dashboardSidebarData = getDashboardSidebarData(session.user.id);

  const [collectionsData, itemsData, sidebarData] = await Promise.all([
    dashboardCollectionsData,
    dashboardItemsData,
    dashboardSidebarData,
  ]);

  return (
    <DashboardShell
      dashboardCollectionsData={collectionsData}
      dashboardItemsData={itemsData}
      dashboardSidebarData={sidebarData}
    />
  );
}
