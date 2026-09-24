<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { submitKyc } from '@/api/kyc'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { sanitizeErrorMessage, sanitizeSubmitPayload, validateDocumentFile } from '@/lib/security'
import FormPageLayout from '@/layouts/FormPageLayout.vue'
import SuccessModal from '@/components/ui/SuccessModal.vue'
import StepClientDetails from '@/components/kyc-group/StepClientDetails.vue'
import StepSupportingDocuments from '@/components/kyc-group/StepSupportingDocuments.vue'
import StepSignatories from '@/components/kyc-group/StepSignatories.vue'
import StepDeclaration from '@/components/kyc-group/StepDeclaration.vue'
import {
  STEPS,
  REQUIRED_FIELDS,
  SIGNATORY_REQUIRED_FIELDS,
  createEmptySignatory,
  MAX_SCHEME_NUMBERS,
  MAX_SIGNATORIES,
} from '@/components/kyc-group/interfaces'
import type { GroupFormData, FileSelections, Signatory } from '@/components/kyc-group/interfaces'

const router = useRouter()
const { confirm } = useConfirm()
const toast = useToast()

const activeStep = ref(0)
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const validationError = ref('')
const validationErrorStep = ref<number | undefined>(undefined)
const showSuccessModal = ref(false)

const stepLabels = STEPS.map((s) => s.label)

const fileSelections = ref<FileSelections>({
  founding: null,
  sourceOfFunds: null,
  bankAccount: null,
})

const formData = reactive<GroupFormData>({
  groupName: '',
  products: [],
  schemeNumbers: [],
  foundingDocument: '',
  sourceOfFunds: '',
  bankAccountProof: '',
  signatories: [],
  declaration: false,
  documents: {
    founding: null,
    sourceOfFunds: null,
    bankAccount: null,
  },
})

