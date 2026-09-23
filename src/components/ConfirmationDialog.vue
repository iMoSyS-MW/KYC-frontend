<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { Info, CircleCheckBig, TriangleAlert, CircleAlert, X } from '@lucide/vue'
import type { Component } from 'vue'
import type { ConfirmationTone } from '@/plugins/confirm'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: ConfirmationTone
    hideCancel?: boolean
  }>(),
  {
    title: 'Please confirm',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    tone: 'warning',
    hideCancel: false,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

interface ToneConfig {
  accent: string
  soft: string
  border: string
  icon: Component
  iconColor: string
  buttonGradient: string
}

const toneConfig: Record<ConfirmationTone, ToneConfig> = {
  primary: {
    accent: 'bg-om-green/5',
    soft: 'bg-om-green/5',
    border: 'border-om-green/20',
    icon: Info,
    iconColor: 'text-om-green',
    buttonGradient: 'linear-gradient(135deg, #009979 0%, #3F9339 100%)',
  },
  success: {
    accent: 'bg-om-green/5',
    soft: 'bg-om-green/5',
    border: 'border-om-green/20',
    icon: CircleCheckBig,
    iconColor: 'text-om-green',
    buttonGradient: 'linear-gradient(135deg, #009979 0%, #3F9339 100%)',
  },
  warning: {
    accent: 'bg-amber-50',
    soft: 'bg-amber-50',
    border: 'border-amber-200',
    icon: TriangleAlert,
    iconColor: 'text-om-warning',
    buttonGradient: 'linear-gradient(135deg, #b73514 0%, #d94a1e 100%)',
  },
  danger: {
    accent: 'bg-om-error/5',
    soft: 'bg-om-error/5',
    border: 'border-om-error/20',
    icon: CircleAlert,
    iconColor: 'text-om-error',
    buttonGradient: 'linear-gradient(135deg, #ca0027 0%, #e0002f 100%)',
  },
}

const currentTone = computed(() => toneConfig[props.tone] || toneConfig.warning)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('cancel')
}

function lockBody() {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
}

function unlockBody() {
  document.body.style.overflow = previousOverflow
  document.removeEventListener('keydown', handleKeydown)
}

let previousOverflow = ''

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) lockBody()
    else unlockBody()
  },
)

onMounted(() => {
  if (props.open) lockBody()
})

onUnmounted(unlockBody)
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
      @click="emit('cancel')"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-confirmation-dialog-title"
        class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border"
        :class="currentTone.border"
        @click.stop
      >
        <div
          class="flex items-center gap-3 border-b px-6 py-4"
          :class="[currentTone.border, currentTone.soft]"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full"
            :class="currentTone.accent"
          >
            <component :is="currentTone.icon" class="h-6 w-6" :class="currentTone.iconColor" />
          </div>
          <h3
            id="global-confirmation-dialog-title"
            class="m-0 flex-1 text-lg font-semibold text-gray-900"
          >
            {{ title }}
          </h3>
          <button
            type="button"
            class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
            @click="emit('cancel')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="px-6 py-5">
          <p class="m-0 text-sm leading-relaxed text-gray-600 whitespace-pre-line">{{ message }}</p>
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            v-if="!hideCancel"
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
            :style="{ background: currentTone.buttonGradient }"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
