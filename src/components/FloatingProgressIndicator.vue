<script lang="ts">
export interface StepStatus {
  label: string
  completed: boolean
  percentage: number
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    steps: StepStatus[]
    overallProgress: number
    formType: string
  }>(),
  {
    steps: () => [],
    overallProgress: 0,
    formType: '',
  },
)

const emit = defineEmits<{
  close: []
}>()

function getProgressColor(percentage: number) {
  if (percentage === 100) return '#4caf50'
  if (percentage >= 75) return '#8bc34a'
  if (percentage >= 50) return '#ff9800'
  if (percentage >= 25) return '#ff5722'
  return '#f44336'
}

const incompleteSteps = computed(() =>
  props.steps
    .filter((step) => !step.completed)
    .map((step) => step.label)
    .join(', '),
)

const barColor = computed(() => getProgressColor(props.overallProgress))
const roundedProgress = computed(() => Math.round(props.overallProgress))
</script>

<template>
  <div
    class="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] z-[1000] rounded-xl border-2 border-[#4caf50] shadow-[0_4px_20px_rgba(76,175,80,0.3)]"
    :style="{
      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
    }"
  >
    <div class="p-3">
      <div class="mb-2">
        <div class="h-1.5 rounded-full bg-gray-300 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{
              width: `${overallProgress}%`,
              backgroundColor: barColor,
            }"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-gray-800">
          {{ formType }} KYC: {{ roundedProgress }}% complete
          <span v-if="incompleteSteps" class="text-gray-600 ml-2">
            &bull; Incomplete: {{ incompleteSteps }}
          </span>
        </p>

        <button
          type="button"
          class="text-gray-500 hover:text-gray-800 hover:bg-black/5 rounded-full p-1 transition-colors"
          aria-label="Close progress indicator"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
