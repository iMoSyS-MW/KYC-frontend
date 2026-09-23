<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroupRoot } from 'reka-ui'
import type { AcceptableValue } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { RadioGroupProps } from './types'

const props = defineProps<RadioGroupProps>()

const model = defineModel<string | number>()

const mergedClass = computed(() => cn('grid gap-3', props.class))

function onUpdate(value: AcceptableValue) {
  if (typeof value === 'string' || typeof value === 'number') {
    model.value = value
  }
}
</script>

<template>
  <RadioGroupRoot
    :model-value="model"
    :class="mergedClass"
    :disabled="disabled"
    :name="name"
    :required="required"
    :orientation="orientation"
    :loop="loop"
    @update:model-value="onUpdate"
  >
    <slot />
  </RadioGroupRoot>
</template>
