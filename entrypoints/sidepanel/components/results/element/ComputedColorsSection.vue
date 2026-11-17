<script setup lang="ts">
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ColorEntry } from '@/src/features/inspector/useInspectorController.ts';
import ColorValueCard from './ColorValueCard.vue';

defineProps<{ entries: ColorEntry[]; copied: string | null; copy: UiCopy }>();
defineEmits<{ 'copy-value': [value: string] }>();
</script>

<template>
  <section class="color-section" aria-labelledby="computed-colors-title">
    <div class="section-heading">
      <h2 id="computed-colors-title">{{ copy.result.computedColors }}</h2>
      <span class="section-count" aria-label="color values">{{ entries.length }}</span>
    </div>
    <div class="color-list">
      <ColorValueCard
        v-for="entry in entries"
        :key="entry.key"
        :entry="entry"
        :copied="copied"
        :copy="copy"
        @copy-value="$emit('copy-value', $event)"
      />
    </div>
  </section>
</template>
