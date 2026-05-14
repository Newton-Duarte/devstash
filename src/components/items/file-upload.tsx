"use client";

import { CheckCircle2, FileUp, Loader2, XCircle } from "lucide-react";
import { type DragEvent, type ReactNode, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatUploadFileSize,
  getAcceptedFileTypes,
  validateUploadFile,
  type UploadedFileMetadata,
  type UploadItemType,
} from "@/lib/items/file-upload";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onChange: (file: UploadedFileMetadata | null) => void;
  type: UploadItemType;
  value: UploadedFileMetadata | null;
}

interface UploadResponse {
  file?: UploadedFileMetadata;
  error?: string;
}

function UploadStatus({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

function parseUploadResponse(value: string): UploadResponse {
  const parsedValue: unknown = JSON.parse(value);

  if (!parsedValue || typeof parsedValue !== "object") {
    return { error: "Unexpected upload response." };
  }

  return parsedValue as UploadResponse;
}

export function FileUpload({ onChange, type, value }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = (file: File) => {
    const validationError = validateUploadFile({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      type,
    });

    if (validationError) {
      setError(validationError);
      onChange(null);
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/uploads");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      setUploading(false);

      try {
        const response = parseUploadResponse(request.responseText);

        if (request.status < 200 || request.status >= 300 || !response.file) {
          setError(response.error ?? "Unable to upload file.");
          onChange(null);
          return;
        }

        setError(null);
        setProgress(100);
        onChange(response.file);
      } catch {
        setError("Unable to read upload response.");
        onChange(null);
      }
    };
    request.onerror = () => {
      setUploading(false);
      setError("Upload failed. Check your connection and try again.");
      onChange(null);
    };

    setError(null);
    setProgress(0);
    setUploading(true);
    onChange(null);
    request.send(formData);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files.item(0);

    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-3xl border border-dashed p-5 text-center transition",
          dragging
            ? "border-white/40 bg-white/[0.08]"
            : "border-white/15 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.06]"
        )}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={handleDrop}
      >
        <input
          accept={getAcceptedFileTypes(type)}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.item(0);

            if (file) {
              uploadFile(file);
            }
          }}
          ref={inputRef}
          type="file"
        />
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/[0.06] text-slate-300">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <FileUp className="size-5" />}
        </div>
        <p className="mt-4 text-sm font-semibold text-white">
          Drop {type === "image" ? "an image" : "a file"} here
        </p>
        <UploadStatus>or browse from your computer</UploadStatus>
        <Button
          className="mt-4 rounded-2xl border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.09]"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          Choose {type === "image" ? "image" : "file"}
        </Button>
      </div>

      {uploading ? (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          <UploadStatus>Uploading {progress}%</UploadStatus>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <XCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {value ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{value.fileName}</p>
            <p className="mt-1 text-emerald-100/70">{formatUploadFileSize(value.fileSize)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
