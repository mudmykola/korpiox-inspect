<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ElementInspection } from '@/src/shared/messaging/contracts.ts';

defineProps<{ inspection: ElementInspection; copied: boolean; copy: UiCopy }>();
defineEmits<{ 'copy-selector': [value: string] }>();
</script>

<template>
  <div class="element-card">
    <p class="section-kicker">{{ copy.result.selectedElement }}</p>
    <p class="element-tag">&lt;{{ inspection.tagName.toLowerCase() }}&gt;</p>
    <div v-if="inspection.selector" class="selector-row">
      <p class="selector-text" :title="inspection.selector">{{ inspection.selector }}</p>
      <button
        class="selector-copy-button"
        :aria-label="copy.result.copySelector"
        @click="$emit('copy-selector', inspection.selector)"
      >
        <Check v-if="copied" :size="13" aria-hidden="true" />
        <Copy v-else :size="13" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
