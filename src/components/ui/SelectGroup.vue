<script setup lang="ts">
import { SelectGroup } from 'reka-ui'

defineProps<{ class?: string }>()
</script>

<template>
  <SelectGroup :class="$props.class">
    <slot />
  </SelectGroup>
</template>
