<script setup lang="ts">
import Checkbox from '@/components/ui/Checkbox.vue'
import Label from '@/components/ui/Label.vue'
import {
  ErrorIcon,
  isRequired,
  requiredLabel,
  type CorporateFormData,
  type StepProps,
} from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof CorporateFormData, value: any]
}>()
</script>

<template>
  <div>
    <div class="space-y-4 mb-8">
      <p class="text-sm text-gray-800 leading-relaxed">
        We have read and can confirm that the information provided above is true and correct. We understand that any misrepresentation of facts affects lines of communication of our business with Old Mutual. We undertake to keep Old Mutual informed of any changes to be made in the future to the information provided.
      </p>
      <p class="text-sm text-gray-800 leading-relaxed">
        We further consent to Old Mutual sharing our Organization's information within Old Mutual's different business units in Malawi for internal business-related purposes only.
      </p>
      <p class="text-xs text-gray-500 leading-relaxed">
        (Please note that as our client, all your personal information is treated with strict confidentiality by all Old Mutual employees and Old Mutual is legally bound to protecting our clients information)
      </p>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <h3 class="text-base font-bold text-black mb-2">
        PEP Declaration
      </h3>
      <p class="text-xs text-gray-500 leading-relaxed mb-6">
        A politically exposed entity is an entity (domestic or foreign) which has been entrusted with a prominent public function such as public institutions, state owned corporations, governing bodies of political parties.
      </p>

      <div class="flex items-start gap-3 mb-6">
        <Checkbox
          id="pepDeclaration"
          :model-value="formData.pepDeclaration"
          class="mt-0.5"
          @update:model-value="emit('inputChange', 'pepDeclaration', $event === true)"
        />
        <Label
          for="pepDeclaration"
          class="text-sm text-gray-800 cursor-pointer leading-snug"
        >
          I confirm that this organization is not a Politically Exposed Entity
        </Label>
      </div>
    </div>

    <div class="flex items-start gap-3">
      <Checkbox
        id="declaration"
        :model-value="formData.declaration"
        class="mt-0.5"
        @update:model-value="emit('inputChange', 'declaration', $event === true)"
      />
      <Label for="declaration" class="text-sm text-gray-800 cursor-pointer leading-snug">
        {{ requiredLabel('I agree to the declaration and consent to the terms above', 'declaration') }}
        <span v-if="isRequired('declaration')" class="text-om-error">*</span>
      </Label>
    </div>
    <div v-if="errors.declaration" class="flex items-center gap-1.5 mt-2">
      <ErrorIcon class="h-4 w-4 shrink-0" />
      <p class="text-sm text-om-error font-medium">{{ errors.declaration }}</p>
    </div>
  </div>
</template>
