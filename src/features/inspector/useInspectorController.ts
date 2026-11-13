import { computed, onMounted, onUnmounted, ref } from 'vue';
import { browser } from 'wxt/browser';
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
      const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) throw new Error(copy.error.noActiveTab);
      if (!tab.url) throw new Error(copy.error.noUrl);
      if (type === 'PICKER_START') {
        await requestPageAccess(tab.url);
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

  async function requestPageAccess(pageUrl: string) {
    let url: URL;
    try {
      url = new URL(pageUrl);
    } catch {
      throw new Error(copy.error.noUrl);
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(copy.error.unavailablePage);
    }
    const origin = `${url.protocol}//${url.host}/*`;
    const alreadyGranted = await browser.permissions.contains({ origins: [origin] });
    if (!alreadyGranted) {
      const granted = await browser.permissions.request({ origins: [origin] });
      if (!granted) throw new Error(copy.error.accessDenied(url.host));
    }
  }

  async function startPixelPicker() {
    error.value = null;
    if (!window.EyeDropper) {
      state.value = 'error';
      error.value = copy.error.pixelUnavailable;
      return;
    }
    state.value = 'pixel-picking';
    try {
      const result = await new window.EyeDropper().open();
      const hex = result.sRGBHex.toLowerCase();
      const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
      const sample: PixelSample = {
        source: 'pixel',
        hex,
        rgb: `rgb(${channels.join(' ')})`,
      };
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
    } else if (message.type === 'PICKER_CANCELLED') {
      state.value = 'ready';
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
