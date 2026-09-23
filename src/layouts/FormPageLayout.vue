<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import ValidationErrorBanner from '@/components/ui/ValidationErrorBanner.vue'

const props = withDefaults(
  defineProps<{
    title: string
    activeStep: number
    totalSteps: number
    stepLabels: string[]
    isLastStep: boolean
    isSubmitting: boolean
    nextDisabled?: boolean
    validationError?: string
    validationErrorStep?: number
    validationErrorStepLabel?: string
  }>(),
  {
    nextDisabled: false,
    validationError: undefined,
    validationErrorStep: undefined,
    validationErrorStepLabel: undefined,
  },
)

const emit = defineEmits<{
  previous: []
  next: []
  submit: []
  goToStep: [step: number]
  dismissError: []
}>()

function handleGoToStep() {
  if (props.validationErrorStep !== undefined) {
    emit('goToStep', props.validationErrorStep)
  }
}
</script>

<template>
  <div
    class="min-h-screen pb-24"
    style="
      background-image: url(/background.png);
      background-size: cover;
      background-position: center;
      background-repeat: repeat;
    "
  >
    <div class="bg-white">
      <div class="max-w-[900px] mx-auto px-4 pt-10 pb-6">
        <div class="mb-3">
          <div class="flex gap-1 mb-3">
            <div
              v-for="index in totalSteps"
              :key="index"
              class="flex-1 h-1 rounded-full transition-colors duration-300"
              :class="index - 1 <= activeStep ? 'bg-om-green' : 'bg-om-tertiary'"
            />
          </div>
          <p class="text-xs lg:text-sm text-gray-500 font-medium">
            Step {{ activeStep + 1 }} of {{ totalSteps }}
          </p>
        </div>

        <h2 class="text-xl sm:text-3xl font-bold text-black mb-0 font-montserrat">
          {{ title }}
        </h2>
      </div>
    </div>

    <div class="max-w-[900px] mx-auto px-4 pt-8">
      <ValidationErrorBanner
        v-if="validationError"
        :message="validationError"
        :step-name="validationErrorStepLabel"
        @go-to-step="handleGoToStep"
        @dismiss="emit('dismissError')"
      />

      <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6 md:p-10">
        <slot />

        <div class="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            class="px-6"
            :disabled="activeStep === 0"
            @click="emit('previous')"
          >
            Previous
          </Button>

          <Button
            v-if="isLastStep"
            class="px-8 bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
            :disabled="isSubmitting || nextDisabled"
            @click="emit('submit')"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit KYC' }}
          </Button>
          <Button
            v-else
            class="px-8 bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
            :disabled="nextDisabled"
            @click="emit('next')"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
