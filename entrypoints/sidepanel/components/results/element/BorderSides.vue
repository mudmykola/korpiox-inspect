<script setup lang="ts">
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ColorValue } from '@/src/shared/messaging/contracts.ts';
import type { BorderEntry } from '@/src/features/inspector/useInspectorController.ts';

defineProps<{ entries: BorderEntry[]; copy: UiCopy }>();

function swatchStyle(color: ColorValue | null) {
  return color?.hex ? { backgroundColor: color.hex } : undefined;
}
</script>

<template>
  <details class="border-details">
    <summary>{{ copy.result.borderSides }}</summary>
    <div class="border-grid">
      <div v-for="entry in entries" :key="entry.key" class="border-item">
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
</template>
