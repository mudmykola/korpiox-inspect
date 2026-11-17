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
    <SelectedElementCard :inspection="inspection" :copy="copy" />
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
      :copy="copy"
      @copy="$emit('copy-details')"
    />
    <BorderSides :entries="borderEntries" :copy="copy" />
  </section>
</template>
