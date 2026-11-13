<script setup lang="ts">
import { History } from 'lucide-vue-next';
import type { UiCopy } from '../../../../src/shared/i18n/uk';

defineProps<{ copy: UiCopy }>();
</script>

<template>
  <section class="empty-state empty-history-state">
    <div class="empty-icon"><History :size="22" aria-hidden="true" /></div>
    <h2>{{ copy.empty.historyTitle }}</h2>
    <p>{{ copy.empty.historyDescription }}</p>
  </section>
</template>
