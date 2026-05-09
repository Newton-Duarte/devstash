"use client";

import { useCallback, useRef, useState, useTransition } from "react";

import { type ItemDetail } from "@/lib/db/items";

interface ItemDetailResponse {
  item?: ItemDetail;
  error?: string;
}

export function useItemDrawer() {
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const requestIdRef = useRef(0);

  const fetchItem = useCallback(async (itemId: string, requestId: number) => {
    try {
      const response = await fetch(`/api/items/${encodeURIComponent(itemId)}`);
      const payload = (await response.json()) as ItemDetailResponse;

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? "Item details are unavailable.");
      }

      setItem(payload.item);
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setItem(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Item details are unavailable right now."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const openItem = useCallback((itemId: string) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    startTransition(() => {
      setError(null);
      setItem(null);
      setLoading(true);
      setSelectedItemId(itemId);
      setOpen(true);
    });

    void fetchItem(itemId, requestId);
  }, [fetchItem]);

  const onOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      requestIdRef.current += 1;
      setError(null);
      setItem(null);
      setLoading(false);
      setSelectedItemId(null);
    }
  }, []);

  const retry = useCallback(() => {
    if (selectedItemId) {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setError(null);
      setItem(null);
      setLoading(true);
      void fetchItem(selectedItemId, requestId);
    }
  }, [fetchItem, selectedItemId]);

  return {
    error,
    item,
    loading,
    onOpenChange,
    open,
    openItem,
    retry,
  };
}
