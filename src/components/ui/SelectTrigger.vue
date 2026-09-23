<script setup lang="ts">
import { computed } from 'vue'
import { SelectTrigger, SelectIcon } from 'reka-ui'
import { ChevronDown, CircleAlert } from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { SelectTriggerProps } from './types'

const props = withDefaults(defineProps<SelectTriggerProps>(), {
  error: false,
})

const mergedClass = computed(() =>
  cn(
    'group flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    props.error
      ? 'border-om-error focus:ring-om-error/30'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 data-[state=open]:border-om-green data-[state=open]:ring-0',
    props.class,
  ),
)
</script>

<template>
  <SelectTrigger :class="mergedClass" :disabled="disabled">
    <slot />
    <div class="flex items-center gap-1.5">
      <slot v-if="error" name="errorIcon">
        <CircleAlert class="h-4 w-4 shrink-0 fill-om-error text-white" />
      </slot>
      <SelectIcon as-child>
        <ChevronDown
          class="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </SelectIcon>
    </div>
  </SelectTrigger>
</template>
