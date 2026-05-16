"use server";

import { auth } from "@/auth";
import {
  createItem as createItemRecord,
  deleteItem as deleteItemRecord,
  setItemFavorite as setItemFavoriteRecord,
  updateItem as updateItemRecord,
  type ItemDetail,
} from "@/lib/db/items";
import { createItemSchema, type CreateItemInput } from "@/lib/items/create-item-schema";
import { updateItemSchema, type UpdateItemInput } from "@/lib/items/update-item-schema";
import { deleteR2Object } from "@/lib/r2";

export interface CreateItemActionState {
  success: boolean;
  data: ItemDetail | null;
  error: string | null;
}

export interface UpdateItemActionState {
  success: boolean;
  data: ItemDetail | null;
  error: string | null;
}

export interface DeleteItemActionState {
  success: boolean;
  error: string | null;
}

export interface FavoriteItemActionState {
  success: boolean;
  data: ItemDetail | null;
  error: string | null;
}

export async function createItem(data: CreateItemInput): Promise<CreateItemActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to create items.",
    };
  }

  const parsedData = createItemSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      data: null,
      error: parsedData.error.issues[0]?.message ?? "Check the item details and try again.",
    };
  }

  try {
    const item = await createItemRecord(session.user.id, parsedData.data);

    if (!item) {
      return {
        success: false,
        data: null,
        error: "Item type not found.",
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
      error: "Unable to create item right now.",
    };
  }
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

export async function deleteItem(itemId: string): Promise<DeleteItemActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to delete items.",
    };
  }

  try {
    const deleted = await deleteItemRecord(session.user.id, itemId);

    if (!deleted) {
      return {
        success: false,
        error: "Item not found.",
      };
    }

    if (deleted.fileKey) {
      try {
        await deleteR2Object(deleted.fileKey);
      } catch {
        // The item is already deleted; failed object cleanup should not restore it in the UI.
      }
    }

    return {
      success: true,
      error: null,
    };
  } catch {
    return {
      success: false,
      error: "Unable to delete item right now.",
    };
  }
}

export async function setItemFavorite(
  itemId: string,
  isFavorite: boolean
): Promise<FavoriteItemActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      data: null,
      error: "You must be signed in to favorite items.",
    };
  }

  try {
    const item = await setItemFavoriteRecord(session.user.id, itemId, isFavorite);

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
      error: "Unable to update favorite right now.",
    };
  }
}