function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
    return
  }
  if (e.key === 'ArrowRight') {
    activeStep.value = Math.min(STEPS.length - 1, activeStep.value + 1)
  } else if (e.key === 'ArrowLeft') {
    activeStep.value = Math.max(0, activeStep.value - 1)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleInputChange(field: keyof GroupFormData, value: unknown) {
  ;(formData as unknown as Record<string, unknown>)[field] = value
}

function handleProductChange(product: string, checked: boolean) {
  formData.products = checked
    ? [...formData.products, product]
    : formData.products.filter((p) => p !== product)
}

function groupFileErrorKey(field: string): string | null {
  const documentErrorMap: Record<string, string> = {
    'documents.founding': 'foundingFile',
    'documents.sourceOfFunds': 'sourceOfFundsFile',
    'documents.bankAccount': 'bankAccountFile',
  }
  if (field.includes('.')) return documentErrorMap[field] ?? null

  if (field.startsWith('signatory_')) {
    const parts = field.split('_')
    const index = parts[1]
    const fileType = parts[2]
    const signatoryErrorMap: Record<string, string> = {
      id: `signatory_${index}_idDocument`,
      idFront: `signatory_${index}_idDocumentFront`,
      idBack: `signatory_${index}_idDocumentBack`,
      address: `signatory_${index}_addressProofFile`,
    }
    return signatoryErrorMap[fileType] ?? null
  }
  return null
}

function handleFileChange(field: string, files: FileList | null) {
  const file = files?.[0] || null

  if (file && !validateDocumentFile(file).valid) {
    const errorKey = groupFileErrorKey(field)
    if (errorKey) {
      errors.value = {
        ...errors.value,
        [errorKey]: 'Only PDF, PNG or JPG files (max 10 MB) are allowed',
      }
    }
    return
  }

  if (field.includes('.')) {
    const [parent, child] = field.split('.')
    const docs = (formData as unknown as Record<string, Record<string, File | null>>)[parent]
    docs[child] = file
    fileSelections.value = { ...fileSelections.value, [child]: file }
  } else if (field.startsWith('signatory_')) {
    const parts = field.split('_')
    const signatoryIndex = parseInt(parts[1])
    const fileType = parts[2]

    if (fileType === 'id') {
      updateSignatory(signatoryIndex, 'idDocument', file)
      fileSelections.value = { ...fileSelections.value, [`signatory_${signatoryIndex}_id`]: file }
      if (file) {
        errors.value = { ...errors.value, [`signatory_${signatoryIndex}_idDocument`]: '' }
      }
    } else if (fileType === 'idFront') {
      updateSignatory(signatoryIndex, 'idDocumentFront', file)
      fileSelections.value = {
        ...fileSelections.value,
        [`signatory_${signatoryIndex}_idFront`]: file,
      }
      if (file) {
        errors.value = { ...errors.value, [`signatory_${signatoryIndex}_idDocumentFront`]: '' }
      }
    } else if (fileType === 'idBack') {
      updateSignatory(signatoryIndex, 'idDocumentBack', file)
      fileSelections.value = {
        ...fileSelections.value,
        [`signatory_${signatoryIndex}_idBack`]: file,
      }
      if (file) {
        errors.value = { ...errors.value, [`signatory_${signatoryIndex}_idDocumentBack`]: '' }
      }
    } else if (fileType === 'address') {
      updateSignatory(signatoryIndex, 'addressProofFile', file)
      fileSelections.value = {
        ...fileSelections.value,
        [`signatory_${signatoryIndex}_address`]: file,
      }
      if (file) {
        errors.value = { ...errors.value, [`signatory_${signatoryIndex}_addressProofFile`]: '' }
      }
    }
  } else {
    ;(formData as unknown as Record<string, unknown>)[field] = file
    fileSelections.value = { ...fileSelections.value, [field]: file }
  }
}

function addSignatory() {
  if (formData.signatories.length >= MAX_SIGNATORIES) return
  formData.signatories = [...formData.signatories, createEmptySignatory()]
}

function handleSignatoryIdTypeChange(index: number, idType: string) {
  formData.signatories = formData.signatories.map((sig, i) => {
    if (i !== index) return sig
    if (idType === 'National ID') {
      return { ...sig, idType, idDocument: null }
    }
    return { ...sig, idType, idDocumentFront: null, idDocumentBack: null }
  })

  const prev = fileSelections.value
  fileSelections.value = {
    ...prev,
    [`signatory_${index}_id`]: idType === 'National ID' ? null : prev[`signatory_${index}_id`],
    [`signatory_${index}_idFront`]:
      idType === 'National ID' ? prev[`signatory_${index}_idFront`] : null,
    [`signatory_${index}_idBack`]:
      idType === 'National ID' ? prev[`signatory_${index}_idBack`] : null,
  }

  errors.value = {
    ...errors.value,
    [`signatory_${index}_idType`]: '',
    [`signatory_${index}_idDocument`]: '',
    [`signatory_${index}_idDocumentFront`]: '',
    [`signatory_${index}_idDocumentBack`]: '',
  }
}

function updateSignatory(index: number, field: string, value: unknown) {
  formData.signatories = formData.signatories.map((sig, i) =>
    i === index ? ({ ...sig, [field]: value } as Signatory) : sig,
  )

  if (field === 'phone') {
    const phoneRegex = /^(09|08)\d{8}$/
    const phone = typeof value === 'string' ? value : ''
    if (phone && !phoneRegex.test(phone)) {
      errors.value = {
        ...errors.value,
        [`signatory_${index}_phone`]:
          'Phone number must start with 09 or 08 and be exactly 10 digits',
      }
    } else {
      errors.value = { ...errors.value, [`signatory_${index}_phone`]: '' }
    }
  }

  if (field === 'email') {
    const email = typeof value === 'string' ? value : ''
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.value = {
        ...errors.value,
        [`signatory_${index}_email`]: 'Please enter a valid email address',
      }
    } else {
      errors.value = { ...errors.value, [`signatory_${index}_email`]: '' }
    }
  }
}

function removeSignatory(index: number) {
  formData.signatories = formData.signatories.filter((_, i) => i !== index)
}

function addSchemeNumber() {
  if (formData.schemeNumbers.length >= MAX_SCHEME_NUMBERS) return
  formData.schemeNumbers = [...formData.schemeNumbers, '']
}

function updateSchemeNumber(index: number, value: string) {
  formData.schemeNumbers = formData.schemeNumbers.map((scheme, i) => (i === index ? value : scheme))
}

function removeSchemeNumber(index: number) {
  formData.schemeNumbers = formData.schemeNumbers.filter((_, i) => i !== index)
}

