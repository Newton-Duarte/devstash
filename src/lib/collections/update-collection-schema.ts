import { z } from "zod";

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  description: z.string().trim().nullable().optional(),
});

export type UpdateCollectionInput = z.input<typeof updateCollectionSchema>;
export type UpdateCollectionData = z.output<typeof updateCollectionSchema>;
