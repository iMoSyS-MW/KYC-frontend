<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()

const mergedClass = computed(() => cn('text-sm text-muted-foreground', props.class))
</script>

<template>
  <p :class="mergedClass">
    <slot />
  </p>
</template>
