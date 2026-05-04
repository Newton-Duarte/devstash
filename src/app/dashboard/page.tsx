import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardCollectionsData } from "@/lib/db/collections";
import { getDashboardItemsData } from "@/lib/db/items";
import { getDashboardSidebarData } from "@/lib/db/sidebar";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();

  const dashboardCollectionsData = getDashboardCollectionsData();
  const dashboardItemsData = getDashboardItemsData();
  const dashboardSidebarData = getDashboardSidebarData();

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
