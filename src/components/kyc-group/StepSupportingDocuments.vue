<script setup lang="ts">
import { SelectItem } from '@/components/ui'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import ErrorIcon from './ErrorIcon.vue'
import { isRequired } from './interfaces'
import type { GroupFormData, StepProps } from './interfaces'

defineProps<StepProps>()

const emit = defineEmits<{
  inputChange: [field: keyof GroupFormData, value: unknown]
  fileChange: [field: string, files: FileList | null]
}>()

function onSelectChange(field: keyof GroupFormData, value: string | undefined) {
  emit('inputChange', field, value)
}

function onFileChange(field: string, files: FileList | null) {
  emit('fileChange', field, files)
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <FloatingSelect
          label="Founding Document"
          :model-value="formData.foundingDocument"
          :error="!!errors.foundingDocument"
          @update:model-value="onSelectChange('foundingDocument', $event)"
        >
          <template #label>Founding Document <span v-if="isRequired('foundingDocument')" class="text-om-error">*</span></template>
          <SelectItem value="Constitution">Constitution</SelectItem>
          <SelectItem value="Minutes">Minutes</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </FloatingSelect>
        <div v-if="errors.foundingDocument" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-sm text-om-error font-medium">{{ errors.foundingDocument }}</p>
        </div>
      </div>

      <FileUploadArea
        label="founding document file"
        field="documents.founding"
        :error="errors.foundingFile"
        :file-selections="fileSelections"
        @file-change="onFileChange"
      />
    </div>

    <div class="border-t border-gray-200 mb-6" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <FloatingSelect
          label="Source of Funds"
          :model-value="formData.sourceOfFunds"
          :error="!!errors.sourceOfFunds"
          @update:model-value="onSelectChange('sourceOfFunds', $event)"
        >
          <template #label>Source of Funds <span v-if="isRequired('sourceOfFunds')" class="text-om-error">*</span></template>
          <SelectItem value="Bank Statements">Bank Statements (last 3 months)</SelectItem>
          <SelectItem value="Audited Financials">Latest audited financials</SelectItem>
          <SelectItem value="Tax Returns">Income tax returns</SelectItem>
        </FloatingSelect>
        <div v-if="errors.sourceOfFunds" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-sm text-om-error font-medium">{{ errors.sourceOfFunds }}</p>
        </div>
      </div>

      <FileUploadArea
        label="source of funds document file"
        field="documents.sourceOfFunds"
        :error="errors.sourceOfFundsFile"
        :file-selections="fileSelections"
        :multiple="true"
        @file-change="onFileChange"
      />
    </div>

    <div class="border-t border-gray-200 mb-6" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <FloatingSelect
          label="Bank Account Proof"
          :model-value="formData.bankAccountProof"
          :error="!!errors.bankAccountProof"
          @update:model-value="onSelectChange('bankAccountProof', $event)"
        >
          <template #label>Bank Account Proof <span v-if="isRequired('bankAccountProof')" class="text-om-error">*</span></template>
          <SelectItem value="Bank Confirmation Letter">Bank confirmation letter</SelectItem>
          <SelectItem value="Cancelled Cheque">Cancelled cheque</SelectItem>
          <SelectItem value="Bank Statement">Bank statement (last 3 months)</SelectItem>
        </FloatingSelect>
        <div v-if="errors.bankAccountProof" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-sm text-om-error font-medium">{{ errors.bankAccountProof }}</p>
        </div>
      </div>

      <FileUploadArea
        label="bank account proof document file"
        field="documents.bankAccount"
        :error="errors.bankAccountFile"
        :file-selections="fileSelections"
        @file-change="onFileChange"
      />
    </div>
  </div>
</template>
