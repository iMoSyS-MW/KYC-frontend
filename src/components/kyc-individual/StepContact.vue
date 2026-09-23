<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import Label from '@/components/ui/Label.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import ErrorIcon from '@/components/kyc-group/ErrorIcon.vue'
import {
  RELATIONSHIPS,
  COMMUNICATION_OPTIONS,
  isRequired,
  requiredLabel,
} from './interfaces'
import type { IndividualFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof IndividualFormData, value: unknown]
}>()

function commOptionId(option: string): string {
  return `comm-${option.replace(/\s+/g, '-').toLowerCase()}`
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <FloatingInput
          id="nextOfKinName"
          :label="requiredLabel('Name of Next of Kin', 'nextOfKinName')"
          :model-value="formData.nextOfKinName"
          :error="!!errors.nextOfKinName"
          :maxlength="100"
          @update:model-value="emit('inputChange', 'nextOfKinName', $event)"
        >
          <template #label>
            Name of Next of Kin
            <span v-if="isRequired('nextOfKinName')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.nextOfKinName" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.nextOfKinName }}</p>
        </div>
      </div>
      <div>
        <FloatingSelect
          :label="requiredLabel('Relationship to Customer', 'nextOfKinRelationship')"
          :model-value="formData.nextOfKinRelationship"
          :error="!!errors.nextOfKinRelationship"
          @update:model-value="emit('inputChange', 'nextOfKinRelationship', $event ?? '')"
        >
          <template #label>
            Relationship to Customer
            <span v-if="isRequired('nextOfKinRelationship')" class="text-om-error">*</span>
          </template>
          <SelectItem v-for="relationship in RELATIONSHIPS" :key="relationship" :value="relationship">
            {{ relationship }}
          </SelectItem>
        </FloatingSelect>
        <div v-if="errors.nextOfKinRelationship" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.nextOfKinRelationship }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <FloatingInput
          id="nextOfKinOccupation"
          :label="requiredLabel('Occupation', 'nextOfKinOccupation')"
          :model-value="formData.nextOfKinOccupation"
          :error="!!errors.nextOfKinOccupation"
          :maxlength="100"
          @update:model-value="emit('inputChange', 'nextOfKinOccupation', $event)"
        >
          <template #label>
            Occupation
            <span v-if="isRequired('nextOfKinOccupation')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.nextOfKinOccupation" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.nextOfKinOccupation }}</p>
        </div>
      </div>
      <div>
        <FloatingInput
          id="cellNumber"
          :label="requiredLabel('Mobile Number', 'cellNumber')"
          :model-value="formData.cellNumber"
          :error="!!errors.cellNumber"
          :maxlength="20"
          @update:model-value="emit('inputChange', 'cellNumber', $event)"
        >
          <template #label>
            Mobile Number
            <span v-if="isRequired('cellNumber')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.cellNumber" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.cellNumber }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <FloatingInput
          id="mobileNumber"
          label="Telephone Number"
          :model-value="formData.mobileNumber"
          :maxlength="20"
          @update:model-value="emit('inputChange', 'mobileNumber', $event)"
        />
      </div>
      <div>
        <FloatingInput
          id="emailAddress"
          :label="requiredLabel('Email Address', 'emailAddress')"
          type="email"
          :model-value="formData.emailAddress"
          :error="!!errors.emailAddress"
          :maxlength="254"
          @update:model-value="emit('inputChange', 'emailAddress', $event)"
        >
          <template #label>
            Email Address
            <span v-if="isRequired('emailAddress')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.emailAddress" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.emailAddress }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div>
      <Label class="text-sm font-bold text-black mb-4 block">
        {{ requiredLabel('Preferred Mode of Communication', 'preferredCommunication') }}
        <span v-if="isRequired('preferredCommunication')" class="text-om-error">*</span>
      </Label>
      <RadioGroup
        :model-value="formData.preferredCommunication"
        class="flex flex-col gap-3"
        @update:model-value="emit('inputChange', 'preferredCommunication', $event)"
      >
        <div v-for="option in COMMUNICATION_OPTIONS" :key="option" class="flex items-center gap-3">
          <RadioGroupItem :id="commOptionId(option)" :value="option" />
          <Label :for="commOptionId(option)" class="cursor-pointer text-sm">
            {{ option }}
          </Label>
        </div>
      </RadioGroup>
      <div v-if="errors.preferredCommunication" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.preferredCommunication }}</p>
      </div>
    </div>
  </div>
</template>
