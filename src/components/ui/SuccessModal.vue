<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { CircleCheckBig, X } from '@lucide/vue'
import type { SuccessModalProps } from './types'

const props = withDefaults(defineProps<SuccessModalProps>(), {
  title: 'Submission Successful',
})

const emit = defineEmits<{
  close: []
}>()

function onClose() {
  emit('close')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    onClose()
  }
}

let previousOverflow = ''

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  },
)

onMounted(() => {
  if (props.open) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = previousOverflow
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[2500] flex items-center justify-center p-4"
      :style="{
        backgroundColor: 'rgba(15, 23, 42, 0.58)',
        backdropFilter: 'blur(4px)',
      }"
      @click="onClose"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center gap-3 border-b border-om-green/20 bg-om-green/5 px-6 py-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-om-green/10">
            <CircleCheckBig class="h-6 w-6 text-om-green" />
          </div>
          <h3 id="success-modal-title" class="m-0 text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
          <button
            class="ml-auto rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
            @click="onClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="px-6 py-5">
          <p class="m-0 text-sm leading-relaxed text-gray-600">{{ message }}</p>
        </div>

        <div class="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            :style="{
              background: 'linear-gradient(135deg, #009979 0%, #3F9339 100%)',
            }"
            @click="onClose"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
