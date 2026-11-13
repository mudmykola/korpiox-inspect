<script setup lang="ts">
import { History, ScanSearch } from 'lucide-vue-next';
import type { UiCopy } from '../../../src/shared/i18n/uk';

defineProps<{
  activeTab: 'inspect' | 'history';
  historyCount: number;
  copy: UiCopy;
}>();

defineEmits<{
  'update:activeTab': [tab: 'inspect' | 'history'];
}>();
</script>

<template>
  <nav class="panel-tabs" role="tablist" :aria-label="copy.brand.name">
    <button
      id="inspect-tab"
      class="panel-tab"
      :class="{ 'panel-tab-active': activeTab === 'inspect' }"
      :aria-selected="activeTab === 'inspect'"
      role="tab"
      @click="$emit('update:activeTab', 'inspect')"
    >
      <ScanSearch :size="14" aria-hidden="true" />
      {{ copy.navigation.inspector }}
    </button>
    <button
      id="history-tab"
      class="panel-tab"
      :class="{ 'panel-tab-active': activeTab === 'history' }"
      :aria-selected="activeTab === 'history'"
      role="tab"
      @click="$emit('update:activeTab', 'history')"
    >
      <History :size="14" aria-hidden="true" />
      {{ copy.navigation.history }}
      <span v-if="historyCount" class="panel-tab-count" :aria-label="copy.navigation.historyCount">
        {{ historyCount }}
      </span>
    </button>
  </nav>
</template>
