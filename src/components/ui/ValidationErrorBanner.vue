<script setup lang="ts">
import { CircleAlert, X } from '@lucide/vue'
import type { ValidationErrorBannerProps } from './types'

defineProps<ValidationErrorBannerProps>()

const emit = defineEmits<{
  goToStep: []
  dismiss: []
}>()
</script>

<template>
  <div class="mb-4 rounded-xl border border-om-error/30 bg-om-error/5 p-4">
    <div class="flex items-start gap-3">
      <CircleAlert class="h-5 w-5 shrink-0 text-om-error mt-0.5" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-om-error">{{ message }}</p>
        <button
          v-if="stepName"
          type="button"
          class="mt-1 text-sm font-semibold text-om-error underline underline-offset-2 hover:text-om-error/80 transition-colors"
          @click="emit('goToStep')"
        >
          Go to {{ stepName }}
        </button>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg p-1 text-om-error/60 hover:text-om-error hover:bg-om-error/10 transition-colors"
        aria-label="Dismiss"
        @click="emit('dismiss')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
