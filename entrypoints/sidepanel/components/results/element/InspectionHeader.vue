<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';

defineProps<{ resultType: string; copied: boolean; copy: UiCopy }>();
defineEmits<{ copy: [] }>();
</script>

<template>
  <div class="result-heading">
    <div>
      <p class="section-kicker">{{ resultType }}</p>
      <h2 id="result-title">{{ copy.result.computedStyles }}</h2>
    </div>
    <button class="icon-button" :aria-label="copy.actions.copyJson" @click="$emit('copy')">
      <Check v-if="copied" :size="14" aria-hidden="true" />
      <Copy v-else :size="14" aria-hidden="true" />
    </button>
  </div>
</template>
