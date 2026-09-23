<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroupItem, RadioGroupIndicator } from 'reka-ui'
import { Circle } from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { RadioGroupItemProps } from './types'

const props = defineProps<RadioGroupItemProps>()

const mergedClass = computed(() =>
  cn(
    'peer h-5 w-5 shrink-0 rounded-full border-2 border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-om-green',
    props.class,
  ),
)
</script>

<template>
  <RadioGroupItem
    :value="value"
    :class="mergedClass"
    :disabled="disabled"
    :id="id"
    :name="name"
    :required="required"
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <Circle class="h-2.5 w-2.5 fill-om-green text-om-green" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
