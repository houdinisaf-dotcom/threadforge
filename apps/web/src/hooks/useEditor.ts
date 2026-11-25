"use client";

import { create } from "zustand";
import type { MockupStatus } from "@prisma/client";

/**
 * Editor UI state shared between the canvas, toolbar and editor chrome.
 * The fabric canvas instance itself stays local to the canvas component — only
 * serialisable, cross-component state lives here.
 */
interface EditorState {
  mockupId: string | null;
  name: string;
  status: MockupStatus;
  templateId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isExporting: boolean;
  layers: number;

  init: (input: {
    mockupId: string | null;
    name: string;
    status?: MockupStatus;
    templateId: string | null;
  }) => void;
  setName: (name: string) => void;
  setStatus: (status: MockupStatus) => void;
  setTemplateId: (templateId: string) => void;
  markDirty: () => void;
  setSaving: (isSaving: boolean) => void;
  setExporting: (isExporting: boolean) => void;
  setLayers: (layers: number) => void;
  markSaved: (mockupId: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mockupId: null,
  name: "Untitled mockup",
  status: "DRAFT",
  templateId: null,
  isDirty: false,
  isSaving: false,
  isExporting: false,
  layers: 0,

  init: ({ mockupId, name, status = "DRAFT", templateId }) =>
    set({
      mockupId,
      name,
      status,
      templateId,
      isDirty: false,
      isSaving: false,
      isExporting: false,
      layers: 0,
    }),
  setName: (name) => set({ name, isDirty: true }),
  setStatus: (status) => set({ status, isDirty: true }),
  setTemplateId: (templateId) => set({ templateId, isDirty: true }),
  markDirty: () => set({ isDirty: true }),
  setSaving: (isSaving) => set({ isSaving }),
  setExporting: (isExporting) => set({ isExporting }),
  setLayers: (layers) => set({ layers }),
  markSaved: (mockupId) =>
    set({ mockupId, isDirty: false, isSaving: false, isExporting: false }),
}));

/** Selects the human-readable save state for the editor header. */
export function useSaveLabel() {
  return useEditorStore((state) => {
    if (state.isSaving) return "Saving…";
    if (state.isDirty) return "Unsaved changes";
    return "All changes saved";
  });
}
