"use client";

import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  className?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
}

function getEditorHeight(value: string) {
  const lineCount = Math.max(value.split("\n").length, 6);
  const nextHeight = lineCount * 22 + 24;

  return Math.min(Math.max(nextHeight, 176), 400);
}

export function MarkdownEditor({
  className,
  onChange,
  placeholder = "Write markdown...",
  readOnly = false,
  value,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const editorHeight = getEditorHeight(value);
  const previewActive = readOnly || activeTab === "preview";

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Unable to copy content.");
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#1e1e1e] shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#2d2d2d] px-4 py-3">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex min-w-0 items-center gap-3">
          {readOnly ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] font-medium tracking-[0.16em] text-slate-400 uppercase">
              Preview
            </span>
          ) : (
            <div
              aria-label="Markdown editor mode"
              className="flex rounded-full border border-white/10 bg-black/20 p-1"
              role="tablist"
            >
              {(["write", "preview"] as const).map((tab) => (
                <button
                  aria-selected={activeTab === tab}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                    activeTab === tab
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:text-white"
                  )}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <Button
            aria-label="Copy markdown content"
            className="h-8 rounded-full border-white/10 bg-white/[0.04] px-3 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white"
            disabled={!value}
            onClick={copyValue}
            type="button"
            variant="outline"
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
        </div>
      </div>

      <div className="max-h-[400px] min-h-44 overflow-auto" style={{ height: editorHeight }}>
        {previewActive ? (
          <div className="markdown-preview min-h-full px-4 py-4">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-sm text-slate-500">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            className="h-full min-h-44 w-full resize-none bg-transparent px-4 py-4 text-sm leading-[22px] text-slate-100 outline-none placeholder:text-slate-600"
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            value={value}
          />
        )}
      </div>
    </div>
  );
}
