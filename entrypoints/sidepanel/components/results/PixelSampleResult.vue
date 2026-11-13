<script setup lang="ts">
import { Copy } from 'lucide-vue-next';
import type { UiCopy } from '../../../../src/shared/i18n/uk';
import type { PixelSample } from '../../../../src/shared/messaging/contracts';

defineProps<{
  pixelSample: PixelSample;
  resultType: string;
  copied: string | null;
  copy: UiCopy;
}>();
defineEmits<{ 'copy-value': [value: string | null]; 'copy-result': [] }>();
</script>

<template>
  <section class="pixel-sample-card" aria-live="polite" aria-labelledby="pixel-result-title">
    <div class="section-heading">
      <div>
        <p class="section-kicker">{{ resultType }}</p>
        <h2 id="pixel-result-title">{{ copy.result.screenColor }}</h2>
      </div>
      <span class="contrast-badge contrast-aa">{{ copy.result.screenColor }}</span>
    </div>
    <div class="pixel-result">
      <span class="pixel-swatch" :style="{ backgroundColor: pixelSample.hex }" aria-hidden="true" />
      <div>
        <p class="contrast-value">{{ pixelSample.hex }}</p>
        <p class="contrast-description">
          {{ pixelSample.rgb }} · {{ copy.result.sampledFromScreen }}
        </p>
      </div>
    </div>
    <div class="value-actions pixel-actions">
      <button class="value-button" @click="$emit('copy-value', pixelSample.hex)">
        {{ copied === pixelSample.hex ? 'Скопійовано' : copy.actions.copyHex }}
        <Copy :size="13" aria-hidden="true" />
</button
      ><button
        class="value-button value-button-muted"
        @click="$emit('copy-value', pixelSample.rgb)"
      >
        {{ copied === pixelSample.rgb ? 'Скопійовано' : copy.actions.copyRgb }}
        <Copy :size="13" aria-hidden="true" />
      </button>
    </div>
    <button class="full-width-button" @click="$emit('copy-result')">
      <Copy :size="14" aria-hidden="true" />{{
        copied ? copy.actions.copiedSample : copy.actions.copySample
      }}
    </button>
  </section>
</template>
