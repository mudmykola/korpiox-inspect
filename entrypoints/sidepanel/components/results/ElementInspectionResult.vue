<script setup lang="ts">
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import type { ElementInspection } from '@/src/shared/messaging/contracts.ts';
import type { BorderEntry, ColorEntry } from '@/src/features/inspector/useInspectorController.ts';
import BorderSides from './element/BorderSides.vue';
import ColorValuesSection from './element/ComputedColorsSection.vue';
import ContrastCard from './element/ContrastCard.vue';
import DeveloperDetails from './element/DeveloperDetails.vue';
import InspectionHeader from './element/InspectionHeader.vue';
import SelectedElementCard from './element/SelectedElementCard.vue';

defineProps<{
  inspection: ElementInspection;
  resultType: string;
  colorEntries: ColorEntry[];
  borderEntries: BorderEntry[];
  contrastRatio: number | null;
  contrastLevel: string;
  contrastClass: string;
  copied: string | null;
  copy: UiCopy;
}>();
defineEmits<{
  'copy-value': [value: string | null];
  'copy-details': [];
  'copy-css': [value: string];
  'copy-result': [];
}>();
</script>

<template>
  <section class="inspection-stack" aria-live="polite" aria-labelledby="result-title">
    <InspectionHeader
      :result-type="resultType"
      :copied="copied === 'result'"
      :copy="copy"
      @copy="$emit('copy-result')"
    />
    <SelectedElementCard
      :inspection="inspection"
      :copied="Boolean(inspection.selector) && copied === inspection.selector"
      :copy="copy"
      @copy-selector="$emit('copy-value', $event)"
    />
    <ColorValuesSection
      :entries="colorEntries"
      :copied="copied"
      :copy="copy"
      @copy-value="$emit('copy-value', $event)"
    />
    <ContrastCard
      :ratio="contrastRatio"
      :level="contrastLevel"
      :class-name="contrastClass"
      :copy="copy"
    />
    <DeveloperDetails
      :inspection="inspection"
      :copied="copied === 'details'"
      :copied-css="copied === 'css'"
      :copy="copy"
      @copy="$emit('copy-details')"
      @copy-css="$emit('copy-css', $event)"
    />
    <BorderSides :entries="borderEntries" :copy="copy" />
  </section>
</template>
