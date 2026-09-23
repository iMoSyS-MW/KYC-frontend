<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()

const mergedClass = computed(() =>
  cn('rounded-xl border bg-card text-card-foreground shadow-sm', props.class),
)
</script>

<template>
  <div :class="mergedClass">
    <slot />
  </div>
</template>
