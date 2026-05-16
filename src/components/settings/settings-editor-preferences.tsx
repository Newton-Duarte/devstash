"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { updateEditorPreferences } from "@/actions/settings";
import { useEditorPreferences } from "@/components/editor/editor-preferences-context";
import {
  EDITOR_FONT_SIZE_OPTIONS,
  EDITOR_TAB_SIZE_OPTIONS,
  EDITOR_THEME_OPTIONS,
  type EditorPreferences,
} from "@/lib/editor-preferences";
import { cn } from "@/lib/utils";

function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label className="text-sm font-medium text-slate-200" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function SelectField({
  children,
  disabled,
  id,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  disabled: boolean;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        className="h-11 w-full rounded-2xl border border-white/10 bg-[#111216] px-4 text-sm text-slate-100 outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </div>
  );
}

function ToggleField({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className={cn(
        "flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-[#111216] px-4 text-left text-sm text-slate-200 transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60",
        checked && "border-white/20 bg-white/[0.07] text-white"
      )}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex h-6 w-11 items-center rounded-full border border-white/10 bg-white/[0.08] p-0.5 transition",
          checked && "bg-emerald-400/20"
        )}
      >
        <span
          className={cn(
            "size-5 rounded-full bg-slate-500 transition-transform",
            checked && "translate-x-5 bg-emerald-300"
          )}
        />
      </span>
    </button>
  );
}

export function SettingsEditorPreferences() {
  const { preferences, setPreferences } = useEditorPreferences();
  const [formPreferences, setFormPreferences] = useState(preferences);
  const [saving, startSaving] = useTransition();

  const savePreferences = (nextPreferences: EditorPreferences) => {
    setFormPreferences(nextPreferences);

    startSaving(async () => {
      const result = await updateEditorPreferences(nextPreferences);

      if (!result.success || !result.data) {
        setFormPreferences(preferences);
        toast.error(result.error ?? "Unable to update editor preferences.");
        return;
      }

      setPreferences(result.data);
      setFormPreferences(result.data);
      toast.success("Editor preferences saved.");
    });
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0d0e12] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
          Editor preferences
        </p>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Code editor</h2>
        <p className="text-sm text-slate-400">
          Tune Monaco for snippets and commands. Changes save automatically and apply across your
          stash.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SelectField
          disabled={saving}
          id="editorFontSize"
          label="Font size"
          onChange={(value) => savePreferences({ ...formPreferences, fontSize: Number(value) as EditorPreferences["fontSize"] })}
          value={String(formPreferences.fontSize)}
        >
          {EDITOR_FONT_SIZE_OPTIONS.map((fontSize) => (
            <option key={fontSize} value={fontSize}>
              {fontSize}px
            </option>
          ))}
        </SelectField>

        <SelectField
          disabled={saving}
          id="editorTabSize"
          label="Tab size"
          onChange={(value) => savePreferences({ ...formPreferences, tabSize: Number(value) as EditorPreferences["tabSize"] })}
          value={String(formPreferences.tabSize)}
        >
          {EDITOR_TAB_SIZE_OPTIONS.map((tabSize) => (
            <option key={tabSize} value={tabSize}>
              {tabSize} spaces
            </option>
          ))}
        </SelectField>

        <SelectField
          disabled={saving}
          id="editorTheme"
          label="Theme"
          onChange={(value) => savePreferences({ ...formPreferences, theme: value as EditorPreferences["theme"] })}
          value={formPreferences.theme}
        >
          {EDITOR_THEME_OPTIONS.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </SelectField>

        <div className="grid gap-3">
          <ToggleField
            checked={formPreferences.wordWrap}
            disabled={saving}
            label="Word wrap"
            onChange={(wordWrap) => savePreferences({ ...formPreferences, wordWrap })}
          />
          <ToggleField
            checked={formPreferences.minimap}
            disabled={saving}
            label="Minimap"
            onChange={(minimap) => savePreferences({ ...formPreferences, minimap })}
          />
        </div>
      </div>
    </section>
  );
}
