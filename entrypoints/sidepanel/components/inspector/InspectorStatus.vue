<script setup lang="ts">
import { AlertCircle, Check, Crosshair } from 'lucide-vue-next';
import type { InspectorState } from '../../../../src/features/inspector/useInspectorController';

defineProps<{
  state: InspectorState;
  stateCopy: Record<InspectorState, { label: string; description: string }>;
}>();
</script>

<template>
  <section
    class="hero-card"
    aria-live="polite"
    :aria-busy="state === 'picking' || state === 'pixel-picking'"
  >
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
</template>
