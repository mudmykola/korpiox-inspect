<script setup lang="ts">
import type { UiCopy } from '../../../../src/shared/i18n/uk';

defineProps<{ copy: UiCopy }>();
</script>

<template>
  <div class="brand-lockup">
    <img class="brand-mark" src="/icons/icon-32.png" alt="" />
    <div>
      <p class="eyebrow">{{ copy.brand.eyebrow }}</p>
      <h1>{{ copy.brand.name }}</h1>
    </div>
  </div>
</template>
