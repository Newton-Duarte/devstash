import { describe, expect, it } from "vitest";

import {
  DEFAULT_EDITOR_PREFERENCES,
  editorPreferencesSchema,
  normalizeEditorLanguage,
  normalizeEditorPreferences,
} from "@/lib/editor-preferences";

describe("editor preferences", () => {
  it("returns defaults for missing preferences", () => {
    expect(normalizeEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("merges partial stored preferences with defaults", () => {
    expect(
      normalizeEditorPreferences({
        fontSize: 16,
        theme: "monokai",
      })
    ).toEqual({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 16,
      theme: "monokai",
    });
  });

  it("ignores invalid stored preferences", () => {
    expect(
      normalizeEditorPreferences({
        fontSize: 99,
        theme: "solarized",
      })
    ).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("validates a complete preference update", () => {
    const result = editorPreferencesSchema.safeParse({
      fontSize: 14,
      minimap: true,
      tabSize: 4,
      theme: "github-dark",
      wordWrap: false,
    });

    expect(result.success).toBe(true);
  });

  it("normalizes common language aliases for Monaco", () => {
    expect(normalizeEditorLanguage("ts")).toBe("typescript");
    expect(normalizeEditorLanguage("tsx")).toBe("typescript");
    expect(normalizeEditorLanguage("js")).toBe("javascript");
    expect(normalizeEditorLanguage("bash")).toBe("shell");
    expect(normalizeEditorLanguage("   ")).toBe("plaintext");
  });
});
