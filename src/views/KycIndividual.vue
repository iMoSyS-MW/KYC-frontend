<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { submitKyc } from '@/api/kyc'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import {
  sanitizeErrorMessage,
  clampNumericInput,
  sanitizeSubmitPayload,
  validateDocumentFile,
} from '@/lib/security'
import FormPageLayout from '@/layouts/FormPageLayout.vue'
import SuccessModal from '@/components/ui/SuccessModal.vue'
import StepPersonalInfo from '@/components/kyc-individual/StepPersonalInfo.vue'
import StepIdentification from '@/components/kyc-individual/StepIdentification.vue'
import StepEmployment from '@/components/kyc-individual/StepEmployment.vue'
import StepContact from '@/components/kyc-individual/StepContact.vue'
import StepDeclarations from '@/components/kyc-individual/StepDeclarations.vue'
import {
  STEPS,
  REQUIRED_FIELDS,
  REQUIRED_FIELDS_CONDITIONAL,
  MAX_POLICY_NUMBERS,
} from '@/components/kyc-individual/interfaces'
import type {
  IndividualFormData,
  FileSelections,
} from '@/components/kyc-individual/interfaces'

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
  proofOfAddress: null,
  identification: null,
  identificationFront: null,
  identificationBack: null,
  immigrationPermit: null,
  sourceOfIncome: null,
})