function validateForm(): { valid: boolean; errorKeys: string[] } {
  const newErrors: Record<string, string> = {}

  const checkField = (field: string) => {
    const value = (formData as unknown as Record<string, unknown>)[field]
    if (typeof value === 'string') {
      if (!value.trim()) newErrors[field] = REQUIRED_FIELDS[field]
    } else if (Array.isArray(value)) {
      if (value.length === 0) newErrors[field] = REQUIRED_FIELDS[field]
    } else if (typeof value === 'boolean') {
      if (!value) newErrors[field] = REQUIRED_FIELDS[field]
    } else {
      if (!value) newErrors[field] = REQUIRED_FIELDS[field]
    }
  }

  for (const field of Object.keys(REQUIRED_FIELDS)) {
    if (field === 'declaration' || field === 'products' || field === 'schemeNumbers') {
      checkField(field)
    } else if (field.endsWith('File')) {
      const docField = field.replace('File', '')
      const docKey =
        docField === 'founding'
          ? 'documents.founding'
          : docField === 'sourceOfFunds'
            ? 'documents.sourceOfFunds'
            : docField === 'bankAccount'
              ? 'documents.bankAccount'
              : null
      if (docKey) {
        const [parent, child] = docKey.split('.')
        const docs = (formData as unknown as Record<string, Record<string, File | null>>)[parent]
        if (!docs?.[child]) newErrors[field] = REQUIRED_FIELDS[field]
      }
    } else {
      checkField(field)
    }
  }

  if (formData.signatories.length === 0) {
    newErrors.signatories = 'Please add at least one signatory'
  } else {
    const phoneRegex = /^(09|08)\d{8}$/
    formData.signatories.forEach((sig, index) => {
      for (const [field, message] of Object.entries(SIGNATORY_REQUIRED_FIELDS)) {
        const value = sig[field as keyof Signatory]
        if (typeof value === 'string' && !value.trim()) {
          newErrors[`signatory_${index}_${field}`] = `Signatory ${index + 1}: ${message}`
        }
      }
      if (sig.phone && !phoneRegex.test(sig.phone)) {
        newErrors[`signatory_${index}_phone`] = `Signatory ${index + 1}: Phone number must start with 09 or 08 and be exactly 10 digits`
      }
      if (sig.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sig.email)) {
        newErrors[`signatory_${index}_email`] = `Signatory ${index + 1}: Please enter a valid email address`
      }
      if (sig.idType === 'National ID') {
        if (!sig.idDocumentFront)
          newErrors[`signatory_${index}_idDocumentFront`] = `Signatory ${index + 1}: National ID front side file is required`
        if (!sig.idDocumentBack)
          newErrors[`signatory_${index}_idDocumentBack`] = `Signatory ${index + 1}: National ID back side file is required`
      } else if (sig.idType) {
        if (!sig.idDocument)
          newErrors[`signatory_${index}_idDocument`] = `Signatory ${index + 1}: ID document file is required`
      }
      if (!sig.addressProofFile) {
        newErrors[`signatory_${index}_addressProofFile`] = `Signatory ${index + 1}: Address proof file is required`
      }
    })
  }

  errors.value = newErrors
  const errorKeys = Object.keys(newErrors)
  return { valid: errorKeys.length === 0, errorKeys }
}

function getFirstErrorStep(errorKeys: string[]): number {
  const step0Fields = ['groupName', 'products', 'schemeNumbers']
  const step1Fields = [
    'foundingDocument',
    'foundingFile',
    'sourceOfFunds',
    'sourceOfFundsFile',
    'bankAccountProof',
    'bankAccountFile',
  ]
  const step3Fields = ['declaration']

  for (const key of errorKeys) {
    if (step0Fields.includes(key)) return 0
    if (step1Fields.includes(key)) return 1
    if (key.startsWith('signatory_') || key === 'signatories') return 2
    if (step3Fields.includes(key)) return 3
  }
  return 0
}

async function handleSubmit() {
  const { valid, errorKeys } = validateForm()
  if (!valid) {
    const firstErrorStep = getFirstErrorStep(errorKeys)
    validationError.value = 'Please complete the required fields'
    validationErrorStep.value = firstErrorStep
    activeStep.value = firstErrorStep
    loading.value = false
    return
  }

  validationError.value = ''
  validationErrorStep.value = undefined

  const confirmed = await confirm({
    title: 'Submit group KYC?',
    message:
      'This will submit the completed group KYC form and supporting documents for review.',
    confirmLabel: 'Submit KYC',
    tone: 'primary',
  })

  if (!confirmed) {
    return
  }

  loading.value = true
  try {
    const submitData = new FormData()
    submitData.append('type', 'group')
    submitData.append('clientName', formData.groupName)
    submitData.append(
      'formData',
      JSON.stringify(
        sanitizeSubmitPayload(
          {
            products: formData.products,
            schemeNumbers: formData.schemeNumbers.filter((scheme) => scheme.trim() !== ''),
            foundingDocument: formData.foundingDocument,
            sourceOfFunds: formData.sourceOfFunds,
            bankAccountProof: formData.bankAccountProof,
            signatories: formData.signatories.map((sig) => ({
              fullName: sig.fullName,
              address: sig.address,
              phone: sig.phone,
              email: sig.email,
              occupation: sig.occupation,
              idType: sig.idType,
              addressProof: sig.addressProof,
            })),
            declaration: formData.declaration,
          },
          { arrayLimits: { schemeNumbers: MAX_SCHEME_NUMBERS, signatories: MAX_SIGNATORIES } },
        ),
      ),
    )

    if (formData.documents.founding) {
      submitData.append('foundingDocument', formData.documents.founding)
    }
    if (formData.documents.sourceOfFunds) {
      submitData.append('sourceOfFunds', formData.documents.sourceOfFunds)
    }
    if (formData.documents.bankAccount) {
      submitData.append('bankAccountProof', formData.documents.bankAccount)
    }

    formData.signatories.forEach((sig, index) => {
      if (sig.idType === 'National ID') {
        if (sig.idDocumentFront) {
          submitData.append(`signatory_${index}_idFront`, sig.idDocumentFront)
        }
        if (sig.idDocumentBack) {
          submitData.append(`signatory_${index}_idBack`, sig.idDocumentBack)
        }
      } else if (sig.idDocument) {
        submitData.append(`signatory_${index}_id`, sig.idDocument)
      }
      if (sig.addressProofFile) {
        submitData.append(`signatory_${index}_address`, sig.addressProofFile)
      }
    })

    await submitKyc(submitData)

    showSuccessModal.value = true
  } catch (error: any) {
    console.error('Submission error:', error?.response?.data || error)
    const rawMessage =
      error?.response?.data?.message || 'Failed to submit KYC. Please check your connection and try again.'
    const errorMessage = sanitizeErrorMessage(rawMessage)

    toast.error(errorMessage, 'Submission Failed')
  }
  loading.value = false
}

