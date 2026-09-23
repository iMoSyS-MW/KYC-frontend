<script setup lang="ts">
import { computed } from 'vue'
import { Label } from 'reka-ui'
import { cn } from '@/lib/utils'
import type { LabelProps } from './types'

const props = defineProps<LabelProps>()

const mergedClass = computed(() =>
  cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    props.class,
  ),
)
</script>

<template>
  <Label :for="props.for" :class="mergedClass">
    <slot />
  </Label>
</template>
