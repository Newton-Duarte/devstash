import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardCollectionsData } from "@/lib/db/collections";
import { getDashboardItemsData } from "@/lib/db/items";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();

  const dashboardCollectionsData = getDashboardCollectionsData();
  const dashboardItemsData = getDashboardItemsData();

  const [collectionsData, itemsData] = await Promise.all([
    dashboardCollectionsData,
    dashboardItemsData,
  ]);

  return (
    <DashboardShell
      dashboardCollectionsData={collectionsData}
      dashboardItemsData={itemsData}
    />
  );
}
