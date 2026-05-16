"use client";

import dynamic from "next/dynamic";
import { Copy } from "lucide-react";
import { type BeforeMount } from "@monaco-editor/react";
import { toast } from "sonner";

import { useEditorPreferences } from "@/components/editor/editor-preferences-context";
import { Button } from "@/components/ui/button";
import { normalizeEditorLanguage } from "@/lib/editor-preferences";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  loading: () => (
    <div className="flex h-full min-h-40 items-center justify-center bg-[#050507] text-xs text-slate-500">
      Loading editor...
    </div>
  ),
  ssr: false,
});

interface CodeEditorProps {
  className?: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  value: string;
}

function getEditorHeight(value: string, lineHeight: number) {
  const lineCount = Math.max(value.split("\n").length, 6);
  const nextHeight = lineCount * lineHeight + 24;

  return Math.min(Math.max(nextHeight, 176), 400);
}

const defineEditorThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e" },
      { token: "keyword", foreground: "f92672" },
      { token: "number", foreground: "ae81ff" },
      { token: "string", foreground: "e6db74" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorCursor.foreground": "#f8f8f0",
      "editorLineNumber.foreground": "#90908a",
      "editorLineNumber.activeForeground": "#f8f8f2",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "number", foreground: "79c0ff" },
      { token: "string", foreground: "a5d6ff" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editorCursor.foreground": "#58a6ff",
      "editorLineNumber.foreground": "#6e7681",
      "editorLineNumber.activeForeground": "#c9d1d9",
    },
  });
};

export function CodeEditor({
  className,
  language,
  onChange,
  readOnly = false,
  value,
}: CodeEditorProps) {
  const { preferences } = useEditorPreferences();
  const normalizedLanguage = normalizeEditorLanguage(language);
  const lineHeight = preferences.fontSize + 9;
  const editorHeight = getEditorHeight(value, lineHeight);

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
        "overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#050507] shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] font-medium tracking-[0.16em] text-slate-400 uppercase">
            {normalizedLanguage}
          </span>
          <Button
            aria-label="Copy editor content"
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

      <div className="max-h-[400px] min-h-44 overflow-hidden" style={{ height: editorHeight }}>
        <MonacoEditor
          beforeMount={defineEditorThemes}
          height="100%"
          language={normalizedLanguage}
          onChange={(nextValue) => onChange?.(nextValue ?? "")}
          options={{
            automaticLayout: true,
            contextmenu: false,
            cursorBlinking: "smooth",
            fontFamily:
              "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: preferences.fontSize,
            lineHeight,
            minimap: { enabled: preferences.minimap },
            padding: { bottom: 16, top: 16 },
            readOnly,
            renderLineHighlight: readOnly ? "none" : "line",
            scrollBeyondLastLine: false,
            scrollbar: {
              alwaysConsumeMouseWheel: false,
              horizontalScrollbarSize: 10,
              verticalScrollbarSize: 10,
            },
            smoothScrolling: true,
            tabSize: preferences.tabSize,
            wordWrap: preferences.wordWrap ? "on" : "off",
          }}
          theme={preferences.theme}
          value={value}
        />
      </div>
    </div>
  );
}
