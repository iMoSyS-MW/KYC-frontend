<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import FloatingTextarea from '@/components/ui/FloatingTextarea.vue'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import SelectItem from '@/components/ui/SelectItem.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import Label from '@/components/ui/Label.vue'
import {
  ErrorIcon,
  isRequired,
  requiredLabel,
  ADDRESS_PROOF_OPTIONS,
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div>
        <FloatingInput
          id="phone"
          :label="requiredLabel('Office Phone Number', 'phone')"
          :model-value="formData.phone"
          :error="!!errors.phone"
          :maxlength="20"
          @update:model-value="emit('inputChange', 'phone', $event)"
        >
          <template #label>
            Office Phone Number
            <span v-if="isRequired('phone')" class="text-om-error">*</span>
          </template>
        </FloatingInput>
        <div v-if="errors.phone" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon class="h-4 w-4 shrink-0" />
          <p class="text-sm text-om-error font-medium">{{ errors.phone }}</p>
        </div>
      </div>
      <div>
        <FloatingInput
          id="email"
          label="Office Email Address"
          type="email"
          :model-value="formData.email"
          :maxlength="254"
          @update:model-value="emit('inputChange', 'email', $event)"
        />
      </div>
    </div>

    <div class="mb-8">
      <FloatingTextarea
        id="address"
        :label="requiredLabel('Office Address', 'address')"
        :model-value="formData.address"
        :rows="3"
        :error="!!errors.address"
        :maxlength="500"
        @update:model-value="emit('inputChange', 'address', $event)"
      >
        <template #label>
          Office Address
          <span v-if="isRequired('address')" class="text-om-error">*</span>
        </template>
      </FloatingTextarea>
      <div v-if="errors.address" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.address }}</p>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-8">
      <Label class="text-sm font-bold text-black mb-4 block">
        {{ requiredLabel('Contact Person Details', 'contactPersonName') }}
        <span v-if="isRequired('contactPersonName')" class="text-om-error">*</span>
      </Label>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <FloatingInput
            id="contactPersonName"
            :label="requiredLabel('Full Name', 'contactPersonName')"
            :model-value="formData.contactPersonName"
            :error="!!errors.contactPersonName"
            :maxlength="100"
            @update:model-value="emit('inputChange', 'contactPersonName', $event)"
          >
            <template #label>
              Full Name
              <span v-if="isRequired('contactPersonName')" class="text-om-error">*</span>
            </template>
          </FloatingInput>
          <div v-if="errors.contactPersonName" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.contactPersonName }}</p>
          </div>
        </div>
        <div>
          <FloatingInput
            id="contactPersonPhone"
            :label="requiredLabel('Phone Number', 'contactPersonPhone')"
            :model-value="formData.contactPersonPhone"
            :error="!!errors.contactPersonPhone"
            :maxlength="20"
            @update:model-value="emit('inputChange', 'contactPersonPhone', $event)"
          >
            <template #label>
              Phone Number
              <span v-if="isRequired('contactPersonPhone')" class="text-om-error">*</span>
            </template>
          </FloatingInput>
          <div v-if="errors.contactPersonPhone" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.contactPersonPhone }}</p>
          </div>
        </div>
        <div>
          <FloatingInput
            id="contactPersonEmail"
            :label="requiredLabel('Email Address', 'contactPersonEmail')"
            type="email"
            :model-value="formData.contactPersonEmail"
            :error="!!errors.contactPersonEmail"
            :maxlength="254"
            @update:model-value="emit('inputChange', 'contactPersonEmail', $event)"
          >
            <template #label>
              Email Address
              <span v-if="isRequired('contactPersonEmail')" class="text-om-error">*</span>
            </template>
          </FloatingInput>
          <div v-if="errors.contactPersonEmail" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon class="h-4 w-4 shrink-0" />
            <p class="text-xs text-om-error font-medium">{{ errors.contactPersonEmail }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 mb-8" />

    <div class="mb-4">
      <FloatingSelect
        :label="requiredLabel('Proof of Office Address', 'addressProof')"
        :model-value="formData.addressProof"
        :error="!!errors.addressProof"
        @update:model-value="emit('inputChange', 'addressProof', $event ?? '')"
      >
        <template #label>
          Proof of Office Address
          <span v-if="isRequired('addressProof')" class="text-om-error">*</span>
        </template>
        <SelectItem v-for="option in ADDRESS_PROOF_OPTIONS" :key="option" :value="option">
          {{ option }}
        </SelectItem>
      </FloatingSelect>
      <div v-if="errors.addressProof" class="flex items-center gap-1.5 mt-1">
        <ErrorIcon class="h-4 w-4 shrink-0" />
        <p class="text-sm text-om-error font-medium">{{ errors.addressProof }}</p>
      </div>
    </div>

    <FileUploadArea
      label="address proof document file"
      field="documents.addressProof"
      :error="errors.addressProofFile"
      :file-selections="fileSelections"
      @file-change="onFileChange"
    />
  </div>
</template>
