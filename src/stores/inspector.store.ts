import { defineStore } from 'pinia';
import type {
  ElementInspection,
  InspectionHistoryItem,
  PixelSample,
} from '../shared/messaging/contracts';

const STORAGE_KEY = 'korpiox-inspect:history';
const LEGACY_STORAGE_KEY = 'mud-color-inspector:history';
const MAX_HISTORY_ITEMS = 20;

export const useInspectorStore = defineStore('inspector', {
  state: () => ({
    history: [] as InspectionHistoryItem[],
  }),
  actions: {
    hydrate() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
        this.history = stored
          ? (JSON.parse(stored) as InspectionHistoryItem[]).slice(0, MAX_HISTORY_ITEMS)
          : [];
      } catch {
        this.history = [];
      }
    },
    addInspection(inspection: ElementInspection) {
      const item: InspectionHistoryItem = {
        kind: 'element',
        id: crypto.randomUUID(),
        capturedAt: new Date().toISOString(),
        inspection,
      };
      this.history = [
        item,
        ...this.history.filter(
          (entry) => entry.kind !== 'element' || entry.inspection.selector !== inspection.selector,
        ),
      ].slice(0, MAX_HISTORY_ITEMS);
      this.persist();
    },
    addPixelSample(sample: PixelSample) {
      const item: InspectionHistoryItem = {
        kind: 'pixel',
        id: crypto.randomUUID(),
        capturedAt: new Date().toISOString(),
        sample,
      };
      this.history = [item, ...this.history].slice(0, MAX_HISTORY_ITEMS);
      this.persist();
    },
    removeInspection(id: string) {
      this.history = this.history.filter((item) => item.id !== id);
      this.persist();
    },
    clearHistory() {
      this.history = [];
      this.persist();
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    },
  },
});
