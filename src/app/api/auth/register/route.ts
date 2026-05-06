import { hash } from "bcryptjs";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/auth/credentials";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    const firstIssue = parsedBody.error.issues[0];

    return Response.json(
      { error: firstIssue?.message ?? "Invalid registration data." },
      { status: 400 },
    );
  }

  const email = parsedBody.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return Response.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsedBody.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: parsedBody.data.name,
        email,
        passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    throw error;
  }

  return Response.json(
    { success: true, message: "Registration successful." },
    { status: 201 },
  );
}
