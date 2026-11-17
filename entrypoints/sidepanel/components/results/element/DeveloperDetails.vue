<script setup lang="ts">
import { Copy } from 'lucide-vue-next';
import { computed } from 'vue';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ElementInspection } from '@/src/shared/messaging/contracts.ts';

const props = defineProps<{
  inspection: ElementInspection;
  copied: boolean;
  copiedCss: boolean;
  copy: UiCopy;
}>();
defineEmits<{ copy: []; 'copy-css': [value: string] }>();

function cssValue(value: { hex: string | null; raw: string } | null) {
  return value?.hex ?? value?.raw ?? 'transparent';
}

const cssSnippet = computed(() => {
  const { inspection } = props;
  return [
    `color: ${cssValue(inspection.colors.text)};`,
    `background-color: ${cssValue(inspection.colors.background)};`,
    `border-top-color: ${cssValue(inspection.borderSides.top)};`,
    `border-right-color: ${cssValue(inspection.borderSides.right)};`,
    `border-bottom-color: ${cssValue(inspection.borderSides.bottom)};`,
    `border-left-color: ${cssValue(inspection.borderSides.left)};`,
  ].join('\n');
});
</script>

<template>
  <details class="details-card">
    <summary>{{ copy.result.developerDetails }}</summary>
    <div class="details-list">
      <p class="detail-group-title">Основне</p>
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
      <p class="detail-group-title">Атрибути</p>
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
    <button class="full-width-button secondary-button" @click="$emit('copy-css', cssSnippet)">
      <Copy :size="14" aria-hidden="true" />
      {{ copiedCss ? copy.actions.copiedCss : copy.actions.copyCss }}
    </button>
  </details>
</template>
