import { computed, onMounted, onUnmounted, ref } from 'vue';
import { browser } from 'wxt/browser';
import { ensureOriginAccess, requestFirefoxHostAccess } from '../../shared/browser/permissions';
import {
  captureVisibleTab,
  openNativePixelPicker,
  supportsNativePixelPicker,
} from '../../shared/browser/pixelPicker';
import { useInspectorStore } from '../../stores/inspector.store';
import { getContrastLevel, getContrastRatio } from '../../shared/color/contrast';
import type {
  ColorValue,
  ElementInspection,
  InspectorEvent,
  PixelSample,
} from '../../shared/messaging/contracts';
import { uk } from '../../shared/i18n/uk';

export type InspectorState = 'ready' | 'picking' | 'pixel-picking' | 'selected' | 'error';

export interface ColorEntry {
  key: string;
  label: string;
  color: ColorValue | null;
}

export interface BorderEntry extends ColorEntry {
  key: 'top' | 'right' | 'bottom' | 'left';
}

function pageAccessError(
  access: { ok: false; reason: 'no-url' | 'unavailable' | 'denied'; host?: string },
  copy: typeof uk,
) {
  if (access.reason === 'no-url') return copy.error.noUrl;
  if (access.reason === 'unavailable') return copy.error.unavailablePage;
  return copy.error.accessDenied(access.host ?? 'поточної сторінки');
}

