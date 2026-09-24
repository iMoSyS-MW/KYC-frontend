<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { submitKyc } from '@/api/kyc'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { sanitizeErrorMessage, sanitizeSubmitPayload, validateDocumentFile } from '@/lib/security'
import FormPageLayout from '@/layouts/FormPageLayout.vue'
import SuccessModal from '@/components/ui/SuccessModal.vue'
import StepClientDetails from '@/components/kyc-corporate/StepClientDetails.vue'
import StepContactDetails from '@/components/kyc-corporate/StepContactDetails.vue'
import StepSupportingDocuments from '@/components/kyc-corporate/StepSupportingDocuments.vue'
import StepDeclaration from '@/components/kyc-corporate/StepDeclaration.vue'
import {
  STEPS,
  REQUIRED_FIELDS,
  MAX_SCHEME_NUMBERS,
  type CorporateFormData,
  type FileSelections,
} from '@/components/kyc-corporate/interfaces'

const router = useRouter()
const { confirm } = useConfirm()
const toast = useToast()

const activeStep = ref(0)
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const validationError = ref('')
const validationErrorStep = ref<number | undefined>(undefined)
const showSuccessModal = ref(false)

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

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

const fileSelections = ref<FileSelections>({
  identification: null,
  addressProof: null,
  articles: null,
  directorsId: null,
  sourceOfFunds: null,
  bankAccount: null,
})

const formData = reactive<CorporateFormData>({
  organizationName: '',
  products: [],
  schemeNumbers: [],
  phone: '',
  email: '',
  address: '',
  identificationDocument: '',
  contactPersonName: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  addressProof: '',
  articlesOfAssociation: '',
  directorsId: '',
  sourceOfFunds: '',
  bankAccountProof: '',
  pepDeclaration: false,
  declaration: false,
  documents: {
    identification: null,
    addressProof: null,
    articles: null,
    directorsId: null,
    sourceOfFunds: null,
    bankAccount: null,
  },
})

function handleInputChange(field: keyof CorporateFormData, value: any) {
  ;(formData as any)[field] = value

  if (field === 'phone' || field === 'contactPersonPhone') {
    const phoneRegex = /^(09|08)\d{8}$/
    if (value && !phoneRegex.test(value)) {
      errors.value = {
        ...errors.value,
        [field]: 'Phone number must start with 09 or 08 and be exactly 10 digits',
      }
    } else {
      errors.value = { ...errors.value, [field]: '' }
    }
  }

  if (field === 'contactPersonEmail') {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.value = {
        ...errors.value,
        contactPersonEmail: 'Please enter a valid email address',
      }
    } else {
      errors.value = { ...errors.value, contactPersonEmail: '' }
    }
  }
}

function handleProductChange(product: string, checked: boolean) {
  formData.products = checked
    ? [...formData.products, product]
    : formData.products.filter((p) => p !== product)
}

function handleFileChange(field: string, files: FileList | null) {
  const file = files?.[0] || null
  const fieldErrorMap: Record<string, string> = {
    'documents.identification': 'identificationFile',
    'documents.addressProof': 'addressProofFile',
    'documents.articles': 'articlesFile',
    'documents.directorsId': 'directorsIdFile',
    'documents.sourceOfFunds': 'sourceOfFundsFile',
    'documents.bankAccount': 'bankAccountFile',
  }
  const errorKey = fieldErrorMap[field]

  if (file && !validateDocumentFile(file).valid) {
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
    const docs = formData[parent as 'documents'] as unknown as Record<string, File | null>
    docs[child] = file
    fileSelections.value = { ...fileSelections.value, [child]: file }

    if (errorKey && file) {
      errors.value = { ...errors.value, [errorKey]: '' }
    }
  } else {
    ;(formData as any)[field] = file
    fileSelections.value = { ...fileSelections.value, [field]: file }

    if (errorKey && file) {
      errors.value = { ...errors.value, [errorKey]: '' }
    }
  }
}

function addSchemeNumber() {
  if (formData.schemeNumbers.length >= MAX_SCHEME_NUMBERS) return
  formData.schemeNumbers = [...formData.schemeNumbers, '']
}

function updateSchemeNumber(index: number, value: string) {
  formData.schemeNumbers = formData.schemeNumbers.map((scheme, i) =>
    i === index ? value : scheme,
  )
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
      const docKey = docField === 'identification' ? 'documents.identification'
        : docField === 'addressProof' ? 'documents.addressProof'
        : docField === 'articles' ? 'documents.articles'
        : docField === 'directorsId' ? 'documents.directorsId'
        : docField === 'sourceOfFunds' ? 'documents.sourceOfFunds'
        : docField === 'bankAccount' ? 'documents.bankAccount'
        : null
      if (docKey) {
        const [parent, child] = docKey.split('.')
        const docs = (formData as unknown as Record<string, any>)[parent]
        if (!docs?.[child]) newErrors[field] = REQUIRED_FIELDS[field]
      }
    } else {
      checkField(field)
    }
  }

  const phoneRegex = /^(09|08)\d{8}$/
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    newErrors.phone = 'Phone number must start with 09 or 08 and be exactly 10 digits'
  }
  if (formData.contactPersonPhone && !phoneRegex.test(formData.contactPersonPhone)) {
    newErrors.contactPersonPhone = 'Phone number must start with 09 or 08 and be exactly 10 digits'
  }

  if (formData.contactPersonEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPersonEmail)) {
    newErrors.contactPersonEmail = 'Please enter a valid email address'
  }

  errors.value = newErrors
  const errorKeys = Object.keys(newErrors)
  return { valid: errorKeys.length === 0, errorKeys }
}

