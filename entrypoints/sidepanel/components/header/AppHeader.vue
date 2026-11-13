<script setup lang="ts">
import type { UiCopy } from '@/src/shared/i18n/uk.ts';
import HeaderLogo from './HeaderLogo.vue';

defineProps<{ copy: UiCopy }>();
</script>

<template>
  <header class="app-header">
    <HeaderLogo :copy="copy" />
    <span class="privacy-pill">{{ copy.brand.privacy }}</span>
  </header>
</template>
