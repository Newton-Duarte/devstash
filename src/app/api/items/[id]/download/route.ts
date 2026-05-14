import { auth } from "@/auth";
import { getItemFileObject } from "@/lib/db/items";
import { getR2Object } from "@/lib/r2";

function encodeContentDisposition(fileName: string) {
  const fallbackName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const itemFile = await getItemFileObject(session.user.id, id);

  if (!itemFile) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const object = await getR2Object(itemFile.fileKey);
    const body = object.Body?.transformToWebStream();

    if (!body) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    const dispositionType = itemFile.typeName.toLowerCase() === "image" ? "inline" : "attachment";
    const headers = new Headers({
      "Content-Disposition": encodeContentDisposition(itemFile.fileName).replace(
        "attachment",
        dispositionType
      ),
      "Content-Type": itemFile.fileMimeType,
      "X-Content-Type-Options": "nosniff",
    });

    if (itemFile.fileSize) {
      headers.set("Content-Length", String(itemFile.fileSize));
    }

    return new Response(body, { headers });
  } catch {
    return Response.json({ error: "Unable to download file right now." }, { status: 500 });
  }
}
