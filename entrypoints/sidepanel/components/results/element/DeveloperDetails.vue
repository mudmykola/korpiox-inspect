<script setup lang="ts">
import { Copy } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ElementInspection } from '@/src/shared/messaging/contracts.ts';

defineProps<{ inspection: ElementInspection; copied: boolean; copy: UiCopy }>();
defineEmits<{ copy: [] }>();
</script>

<template>
  <details class="details-card">
    <summary>{{ copy.result.developerDetails }}</summary>
    <div class="details-list">
      <div class="detail-row">
        <span>{{ copy.result.tag }}</span>
        <code>&lt;{{ inspection.tagName.toLowerCase() }}&gt;</code>
      </div>
      <div class="detail-row">
        <span>{{ copy.result.id }}</span>
        <code>{{ inspection.details.id ?? '—' }}</code>
      </div>
      <div class="detail-row detail-row-stack">
        <span>{{ copy.result.classes }}</span>
        <code>{{
          inspection.details.classes.length ? `.${inspection.details.classes.join(' .')}` : '—'
        }}</code>
      </div>
      <div
        v-for="(value, name) in inspection.details.attributes"
        :key="`attribute-${name}`"
        class="detail-row"
      >
        <span>{{ name }}</span>
        <code>{{ value }}</code>
      </div>
      <div
        v-for="(value, name) in inspection.details.dataAttributes"
        :key="`data-${name}`"
        class="detail-row"
      >
        <span>{{ name }}</span>
        <code>{{ value }}</code>
      </div>
      <div
        v-for="(value, name) in inspection.details.ariaAttributes"
        :key="`aria-${name}`"
        class="detail-row"
      >
        <span>{{ name }}</span>
        <code>{{ value }}</code>
      </div>
    </div>
    <button class="full-width-button" @click="$emit('copy')">
      <Copy :size="14" aria-hidden="true" />
      {{ copied ? copy.actions.copiedDetails : copy.actions.copyDetails }}
    </button>
  </details>
</template>
