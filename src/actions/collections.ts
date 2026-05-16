"use server";

import { auth } from "@/auth";
import { updateCollectionSchema } from "@/lib/collections/update-collection-schema";
import {
  deleteCollection as deleteCollectionRecord,
  setCollectionFavorite as setCollectionFavoriteRecord,
  updateCollection as updateCollectionRecord,
  type FavoriteCollectionUpdate,
  type UpdatedCollection,
} from "@/lib/db/collections";

interface CollectionMutationState<TData = null> {
  success: boolean;
  data: TData;
  error: string | null;
}

export async function updateCollection(
  collectionId: string,
  data: unknown
): Promise<CollectionMutationState<UpdatedCollection | null>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, data: null, error: "You must be signed in to update collections." };
  }

  const parsedData = updateCollectionSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      data: null,
      error: parsedData.error.issues[0]?.message ?? "Check the collection details and try again.",
    };
  }

  try {
    const collection = await updateCollectionRecord(session.user.id, collectionId, parsedData.data);

    if (!collection) {
      return { success: false, data: null, error: "Collection not found." };
    }

    return { success: true, data: collection, error: null };
  } catch {
    return { success: false, data: null, error: "Unable to update collection right now." };
  }
}

export async function deleteCollection(
  collectionId: string
): Promise<CollectionMutationState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, data: null, error: "You must be signed in to delete collections." };
  }

  try {
    const deleted = await deleteCollectionRecord(session.user.id, collectionId);

    if (!deleted) {
      return { success: false, data: null, error: "Collection not found." };
    }

    return { success: true, data: null, error: null };
  } catch {
    return { success: false, data: null, error: "Unable to delete collection right now." };
  }
}

export async function setCollectionFavorite(
  collectionId: string,
  isFavorite: boolean
): Promise<CollectionMutationState<FavoriteCollectionUpdate | null>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, data: null, error: "You must be signed in to favorite collections." };
  }

  try {
    const collection = await setCollectionFavoriteRecord(session.user.id, collectionId, isFavorite);

    if (!collection) {
      return { success: false, data: null, error: "Collection not found." };
    }

    return { success: true, data: collection, error: null };
  } catch {
    return { success: false, data: null, error: "Unable to update favorite right now." };
  }
}
