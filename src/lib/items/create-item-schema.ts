import { z } from "zod";

export const createItemTypeSchema = z.enum(["snippet", "prompt", "command", "note", "link", "file", "image"]);

const uploadedFileSchema = z.object({
  fileKey: z.string().trim().min(1, "Upload a file first."),
  fileName: z.string().trim().min(1, "Upload a file first."),
  fileSize: z.number().int().positive("Upload a file first."),
  fileMimeType: z.string().trim().min(1, "Upload a file first."),
  fileUrl: z.string().trim().nullable().optional(),
});

export const createItemSchema = z
  .object({
    type: createItemTypeSchema,
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().nullable().optional(),
    content: z.string().trim().nullable().optional(),
    url: z.string().trim().nullable().optional(),
    language: z.string().trim().nullable().optional(),
    file: uploadedFileSchema.nullable().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    collectionIds: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, context) => {
    if (data.type === "link") {
      const urlResult = z.string().url().safeParse(data.url);

      if (!urlResult.success) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid URL.",
          path: ["url"],
        });
      }
    }

    if (["file", "image"].includes(data.type) && !data.file) {
      context.addIssue({
        code: "custom",
        message: "Upload a file first.",
        path: ["file"],
      });
    }
  });

export type CreateItemInput = z.input<typeof createItemSchema>;
export type CreateItemData = z.output<typeof createItemSchema>;
export type CreateItemType = z.infer<typeof createItemTypeSchema>;
