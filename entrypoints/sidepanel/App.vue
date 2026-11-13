<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './components/header/AppHeader.vue';
import EmptyState from './components/EmptyState.vue';
import PanelTabs from './components/PanelTabs.vue';
import ErrorCard from './components/inspector/ErrorCard.vue';
import InspectorActions from './components/inspector/InspectorActions.vue';
import InspectorStatus from './components/inspector/InspectorStatus.vue';
import InspectionHistory from './components/history/InspectionHistory.vue';
import HistoryEmptyState from './components/history/HistoryEmptyState.vue';
import ElementInspectionResult from './components/results/ElementInspectionResult.vue';
import PixelSampleResult from './components/results/PixelSampleResult.vue';
import { useInspectorController } from '@/src/features/inspector/useInspectorController.ts';

const {
  borderEntries,
  colorEntries,
  contrastClass,
  contrastLevel,
  contrastRatio,
  copied,
  copy,
  copyDetails,
  copyResult,
  copyValue,
  error,
  exportHistory,
  hasResult,
  inspection,
  inspectorStore,
  pixelSample,
  resultType,
  selectHistory,
  sendCommand,
  startPixelPicker,
  state,
  stateCopy,
} = useInspectorController();

const activeTab = ref<'inspect' | 'history'>('inspect');

function restoreHistoryItem(id: string) {
  selectHistory(id);
  activeTab.value = 'inspect';
}
</script>

<template>
  <main class="app-shell">
    <AppHeader :copy="copy" />
    <PanelTabs
      v-model:active-tab="activeTab"
      :history-count="inspectorStore.history.length"
      :copy="copy"
    />

    <section v-if="activeTab === 'inspect'" class="inspector-view" aria-labelledby="inspect-tab">
      <InspectorStatus :state="state" :state-copy="stateCopy" />
      <InspectorActions
        :state="state"
        :has-result="hasResult"
        :copy="copy"
        @pick-element="sendCommand('PICKER_START')"
        @stop-picking="sendCommand('PICKER_STOP')"
        @pick-pixel="startPixelPicker"
        @pick-again="sendCommand('PICKER_START')"
      />
      <ErrorCard v-if="error" :error="error" :copy="copy" @retry="sendCommand('PICKER_START')" />
      <ElementInspectionResult
        v-if="inspection"
        :inspection="inspection"
        :result-type="resultType"
        :color-entries="colorEntries"
        :border-entries="borderEntries"
        :contrast-ratio="contrastRatio"
        :contrast-level="contrastLevel"
        :contrast-class="contrastClass"
        :copied="copied"
        :copy="copy"
        @copy-value="copyValue"
        @copy-details="copyDetails"
        @copy-result="copyResult"
      />
      <PixelSampleResult
        v-if="pixelSample"
        :pixel-sample="pixelSample"
        :result-type="resultType"
        :copied="copied"
        :copy="copy"
        @copy-value="copyValue"
        @copy-result="copyResult"
      />
      <EmptyState v-else-if="!error" :copy="copy" />
    </section>

    <section v-else class="history-view" aria-labelledby="history-tab">
      <InspectionHistory
        :history="inspectorStore.history"
        :copy="copy"
        @select="restoreHistoryItem"
        @export="exportHistory"
        @clear="inspectorStore.clearHistory"
        @remove="inspectorStore.removeInspection"
      />
      <HistoryEmptyState v-if="!inspectorStore.history.length" :copy="copy" />
    </section>

    <footer class="app-footer">{{ copy.brand.footer }}</footer>
  </main>
</template>
