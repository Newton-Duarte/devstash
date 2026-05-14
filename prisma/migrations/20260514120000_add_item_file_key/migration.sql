-- Add private storage metadata for R2-backed file and image items.
ALTER TABLE "Item" ADD COLUMN "fileKey" TEXT;
ALTER TABLE "Item" ADD COLUMN "fileMimeType" TEXT;
