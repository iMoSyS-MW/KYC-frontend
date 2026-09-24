<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import FloatingDate from '@/components/ui/FloatingDate.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import Label from '@/components/ui/Label.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import ErrorIcon from '@/components/kyc-group/ErrorIcon.vue'
import {
  COUNTRIES,
  NATIONALITIES,
  ID_TYPE_OPTIONS,
  isRequired,
  requiredLabel,
} from './interfaces'
import type { IndividualFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof IndividualFormData, value: unknown]
  fileChange: [field: string, files: FileList | null]
  idTypeChange: [idType: string]
}>()

function idTypeOptionId(option: string): string {
  return `id-type-${option.replace(/[\s']+/g, '-')}`
}

function onIdTypeChange(value: string | number | undefined) {
  emit('idTypeChange', value == null ? '' : String(value))
}

function onFileChange(field: string, files: FileList | null) {
  emit('fileChange', field, files)
}
</script>

<template>
  <div>
    <div class="mb-8">
      <Label class="text-sm font-bold text-black mb-4 block">
        {{ requiredLabel('Type of Identification (select and attach)', 'idType') }}
        <span v-if="isRequired('idType')" class="text-om-error">*</span>
      </Label>
      <RadioGroup
        :model-value="formData.idType"
        class="flex flex-col gap-3"
        @update:model-value="onIdTypeChange"
      >
        <div v-for="option in ID_TYPE_OPTIONS" :key="option" class="flex items-center gap-3">
          <RadioGroupItem :id="idTypeOptionId(option)" :value="option" />
          <Label :for="idTypeOptionId(option)" class="cursor-pointer text-sm">
            {{ option }}
          </Label>
        </div>
      </RadioGroup>
      <div v-if="errors.idType" class="flex items-center gap-1.5 mt-2">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.idType }}</p>
      </div>
    </div>

    <div class="mb-8">
      <div v-if="formData.idType === 'National ID'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FileUploadArea
            label="national ID front side file"
            field="documents.identificationFront"
            :error="errors.identificationFrontFile"
            :file-selections="fileSelections"
            @file-change="onFileChange"
          />
          <div v-if="errors.identificationFrontFile" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors.identificationFrontFile }}</p>
          </div>
        </div>
        <div>
          <FileUploadArea
            label="national ID back side file"
            field="documents.identificationBack"
            :error="errors.identificationBackFile"
            :file-selections="fileSelections"
            @file-change="onFileChange"
          />
          <div v-if="errors.identificationBackFile" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors.identificationBackFile }}</p>
          </div>
        </div>
      </div>
      <div v-else>
        <FileUploadArea
          label="identification document file"
          field="documents.identification"
          :error="errors.identificationFile"
          :file-selections="fileSelections"
          @file-change="onFileChange"
        />
        <div v-if="errors.identificationFile" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.identificationFile }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <FloatingInput
          id="idNumber"
          :label="requiredLabel('Identification Number', 'idNumber')"
          :model-value="formData.idNumber"
          :error="!!errors.idNumber"
          :maxlength="50"
          @update:model-value="emit('inputChange', 'idNumber', $event)"
        >
          <template #label>
            Identification Number
            <span v-if="isRequired('idNumber')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.idNumber" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.idNumber }}</p>
        </div>
      </div>
      <div>
        <FloatingDate
          id="dateOfBirth"
          :label="requiredLabel('Date of Birth', 'dateOfBirth')"
          :model-value="formData.dateOfBirth"
          :error="!!errors.dateOfBirth"
          @update:model-value="emit('inputChange', 'dateOfBirth', $event)"
        >
          <template #label>
            Date of Birth
            <span v-if="isRequired('dateOfBirth')" class="text-om-error">*</span>
          </template>
        </FloatingDate>
        <div v-if="errors.dateOfBirth" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.dateOfBirth }}</p>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <FloatingDate
        id="idExpiryDate"
        :label="requiredLabel('Date of Expiry of ID', 'idExpiryDate')"
        :model-value="formData.idExpiryDate"
        :error="!!errors.idExpiryDate"
        @update:model-value="emit('inputChange', 'idExpiryDate', $event)"
      >
        <template #label>
          Date of Expiry of ID
          <span v-if="isRequired('idExpiryDate')" class="text-om-error">*</span>
        </template>
      </FloatingDate>
      <div v-if="errors.idExpiryDate" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon />
        <p class="text-xs text-om-error font-medium">{{ errors.idExpiryDate }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FloatingSelect
          :label="requiredLabel('Country of Residence', 'countryOfResidence')"
          :model-value="formData.countryOfResidence"
          :error="!!errors.countryOfResidence"
          @update:model-value="emit('inputChange', 'countryOfResidence', $event ?? '')"
        >
          <template #label>
            Country of Residence
            <span v-if="isRequired('countryOfResidence')" class="text-om-error">*</span>
          </template>
          <SelectItem v-for="country in COUNTRIES" :key="country" :value="country">
            {{ country }}
          </SelectItem>
        </FloatingSelect>
        <div v-if="errors.countryOfResidence" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.countryOfResidence }}</p>
        </div>
      </div>
      <div>
        <FloatingSelect
          :label="requiredLabel('Nationality', 'nationality')"
          :model-value="formData.nationality"
          :error="!!errors.nationality"
          @update:model-value="emit('inputChange', 'nationality', $event ?? '')"
        >
          <template #label>
            Nationality
            <span v-if="isRequired('nationality')" class="text-om-error">*</span>
          </template>
          <SelectItem v-for="item in NATIONALITIES" :key="item" :value="item">
            {{ item }}
          </SelectItem>
        </FloatingSelect>
        <div v-if="errors.nationality" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors.nationality }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
