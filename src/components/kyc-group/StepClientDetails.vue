<script setup lang="ts">
import Input from '@/components/ui/Input.vue'
import FloatingInput from '@/components/ui/FloatingInput.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Label from '@/components/ui/Label.vue'
import { Plus, X } from '@lucide/vue'
import ErrorIcon from './ErrorIcon.vue'
import { PRODUCTS, isRequired } from './interfaces'
import type { GroupFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof GroupFormData, value: unknown]
  productChange: [product: string, checked: boolean]
  addSchemeNumber: []
  updateSchemeNumber: [index: number, value: string]
  removeSchemeNumber: [index: number]
}>()

function productFullLabel(product: { code: string; label: string }): string {
  return product.label ? `${product.code} ${product.label}` : product.code
}

function onGroupNameInput(value: string | number) {
  emit('inputChange', 'groupName', value)
}

function onProductCheckedChange(
  product: { code: string; label: string },
  checked: boolean | 'indeterminate',
) {
  emit('productChange', productFullLabel(product), Boolean(checked))
}

function onSchemeInput(index: number, value: string | number) {
  emit('updateSchemeNumber', index, String(value))
}
</script>

<template>
  <div>
    <div class="mb-8">
      <FloatingInput
        id="groupName"
        label="Group Name"
        :model-value="formData.groupName"
        :error="!!errors.groupName"
        :maxlength="200"
        @update:model-value="onGroupNameInput"
      >
        <template #label>Group Name <span v-if="isRequired('groupName')" class="text-om-error">*</span></template>
      </FloatingInput>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <h3 class="text-sm lg:text-base font-bold text-black mb-4">
        <template v-if="isRequired('products')">Products/Schemes (select at least one) <span class="text-om-error">*</span></template>
        <template v-else>Products/Schemes (select at least one)</template>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="(product, idx) in PRODUCTS" :key="idx" class="flex items-start gap-3">
          <Checkbox
            :id="`product-${idx}`"
            :model-value="formData.products.includes(productFullLabel(product))"
            class="mt-0.5"
            @update:model-value="onProductCheckedChange(product, $event)"
          />
          <Label :for="`product-${idx}`" class="cursor-pointer">
            <span class="text-sm font-semibold text-black block">{{ product.code }}</span>
            <span v-if="product.label" class="text-xs text-gray-500">{{ product.label }}</span>
          </Label>
        </div>
      </div>
      <div v-if="errors.products" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon />
        <p class="text-sm text-om-error font-medium">{{ errors.products }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 pt-8">
      <h3 class="text-sm lg:text-base font-bold text-black mb-1">
        <template v-if="isRequired('schemeNumbers')">Scheme Numbers/Investment Numbers/Policy Numbers <span class="text-om-error">*</span></template>
        <template v-else>Scheme Numbers/Investment Numbers/Policy Numbers</template>
      </h3>
      <p class="text-sm text-gray-500 mb-6">
        Add each scheme, investment, or policy number individually
      </p>

      <div
        v-for="(scheme, index) in formData.schemeNumbers"
        :key="index"
        class="flex items-center mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
      >
        <span class="font-bold text-gray-500 mr-2">
          #{{ index + 1 }}
        </span>
        <Input
          :model-value="scheme"
          placeholder="Enter scheme/investment/policy number"
          class="mr-2"
          :maxlength="50"
          @update:model-value="onSchemeInput(index, $event)"
        />
        <Button
          variant="destructive"
          size="sm"
          class="px-3"
          @click="emit('removeSchemeNumber', index)"
        >
          <X class="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      <Button
        class="w-full sm:w-auto mt-2 bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
        @click="emit('addSchemeNumber')"
      >
        <Plus class="h-4 w-4 mr-2" />
        Add Scheme Number
      </Button>

      <div v-if="errors.schemeNumbers" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon />
        <p class="text-sm text-om-error font-medium">{{ errors.schemeNumbers }}</p>
      </div>
    </div>
  </div>
</template>
