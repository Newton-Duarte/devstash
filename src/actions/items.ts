"use server";

import { auth } from "@/auth";
import { updateItem as updateItemRecord, type ItemDetail } from "@/lib/db/items";
import { updateItemSchema, type UpdateItemInput } from "@/lib/items/update-item-schema";

export interface UpdateItemActionState {
  success: boolean;
  data: ItemDetail | null;
  error: string | null;
}

export async function updateItem(
  itemId: string,
  data: UpdateItemInput
): Promise<UpdateItemActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to update items.",
    };
  }

  const parsedData = updateItemSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      data: null,
      error: parsedData.error.issues[0]?.message ?? "Check the item details and try again.",
    };
  }

  try {
    const item = await updateItemRecord(session.user.id, itemId, parsedData.data);

    if (!item) {
      return {
        success: false,
        data: null,
        error: "Item not found.",
      };
    }

    return {
      success: true,
      data: item,
      error: null,
    };
  } catch {
    return {
      success: false,
      data: null,
      error: "Unable to update item right now.",
    };
  }
}
