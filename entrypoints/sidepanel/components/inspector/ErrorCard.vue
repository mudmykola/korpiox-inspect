<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next';
import type { UiCopy } from '../../../../src/shared/i18n/uk';

defineProps<{ error: string; copy: UiCopy }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div role="alert" class="error-card">
    <AlertCircle :size="16" aria-hidden="true" />
    <div>
      <strong>{{ copy.error.title }}</strong>
      <p>{{ error }}</p>
      <button class="text-button" @click="$emit('retry')">{{ copy.actions.tryAgain }}</button>
    </div>
  </div>
</template>
