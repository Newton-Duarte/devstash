import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { createCollection } from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/collections/create-collection-schema";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = createCollectionSchema.safeParse(body);

  if (!parsedBody.success) {
    const firstIssue = parsedBody.error.issues[0];

    return Response.json(
      { error: firstIssue?.message ?? "Check the collection details and try again." },
      { status: 400 }
    );
  }

  try {
    const collection = await createCollection(session.user.id, parsedBody.data);

    return Response.json({ collection }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Unable to create collection right now." },
      { status: 500 }
    );
  }
}
