<script setup lang="ts">
import { SelectRoot } from 'reka-ui'
import type { SelectProps } from './types'

defineProps<SelectProps>()

const model = defineModel<string>()
const openModel = defineModel<boolean>('open')

function onUpdateModel(value: string) {
  model.value = value
}

function onUpdateOpen(value: boolean) {
  openModel.value = value
}
</script>

<template>
  <SelectRoot
    :model-value="model"
    :default-value="defaultValue"
    :open="openModel"
    :default-open="defaultOpen"
    :disabled="disabled"
    :name="name"
    :required="required"
    :autocomplete="autocomplete"
    :dir="dir"
    @update:model-value="onUpdateModel"
    @update:open="onUpdateOpen"
  >
    <slot />
  </SelectRoot>
</template>
