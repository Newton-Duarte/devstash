import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardCollectionsData } from "@/lib/db/collections";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();

  const dashboardCollectionsData = await getDashboardCollectionsData();

  return <DashboardShell dashboardCollectionsData={dashboardCollectionsData} />;
}
