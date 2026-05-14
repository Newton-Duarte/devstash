import { auth } from "@/auth";
import { validateUploadFile, type UploadItemType } from "@/lib/items/file-upload";
import { uploadR2Object } from "@/lib/r2";

function isUploadItemType(value: FormDataEntryValue | null): value is UploadItemType {
  return value === "file" || value === "image";
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const type = formData.get("type");
  const file = formData.get("file");

  if (!isUploadItemType(type)) {
    return Response.json({ error: "Choose a file or image item type." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  const validationError = validateUploadFile({
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    type,
  });

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  try {
    const uploadedFile = await uploadR2Object({
      body: Buffer.from(await file.arrayBuffer()),
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      type,
      userId: session.user.id,
    });

    return Response.json({ file: uploadedFile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload file right now.";

    return Response.json({ error: message }, { status: 500 });
  }
}
