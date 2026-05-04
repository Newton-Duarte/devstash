import "dotenv/config";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

neonConfig.webSocketConstructor = ws;

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const databaseInfo = await prisma.$queryRaw<
    { current_database: string; version: string }[]
  >`SELECT current_database()::text, version()::text`;

  const [users, itemTypes, collections, items, tags] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.collection.count(),
    prisma.item.count(),
    prisma.tag.count(),
  ]);

  console.log("Database connection successful.");
  console.log(`Database: ${databaseInfo[0]?.current_database ?? "unknown"}`);
  console.log(`Postgres: ${databaseInfo[0]?.version ?? "unknown"}`);
  console.log("Row counts:");
  console.log(`- users: ${users}`);
  console.log(`- itemTypes: ${itemTypes}`);
  console.log(`- collections: ${collections}`);
  console.log(`- items: ${items}`);
  console.log(`- tags: ${tags}`);
}

main()
  .catch((error: unknown) => {
    console.error("Database test failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
