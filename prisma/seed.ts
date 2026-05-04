import "dotenv/config";

import { hash } from "bcryptjs";
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

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
] as const;

type SystemItemTypeName = (typeof systemItemTypes)[number]["name"];

type SeedItem = {
  title: string;
  typeName: SystemItemTypeName;
  contentType: "text" | "link";
  content?: string;
  url?: string;
  description: string;
  language?: string;
  tags: string[];
};

type SeedCollection = {
  name: string;
  description: string;
  items: SeedItem[];
};

const seedCollections: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        title: "useDebounce Hook",
        typeName: "snippet",
        contentType: "text",
        description: "Delay value updates until input settles.",
        language: "ts",
        tags: ["react", "hooks", "typescript"],
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}`,
      },
      {
        title: "useLocalStorage Hook",
        typeName: "snippet",
        contentType: "text",
        description: "Persist React state in local storage.",
        language: "ts",
        tags: ["react", "hooks", "state"],
        content: `import { useEffect, useState } from "react";

export function useLocalStorage(key: string, initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue) {
      setValue(storedValue);
    }
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
      {
        title: "Compound Component Pattern",
        typeName: "snippet",
        contentType: "text",
        description: "Expose related UI parts under one API.",
        language: "tsx",
        tags: ["react", "patterns", "components"],
        content: `type CardProps = {
  children: React.ReactNode;
};

function CardRoot({ children }: CardProps) {
  return <section className="rounded-xl border p-4">{children}</section>;
}

function CardTitle({ children }: CardProps) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function CardBody({ children }: CardProps) {
  return <div className="mt-2 text-sm text-muted-foreground">{children}</div>;
}

export const Card = Object.assign(CardRoot, {
  Title: CardTitle,
  Body: CardBody,
});`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code Review Prompt",
        typeName: "prompt",
        contentType: "text",
        description: "Prompt for finding risks, regressions, and missing tests.",
        tags: ["ai", "review", "quality"],
        content: `Review this diff like a senior engineer. Focus first on bugs, regressions, missing validation, and test gaps. Then summarize the highest-risk issues with file references and concise fixes.`,
      },
      {
        title: "Documentation Generator Prompt",
        typeName: "prompt",
        contentType: "text",
        description: "Prompt for turning code into concise docs.",
        tags: ["ai", "docs", "workflow"],
        content: `Generate developer-facing documentation for this module. Explain purpose, main entry points, important data flow, failure modes, and one realistic usage example without repeating the code verbatim.`,
      },
      {
        title: "Refactoring Assistant Prompt",
        typeName: "prompt",
        contentType: "text",
        description: "Prompt for extracting smaller units safely.",
        tags: ["ai", "refactor", "maintenance"],
        content: `Refactor this code in the smallest safe steps. Preserve behavior, avoid unrelated cleanup, and explain each extraction in terms of readability, testability, and ownership boundaries.`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Dockerized Next.js Service",
        typeName: "snippet",
        contentType: "text",
        description: "Minimal production-oriented container definition.",
        language: "dockerfile",
        tags: ["docker", "deployment", "nextjs"],
        content: `FROM node:22-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]`,
      },
      {
        title: "Deploy Latest Commit",
        typeName: "command",
        contentType: "text",
        description: "Push main and trigger the deployment pipeline.",
        tags: ["deployment", "git", "automation"],
        content: `git checkout main && git pull --ff-only && git push origin main`,
      },
      {
        title: "GitHub Actions Docs",
        typeName: "link",
        contentType: "link",
        description: "Official docs for workflow syntax and actions.",
        tags: ["cicd", "github", "docs"],
        url: "https://docs.github.com/en/actions",
      },
      {
        title: "Docker Build Cache Guide",
        typeName: "link",
        contentType: "link",
        description: "Docker docs for speeding up image builds.",
        tags: ["docker", "performance", "docs"],
        url: "https://docs.docker.com/build/cache/",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Git Sync Branch",
        typeName: "command",
        contentType: "text",
        description: "Fetch and rebase on the latest main branch.",
        tags: ["git", "workflow", "shell"],
        content: `git fetch origin && git rebase origin/main`,
      },
      {
        title: "Docker Cleanup",
        typeName: "command",
        contentType: "text",
        description: "Remove unused Docker data safely.",
        tags: ["docker", "cleanup", "shell"],
        content: `docker system prune --volumes`,
      },
      {
        title: "Kill Process On Port 3000",
        typeName: "command",
        contentType: "text",
        description: "Find and stop the process using port 3000.",
        tags: ["process", "debugging", "shell"],
        content: `lsof -ti :3000 | xargs kill -9`,
      },
      {
        title: "Update Dependencies With pnpm",
        typeName: "command",
        contentType: "text",
        description: "Refresh dependency ranges and install updates.",
        tags: ["pnpm", "dependencies", "shell"],
        content: `pnpm update --latest`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS Docs",
        typeName: "link",
        contentType: "link",
        description: "Official utility and framework reference.",
        tags: ["tailwind", "css", "reference"],
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui",
        typeName: "link",
        contentType: "link",
        description: "Composable components and usage patterns.",
        tags: ["components", "ui", "reference"],
        url: "https://ui.shadcn.com/",
      },
      {
        title: "Material Design 3",
        typeName: "link",
        contentType: "link",
        description: "Design system guidance for layout and interaction.",
        tags: ["design-system", "ux", "reference"],
        url: "https://m3.material.io/",
      },
      {
        title: "Lucide Icons",
        typeName: "link",
        contentType: "link",
        description: "Icon library used by the seeded item types.",
        tags: ["icons", "design", "reference"],
        url: "https://lucide.dev/icons/",
      },
    ],
  },
];