function getFirstErrorStep(errorKeys: string[]): number {
  const step0Fields = ['organizationName', 'products', 'schemeNumbers', 'identificationDocument', 'identificationFile']
  const step1Fields = ['phone', 'address', 'contactPersonName', 'contactPersonPhone', 'contactPersonEmail', 'addressProof', 'addressProofFile']
  const step2Fields = ['articlesOfAssociation', 'articlesFile', 'directorsId', 'directorsIdFile', 'sourceOfFunds', 'sourceOfFundsFile', 'bankAccountProof', 'bankAccountFile']
  const step3Fields = ['declaration']

  for (const key of errorKeys) {
    if (step0Fields.includes(key)) return 0
    if (step1Fields.includes(key)) return 1
    if (step2Fields.includes(key)) return 2
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
    title: 'Submit corporate KYC?',
    message: 'This will submit the completed corporate KYC form and supporting documents for review.',
    confirmLabel: 'Submit KYC',
    tone: 'primary',
  })

  if (!confirmed) {
    return
  }

  loading.value = true
  try {
    const submitData = new FormData()
    submitData.append('type', 'corporate')
    submitData.append('clientName', formData.organizationName)
    submitData.append(
      'formData',
      JSON.stringify(
        sanitizeSubmitPayload(
          {
            organizationName: formData.organizationName,
            products: formData.products,
            schemeNumbers: formData.schemeNumbers.filter((scheme) => scheme.trim() !== ''),
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            identificationDocument: formData.identificationDocument,
            contactPerson: {
              name: formData.contactPersonName,
              phone: formData.contactPersonPhone,
              email: formData.contactPersonEmail,
            },
            addressProof: formData.addressProof,
            articlesOfAssociation: formData.articlesOfAssociation,
            directorsId: formData.directorsId,
            sourceOfFunds: formData.sourceOfFunds,
            bankAccountProof: formData.bankAccountProof,
            pepDeclaration: formData.pepDeclaration,
            declaration: formData.declaration,
          },
          { arrayLimits: { schemeNumbers: MAX_SCHEME_NUMBERS } },
        ),
      ),
    )

    Object.entries(formData.documents).forEach(([key, file]) => {
      if (file) {
        submitData.append(key, file)
      }
    })

    await submitKyc(submitData)

    showSuccessModal.value = true
  } catch (error: any) {
    console.error('Submission error:', error?.response?.data || error)
    const rawMessage = error?.response?.data?.message || 'Failed to submit KYC. Please check your connection and try again.'
    const errorMessage = sanitizeErrorMessage(rawMessage)

    toast.error(errorMessage, 'Submission Failed')
  }
  loading.value = false
}

function isStepValid(step: number): boolean {
  if (step === 0) {
    return (
      !!formData.organizationName.trim() &&
      formData.products.length > 0 &&
      formData.schemeNumbers.filter((s) => s.trim()).length > 0 &&
      !!formData.identificationDocument &&
      !!formData.documents.identification
    )
  }
  if (step === 1) {
    return (
      !!formData.phone.trim() &&
      !!formData.address.trim() &&
      !!formData.contactPersonName.trim() &&
      !!formData.contactPersonPhone.trim() &&
      !!formData.contactPersonEmail.trim() &&
      !!formData.addressProof &&
      !!formData.documents.addressProof
    )
  }
  if (step === 2) {
    return (
      !!formData.articlesOfAssociation &&
      !!formData.documents.articles &&
      !!formData.directorsId &&
      !!formData.documents.directorsId &&
      !!formData.sourceOfFunds &&
      !!formData.documents.sourceOfFunds &&
      !!formData.bankAccountProof &&
      !!formData.documents.bankAccount
    )
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
    :step-labels="STEPS.map((s) => s.label)"
    :is-last-step="activeStep === STEPS.length - 1"
    :is-submitting="loading"
    :next-disabled="!isStepValid(activeStep)"
    :validation-error="validationError"
    :validation-error-step="validationErrorStep"
    :validation-error-step-label="validationErrorStep !== undefined ? STEPS[validationErrorStep].label : undefined"
    @previous="handlePrevious"
    @next="handleNext"
    @submit="handleSubmit"
    @go-to-step="(step) => (activeStep = step)"
    @dismiss-error="handleDismissError"
  >
    <StepClientDetails
      v-if="activeStep === 0"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
      @product-change="handleProductChange"
      @add-scheme-number="addSchemeNumber"
      @update-scheme-number="updateSchemeNumber"
      @remove-scheme-number="removeSchemeNumber"
    />
    <StepContactDetails
      v-else-if="activeStep === 1"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
    />
    <StepSupportingDocuments
      v-else-if="activeStep === 2"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
    />
    <StepDeclaration
      v-else-if="activeStep === 3"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
    />
    <div v-else class="text-center py-12 text-gray-400">
      <p>Step {{ activeStep + 1 }} coming soon...</p>
    </div>
  </FormPageLayout>
  <SuccessModal
    :open="showSuccessModal"
    message="Your Corporate KYC has been submitted successfully!"
    @close="handleSuccessClose"
  />
</template>
