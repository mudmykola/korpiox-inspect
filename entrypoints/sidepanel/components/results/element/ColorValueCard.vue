<script setup lang="ts">
import { Copy } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ColorValue } from '@/src/shared/messaging/contracts.ts';
import type { ColorEntry } from '@/src/features/inspector/useInspectorController.ts';
import { hexToHsl } from '@/src/shared/color/format.ts';

defineProps<{ entry: ColorEntry; copied: string | null; copy: UiCopy }>();
defineEmits<{ 'copy-value': [value: string] }>();

function swatchStyle(color: ColorValue | null) {
  return color?.hex ? { backgroundColor: color.hex } : undefined;
}
</script>

<template>
  <article class="color-card">
    <span
      class="swatch"
      :class="{ 'swatch-empty': !entry.color?.hex }"
      :style="swatchStyle(entry.color)"
      aria-hidden="true"
    />
    <div class="color-main">
      <p class="color-name">{{ entry.label }}</p>
      <p class="color-raw">{{ entry.color?.raw ?? copy.result.unavailable }}</p>
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
    <details v-if="entry.color?.hex" class="color-formats">
      <summary>{{ copy.result.formats }}</summary>
      <code>{{ copy.result.hsl }}: {{ hexToHsl(entry.color.hex) }}</code>
    </details>
    <span v-else class="value-muted">{{ copy.result.transparent }}</span>
  </article>
</template>
