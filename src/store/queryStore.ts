import { create } from "zustand";

type Resource = {
  id: string;
  title: string;
  url: string;
  type: "video" | "article" | "quiz";
};

interface QueryState {
  query: string;
  concept: string | null;
  resources: Resource[];
  feedback: "yes" | "no" | null;
  setQuery: (q: string) => void;
  setConcept: (c: string) => void;
  setResources: (r: Resource[]) => void;
  setFeedback: (f: "yes" | "no") => void;
}

export const useQueryStore = create<QueryState>((set) => ({
  query: "",
  concept: null,
  resources: [],
  feedback: null,
  setQuery: (q) => set({ query: q }),
  setConcept: (c) => set({ concept: c }),
  setResources: (r) => set({ resources: r }),
  setFeedback: (f) => set({ feedback: f }),
}));
