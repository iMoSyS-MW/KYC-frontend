<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import FloatingTextarea from '@/components/ui/FloatingTextarea.vue'
import FloatingDate from '@/components/ui/FloatingDate.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import Label from '@/components/ui/Label.vue'
import ErrorIcon from '@/components/kyc-group/ErrorIcon.vue'
import {
  REQUIRED_FIELDS_CONDITIONAL,
  INCOME_SOURCE_OPTIONS,
  isRequired,
  requiredLabel,
} from './interfaces'
import type { IndividualFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof IndividualFormData, value: unknown]
  fileChange: [field: string, files: FileList | null]
}>()

function incomeOptionId(option: string): string {
  return `income-${option.toLowerCase()}`
}

function conditionalLabel(source: string, field: string): string {
  return REQUIRED_FIELDS_CONDITIONAL[source][field].replace(' is required', '')
}

function onFileChange(field: string, files: FileList | null) {
  emit('fileChange', field, files)
}
</script>

<template>
  <div>
    <div class="mb-8">
      <Label class="text-sm font-bold text-black mb-4 block">
        {{ requiredLabel('Specify Source of Income', 'sourceOfIncome') }}
        <span v-if="isRequired('sourceOfIncome')" class="text-om-error">*</span>
      </Label>
      <RadioGroup
        :model-value="formData.sourceOfIncome"
        class="flex flex-col gap-3"
        @update:model-value="emit('inputChange', 'sourceOfIncome', $event)"
      >
        <div v-for="option in INCOME_SOURCE_OPTIONS" :key="option" class="flex items-center gap-3">
          <RadioGroupItem :id="incomeOptionId(option)" :value="option" />
          <Label :for="incomeOptionId(option)" class="cursor-pointer text-sm">
            {{ option }}
          </Label>
        </div>
      </RadioGroup>
      <div v-if="errors.sourceOfIncome" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.sourceOfIncome }}</p>
      </div>
    </div>

    <div class="mb-8">
      <FileUploadArea
        label="source of income document file"
        field="documents.sourceOfIncome"
        :error="errors.sourceOfIncomeFile"
        :file-selections="fileSelections"
        @file-change="onFileChange"
      />
      <div v-if="errors.sourceOfIncomeFile" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon />
        <p class="text-xs text-om-error font-medium">{{ errors.sourceOfIncomeFile }}</p>
      </div>
    </div>

    <template v-if="formData.sourceOfIncome === 'Employment'">
      <div class="border-t border-gray-200 mb-8" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <FloatingInput
            id="employerName"
            :label="conditionalLabel('Employment', 'employerName')"
            :model-value="formData.employerName"
            :error="!!errors.employerName"
            :maxlength="100"
            @update:model-value="emit('inputChange', 'employerName', $event)"
          >
            <template #label>
              {{ conditionalLabel('Employment', 'employerName') }}
              <span class="text-om-error">*</span>
            </template>
          </FloatingInput>
          <div v-if="errors.employerName" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors.employerName }}</p>
          </div>
        </div>
        <div>
          <FloatingDate
            id="employmentStartDate"
            :label="conditionalLabel('Employment', 'employmentStartDate')"
            :model-value="formData.employmentStartDate"
            :error="!!errors.employmentStartDate"
            @update:model-value="emit('inputChange', 'employmentStartDate', $event)"
          >
            <template #label>
              {{ conditionalLabel('Employment', 'employmentStartDate') }}
              <span class="text-om-error">*</span>
            </template>
          </FloatingDate>
          <div v-if="errors.employmentStartDate" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors.employmentStartDate }}</p>
          </div>
        </div>
        <div>
          <FloatingInput
            id="monthlyNetIncome"
            :label="conditionalLabel('Employment', 'monthlyNetIncome')"
            type="number"
            :model-value="formData.monthlyNetIncome"
            :error="!!errors.monthlyNetIncome"
            @update:model-value="emit('inputChange', 'monthlyNetIncome', $event)"
          >
            <template #label>
              {{ conditionalLabel('Employment', 'monthlyNetIncome') }}
              <span class="text-om-error">*</span>
            </template>
          </FloatingInput>
          <div v-if="errors.monthlyNetIncome" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors.monthlyNetIncome }}</p>
          </div>
        </div>
      </div>
    </template>

    <template v-if="formData.sourceOfIncome === 'Business'">
      <div class="border-t border-gray-200 mb-8" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FloatingInput
            id="businessType"
            :label="conditionalLabel('Business', 'businessType')"
            :model-value="formData.businessType"
            :error="!!errors.businessType"
            :maxlength="100"
            @update:model-value="emit('inputChange', 'businessType', $event)"
          >
            <template #label>
              {{ conditionalLabel('Business', 'businessType') }}
              <span class="text-om-error">*</span>
            </template>
          </FloatingInput>
          <div v-if="errors.businessType" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors.businessType }}</p>
          </div>
        </div>
        <div>
          <FloatingInput
            id="businessRegistrationNumber"
            label="Business Registration Number"
            :model-value="formData.businessRegistrationNumber"
            :maxlength="50"
            @update:model-value="emit('inputChange', 'businessRegistrationNumber', $event)"
          />
        </div>
      </div>
      <div class="mb-4">
        <FloatingTextarea
          id="businessAddress"
          :label="conditionalLabel('Business', 'businessAddress')"
          :model-value="formData.businessAddress"
          :rows="3"
          :error="!!errors.businessAddress"
          :maxlength="500"
          @update:model-value="emit('inputChange', 'businessAddress', $event)"
        >
          <template #label>
            {{ conditionalLabel('Business', 'businessAddress') }}
            <span class="text-om-error">*</span>
          </template>
        </FloatingTextarea>
        <div v-if="errors.businessAddress" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.businessAddress }}</p>
        </div>
      </div>
      <div class="mb-8">
        <FloatingInput
          id="businessMonthlyIncome"
          :label="conditionalLabel('Business', 'businessMonthlyIncome')"
          type="number"
          :model-value="formData.businessMonthlyIncome"
          :error="!!errors.businessMonthlyIncome"
          @update:model-value="emit('inputChange', 'businessMonthlyIncome', $event)"
        >
          <template #label>
            {{ conditionalLabel('Business', 'businessMonthlyIncome') }}
            <span class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.businessMonthlyIncome" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.businessMonthlyIncome }}</p>
        </div>
      </div>
    </template>

    <div class="border-t border-gray-200 mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <FloatingInput
          id="otherIncome"
          label="Other Income (specify)"
          :model-value="formData.otherIncome"
          :maxlength="100"
          @update:model-value="emit('inputChange', 'otherIncome', $event)"
        />
      </div>
      <div>
        <FloatingInput
          id="otherMonthlyIncome"
          label="Monthly Income (MWK)"
          type="number"
          :model-value="formData.otherMonthlyIncome"
          @update:model-value="emit('inputChange', 'otherMonthlyIncome', $event)"
        />
      </div>
    </div>

    <div>
      <FloatingTextarea
        id="sourceOfFunds"
        :label="requiredLabel('Specify Source of Funds', 'sourceOfFunds')"
        :model-value="formData.sourceOfFunds"
        :rows="4"
        :error="!!errors.sourceOfFunds"
        :maxlength="1000"
        @update:model-value="emit('inputChange', 'sourceOfFunds', $event)"
      >
        <template #label>
          Specify Source of Funds
          <span v-if="isRequired('sourceOfFunds')" class="text-om-error">*</span>
        </template>
      </FloatingTextarea>
      <div v-if="errors.sourceOfFunds" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon />
        <p class="text-xs text-om-error font-medium">{{ errors.sourceOfFunds }}</p>
      </div>
    </div>
  </div>
</template>
