<script setup lang="ts">
import Checkbox from '@/components/ui/Checkbox.vue'
import Label from '@/components/ui/Label.vue'
import ErrorIcon from './ErrorIcon.vue'
import { isRequired } from './interfaces'
import type { GroupFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof GroupFormData, value: unknown]
}>()

function onDeclarationChange(checked: boolean | 'indeterminate') {
  emit('inputChange', 'declaration', checked)
}
</script>

<template>
  <div>
    <div class="space-y-4 mb-6">
      <p class="text-sm text-gray-800 leading-relaxed">
        We have read and can confirm that the information provided above is true and correct.
      </p>
      <p class="text-sm text-gray-800 leading-relaxed">
        We understand that any misrepresentation of facts affects lines of communication of our business with Old Mutual.
      </p>
      <p class="text-sm text-gray-800 leading-relaxed">
        We undertake to keep Old Mutual informed of any changes to be made in the future to the information provided.
      </p>
      <p class="text-sm text-gray-800 leading-relaxed">
        We further consent to Old Mutual sharing our Group's information within Old Mutual's different business units in Malawi for internal business-related purposes only.
      </p>
      <p class="text-xs text-gray-400 leading-relaxed mt-6">
        (Please note that as our client, all your personal information is treated with strict confidentiality by all Old Mutual employees and Old Mutual is legally bound to protecting our clients information)
      </p>
    </div>

    <div class="flex items-start gap-3 mt-8">
      <Checkbox
        id="declaration"
        :model-value="formData.declaration"
        class="mt-0.5"
        @update:model-value="onDeclarationChange"
      />
      <Label for="declaration" class="text-sm text-gray-800 cursor-pointer leading-snug">
        <template v-if="isRequired('declaration')">I agree to the declaration and consent to the terms above. <span class="text-om-error">*</span></template>
        <template v-else>I agree to the declaration and consent to the terms above.</template>
      </Label>
    </div>

    <div v-if="errors.declaration" class="flex items-center gap-1.5 mt-2">
      <ErrorIcon />
      <p class="text-sm text-om-error font-medium">{{ errors.declaration }}</p>
    </div>
  </div>
</template>
