<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';
import type { UiCopy } from '../../../../src/shared/i18n/uk';
import type { ColorValue, ElementInspection } from '../../../../src/shared/messaging/contracts';
import type {
  BorderEntry,
  ColorEntry,
} from '../../../../src/features/inspector/useInspectorController';

defineProps<{
  inspection: ElementInspection;
  resultType: string;
  colorEntries: ColorEntry[];
  borderEntries: BorderEntry[];
  contrastRatio: number | null;
  contrastLevel: string;
  contrastClass: string;
  copied: string | null;
  copy: UiCopy;
}>();
defineEmits<{
  'copy-value': [value: string | null];
  'copy-details': [];
  'copy-result': [];
}>();

function swatchStyle(color: ColorValue | null) {
  return color?.hex ? { backgroundColor: color.hex } : undefined;
}
</script>

<template>
  <section class="inspection-stack" aria-live="polite" aria-labelledby="result-title">
    <div class="result-heading">
      <div>
        <p class="section-kicker">{{ resultType }}</p>
        <h2 id="result-title">{{ copy.result.computedStyles }}</h2>
      </div>
      <button class="icon-button" :aria-label="copy.actions.copyJson" @click="$emit('copy-result')">
        <Check v-if="copied" :size="14" aria-hidden="true" /><Copy
          v-else
          :size="14"
          aria-hidden="true"
        />
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
          <span>{{ copy.result.tag }}</span><code
            >&lt;{{ inspection.tagName.toLowerCase() }}&gt;</code
          >
        </div>
        <div class="detail-row">
          <span>{{ copy.result.id }}</span><code>{{ inspection.details.id ?? '—' }}</code>
        </div>
        <div class="detail-row detail-row-stack">
          <span>{{ copy.result.classes }}</span><code>{{
            inspection.details.classes.length ? `.${inspection.details.classes.join(' .')}` : '—'
          }}</code>
        </div>
        <div v-for="(value, name) in inspection.details.attributes" :key="name" class="detail-row">
          <span>{{ name }}</span><code>{{ value }}</code>
        </div>
        <div
          v-for="(value, name) in inspection.details.dataAttributes"
          :key="name"
          class="detail-row"
        >
          <span>{{ name }}</span><code>{{ value }}</code>
        </div>
        <div
          v-for="(value, name) in inspection.details.ariaAttributes"
          :key="name"
          class="detail-row"
        >
          <span>{{ name }}</span><code>{{ value }}</code>
        </div>
      </div>
      <button class="full-width-button" @click="$emit('copy-details')">
        <Copy :size="14" aria-hidden="true" />{{
          copied ? copy.actions.copiedDetails : copy.actions.copyDetails
        }}
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
              @click="$emit('copy-value', entry.color.hex)"
            >
              {{ copied === entry.color.hex ? 'Скопійовано' : entry.color.hex }}
              <Copy :size="13" aria-hidden="true" />
            </button>
            <button
              v-if="entry.color.rgb"
              class="value-button value-button-muted"
              :aria-label="`Копіювати ${entry.label} RGB`"
              @click="$emit('copy-value', entry.color.rgb)"
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
        {{ contrastRatio ? copy.result.contrastDescription : copy.result.contrastRequiresSolid }}
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
          /><span>{{ entry.label }}</span
          ><code>{{ entry.color?.hex ?? entry.color?.raw ?? '—' }}</code>
        </div>
      </div>
    </details>
  </section>
</template>
