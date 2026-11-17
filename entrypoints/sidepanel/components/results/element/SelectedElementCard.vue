<script setup lang="ts">
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ElementInspection } from '@/src/shared/messaging/contracts.ts';

defineProps<{ inspection: ElementInspection; copy: UiCopy }>();
</script>

<template>
  <div class="element-card">
    <p class="section-kicker">{{ copy.result.selectedElement }}</p>
    <p class="element-tag">&lt;{{ inspection.tagName.toLowerCase() }}&gt;</p>
    <p v-if="inspection.selector" class="selector-text" :title="inspection.selector">
      {{ inspection.selector }}
    </p>
  </div>
</template>