function isStepValid(step: number): boolean {
  if (step === 0) {
    return (
      !!formData.groupName.trim() &&
      formData.products.length > 0 &&
      formData.schemeNumbers.filter((s) => s.trim()).length > 0
    )
  }
  if (step === 1) {
    return (
      !!formData.foundingDocument &&
      !!formData.documents.founding &&
      !!formData.sourceOfFunds &&
      !!formData.documents.sourceOfFunds &&
      !!formData.bankAccountProof &&
      !!formData.documents.bankAccount
    )
  }
  if (step === 2) {
    if (formData.signatories.length === 0) return false
    return formData.signatories.every((sig) => {
      const basicValid =
        !!sig.fullName.trim() &&
        !!sig.address.trim() &&
        !!sig.phone.trim() &&
        !!sig.email.trim() &&
        !!sig.occupation.trim() &&
        !!sig.idType &&
        !!sig.addressProof
      if (!basicValid) return false
      if (sig.idType === 'National ID') {
        return !!sig.idDocumentFront && !!sig.idDocumentBack && !!sig.addressProofFile
      }
      return !!sig.idDocument && !!sig.addressProofFile
    })
  }
  if (step === 3) {
    return formData.declaration === true
  }
  return true
}

function handleNext() {
  activeStep.value = activeStep.value + 1
}

function handlePrevious() {
  activeStep.value = Math.max(0, activeStep.value - 1)
}

function handleGoToStep(step: number) {
  activeStep.value = step
}

function handleDismissError() {
  validationError.value = ''
  validationErrorStep.value = undefined
}

function handleSuccessClose() {
  showSuccessModal.value = false
  router.push('/')
}
</script>

<template>
  <FormPageLayout
    :title="STEPS[activeStep].label"
    :active-step="activeStep"
    :total-steps="STEPS.length"
    :step-labels="stepLabels"
    :is-last-step="activeStep === STEPS.length - 1"
    :is-submitting="loading"
    :next-disabled="!isStepValid(activeStep)"
    :validation-error="validationError"
    :validation-error-step="validationErrorStep"
    :validation-error-step-label="
      validationErrorStep !== undefined ? STEPS[validationErrorStep].label : undefined
    "
    @previous="handlePrevious"
    @next="handleNext"
    @submit="handleSubmit"
    @go-to-step="handleGoToStep"
    @dismiss-error="handleDismissError"
  >
    <StepClientDetails
      v-if="activeStep === 0"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @product-change="handleProductChange"
      @add-scheme-number="addSchemeNumber"
      @update-scheme-number="updateSchemeNumber"
      @remove-scheme-number="removeSchemeNumber"
    />
    <StepSupportingDocuments
      v-else-if="activeStep === 1"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
    />
    <StepSignatories
      v-else-if="activeStep === 2"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @add-signatory="addSignatory"
      @remove-signatory="removeSignatory"
      @update-signatory="updateSignatory"
      @signatory-id-type-change="handleSignatoryIdTypeChange"
      @file-change="handleFileChange"
    />
    <StepDeclaration
      v-else-if="activeStep === 3"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
    />
  </FormPageLayout>
  <SuccessModal
    :open="showSuccessModal"
    message="Your Group KYC has been submitted successfully!"
    @close="handleSuccessClose"
  />
</template>
