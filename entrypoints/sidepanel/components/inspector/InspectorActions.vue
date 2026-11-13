<script setup lang="ts">
import { Crosshair, RotateCcw, Square } from 'lucide-vue-next';
import type { UiCopy } from '../../../../src/shared/i18n/uk';
import type { InspectorState } from '../../../../src/features/inspector/useInspectorController';

defineProps<{ state: InspectorState; hasResult: boolean; copy: UiCopy }>();
defineEmits<{
  'pick-element': [];
  'stop-picking': [];
  'pick-pixel': [];
  'pick-again': [];
}>();
</script>

<template>
  <div class="action-stack">
    <button
      class="button button-primary"
      :disabled="state === 'picking'"
      @click="$emit('pick-element')"
    >
      <Crosshair :size="16" aria-hidden="true" />
      {{ state === 'picking' ? copy.actions.pickingElement : copy.actions.pickElement }}
    </button>
    <div class="action-row">
      <button
        v-if="state === 'picking'"
        class="button button-secondary"
        @click="$emit('stop-picking')"
      >
        <Square :size="15" aria-hidden="true" />
        {{ copy.actions.stopPicking }}
      </button>
      <button
        v-else
        class="button button-secondary"
        :disabled="state === 'pixel-picking'"
        @click="$emit('pick-pixel')"
      >
        <Crosshair :size="15" aria-hidden="true" />
        {{ state === 'pixel-picking' ? copy.actions.sampling : copy.actions.pickPixel }}
      </button>
      <button
        v-if="hasResult && state !== 'picking'"
        class="button button-quiet"
        @click="$emit('pick-again')"
      >
        <RotateCcw :size="15" aria-hidden="true" />
        {{ copy.actions.pickAgain }}
      </button>
    </div>
  </div>
</template>