export function useInspectorController() {
  const inspection = ref<ElementInspection | null>(null);
  const error = ref<string | null>(null);
  const state = ref<InspectorState>('ready');
  const copied = ref<string | null>(null);
  const pixelSample = ref<PixelSample | null>(null);
  const requestId = ref(crypto.randomUUID());
  const inspectorStore = useInspectorStore();
  const copy = uk;

  const stateCopy: Record<InspectorState, { label: string; description: string }> = {
    ready: copy.state.ready,
    picking: copy.state.picking,
    'pixel-picking': copy.state.pixelPicking,
    selected: copy.state.selected,
    error: copy.state.error,
  };

  const hasResult = computed(() => Boolean(inspection.value || pixelSample.value));
  const resultType = computed(() =>
    inspection.value ? copy.result.elementInspection : copy.result.pixelSample,
  );
  const colorEntries = computed<ColorEntry[]>(() => {
    const colors = inspection.value?.colors;
    if (!colors) return [];
    return [
      { key: 'text', label: copy.result.text, color: colors.text },
      { key: 'background', label: copy.result.background, color: colors.background },
      { key: 'border', label: copy.result.border, color: colors.border },
    ];
  });
  const borderEntries = computed<BorderEntry[]>(() => {
    const sides = inspection.value?.borderSides;
    if (!sides) return [];
    return [
      { key: 'top', label: copy.result.top, color: sides.top },
      { key: 'right', label: copy.result.right, color: sides.right },
      { key: 'bottom', label: copy.result.bottom, color: sides.bottom },
      { key: 'left', label: copy.result.left, color: sides.left },
    ];
  });
  const contrastRatio = computed(() =>
    getContrastRatio(
      inspection.value?.colors.text ?? null,
      inspection.value?.colors.background ?? null,
    ),
  );
  const contrastLevel = computed(() => getContrastLevel(contrastRatio.value));
  const contrastClass = computed(
    () => `contrast-${contrastLevel.value.toLowerCase().replace(' ', '-')}`,
  );

  async function sendCommand(type: 'PICKER_START' | 'PICKER_STOP') {
    error.value = null;
    requestId.value = crypto.randomUUID();
    try {
      const firefoxAccessRequest = type === 'PICKER_START' ? requestFirefoxHostAccess() : null;
      const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) throw new Error(copy.error.noActiveTab);
      if (!tab.url) throw new Error(copy.error.noUrl);
      if (type === 'PICKER_START') {
        if (firefoxAccessRequest) {
          const granted = await firefoxAccessRequest;
          if (!granted) throw new Error(copy.error.accessDenied(new URL(tab.url).host));
        } else {
          const access = await ensureOriginAccess(tab.url);
          if (!access.ok) throw new Error(pageAccessError(access, copy));
        }
        state.value = 'picking';
      }
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/content.js'],
      });
      await browser.tabs.sendMessage(tab.id, { type, requestId: requestId.value });
      if (type === 'PICKER_STOP') state.value = 'ready';
    } catch (cause) {
      state.value = 'error';
      error.value = cause instanceof Error ? cause.message : copy.error.pickerUnavailable;
    }
  }

  async function startPixelPicker() {
    error.value = null;
    requestId.value = crypto.randomUUID();

    if (import.meta.env.FIREFOX) {
      const firefoxAccessRequest = requestFirefoxHostAccess();
      state.value = 'pixel-picking';
      try {
        const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        if (!tab?.id) throw new Error(copy.error.noActiveTab);
        if (!tab.url) throw new Error(copy.error.noUrl);
        if (!(await firefoxAccessRequest)) {
          throw new Error(copy.error.accessDenied(new URL(tab.url).host));
        }
        const screenshot = await captureVisibleTab(tab.windowId);
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['/content-scripts/content.js'],
        });
        await browser.tabs.sendMessage(tab.id, {
          type: 'PIXEL_PICKER_START',
          requestId: requestId.value,
          screenshot,
        });
      } catch (cause) {
        state.value = 'error';
        error.value = cause instanceof Error ? cause.message : copy.error.pixelFailed;
      }
      return;
    }

    if (!supportsNativePixelPicker()) {
      state.value = 'error';
      error.value = copy.error.pixelUnavailable;
      return;
    }
    state.value = 'pixel-picking';
    try {
      const sample = await openNativePixelPicker();
      pixelSample.value = sample;
      inspectorStore.addPixelSample(sample);
      state.value = 'selected';
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') {
        state.value = inspection.value || pixelSample.value ? 'selected' : 'ready';
        return;
      }
      state.value = 'error';
      error.value = cause instanceof Error ? cause.message : copy.error.pixelFailed;
    }
  }

  async function copyValue(value: string | null) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      copied.value = value;
      window.setTimeout(() => (copied.value = null), 1200);
    } catch {
      error.value = copy.error.clipboardUnavailable;
    }
  }

  function handleMessage(message: InspectorEvent) {
    if (message.requestId !== requestId.value) return;
    if (message.type === 'ELEMENT_SELECTED') {
      inspection.value = message.payload;
      pixelSample.value = null;
      inspectorStore.addInspection(message.payload);
      state.value = 'selected';
    } else if (message.type === 'PIXEL_SELECTED') {
      pixelSample.value = message.payload;
      inspection.value = null;
      inspectorStore.addPixelSample(message.payload);
      state.value = 'selected';
    } else if (message.type === 'PICKER_CANCELLED') {
      state.value = 'ready';
    } else if (message.type === 'PIXEL_PICKER_CANCELLED') {
      state.value = inspection.value || pixelSample.value ? 'selected' : 'ready';
    } else if (message.type === 'PICKER_ERROR') {
      state.value = 'error';
      error.value = message.message;
    }
  }

  async function copyDetails() {
    if (inspection.value) await copyValue(JSON.stringify(inspection.value.details, null, 2));
  }

  async function copyResult() {
    if (inspection.value) {
      await copyValue(JSON.stringify(inspection.value, null, 2));
    } else if (pixelSample.value) {
      await copyValue(JSON.stringify(pixelSample.value, null, 2));
    }
  }

  function selectHistory(id: string) {
    const item = inspectorStore.history.find((entry) => entry.id === id);
    if (!item) return;
    if (item.kind === 'pixel') {
      pixelSample.value = item.sample;
      inspection.value = null;
    } else {
      inspection.value = item.inspection;
      pixelSample.value = null;
    }
    state.value = 'selected';
    error.value = null;
  }

  function exportHistory() {
    const blob = new Blob([JSON.stringify(inspectorStore.history, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'korpiox-inspect-history.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  onMounted(() => {
    inspectorStore.hydrate();
    browser.runtime.onMessage.addListener(handleMessage);
  });
  onUnmounted(() => browser.runtime.onMessage.removeListener(handleMessage));

  return {
    borderEntries,
    colorEntries,
    contrastClass,
    contrastLevel,
    contrastRatio,
    copied,
    copy,
    copyDetails,
    copyResult,
    copyValue,
    error,
    exportHistory,
    hasResult,
    inspection,
    inspectorStore,
    pixelSample,
    resultType,
    selectHistory,
    sendCommand,
    startPixelPicker,
    state,
    stateCopy,
  };
}
