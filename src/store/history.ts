import { create } from "zustand";

type HistoryItem = {
  question: string;
  matchedConcept: string;
};

type HistoryState = {
  items: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
};

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [],
  addToHistory: (item) =>
    set((state) => ({ items: [item, ...state.items.slice(0, 19)] })),
}));