const formData = reactive<IndividualFormData>({
  firstName: '',
  lastName: '',
  middleName: '',
  policyNumbers: [],
  gender: '',
  maritalStatus: '',
  physicalAddress: '',
  postalAddress: '',
  proofOfAddress: '',
  idType: '',
  idNumber: '',
  dateOfBirth: '',
  idExpiryDate: '',
  countryOfResidence: '',
  nationality: '',
  immigrationPermit: '',
  permitExpiryDate: '',
  sourceOfIncome: '',
  employerName: '',
  employmentStartDate: '',
  monthlyNetIncome: '',
  businessType: '',
  businessAddress: '',
  businessRegistrationNumber: '',
  businessMonthlyIncome: '',
  otherIncome: '',
  sourceOfFunds: '',
  otherMonthlyIncome: '',
  nextOfKinName: '',
  nextOfKinRelationship: '',
  nextOfKinOccupation: '',
  cellNumber: '',
  preferredCommunication: '',
  telephoneNumber: '',
  mobileNumber: '',
  emailAddress: '',
  isPEP: '',
  relatedToPEP: '',
  termsAgreement: false,
  documents: {
    proofOfAddress: null,
    identification: null,
    identificationFront: null,
    identificationBack: null,
    immigrationPermit: null,
    sourceOfIncome: null,
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

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

function handleInputChange(field: keyof IndividualFormData, value: unknown) {
  if (
    field === 'monthlyNetIncome' ||
    field === 'businessMonthlyIncome' ||
    field === 'otherMonthlyIncome'
  ) {
    value = clampNumericInput(typeof value === 'string' ? value : String(value ?? ''))
  }

  ;(formData as unknown as Record<string, unknown>)[field] = value

  if (field === 'dateOfBirth') {
    if (value) {
      const dob = new Date(String(value))
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      errors.value = {
        ...errors.value,
        dateOfBirth: age < 16 ? 'You must be at least 16 years old' : '',
      }
    } else {
      errors.value = { ...errors.value, dateOfBirth: '' }
    }
  }

  if (field === 'cellNumber' || field === 'mobileNumber') {
    const phoneRegex = /^(09|08)\d{8}$/
    const phone = typeof value === 'string' ? value : ''
    if (phone && !phoneRegex.test(phone)) {
      errors.value = {
        ...errors.value,
        [field]: 'Phone number must start with 09 or 08 and be exactly 10 digits',
      }
    } else {
      errors.value = { ...errors.value, [field]: '' }
    }
  }
}

function handleFileChange(field: string, files: FileList | null) {
  const file = files?.[0] || null
  const fieldErrorMap: Record<string, string> = {
    'documents.identification': 'identificationFile',
    'documents.identificationFront': 'identificationFrontFile',
    'documents.identificationBack': 'identificationBackFile',
    'documents.proofOfAddress': 'proofOfAddressFile',
    'documents.immigrationPermit': 'immigrationPermitFile',
    'documents.sourceOfIncome': 'sourceOfIncomeFile',
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
    ;(formData as unknown as Record<string, unknown>)[field] = file
    fileSelections.value = { ...fileSelections.value, [field]: file }

    if (errorKey && file) {
      errors.value = { ...errors.value, [errorKey]: '' }
    }
  }
}

function addPolicyNumber() {
  if (formData.policyNumbers.length >= MAX_POLICY_NUMBERS) return
  formData.policyNumbers = [...formData.policyNumbers, '']
}

function updatePolicyNumber(index: number, value: string) {
  formData.policyNumbers = formData.policyNumbers.map((policy, i) =>
    i === index ? value : policy,
  )
}

function removePolicyNumber(index: number) {
  formData.policyNumbers = formData.policyNumbers.filter((_, i) => i !== index)
}

function handleIdTypeChange(idType: string) {
  handleInputChange('idType', idType)

  if (idType === 'National ID') {
    formData.documents.identification = null
    fileSelections.value = { ...fileSelections.value, identification: null }
    errors.value = {
      ...errors.value,
      identificationFile: '',
      identificationFrontFile: '',
      identificationBackFile: '',
    }
  } else {
    formData.documents.identificationFront = null
    formData.documents.identificationBack = null
    fileSelections.value = {
      ...fileSelections.value,
      identificationFront: null,
      identificationBack: null,
    }
    errors.value = {
      ...errors.value,
      identificationFile: '',
      identificationFrontFile: '',
      identificationBackFile: '',
    }
  }
}

function validateForm(): { valid: boolean; errorKeys: string[] } {
  const newErrors: Record<string, string> = {}

  const checkField = (field: string) => {
    const value = (formData as unknown as Record<string, unknown>)[field]
    if (typeof value === 'string') {
      if (!value.trim()) newErrors[field] = REQUIRED_FIELDS[field]
    } else if (Array.isArray(value)) {
      if ((value as string[]).filter((v: string) => v.trim()).length === 0) {
        newErrors[field] = REQUIRED_FIELDS[field]
      }
    } else {
      if (!value) newErrors[field] = REQUIRED_FIELDS[field]
    }
  }

  for (const field of Object.keys(REQUIRED_FIELDS)) {
    if (field.endsWith('File')) continue
    checkField(field)
  }

  if (!formData.documents.proofOfAddress) {
    newErrors.proofOfAddressFile = REQUIRED_FIELDS.proofOfAddressFile
  }
  if (formData.idType === 'National ID') {
    if (!formData.documents.identificationFront) {
      newErrors.identificationFrontFile = 'National ID front side attachment is required'
    }
    if (!formData.documents.identificationBack) {
      newErrors.identificationBackFile = 'National ID back side attachment is required'
    }
  } else if (formData.idType) {
    if (!formData.documents.identification) {
      newErrors.identificationFile = 'Identification attachment is required'
    }
  }
  if (!formData.documents.sourceOfIncome) {
    newErrors.sourceOfIncomeFile = REQUIRED_FIELDS.sourceOfIncomeFile
  }

  if (formData.sourceOfIncome && REQUIRED_FIELDS_CONDITIONAL[formData.sourceOfIncome]) {
    const conditionalFields = REQUIRED_FIELDS_CONDITIONAL[formData.sourceOfIncome]
    for (const [field, message] of Object.entries(conditionalFields)) {
      const value = (formData as unknown as Record<string, unknown>)[field]
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field] = message
      }
    }
  }

  if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
    newErrors.emailAddress = 'Please enter a valid email address'
  }

  const phoneRegex = /^(09|08)\d{8}$/
  if (formData.cellNumber && !phoneRegex.test(formData.cellNumber)) {
    newErrors.cellNumber = 'Phone number must start with 09 or 08 and be exactly 10 digits'
  }
  if (formData.mobileNumber && !phoneRegex.test(formData.mobileNumber)) {
    newErrors.mobileNumber = 'Phone number must start with 09 or 08 and be exactly 10 digits'
  }

  if (formData.dateOfBirth) {
    const dob = new Date(formData.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    if (age < 16) {
      newErrors.dateOfBirth = 'You must be at least 16 years old'
    }
  }

  errors.value = newErrors
  const errorKeys = Object.keys(newErrors)
  return { valid: errorKeys.length === 0, errorKeys }
}

function getFirstErrorStep(errorKeys: string[]): number {
  const step0Fields = [
    'firstName',
    'lastName',
    'gender',
    'maritalStatus',
    'physicalAddress',
    'postalAddress',
    'proofOfAddress',
    'proofOfAddressFile',
    'policyNumbers',
  ]
  const step1Fields = [
    'idType',
    'identificationFile',
    'identificationFrontFile',
    'identificationBackFile',
    'idNumber',
    'dateOfBirth',
    'idExpiryDate',
    'countryOfResidence',
    'nationality',
  ]
  const step2Fields = [
    'sourceOfIncome',
    'sourceOfIncomeFile',
    'employerName',
    'employmentStartDate',
    'monthlyNetIncome',
    'businessType',
    'businessAddress',
    'businessMonthlyIncome',
    'sourceOfFunds',
  ]
  const step3Fields = [
    'nextOfKinName',
    'nextOfKinRelationship',
    'nextOfKinOccupation',
    'cellNumber',
    'emailAddress',
    'preferredCommunication',
  ]
  const step4Fields = ['isPEP', 'relatedToPEP']

  for (const key of errorKeys) {
    if (step0Fields.includes(key)) return 0
    if (step1Fields.includes(key)) return 1
    if (step2Fields.includes(key)) return 2
    if (step3Fields.includes(key)) return 3
    if (step4Fields.includes(key)) return 4
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
    title: 'Submit individual KYC?',
    message:
      'This will submit the completed individual KYC form and supporting documents for review.',
    confirmLabel: 'Submit KYC',
    tone: 'primary',
  })

  if (!confirmed) {
    return
  }

  loading.value = true
  try {
    const submitData = new FormData()
    submitData.append('type', 'individual')
    submitData.append('clientName', `${formData.firstName} ${formData.lastName}`)
    submitData.append(
      'formData',
      JSON.stringify(
        sanitizeSubmitPayload(
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName,
            policyNumbers: formData.policyNumbers.filter((p) => p.trim() !== ''),
            gender: formData.gender,
            maritalStatus: formData.maritalStatus,
            physicalAddress: formData.physicalAddress,
            postalAddress: formData.postalAddress,
            proofOfAddress: formData.proofOfAddress,
            idType: formData.idType,
            idNumber: formData.idNumber,
            dateOfBirth: formData.dateOfBirth,
            idExpiryDate: formData.idExpiryDate,
            countryOfResidence: formData.countryOfResidence,
            nationality: formData.nationality,
            immigrationPermit: formData.immigrationPermit,
            permitExpiryDate: formData.permitExpiryDate,
            sourceOfIncome: formData.sourceOfIncome,
            employerName: formData.employerName,
            employmentStartDate: formData.employmentStartDate,
            monthlyNetIncome: formData.monthlyNetIncome,
            businessType: formData.businessType,
            businessAddress: formData.businessAddress,
            businessRegistrationNumber: formData.businessRegistrationNumber,
            businessMonthlyIncome: formData.businessMonthlyIncome,
            otherIncome: formData.otherIncome,
            sourceOfFunds: formData.sourceOfFunds,
            otherMonthlyIncome: formData.otherMonthlyIncome,
            nextOfKinName: formData.nextOfKinName,
            nextOfKinRelationship: formData.nextOfKinRelationship,
            nextOfKinOccupation: formData.nextOfKinOccupation,
            cellNumber: formData.cellNumber,
            preferredCommunication: formData.preferredCommunication,
            telephoneNumber: formData.telephoneNumber,
            mobileNumber: formData.mobileNumber,
            emailAddress: formData.emailAddress,
            isPEP: formData.isPEP,
            relatedToPEP: formData.relatedToPEP,
            termsAgreement: formData.termsAgreement,
          },
          { arrayLimits: { policyNumbers: MAX_POLICY_NUMBERS } },
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
      !!formData.firstName.trim() &&
      !!formData.lastName.trim() &&
      !!formData.gender &&
      !!formData.maritalStatus &&
      !!formData.physicalAddress.trim() &&
      !!formData.postalAddress.trim() &&
      !!formData.proofOfAddress &&
      !!formData.documents.proofOfAddress &&
      formData.policyNumbers.filter((p) => p.trim()).length > 0
    )
  }
  if (step === 1) {
    if (
      !formData.idType ||
      !formData.idNumber.trim() ||
      !formData.dateOfBirth ||
      !formData.idExpiryDate ||
      !formData.countryOfResidence ||
      !formData.nationality
    ) {
      return false
    }
    if (formData.idType === 'National ID') {
      return !!formData.documents.identificationFront && !!formData.documents.identificationBack
    }
    return !!formData.documents.identification
  }
  if (step === 2) {
    if (!formData.sourceOfIncome || !formData.documents.sourceOfIncome || !formData.sourceOfFunds.trim()) {
      return false
    }
    if (formData.sourceOfIncome === 'Employment') {
      return (
        !!formData.employerName.trim() &&
        !!formData.employmentStartDate &&
        !!formData.monthlyNetIncome.trim()
      )
    }
    if (formData.sourceOfIncome === 'Business') {
      return (
        !!formData.businessType.trim() &&
        !!formData.businessAddress.trim() &&
        !!formData.businessMonthlyIncome.trim()
      )
    }
    return true
  }
  if (step === 3) {
    return (
      !!formData.nextOfKinName.trim() &&
      !!formData.nextOfKinRelationship &&
      !!formData.nextOfKinOccupation.trim() &&
      !!formData.cellNumber.trim() &&
      !!formData.emailAddress.trim() &&
      !!formData.preferredCommunication
    )
  }
  if (step === 4) {
    return !!formData.isPEP && !!formData.relatedToPEP
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
    <StepPersonalInfo
      v-if="activeStep === 0"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
      @add-policy-number="addPolicyNumber"
      @update-policy-number="updatePolicyNumber"
      @remove-policy-number="removePolicyNumber"
    />
    <StepIdentification
      v-else-if="activeStep === 1"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
      @id-type-change="handleIdTypeChange"
    />
    <StepEmployment
      v-else-if="activeStep === 2"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
      @file-change="handleFileChange"
    />
    <StepContact
      v-else-if="activeStep === 3"
      :form-data="formData"
      :errors="errors"
      :file-selections="fileSelections"
      @input-change="handleInputChange"
    />
    <StepDeclarations
      v-else-if="activeStep === 4"
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
    message="Your Individual KYC has been submitted successfully!"
    @close="handleSuccessClose"
  />
</template>
