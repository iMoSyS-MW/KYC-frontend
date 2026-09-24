<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import FloatingTextarea from '@/components/ui/FloatingTextarea.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import { Plus, X } from '@lucide/vue'
import ErrorIcon from '@/components/kyc-group/ErrorIcon.vue'
import {
  PROOF_OF_ADDRESS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MAX_POLICY_NUMBERS,
  isRequired,
  requiredLabel,
} from './interfaces'
import type { IndividualFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof IndividualFormData, value: unknown]
  fileChange: [field: string, files: FileList | null]
  addPolicyNumber: []
  updatePolicyNumber: [index: number, value: string]
  removePolicyNumber: [index: number]
}>()

const MARITAL_STATUS_PLACEHOLDER = 'Select status'

function onMaritalStatusChange(value: string | undefined) {
  emit('inputChange', 'maritalStatus', value === MARITAL_STATUS_PLACEHOLDER ? '' : (value ?? ''))
}

function onPolicyInput(index: number, value: string | number) {
  emit('updatePolicyNumber', index, String(value))
}

function proofOptionId(option: string): string {
  return `proof-${option.replace(/\s+/g, '-')}`
}

function onFileChange(field: string, files: FileList | null) {
  emit('fileChange', field, files)
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div>
        <FloatingInput
          id="firstName"
          :label="requiredLabel('First Name', 'firstName')"
          :model-value="formData.firstName"
          :error="!!errors.firstName"
          :maxlength="100"
          @update:model-value="emit('inputChange', 'firstName', $event)"
        >
          <template #label>
            First Name
            <span v-if="isRequired('firstName')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.firstName" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.firstName }}</p>
        </div>
      </div>
      <div>
        <FloatingInput
          id="lastName"
          :label="requiredLabel('Last Name', 'lastName')"
          :model-value="formData.lastName"
          :error="!!errors.lastName"
          :maxlength="100"
          @update:model-value="emit('inputChange', 'lastName', $event)"
        >
          <template #label>
            Last Name
            <span v-if="isRequired('lastName')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.lastName" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.lastName }}</p>
        </div>
      </div>
      <div>
        <FloatingInput
          id="middleName"
          label="Middle Name (optional)"
          :model-value="formData.middleName"
          :maxlength="100"
          @update:model-value="emit('inputChange', 'middleName', $event)"
        />
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <h3 class="text-base font-bold text-black mb-1">
        {{ requiredLabel('Policy Numbers/Investment Numbers/Policy Numbers', 'policyNumbers') }}
        <span v-if="isRequired('policyNumbers')" class="text-om-error">*</span>
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Add each policy, investment, or policy number individually
      </p>

      <div
        v-for="(policy, index) in formData.policyNumbers"
        :key="index"
        class="flex items-center gap-3 mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
      >
        <span class="font-bold text-gray-500 mr-1">#{{ index + 1 }}</span>
        <div class="flex-1">
          <FloatingInput
            :id="`policy-${index}`"
            label="Policy/Investment number"
            :model-value="policy"
            :maxlength="50"
            @update:model-value="onPolicyInput(index, $event)"
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          class="px-3 shrink-0"
          @click="emit('removePolicyNumber', index)"
        >
          <X class="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      <Button
        class="w-full sm:w-auto bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end"
        :disabled="formData.policyNumbers.length >= MAX_POLICY_NUMBERS"
        @click="emit('addPolicyNumber')"
      >
        <Plus class="h-4 w-4 mr-2" />
        Add Policy Number
      </Button>

      <div
        v-if="formData.policyNumbers.length > 0"
        class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
      >
        <p class="text-sm text-gray-700">
          <strong>Summary:</strong>
          {{ formData.policyNumbers.filter((p) => p.trim()).length }} policy number(s) added
          <span
            v-if="formData.policyNumbers.filter((p) => !p.trim()).length > 0"
            class="text-amber-700 ml-2"
          >
            ({{ formData.policyNumbers.filter((p) => !p.trim()).length }} empty)
          </span>
        </p>
      </div>

      <div v-if="errors.policyNumbers" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon />
        <p class="text-sm text-om-error font-medium">{{ errors.policyNumbers }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <Label class="text-sm font-bold text-black mb-3 block">
          {{ requiredLabel('Gender', 'gender') }}
          <span v-if="isRequired('gender')" class="text-om-error">*</span>
        </Label>
        <RadioGroup
          :model-value="formData.gender"
          class="flex flex-col gap-3"
          @update:model-value="emit('inputChange', 'gender', $event)"
        >
          <div class="flex items-center gap-3">
            <RadioGroupItem id="gender-male" value="Male" />
            <Label for="gender-male" class="cursor-pointer text-sm">
              Male
            </Label>
          </div>
          <div class="flex items-center gap-3">
            <RadioGroupItem id="gender-female" value="Female" />
            <Label for="gender-female" class="cursor-pointer text-sm">
              Female
            </Label>
          </div>
        </RadioGroup>
        <div v-if="errors.gender" class="flex items-center gap-1.5 mt-2">
          <ErrorIcon class="h-4 w-4 shrink-0" />
          <p class="text-sm text-om-error font-medium">{{ errors.gender }}</p>
        </div>
      </div>

      <div>
        <FloatingSelect
          :label="requiredLabel('Marital Status', 'maritalStatus')"
          :model-value="formData.maritalStatus"
          :error="!!errors.maritalStatus"
          @update:model-value="onMaritalStatusChange"
        >
          <template #label>
            Marital Status
            <span v-if="isRequired('maritalStatus')" class="text-om-error">*</span>
          </template>
          <SelectItem :value="MARITAL_STATUS_PLACEHOLDER">
            <em>Select status</em>
          </SelectItem>
          <SelectItem v-for="option in MARITAL_STATUS_OPTIONS" :key="option" :value="option">
            {{ option }}
          </SelectItem>
        </FloatingSelect>
        <div v-if="errors.maritalStatus" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.maritalStatus }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <FloatingTextarea
        id="physicalAddress"
        :label="requiredLabel('Physical Address (brief description)', 'physicalAddress')"
        :model-value="formData.physicalAddress"
        :rows="3"
        :error="!!errors.physicalAddress"
        :maxlength="500"
        @update:model-value="emit('inputChange', 'physicalAddress', $event)"
      >
        <template #label>
          Physical Address (brief description)
          <span v-if="isRequired('physicalAddress')" class="text-om-error">*</span>
        </template>
      </FloatingTextarea>
      <div v-if="errors.physicalAddress" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon />
        <p class="text-xs text-om-error font-medium">{{ errors.physicalAddress }}</p>
      </div>
    </div>

    <div class="mb-8">
      <FloatingTextarea
        id="postalAddress"
        :label="requiredLabel('Postal Address', 'postalAddress')"
        :model-value="formData.postalAddress"
        :rows="3"
        :error="!!errors.postalAddress"
        :maxlength="500"
        @update:model-value="emit('inputChange', 'postalAddress', $event)"
      >
        <template #label>
          Postal Address
          <span v-if="isRequired('postalAddress')" class="text-om-error">*</span>
        </template>
      </FloatingTextarea>
      <div v-if="errors.postalAddress" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon />
        <p class="text-xs text-om-error font-medium">{{ errors.postalAddress }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-4">
      <Label class="text-sm font-bold text-black mb-4 block">
        {{ requiredLabel('Proof of Address (select which has been attached)', 'proofOfAddress') }}
        <span v-if="isRequired('proofOfAddress')" class="text-om-error">*</span>
      </Label>
      <RadioGroup
        :model-value="formData.proofOfAddress"
        class="grid grid-cols-1 sm:grid-cols-2 gap-3"
        @update:model-value="emit('inputChange', 'proofOfAddress', $event)"
      >
        <div v-for="option in PROOF_OF_ADDRESS_OPTIONS" :key="option" class="flex items-center gap-3">
          <RadioGroupItem :id="proofOptionId(option)" :value="option" />
          <Label :for="proofOptionId(option)" class="cursor-pointer text-sm">
            {{ option }}
          </Label>
        </div>
      </RadioGroup>
      <div v-if="errors.proofOfAddress" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.proofOfAddress }}</p>
      </div>
    </div>

    <FileUploadArea
      label="proof of address document file"
      field="documents.proofOfAddress"
      :error="errors.proofOfAddressFile"
      :file-selections="fileSelections"
      @file-change="onFileChange"
    />
  </div>
</template>