function getRequiredId(map: Map<string, string>, key: string, label: string) {
  const id = map.get(key);

  if (!id) {
    throw new Error(`Missing ${label}: ${key}`);
  }

  return id;
}

async function main() {
  const passwordHash = await hash("12345678", 12);

  const user = await prisma.user.create({
    data: {
      email: "demo@devstash.io",
      name: "Demo User",
      passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  await prisma.itemType.createMany({
    data: systemItemTypes.map((itemType) => ({
      ...itemType,
      isSystem: true,
    })),
  });

  const itemTypeIds = new Map(
    (
      await prisma.itemType.findMany({
        where: {
          isSystem: true,
          name: {
            in: systemItemTypes.map((itemType) => itemType.name),
          },
        },
        select: {
          id: true,
          name: true,
        },
      })
    ).map((itemType) => [itemType.name, itemType.id]),
  );

  const collectionIds = new Map<string, string>();

  for (const collection of seedCollections) {
    const createdCollection = await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    collectionIds.set(createdCollection.name, createdCollection.id);
  }

  const tagNames = [...new Set(seedCollections.flatMap((collection) => collection.items.flatMap((item) => item.tags)))];

  await prisma.tag.createMany({
    data: tagNames.map((name) => ({
      name,
      userId: user.id,
    })),
  });

  const tagIds = new Map(
    (
      await prisma.tag.findMany({
        where: {
          userId: user.id,
          name: {
            in: tagNames,
          },
        },
        select: {
          id: true,
          name: true,
        },
      })
    ).map((tag) => [tag.name, tag.id]),
  );

  let itemCount = 0;

  for (const collection of seedCollections) {
    const collectionId = getRequiredId(collectionIds, collection.name, "collection");

    for (const item of collection.items) {
      const createdItem = await prisma.item.create({
        data: {
          title: item.title,
          contentType: item.contentType,
          content: item.content,
          url: item.url,
          description: item.description,
          language: item.language,
          userId: user.id,
          typeId: getRequiredId(itemTypeIds, item.typeName, "item type"),
          collectionId,
        },
        select: {
          id: true,
        },
      });

      if (item.tags.length > 0) {
        await prisma.itemTag.createMany({
          data: item.tags.map((tag) => ({
            itemId: createdItem.id,
            tagId: getRequiredId(tagIds, tag, "tag"),
          })),
        });
      }

      itemCount += 1;
    }
  }

  console.log("Seed completed successfully.");
  console.log(`- user: ${user.email}`);
  console.log(`- item types: ${systemItemTypes.length}`);
  console.log(`- collections: ${seedCollections.length}`);
  console.log(`- items: ${itemCount}`);
  console.log(`- tags: ${tagNames.length}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
