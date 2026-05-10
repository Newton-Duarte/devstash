import { z } from "zod";

export const createItemTypeSchema = z.enum(["snippet", "prompt", "command", "note", "link"]);

export const createItemSchema = z
  .object({
    type: createItemTypeSchema,
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().nullable().optional(),
    content: z.string().trim().nullable().optional(),
    url: z.string().trim().nullable().optional(),
    language: z.string().trim().nullable().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, context) => {
    if (data.type !== "link") {
      return;
    }

    const urlResult = z.string().url().safeParse(data.url);

    if (!urlResult.success) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid URL.",
        path: ["url"],
      });
    }
  });

export type CreateItemInput = z.input<typeof createItemSchema>;
export type CreateItemData = z.output<typeof createItemSchema>;
export type CreateItemType = z.infer<typeof createItemTypeSchema>;
