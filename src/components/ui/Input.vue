<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { InputProps } from './types'

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
})

const model = defineModel<string | number>({ default: '' })

const mergedClass = computed(() =>
  cn(
    'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class,
  ),
)

function onInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <input :type="type" :value="model" :class="mergedClass" @input="onInput" />
</template>
