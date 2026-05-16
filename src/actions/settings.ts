"use server";

import { auth } from "@/auth";
import {
  editorPreferencesSchema,
  normalizeEditorPreferences,
  type EditorPreferences,
} from "@/lib/editor-preferences";
import { prisma } from "@/lib/prisma";

export interface UpdateEditorPreferencesActionState {
  success: boolean;
  data: EditorPreferences | null;
  error: string | null;
}

export async function updateEditorPreferences(
  preferences: EditorPreferences
): Promise<UpdateEditorPreferencesActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to update editor preferences.",
    };
  }

  const parsedPreferences = editorPreferencesSchema.safeParse(preferences);

  if (!parsedPreferences.success) {
    return {
      success: false,
      data: null,
      error: parsedPreferences.error.issues[0]?.message ?? "Check the editor preferences and try again.",
    };
  }

  try {
    await prisma.$executeRaw`
      UPDATE "User"
      SET "editorPreferences" = ${JSON.stringify(parsedPreferences.data)}::jsonb
      WHERE "id" = ${session.user.id}
    `;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        editorPreferences: true,
      },
    });

    if (!user) {
      return {
        success: false,
        data: null,
        error: "You must be signed in to update editor preferences.",
      };
    }

    return {
      success: true,
      data: normalizeEditorPreferences(user.editorPreferences),
      error: null,
    };
  } catch {
    return {
      success: false,
      data: null,
      error: "Unable to update editor preferences right now.",
    };
  }
}
