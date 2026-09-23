<script setup lang="ts">
import { SelectValue } from 'reka-ui'
import type { SelectValueProps } from './types'

withDefaults(defineProps<SelectValueProps>(), {
  placeholder: '',
})
</script>

<template>
  <SelectValue :placeholder="placeholder" :class="$props.class">
    <template v-if="$slots.default" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </SelectValue>
</template>
