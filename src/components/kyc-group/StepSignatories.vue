<script setup lang="ts">
import FloatingInput from '@/components/ui/FloatingInput.vue'
import Button from '@/components/ui/Button.vue'
import FloatingSelect from '@/components/ui/FloatingSelect.vue'
import { SelectItem } from '@/components/ui'
import { Plus, X } from '@lucide/vue'
import ErrorIcon from './ErrorIcon.vue'
import type { Signatory, SignatoryFileSlot, StepProps } from './interfaces'

const props = defineProps<StepProps>()

const emit = defineEmits<{
  addSignatory: []
  removeSignatory: [index: number]
  updateSignatory: [index: number, field: string, value: unknown]
  signatoryIdTypeChange: [index: number, idType: string]
  fileChange: [field: string, files: FileList | null]
}>()

function signatoryFileSlots(signatory: Signatory, index: number): SignatoryFileSlot[] {
  const slots: SignatoryFileSlot[] = []
  if (signatory.idType === 'National ID') {
    slots.push({
      label: 'National ID front side',
      field: `signatory_${index}_idFront`,
      errorKey: `signatory_${index}_idDocumentFront`,
    })
    slots.push({
      label: 'National ID back side',
      field: `signatory_${index}_idBack`,
      errorKey: `signatory_${index}_idDocumentBack`,
    })
  } else {
    slots.push({
      label: 'ID document',
      field: `signatory_${index}_id`,
      errorKey: `signatory_${index}_idDocument`,
    })
  }
  slots.push({
    label: 'address proof file',
    field: `signatory_${index}_address`,
    errorKey: `signatory_${index}_addressProofFile`,
  })
  return slots
}

function selectedFileFor(field: string): File | null {
  return props.fileSelections[field] ?? null
}

function slotBoxClass(field: string, error: string | undefined): string {
  const base =
    'w-full p-3 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-300 '
  if (error) return base + 'border-2 border-om-error'
  if (selectedFileFor(field)) return base + 'border-2 border-om-success bg-green-50'
  return base + 'border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-om-green'
}

function slotLabelClass(field: string): string {
  return `text-sm ${selectedFileFor(field) ? 'text-om-success' : 'text-gray-500'}`
}

function slotDisplayLabel(slot: SignatoryFileSlot): string {
  const file = selectedFileFor(slot.field)
  return file ? `✓ ${file.name}` : ` ${slot.label}`
}

function slotFileSize(field: string): string {
  const file = selectedFileFor(field)
  return file ? (file.size / 1024 / 1024).toFixed(2) : '0.00'
}

function openFilePicker(event: MouseEvent) {
  const root = (event.currentTarget as HTMLElement | null)?.parentElement
  const input = root?.querySelector('input[type="file"]') as HTMLInputElement | null
  input?.click()
}

function onSlotFileChange(field: string, event: Event) {
  emit('fileChange', field, (event.target as HTMLInputElement).files)
}

function onTextInput(index: number, field: string, value: string | number) {
  emit('updateSignatory', index, field, value)
}

function onIdTypeChange(index: number, value: string | undefined) {
  emit('signatoryIdTypeChange', index, value as string)
}

function onAddressProofChange(index: number, value: string | undefined) {
  emit('updateSignatory', index, 'addressProof', value)
}
</script>

