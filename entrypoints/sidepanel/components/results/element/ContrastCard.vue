<script setup lang="ts">
import type { UiCopy } from '@/src/shared/i18n/uk.ts';

defineProps<{ ratio: number | null; level: string; className: string; copy: UiCopy }>();
</script>

<template>
  <section class="contrast-card" aria-labelledby="contrast-title">
    <div class="section-heading">
      <h2 id="contrast-title">{{ copy.result.contrast }}</h2>
      <span class="contrast-badge" :class="className">{{ level }}</span>
    </div>
    <div v-if="ratio !== null" class="contrast-value">{{ ratio.toFixed(2) }}:1</div>
    <p class="contrast-description">
      {{ ratio !== null ? copy.result.contrastDescription : copy.result.contrastRequiresSolid }}
    </p>
  </section>
</template>
