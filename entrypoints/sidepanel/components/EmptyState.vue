<script setup lang="ts">
import { Crosshair } from 'lucide-vue-next';
import type { UiCopy } from '@/src/shared/i18n/uk.ts';

defineProps<{ copy: UiCopy }>();
</script>

<template>
  <section class="empty-state">
    <div class="empty-icon"><Crosshair :size="22" aria-hidden="true" /></div>
    <h2>{{ copy.empty.title }}</h2>
    <p>{{ copy.empty.description }}</p>
  </section>
</template>
