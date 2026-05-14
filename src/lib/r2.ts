import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { createR2ObjectKey, validateUploadFile, type UploadItemType } from "@/lib/items/file-upload";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

interface UploadObjectInput {
  body: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
  type: UploadItemType;
  userId: string;
}

export interface UploadedObject {
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  fileUrl: string | null;
}

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Cloudflare R2 environment variables are not configured.");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
}

function getR2Client() {
  const config = getR2Config();

  return new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  });
}

export async function uploadR2Object(input: UploadObjectInput): Promise<UploadedObject> {
  const validationError = validateUploadFile({
    fileName: input.fileName,
    fileSize: input.size,
    mimeType: input.mimeType,
    type: input.type,
  });

  if (validationError) {
    throw new Error(validationError);
  }

  const config = getR2Config();
  const client = getR2Client();
  const fileKey = createR2ObjectKey({
    fileName: input.fileName,
    type: input.type,
    userId: input.userId,
  });

  await client.send(
    new PutObjectCommand({
      Body: input.body,
      Bucket: config.bucketName,
      ContentLength: input.size,
      ContentType: input.mimeType,
      Key: fileKey,
    })
  );

  return {
    fileKey,
    fileName: input.fileName,
    fileSize: input.size,
    fileMimeType: input.mimeType,
    fileUrl: null,
  };
}

export async function getR2Object(fileKey: string) {
  const config = getR2Config();
  const client = getR2Client();

  return client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
    })
  );
}

export async function deleteR2Object(fileKey: string) {
  const config = getR2Config();
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: fileKey,
    })
  );
}
