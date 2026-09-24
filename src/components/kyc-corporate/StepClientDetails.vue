<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Label from '@/components/ui/Label.vue'
import Input from '@/components/ui/Input.vue'
import { Plus, X } from '@lucide/vue'
import {
  ErrorIcon,
  isRequired,
  requiredLabel,
  PRODUCTS,
  ID_DOCUMENT_OPTIONS,
  MAX_SCHEME_NUMBERS,
  type CorporateFormData,
  type StepProps,
} from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof CorporateFormData, value: any]
  fileChange: [field: string, files: FileList | null]
  productChange: [product: string, checked: boolean]
  addSchemeNumber: []
  updateSchemeNumber: [index: number, value: string]
  removeSchemeNumber: [index: number]
}>()

const productOptions = PRODUCTS.map((product) => ({
  code: product.code,
  label: product.label,
  fullLabel: product.label ? `${product.code} ${product.label}` : product.code,
}))

function onFileChange(field: string, files: FileList | null) {
  emit('fileChange', field, files)
}
</script>

<template>
  <div>
    <div class="mb-8">
      <FloatingInput
        id="organizationName"
        :label="requiredLabel('Organisation Name', 'organizationName')"
        :model-value="formData.organizationName"
        :error="!!errors.organizationName"
        :maxlength="200"
        @update:model-value="emit('inputChange', 'organizationName', $event)"
      >
        <template #label>
          Organisation Name
          <span v-if="isRequired('organizationName')" class="text-om-error">*</span>
        </template>
      </FloatingInput>
      <div v-if="errors.organizationName" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.organizationName }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <h3 class="text-base font-bold text-black mb-4">
        {{ requiredLabel('Products/Schemes', 'products') }}
        <span v-if="isRequired('products')" class="text-om-error">*</span>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="(product, idx) in productOptions" :key="idx" class="flex items-start gap-3">
          <Checkbox
            :id="`product-${idx}`"
            :model-value="formData.products.includes(product.fullLabel)"
            class="mt-0.5"
            @update:model-value="emit('productChange', product.fullLabel, $event === true)"
          />
          <Label :for="`product-${idx}`" class="cursor-pointer">
            <span class="text-sm font-semibold text-black block">{{ product.code }}</span>
            <span v-if="product.label" class="text-xs text-gray-500">{{ product.label }}</span>
          </Label>
        </div>
      </div>
      <div v-if="errors.products" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.products }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <h3 class="text-base font-bold text-black mb-1">
        {{ requiredLabel('Scheme Numbers/Investment Numbers/Policy Numbers', 'schemeNumbers') }}
        <span v-if="isRequired('schemeNumbers')" class="text-om-error">*</span>
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Add each scheme, investment, or policy number individually
      </p>

      <div
        v-for="(scheme, index) in formData.schemeNumbers"
        :key="index"
        class="flex items-center mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
      >
        <span class="font-bold text-gray-500 mr-2">#{{ index + 1 }}</span>
        <Input
          :model-value="scheme"
          placeholder="Enter scheme/investment/policy number"
          class="mr-2"
          :maxlength="50"
          @update:model-value="emit('updateSchemeNumber', index, String($event))"
        />
        <Button
          variant="destructive"
          size="sm"
          class="px-3 shrink-0"
          @click="emit('removeSchemeNumber', index)"
        >
          <X class="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      <Button
        class="w-full sm:w-auto bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
        :disabled="formData.schemeNumbers.length >= MAX_SCHEME_NUMBERS"
        @click="emit('addSchemeNumber')"
      >
        <Plus class="h-4 w-4 mr-2" />
        Add Scheme Number
      </Button>

      <div
        v-if="formData.schemeNumbers.length > 0"
        class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
      >
        <p class="text-sm text-gray-700">
          <strong>Summary:</strong>
          {{ formData.schemeNumbers.filter((s) => s.trim()).length }} scheme number(s) added
          <span
            v-if="formData.schemeNumbers.filter((s) => !s.trim()).length > 0"
            class="text-amber-700 ml-2"
          >
            ({{ formData.schemeNumbers.filter((s) => !s.trim()).length }} empty)
          </span>
        </p>
      </div>

      <div v-if="errors.schemeNumbers" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.schemeNumbers }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-4">
      <FloatingSelect
        :label="requiredLabel('Identification Document', 'identificationDocument')"
        :model-value="formData.identificationDocument"
        :error="!!errors.identificationDocument"
        @update:model-value="emit('inputChange', 'identificationDocument', $event ?? '')"
      >
        <template #label>
          Identification Document
          <span v-if="isRequired('identificationDocument')" class="text-om-error">*</span>
        </template>
        <SelectItem v-for="option in ID_DOCUMENT_OPTIONS" :key="option" :value="option">
          {{ option }}
        </SelectItem>
      </FloatingSelect>
      <div v-if="errors.identificationDocument" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.identificationDocument }}</p>
      </div>
    </div>

    <FileUploadArea
      label="identification document file"
      field="documents.identification"
      :error="errors.identificationFile"
      :file-selections="fileSelections"
      @file-change="onFileChange"
    />
  </div>
</template>
