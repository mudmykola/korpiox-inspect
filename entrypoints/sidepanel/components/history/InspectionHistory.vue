<script setup lang="ts">
import { computed, ref } from 'vue';
import { Download, Trash2 } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { InspectionHistoryItem } from '@/src/shared/messaging/contracts.ts';

const props = defineProps<{ history: InspectionHistoryItem[]; copy: UiCopy }>();
defineEmits<{ select: [id: string]; export: []; clear: []; remove: [id: string] }>();

const query = ref('');
const kind = ref<'all' | 'element' | 'pixel'>('all');
const filteredHistory = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase();
  return props.history.filter((item) => {
    if (kind.value !== 'all' && item.kind !== kind.value) return false;
    if (!normalizedQuery) return true;
    const searchable =
      item.kind === 'element'
        ? [
            item.inspection.tagName,
            item.inspection.selector ?? '',
            item.inspection.details.id ?? '',
            ...item.inspection.details.classes,
          ]
        : [item.sample.hex, item.sample.rgb];
    return searchable.some((value) => value.toLowerCase().includes(normalizedQuery));
  });
});

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
          <Download :size="14" aria-hidden="true" />
        </button>
        <button class="icon-button" :aria-label="copy.history.clear" @click="$emit('clear')">
          <Trash2 :size="14" aria-hidden="true" />
        </button>
      </div>
    </div>
    <div class="history-filters">
      <input v-model="query" class="history-search" :placeholder="copy.history.searchPlaceholder" />
      <select v-model="kind" class="history-filter" :aria-label="copy.history.filterKind">
        <option value="all">{{ copy.history.all }}</option>
        <option value="element">{{ copy.history.elementKind }}</option>
        <option value="pixel">{{ copy.history.pixelSample }}</option>
      </select>
    </div>
    <button
      v-for="item in filteredHistory"
      :key="item.id"
      class="history-item"
      @click="$emit('select', item.id)"
    >
      <span
        ><small class="history-kind">{{
          item.kind === 'element' ? copy.history.elementKind : copy.history.pixelSample
        }}</small
        ><strong v-if="item.kind === 'element'"
          >&lt;{{ item.inspection.tagName.toLowerCase() }}&gt;</strong
        ><strong v-else>{{ item.sample.hex }}</strong
        ><small v-if="item.kind === 'element'">{{
          item.inspection.selector ?? copy.history.noSelector
        }}</small
        ><small v-else>{{ item.sample.rgb }}</small></span
      >
      <span class="history-meta"
        >{{ formatDate(item.capturedAt)
        }}<Trash2 :size="13" aria-hidden="true" @click.stop="$emit('remove', item.id)"
      /></span>
    </button>
    <p v-if="!filteredHistory.length" class="history-filter-empty">Нічого не знайдено.</p>
  </section>
</template>
