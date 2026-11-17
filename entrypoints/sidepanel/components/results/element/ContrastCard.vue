<script setup lang="ts">
import { computed } from 'vue';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';

const props = defineProps<{
  ratio: number | null;
  level: string;
  className: string;
  copy: UiCopy;
}>();
const levelLabel = computed(() => {
  const labels: Record<string, string> = {
    AAA: props.copy.result.contrastAAA,
    AA: props.copy.result.contrastAA,
    'AA Large': props.copy.result.contrastAALarge,
    Fail: props.copy.result.contrastFail,
    Unavailable: props.copy.result.contrastUnavailable,
  };
  return labels[props.level] ?? props.level;
});
</script>

<template>
  <section class="contrast-card" aria-labelledby="contrast-title">
    <div class="section-heading">
      <h2 id="contrast-title">{{ copy.result.contrast }}</h2>
      <span class="contrast-badge" :class="className">{{ levelLabel }}</span>
    </div>
    <div v-if="ratio !== null" class="contrast-value">{{ ratio.toFixed(2) }}:1</div>
    <p class="contrast-description">
      {{ ratio !== null ? copy.result.contrastDescription : copy.result.contrastRequiresSolid }}
    </p>
  </section>
</template>
