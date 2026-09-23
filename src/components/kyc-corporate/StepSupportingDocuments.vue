<script setup lang="ts">
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import {
  ErrorIcon,
  isRequired,
  requiredLabel,
  ARTICLES_OPTIONS,
  DIRECTORS_ID_OPTIONS,
  SOURCE_OF_FUNDS_OPTIONS,
  BANK_ACCOUNT_OPTIONS,
  type CorporateFormData,
  type StepProps,
} from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof CorporateFormData, value: any]
  fileChange: [field: string, files: FileList | null]
}>()

function onFileChange(field: string, files: FileList | null) {
  emit('fileChange', field, files)
}
</script>

<template>
  <div>
    <div class="mb-8">
      <p class="text-sm font-bold text-black mb-4">
        {{ requiredLabel('Articles of Association/Constitution', 'articlesOfAssociation') }}
        <span v-if="isRequired('articlesOfAssociation')" class="text-om-error">*</span>
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingSelect
            label="Document Type"
            :model-value="formData.articlesOfAssociation"
            :error="!!errors.articlesOfAssociation"
            @update:model-value="emit('inputChange', 'articlesOfAssociation', $event ?? '')"
          >
            <SelectItem v-for="option in ARTICLES_OPTIONS" :key="option" :value="option">
              {{ option }}
            </SelectItem>
          </FloatingSelect>
          <div v-if="errors.articlesOfAssociation" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.articlesOfAssociation }}</p>
          </div>
        </div>
        <FileUploadArea
          label="articles of association file"
          field="documents.articles"
          :error="errors.articlesFile"
          :file-selections="fileSelections"
          @file-change="onFileChange"
        />
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <p class="text-sm font-bold text-black mb-4">
        {{ requiredLabel('Directors/Senior Management ID', 'directorsId') }}
        <span v-if="isRequired('directorsId')" class="text-om-error">*</span>
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingSelect
            label="Document Type"
            :model-value="formData.directorsId"
            :error="!!errors.directorsId"
            @update:model-value="emit('inputChange', 'directorsId', $event ?? '')"
          >
            <SelectItem v-for="option in DIRECTORS_ID_OPTIONS" :key="option" :value="option">
              {{ option }}
            </SelectItem>
          </FloatingSelect>
          <div v-if="errors.directorsId" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.directorsId }}</p>
          </div>
        </div>
        <FileUploadArea
          label="directors ID document file"
          field="documents.directorsId"
          :error="errors.directorsIdFile"
          :file-selections="fileSelections"
          multiple
          @file-change="onFileChange"
        />
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <p class="text-sm font-bold text-black mb-4">
        {{ requiredLabel('Source of Funds', 'sourceOfFunds') }}
        <span v-if="isRequired('sourceOfFunds')" class="text-om-error">*</span>
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingSelect
            label="Document Type"
            :model-value="formData.sourceOfFunds"
            :error="!!errors.sourceOfFunds"
            @update:model-value="emit('inputChange', 'sourceOfFunds', $event ?? '')"
          >
            <SelectItem v-for="option in SOURCE_OF_FUNDS_OPTIONS" :key="option" :value="option">
              {{ option }}
            </SelectItem>
          </FloatingSelect>
          <div v-if="errors.sourceOfFunds" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.sourceOfFunds }}</p>
          </div>
        </div>
        <FileUploadArea
          label="source of funds document file"
          field="documents.sourceOfFunds"
          :error="errors.sourceOfFundsFile"
          :file-selections="fileSelections"
          multiple
          @file-change="onFileChange"
        />
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-4">
      <p class="text-sm font-bold text-black mb-4">
        {{ requiredLabel('Bank Account Proof', 'bankAccountProof') }}
        <span v-if="isRequired('bankAccountProof')" class="text-om-error">*</span>
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingSelect
            label="Document Type"
            :model-value="formData.bankAccountProof"
            :error="!!errors.bankAccountProof"
            @update:model-value="emit('inputChange', 'bankAccountProof', $event ?? '')"
          >
            <SelectItem v-for="option in BANK_ACCOUNT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </SelectItem>
          </FloatingSelect>
          <div v-if="errors.bankAccountProof" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.bankAccountProof }}</p>
          </div>
        </div>
        <FileUploadArea
          label="bank account proof document file"
          field="documents.bankAccount"
          :error="errors.bankAccountFile"
          :file-selections="fileSelections"
          multiple
          @file-change="onFileChange"
        />
      </div>
    </div>
  </div>
</template>