<template>
  <div>
    <p class="text-base font-semibold text-black mb-6">
      Add the authorised signatories for the group (minimum 1 required)
    </p>

    <Button
      class="w-full bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end mb-8"
      @click="emit('addSignatory')"
    >
      <Plus class="h-4 w-4 mr-2" />
      Add Signatory
    </Button>

    <div v-if="errors.signatories" class="flex items-center gap-1.5 mb-4">
      <ErrorIcon />
      <p class="text-sm text-om-error font-medium">{{ errors.signatories }}</p>
    </div>

    <div
      v-for="(signatory, index) in formData.signatories"
      :key="index"
      class="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
    >
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-lg font-semibold text-black">
          Signatory {{ index + 1 }}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          class="text-om-error hover:text-om-error hover:bg-red-50"
          @click="emit('removeSignatory', index)"
        >
          <X class="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FloatingInput
            :id="`signatory-${index}-fullName`"
            label="Full Name"
            :model-value="signatory.fullName"
            :error="!!errors[`signatory_${index}_fullName`]"
            :maxlength="100"
            @update:model-value="onTextInput(index, 'fullName', $event)"
          >
            <template #label>Full Name <span class="text-om-error">*</span></template>
          </FloatingInput>
          <div v-if="errors[`signatory_${index}_fullName`]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_fullName`] }}</p>
          </div>
        </div>
        <div>
          <FloatingInput
            :id="`signatory-${index}-phone`"
            label="Phone Number"
            :model-value="signatory.phone"
            :error="!!errors[`signatory_${index}_phone`]"
            :maxlength="20"
            @update:model-value="onTextInput(index, 'phone', $event)"
          >
            <template #label>Phone Number <span class="text-om-error">*</span></template>
          </FloatingInput>
          <div v-if="errors[`signatory_${index}_phone`]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_phone`] }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FloatingInput
            :id="`signatory-${index}-email`"
            label="Email Address"
            :model-value="signatory.email"
            :error="!!errors[`signatory_${index}_email`]"
            :maxlength="254"
            @update:model-value="onTextInput(index, 'email', $event)"
          >
            <template #label>Email Address <span class="text-om-error">*</span></template>
          </FloatingInput>
          <div v-if="errors[`signatory_${index}_email`]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_email`] }}</p>
          </div>
        </div>
        <div>
          <FloatingInput
            :id="`signatory-${index}-occupation`"
            label="Occupation"
            :model-value="signatory.occupation"
            :error="!!errors[`signatory_${index}_occupation`]"
            :maxlength="100"
            @update:model-value="onTextInput(index, 'occupation', $event)"
          >
            <template #label>Occupation <span class="text-om-error">*</span></template>
          </FloatingInput>
          <div v-if="errors[`signatory_${index}_occupation`]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_occupation`] }}</p>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <FloatingInput
          :id="`signatory-${index}-address`"
          label="Address"
          :model-value="signatory.address"
          :error="!!errors[`signatory_${index}_address`]"
          :maxlength="500"
          @update:model-value="onTextInput(index, 'address', $event)"
        >
          <template #label>Address <span class="text-om-error">*</span></template>
        </FloatingInput>
        <div v-if="errors[`signatory_${index}_address`]" class="flex items-center gap-1.5 mt-1">
          <ErrorIcon />
          <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_address`] }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <FloatingSelect
            label="ID Type"
            :model-value="signatory.idType"
            :error="!!errors[`signatory_${index}_idType`]"
            @update:model-value="onIdTypeChange(index, $event)"
          >
            <template #label>ID Type <span class="text-om-error">*</span></template>
            <SelectItem value="National ID">National ID</SelectItem>
            <SelectItem value="Passport">Passport</SelectItem>
            <SelectItem value="Driver's License">Driver's License</SelectItem>
          </FloatingSelect>
          <div v-if="errors[`signatory_${index}_idType`]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_idType`] }}</p>
          </div>
        </div>
        <div>
          <FloatingSelect
            label="Address Proof Type"
            :model-value="signatory.addressProof"
            :error="!!errors[`signatory_${index}_addressProof`]"
            @update:model-value="onAddressProofChange(index, $event)"
          >
            <template #label>Address Proof Type <span class="text-om-error">*</span></template>
            <SelectItem value="Utility Bill">Utility Bill</SelectItem>
            <SelectItem value="Bank Statement">Bank Statement</SelectItem>
            <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
          </FloatingSelect>
          <div v-if="errors[`signatory_${index}_addressProof`]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-xs text-om-error font-medium">{{ errors[`signatory_${index}_addressProof`] }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="slot in signatoryFileSlots(signatory, index)"
          :key="slot.field"
          class="mt-3"
        >
          <input
            type="file"
            class="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            @change="onSlotFileChange(slot.field, $event)"
          />

          <div :class="slotBoxClass(slot.field, errors[slot.errorKey])" @click="openFilePicker">
            <span :class="slotLabelClass(slot.field)">
              {{ slotDisplayLabel(slot) }}
            </span>
          </div>

          <div
            v-if="selectedFileFor(slot.field)"
            class="mt-2 p-3 bg-om-tertiary rounded-lg border border-om-success"
          >
            <p class="text-sm text-om-success font-semibold">
              ✓ Selected: {{ selectedFileFor(slot.field)?.name }}
            </p>
            <p class="text-xs text-gray-500">
              Size: {{ slotFileSize(slot.field) }} MB
            </p>
          </div>

          <p v-if="!selectedFileFor(slot.field)" class="text-xs text-gray-400 mt-1 italic">
            Click to select {{ slot.label.toLowerCase() }}
          </p>

          <div v-if="errors[slot.errorKey]" class="flex items-center gap-1.5 mt-1">
            <ErrorIcon />
            <p class="text-sm text-om-error font-medium">{{ errors[slot.errorKey] }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
