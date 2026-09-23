<script setup lang="ts">
import { computed } from 'vue'
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'
import { Check } from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { CheckboxProps } from './types'

const props = defineProps<CheckboxProps>()

const model = defineModel<boolean | 'indeterminate'>({ default: false })

const mergedClass = computed(() =>
  cn(
    'peer h-5 w-5 shrink-0 rounded border border-om-green ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-om-green data-[state=checked]:text-primary-foreground',
    props.class,
  ),
)
</script>

<template>
  <CheckboxRoot
    v-model="model"
    :class="mergedClass"
    :disabled="disabled"
    :id="id"
    :name="name"
    :required="required"
    :value="value"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Check class="h-4 w-4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
