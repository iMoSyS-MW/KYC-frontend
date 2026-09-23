<script setup lang="ts">
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'
import type { ButtonProps } from './types'

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default',
  asChild: false,
})

const mergedClass = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size, className: props.class })),
)
</script>

<template>
  <Primitive as="button" :as-child="asChild" :class="mergedClass">
    <slot />
  </Primitive>
</template>
