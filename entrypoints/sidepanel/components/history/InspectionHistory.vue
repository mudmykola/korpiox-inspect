<script setup lang="ts">
import { Download, Trash2 } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { InspectionHistoryItem } from '@/src/shared/messaging/contracts.ts';

defineProps<{ history: InspectionHistoryItem[]; copy: UiCopy }>();
defineEmits<{ select: [id: string]; export: []; clear: []; remove: [id: string] }>();

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
</script>

<template>
  <section v-if="history.length" class="history-card" aria-labelledby="history-title">
    <div class="section-heading">
      <h2 id="history-title">{{ copy.history.title }}</h2>
      <div class="history-actions">
        <button class="icon-button" :aria-label="copy.history.export" @click="$emit('export')">
          <Download :size="14" aria-hidden="true" /></button
        ><button class="icon-button" :aria-label="copy.history.clear" @click="$emit('clear')">
          <Trash2 :size="14" aria-hidden="true" />
        </button>
      </div>
    </div>
    <button
      v-for="item in history"
      :key="item.id"
      class="history-item"
      @click="$emit('select', item.id)"
    >
      <span
        ><strong v-if="item.kind === 'element'"
          >&lt;{{ item.inspection.tagName.toLowerCase() }}&gt;</strong
        ><strong v-else>{{ item.sample.hex }}</strong
        ><small v-if="item.kind === 'element'">{{
          item.inspection.selector ?? copy.history.noSelector
        }}</small
        ><small v-else>{{ copy.history.pixelSample }} · {{ item.sample.rgb }}</small></span
      >
      <span class="history-meta"
        >{{ formatDate(item.capturedAt)
        }}<Trash2 :size="13" aria-hidden="true" @click.stop="$emit('remove', item.id)"
      /></span>
    </button>
  </section>
</template>
