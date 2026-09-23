<script setup lang="ts">
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import Label from '@/components/ui/Label.vue'
import ErrorIcon from '@/components/kyc-group/ErrorIcon.vue'
import { isRequired, requiredLabel } from './interfaces'
import type { IndividualFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof IndividualFormData, value: unknown]
}>()
</script>

<template>
  <div>
    <div class="space-y-4 mb-8">
      <p class="text-sm text-gray-800 leading-relaxed">
        We have read and can confirm that the information provided above is true and correct. We understand that any misrepresentation of facts affects lines of communication of our business with Old Mutual. We undertake to keep Old Mutual informed of any changes to be made in the future to the information provided.
      </p>
      <p class="text-sm text-gray-800 leading-relaxed">
        We further consent to Old Mutual sharing our information within Old Mutual's different business units in Malawi for internal business-related purposes only.
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
        A politically exposed person is an individual (domestic or foreign) who has been entrusted with a prominent public function such as public institutions, state owned corporations, governing bodies of political parties.
      </p>

      <div class="mb-6">
        <Label class="text-sm font-bold text-black mb-3 block">
          {{ requiredLabel('I am a politically exposed person (PEP)', 'isPEP') }}
          <span v-if="isRequired('isPEP')" class="text-om-error">*</span>
        </Label>
        <RadioGroup
          :model-value="formData.isPEP"
          class="flex flex-col gap-3"
          @update:model-value="emit('inputChange', 'isPEP', $event)"
        >
          <div class="flex items-center gap-3">
            <RadioGroupItem id="pep-yes" value="YES" />
            <Label for="pep-yes" class="cursor-pointer text-sm">
              YES
            </Label>
          </div>
          <div class="flex items-center gap-3">
            <RadioGroupItem id="pep-no" value="NO" />
            <Label for="pep-no" class="cursor-pointer text-sm">
              NO
            </Label>
          </div>
        </RadioGroup>
        <div v-if="errors.isPEP" class="flex items-center gap-1.5 mt-2">
          <ErrorIcon class="h-4 w-4 shrink-0" />
          <p class="text-sm text-om-error font-medium">{{ errors.isPEP }}</p>
        </div>
      </div>

      <div>
        <Label class="text-sm font-bold text-black mb-3 block">
          {{ requiredLabel('I am related to a politically exposed person (PEP)', 'relatedToPEP') }}
          <span v-if="isRequired('relatedToPEP')" class="text-om-error">*</span>
        </Label>
        <RadioGroup
          :model-value="formData.relatedToPEP"
          class="flex flex-col gap-3"
          @update:model-value="emit('inputChange', 'relatedToPEP', $event)"
        >
          <div class="flex items-center gap-3">
            <RadioGroupItem id="related-pep-yes" value="YES" />
            <Label for="related-pep-yes" class="cursor-pointer text-sm">
              YES
            </Label>
          </div>
          <div class="flex items-center gap-3">
            <RadioGroupItem id="related-pep-no" value="NO" />
            <Label for="related-pep-no" class="cursor-pointer text-sm">
              NO
            </Label>
          </div>
        </RadioGroup>
        <div v-if="errors.relatedToPEP" class="flex items-center gap-1.5 mt-2">
          <ErrorIcon class="h-4 w-4 shrink-0" />
          <p class="text-sm text-om-error font-medium">{{ errors.relatedToPEP }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
