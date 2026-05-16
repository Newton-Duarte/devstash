"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/lib/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  setPreferences: (preferences: EditorPreferences) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null);

interface EditorPreferencesProviderProps {
  children: ReactNode;
  initialPreferences?: EditorPreferences;
}

export function EditorPreferencesProvider({
  children,
  initialPreferences = DEFAULT_EDITOR_PREFERENCES,
}: EditorPreferencesProviderProps) {
  const [preferences, setPreferences] = useState(initialPreferences);

  return (
    <EditorPreferencesContext value={{ preferences, setPreferences }}>
      {children}
    </EditorPreferencesContext>
  );
}

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);

  if (!context) {
    return {
      preferences: DEFAULT_EDITOR_PREFERENCES,
      setPreferences: () => {},
    } satisfies EditorPreferencesContextValue;
  }

  return context;
}
