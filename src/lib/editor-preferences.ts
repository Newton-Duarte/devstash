import { z } from "zod";

export const EDITOR_FONT_SIZE_OPTIONS = [12, 13, 14, 15, 16, 18] as const;
export const EDITOR_TAB_SIZE_OPTIONS = [2, 4, 8] as const;
export const EDITOR_THEME_OPTIONS = ["vs-dark", "monokai", "github-dark"] as const;

export const DEFAULT_EDITOR_PREFERENCES = {
  fontSize: 13,
  minimap: false,
  tabSize: 2,
  theme: "vs-dark",
  wordWrap: true,
} as const;

export const editorPreferencesSchema = z.object({
  fontSize: z.union([
    z.literal(12),
    z.literal(13),
    z.literal(14),
    z.literal(15),
    z.literal(16),
    z.literal(18),
  ]),
  minimap: z.boolean(),
  tabSize: z.union([z.literal(2), z.literal(4), z.literal(8)]),
  theme: z.enum(EDITOR_THEME_OPTIONS),
  wordWrap: z.boolean(),
});

const storedEditorPreferencesSchema = editorPreferencesSchema.partial();

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;

export function normalizeEditorLanguage(language: string) {
  const trimmedLanguage = language.trim().toLowerCase();

  if (!trimmedLanguage) {
    return "plaintext";
  }

  const languageAliases: Record<string, string> = {
    bash: "shell",
    js: "javascript",
    jsx: "javascript",
    sh: "shell",
    ts: "typescript",
    tsx: "typescript",
  };

  return languageAliases[trimmedLanguage] ?? trimmedLanguage;
}

export function normalizeEditorPreferences(value: unknown): EditorPreferences {
  const parsedPreferences = storedEditorPreferencesSchema.safeParse(value);

  if (!parsedPreferences.success) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  return {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...parsedPreferences.data,
  };
}
