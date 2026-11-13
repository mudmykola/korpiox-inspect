<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  AlertCircle,
  Check,
  Copy,
  Crosshair,
  Download,
  RotateCcw,
  Square,
  Trash2,
} from 'lucide-vue-next';
import { browser } from 'wxt/browser';
import { useInspectorStore } from '../../src/stores/inspector.store';
import { getContrastLevel, getContrastRatio } from '../../src/shared/color/contrast';
import type {
  ColorValue,
  ElementInspection,
  InspectorEvent,
  PixelSample,
} from '../../src/shared/messaging/contracts';
import { uk } from '../../src/shared/i18n/uk';

type InspectorState = 'ready' | 'picking' | 'pixel-picking' | 'selected' | 'error';

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

const colorEntries = computed(() => {
  const colors = inspection.value?.colors;
  if (!colors) return [];
  return [
    { key: 'text', label: copy.result.text, color: colors.text },
    { key: 'background', label: copy.result.background, color: colors.background },
    { key: 'border', label: copy.result.border, color: colors.border },
  ];
});

const borderEntries = computed(() => {
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

function swatchStyle(color: ColorValue | null) {
  return color?.hex ? { backgroundColor: color.hex } : undefined;
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

async function copyDetails() {
  if (!inspection.value) return;
  await copyValue(JSON.stringify(inspection.value.details, null, 2));
}

async function copyResult() {
  if (inspection.value) {
    await copyValue(JSON.stringify(inspection.value, null, 2));
  } else if (pixelSample.value) {
    await copyValue(JSON.stringify(pixelSample.value, null, 2));
  }
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

onMounted(() => {
  inspectorStore.hydrate();
  browser.runtime.onMessage.addListener(handleMessage);
});
onUnmounted(() => browser.runtime.onMessage.removeListener(handleMessage));
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div class="brand-lockup">
        <img class="brand-mark" src="/icons/icon-32.png" alt="" />
        <div>
          <p class="eyebrow">{{ copy.brand.eyebrow }}</p>
          <h1>{{ copy.brand.name }}</h1>
        </div>
      </div>
      <span class="privacy-pill">{{ copy.brand.privacy }}</span>
    </header>

    <section class="hero-card" aria-live="polite" :aria-busy="state === 'picking' || state === 'pixel-picking'">
      <div class="hero-icon" :class="`hero-icon-${state}`">
        <Crosshair v-if="state === 'picking'" :size="20" aria-hidden="true" />
        <Check v-else-if="state === 'selected'" :size="20" aria-hidden="true" />
        <AlertCircle v-else-if="state === 'error'" :size="20" aria-hidden="true" />
        <Crosshair v-else :size="20" aria-hidden="true" />
      </div>
      <div>
        <p class="state-label">{{ stateCopy[state].label }}</p>
        <p class="state-description">{{ stateCopy[state].description }}</p>
      </div>
    </section>

    <div class="action-stack">
      <button
        class="button button-primary"
        :disabled="state === 'picking'"
        @click="sendCommand('PICKER_START')"
      >
        <Crosshair :size="16" aria-hidden="true" />
        {{ state === 'picking' ? copy.actions.pickingElement : copy.actions.pickElement }}
      </button>
      <div class="action-row">
        <button
          v-if="state === 'picking'"
          class="button button-secondary"
          @click="sendCommand('PICKER_STOP')"
        >
          <Square :size="15" aria-hidden="true" />
          {{ copy.actions.stopPicking }}
        </button>
        <button
          v-else
          class="button button-secondary"
          :disabled="state === 'pixel-picking'"
          @click="startPixelPicker"
        >
          <Crosshair :size="15" aria-hidden="true" />
          {{ state === 'pixel-picking' ? copy.actions.sampling : copy.actions.pickPixel }}
        </button>
        <button
          v-if="hasResult && state !== 'picking'"
          class="button button-quiet"
          @click="sendCommand('PICKER_START')"
        >
          <RotateCcw :size="15" aria-hidden="true" />
          {{ copy.actions.pickAgain }}
        </button>
      </div>
    </div>

    <div v-if="error" role="alert" class="error-card">
      <AlertCircle :size="16" aria-hidden="true" />
      <div>
        <strong>{{ copy.error.title }}</strong>
        <p>{{ error }}</p>
        <button class="text-button" @click="sendCommand('PICKER_START')">
          {{ copy.actions.tryAgain }}
        </button>
      </div>
    </div>

    <section v-if="inspection" class="inspection-stack" aria-live="polite" aria-labelledby="result-title">
      <div class="result-heading">
        <div>
          <p class="section-kicker">{{ resultType }}</p>
          <h2 id="result-title">{{ copy.result.computedStyles }}</h2>
        </div>
        <button class="icon-button" :aria-label="copy.actions.copyJson" @click="copyResult">
          <Check v-if="copied" :size="14" aria-hidden="true" />
          <Copy v-else :size="14" aria-hidden="true" />
        </button>
      </div>
      <div class="element-card">
        <div>
          <p class="section-kicker">{{ copy.result.selectedElement }}</p>
          <p class="element-tag">&lt;{{ inspection.tagName.toLowerCase() }}&gt;</p>
        </div>
        <p v-if="inspection.selector" class="selector-text">{{ inspection.selector }}</p>
      </div>

      <details class="details-card">
        <summary>{{ copy.result.developerDetails }}</summary>
        <div class="details-list">
          <div class="detail-row">
            <span>{{ copy.result.tag }}</span>
            <code>&lt;{{ inspection.tagName.toLowerCase() }}&gt;</code>
          </div>
          <div class="detail-row">
            <span>{{ copy.result.id }}</span>
            <code>{{ inspection.details.id ?? '—' }}</code>
          </div>
          <div class="detail-row detail-row-stack">
            <span>{{ copy.result.classes }}</span>
            <code>{{
              inspection.details.classes.length ? `.${inspection.details.classes.join(' .')}` : '—'
            }}</code>
          </div>
          <div
            v-for="(value, name) in inspection.details.attributes"
            :key="name"
            class="detail-row"
          >
            <span>{{ name }}</span>
            <code>{{ value }}</code>
          </div>
          <div
            v-for="(value, name) in inspection.details.dataAttributes"
            :key="name"
            class="detail-row"
          >
            <span>{{ name }}</span>
            <code>{{ value }}</code>
          </div>
          <div
            v-for="(value, name) in inspection.details.ariaAttributes"
            :key="name"
            class="detail-row"
          >
            <span>{{ name }}</span>
            <code>{{ value }}</code>
          </div>
        </div>
        <button class="full-width-button" @click="copyDetails">
          <Copy :size="14" aria-hidden="true" />
          {{ copied ? copy.actions.copiedDetails : copy.actions.copyDetails }}
        </button>
      </details>

      <section class="color-section" aria-labelledby="computed-colors-title">
        <div class="section-heading">
          <h2 id="computed-colors-title">{{ copy.result.computedColors }}</h2>
          <span class="section-count" aria-label="color values">{{ colorEntries.length }}</span>
        </div>
        <div class="color-list">
          <article v-for="entry in colorEntries" :key="entry.key" class="color-card">
            <span
              class="swatch"
              :class="{ 'swatch-empty': !entry.color?.hex }"
              :style="swatchStyle(entry.color)"
              aria-hidden="true"
            />
            <div class="color-main">
              <p class="color-name">{{ entry.label }}</p>
              <p class="color-raw">{{ entry.color?.raw ?? 'Not available' }}</p>
            </div>
            <div v-if="entry.color?.hex || entry.color?.rgb" class="value-actions">
              <button
                v-if="entry.color.hex"
                class="value-button"
                :aria-label="`Копіювати ${entry.label} HEX`"
                @click="copyValue(entry.color.hex)"
              >
                {{ copied === entry.color.hex ? 'Скопійовано' : entry.color.hex }}
                <Copy :size="13" aria-hidden="true" />
              </button>
              <button
                v-if="entry.color.rgb"
                class="value-button value-button-muted"
                :aria-label="`Копіювати ${entry.label} RGB`"
                @click="copyValue(entry.color.rgb)"
              >
                {{ copied === entry.color.rgb ? 'Скопійовано' : entry.color.rgb }}
                <Copy :size="13" aria-hidden="true" />
              </button>
            </div>
            <span v-else class="value-muted">{{ copy.result.transparent }}</span>
          </article>
        </div>
      </section>

      <section class="contrast-card" aria-labelledby="contrast-title">
        <div class="section-heading">
          <h2 id="contrast-title">{{ copy.result.contrast }}</h2>
          <span class="contrast-badge" :class="contrastClass">{{ contrastLevel }}</span>
        </div>
        <div v-if="contrastRatio" class="contrast-value">{{ contrastRatio.toFixed(2) }}:1</div>
        <p class="contrast-description">
          {{
            contrastRatio
              ? copy.result.contrastDescription
              : copy.result.contrastRequiresSolid
          }}
        </p>
      </section>

      <details class="border-details">
        <summary>{{ copy.result.borderSides }}</summary>
        <div class="border-grid">
          <div v-for="entry in borderEntries" :key="entry.key" class="border-item">
            <span
              class="border-dot"
              :class="{ 'swatch-empty': !entry.color?.hex }"
              :style="swatchStyle(entry.color)"
              aria-hidden="true"
            />
            <span>{{ entry.label }}</span>
            <code>{{ entry.color?.hex ?? entry.color?.raw ?? '—' }}</code>
          </div>
        </div>
      </details>
    </section>

    <section v-if="pixelSample" class="pixel-sample-card" aria-live="polite" aria-labelledby="pixel-result-title">
      <div class="section-heading">
        <div>
          <p class="section-kicker">{{ resultType }}</p>
          <h2 id="pixel-result-title">{{ copy.result.screenColor }}</h2>
        </div>
        <span class="contrast-badge contrast-aa">{{ copy.result.screenColor }}</span>
      </div>
      <div class="pixel-result">
        <span
          class="pixel-swatch"
          :style="{ backgroundColor: pixelSample.hex }"
          aria-hidden="true"
        />
        <div>
          <p class="contrast-value">{{ pixelSample.hex }}</p>
          <p class="contrast-description">{{ pixelSample.rgb }} · {{ copy.result.sampledFromScreen }}</p>
        </div>
      </div>
      <div class="value-actions pixel-actions">
        <button class="value-button" @click="copyValue(pixelSample.hex)">
          {{ copied === pixelSample.hex ? 'Скопійовано' : copy.actions.copyHex }}
          <Copy :size="13" aria-hidden="true" />
        </button>
        <button class="value-button value-button-muted" @click="copyValue(pixelSample.rgb)">
          {{ copied === pixelSample.rgb ? 'Скопійовано' : copy.actions.copyRgb }}
          <Copy :size="13" aria-hidden="true" />
        </button>
      </div>
      <button class="full-width-button" @click="copyResult">
        <Copy :size="14" aria-hidden="true" />
        {{ copied ? copy.actions.copiedSample : copy.actions.copySample }}
      </button>
    </section>

    <section v-else-if="!error" class="empty-state">
      <div class="empty-icon"><Crosshair :size="22" aria-hidden="true" /></div>
      <h2>{{ copy.empty.title }}</h2>
      <p>{{ copy.empty.description }}</p>
    </section>

    <section
      v-if="inspectorStore.history.length"
      class="history-card"
      aria-labelledby="history-title"
    >
      <div class="section-heading">
        <h2 id="history-title">{{ copy.history.title }}</h2>
        <div class="history-actions">
          <button class="icon-button" :aria-label="copy.history.export" @click="exportHistory">
            <Download :size="14" aria-hidden="true" />
          </button>
          <button
            class="icon-button"
            :aria-label="copy.history.clear"
            @click="inspectorStore.clearHistory()"
          >
            <Trash2 :size="14" aria-hidden="true" />
          </button>
        </div>
      </div>
      <button
        v-for="item in inspectorStore.history"
        :key="item.id"
        class="history-item"
        @click="selectHistory(item.id)"
      >
        <span>
          <strong v-if="item.kind === 'element'"
            >&lt;{{ item.inspection.tagName.toLowerCase() }}&gt;</strong
          >
          <strong v-else>{{ item.sample.hex }}</strong>
            <small v-if="item.kind === 'element'">{{
            item.inspection.selector ?? copy.history.noSelector
          }}</small>
          <small v-else>{{ copy.history.pixelSample }} · {{ item.sample.rgb }}</small>
        </span>
        <span class="history-meta">
          {{ formatDate(item.capturedAt) }}
          <Trash2
            :size="13"
            aria-hidden="true"
            @click.stop="inspectorStore.removeInspection(item.id)"
          />
        </span>
      </button>
    </section>

    <footer class="app-footer">{{ copy.brand.footer }}</footer>
  </main>
</template>
