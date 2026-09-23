import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createConfirmPlugin } from '@/plugins/confirm'
import KycIndividual from '@/views/KycIndividual.vue'
import StepPersonalInfo from '@/components/kyc-individual/StepPersonalInfo.vue'
import StepIdentification from '@/components/kyc-individual/StepIdentification.vue'
import StepEmployment from '@/components/kyc-individual/StepEmployment.vue'
import StepContact from '@/components/kyc-individual/StepContact.vue'
import StepDeclarations from '@/components/kyc-individual/StepDeclarations.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import {
  isRequired,
  type IndividualFormData,
  type FileSelections,
} from '@/components/kyc-individual/interfaces'

afterEach(() => {
  document.body.innerHTML = ''
})

function makeFormData(): IndividualFormData {
  return {
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
  }
}

function makeFileSelections(): FileSelections {
  return {
    proofOfAddress: null,
    identification: null,
    identificationFront: null,
    identificationBack: null,
    immigrationPermit: null,
    sourceOfIncome: null,
  }
}

function stepProps(formData: IndividualFormData, errors: Record<string, string> = {}) {
  return {
    formData,
    errors,
    fileSelections: makeFileSelections(),
  }
}

function mountController() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  })
  const confirmPlugin = createConfirmPlugin()
  return mount(KycIndividual, {
    global: { plugins: [router, confirmPlugin] },
  })
}

function buttonByText(wrapper: VueWrapper, text: string) {
  const match = wrapper.findAll('button').find((b) => b.text().includes(text))
  if (!match) throw new Error(`Button not found: ${text}`)
  return match
}

describe('interfaces', () => {
  it('knows which fields are required', () => {
    expect(isRequired('firstName')).toBe(true)
    expect(isRequired('policyNumbers')).toBe(true)
    expect(isRequired('middleName')).toBe(false)
    expect(isRequired('termsAgreement')).toBe(false)
  })
})

describe('StepPersonalInfo', () => {
  it('renders the main labels and fields', () => {
    const wrapper = mount(StepPersonalInfo, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('First Name')
    expect(wrapper.text()).toContain('Last Name')
    expect(wrapper.text()).toContain('Middle Name (optional)')
    expect(wrapper.text()).toContain('Policy Numbers/Investment Numbers/Policy Numbers')
    expect(wrapper.text()).toContain('Gender')
    expect(wrapper.text()).toContain('Marital Status')
    expect(wrapper.text()).toContain('Physical Address (brief description)')
    expect(wrapper.text()).toContain('Postal Address')
    expect(wrapper.text()).toContain('Proof of Address (select which has been attached)')
    expect(wrapper.text()).toContain('proof of address document file')
    expect(wrapper.find('#firstName').exists()).toBe(true)
    expect(wrapper.find('#gender-male').exists()).toBe(true)
    expect(wrapper.find('span.text-om-error').exists()).toBe(true)
  })

  it('emits inputChange for text fields', async () => {
    const wrapper = mount(StepPersonalInfo, { props: stepProps(makeFormData()) })
    await wrapper.get('#firstName').setValue('Jane')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['firstName', 'Jane'])
  })

  it('emits policy number list events and renders the summary', async () => {
    const formData = makeFormData()
    formData.policyNumbers = ['POL-1', '']
    const wrapper = mount(StepPersonalInfo, { props: stepProps(formData) })
    expect(wrapper.text()).toContain('Summary:')
    expect(wrapper.text()).toContain('policy number(s) added')
    expect(wrapper.text()).toContain('empty')

    await buttonByText(wrapper, 'Add Policy Number').trigger('click')
    expect(wrapper.emitted('addPolicyNumber')).toHaveLength(1)

    await wrapper.get('#policy-0').setValue('POL-9')
    expect(wrapper.emitted('updatePolicyNumber')?.[0]).toEqual([0, 'POL-9'])

    await buttonByText(wrapper, 'Remove').trigger('click')
    expect(wrapper.emitted('removePolicyNumber')?.[0]).toEqual([0])
  })

  it('emits file changes from the upload area', () => {
    const wrapper = mount(StepPersonalInfo, { props: stepProps(makeFormData()) })
    wrapper.findComponent(FileUploadArea).vm.$emit('fileChange', 'documents.proofOfAddress', null)
    expect(wrapper.emitted('fileChange')?.[0]).toEqual(['documents.proofOfAddress', null])
  })

  it('writes emitted input into the parent form state', async () => {
    const form = reactive(makeFormData())
    const wrapper = mount(StepPersonalInfo, {
      props: stepProps(form),
      attrs: {
        onInputChange: (field: keyof IndividualFormData, value: unknown) => {
          ;(form as unknown as Record<string, unknown>)[field] = value
        },
        onAddPolicyNumber: () => {
          form.policyNumbers = [...form.policyNumbers, '']
        },
      },
    })
    await wrapper.get('#firstName').setValue('Wired')
    expect(form.firstName).toBe('Wired')
    await buttonByText(wrapper, 'Add Policy Number').trigger('click')
    expect(form.policyNumbers).toHaveLength(1)
  })
})

describe('StepIdentification', () => {
  it('renders the main labels and fields', () => {
    const wrapper = mount(StepIdentification, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('Type of Identification (select and attach)')
    expect(wrapper.text()).toContain('National ID')
    expect(wrapper.text()).toContain('Passport')
    expect(wrapper.text()).toContain("Driver's Licence")
    expect(wrapper.text()).toContain('Identification Number')
    expect(wrapper.text()).toContain('Date of Birth')
    expect(wrapper.text()).toContain('Date of Expiry of ID')
    expect(wrapper.text()).toContain('Country of Residence')
    expect(wrapper.text()).toContain('Nationality')
    expect(wrapper.text()).toContain('identification document file')
    expect(wrapper.find('#idNumber').exists()).toBe(true)
    expect(wrapper.find('#dateOfBirth').exists()).toBe(true)
  })

  it('shows front and back slots for National ID', () => {
    const formData = makeFormData()
    formData.idType = 'National ID'
    const wrapper = mount(StepIdentification, { props: stepProps(formData) })
    expect(wrapper.text()).toContain('national ID front side file')
    expect(wrapper.text()).toContain('national ID back side file')
    expect(wrapper.text()).not.toContain('identification document file')
  })

  it('emits idTypeChange and inputChange', async () => {
    const wrapper = mount(StepIdentification, { props: stepProps(makeFormData()) })
    await wrapper.get('#id-type-Passport').trigger('click')
    expect(wrapper.emitted('idTypeChange')?.[0]).toEqual(['Passport'])

    await wrapper.get('#idNumber').setValue('12345')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['idNumber', '12345'])
  })
})

describe('StepEmployment', () => {
  it('renders the main labels and conditional blocks', () => {
    const wrapper = mount(StepEmployment, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('Specify Source of Income')
    expect(wrapper.text()).toContain('source of income document file')
    expect(wrapper.text()).toContain('Other Income (specify)')
    expect(wrapper.text()).toContain('Monthly Income (MWK)')
    expect(wrapper.text()).toContain('Specify Source of Funds')
    expect(wrapper.find('#income-employment').exists()).toBe(true)
    expect(wrapper.find('#sourceOfFunds').exists()).toBe(true)

    const employment = makeFormData()
    employment.sourceOfIncome = 'Employment'
    const employmentWrapper = mount(StepEmployment, { props: stepProps(employment) })
    expect(employmentWrapper.text()).toContain('Name of employer')
    expect(employmentWrapper.find('#employerName').exists()).toBe(true)
    expect(employmentWrapper.find('#employmentStartDate').exists()).toBe(true)
    expect(employmentWrapper.find('#monthlyNetIncome').exists()).toBe(true)

    const business = makeFormData()
    business.sourceOfIncome = 'Business'
    const businessWrapper = mount(StepEmployment, { props: stepProps(business) })
    expect(businessWrapper.text()).toContain('Business type')
    expect(businessWrapper.text()).toContain('Business Registration Number')
    expect(businessWrapper.find('#businessAddress').exists()).toBe(true)
  })

  it('emits inputChange and fileChange', async () => {
    const formData = makeFormData()
    formData.sourceOfIncome = 'Employment'
    const wrapper = mount(StepEmployment, { props: stepProps(formData) })

    await wrapper.get('#employerName').setValue('Old Mutual')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['employerName', 'Old Mutual'])

    wrapper.findComponent(FileUploadArea).vm.$emit('fileChange', 'documents.sourceOfIncome', null)
    expect(wrapper.emitted('fileChange')?.[0]).toEqual(['documents.sourceOfIncome', null])
  })
})

describe('StepContact', () => {
  it('renders the main labels and fields', () => {
    const wrapper = mount(StepContact, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('Name of Next of Kin')
    expect(wrapper.text()).toContain('Relationship to Customer')
    expect(wrapper.text()).toContain('Occupation')
    expect(wrapper.text()).toContain('Mobile Number')
    expect(wrapper.text()).toContain('Telephone Number')
    expect(wrapper.text()).toContain('Email Address')
    expect(wrapper.text()).toContain('Preferred Mode of Communication')
    expect(wrapper.find('#nextOfKinName').exists()).toBe(true)
    expect(wrapper.find('#cellNumber').exists()).toBe(true)
    expect(wrapper.find('#emailAddress').exists()).toBe(true)
  })

  it('emits inputChange and shows inline errors from props', async () => {
    const wrapper = mount(StepContact, {
      props: stepProps(makeFormData(), {
        cellNumber: 'Phone number must start with 09 or 08 and be exactly 10 digits',
      }),
    })
    expect(wrapper.text()).toContain(
      'Phone number must start with 09 or 08 and be exactly 10 digits',
    )

    await wrapper.get('#cellNumber').setValue('0999888777')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['cellNumber', '0999888777'])
  })
})

describe('StepDeclarations', () => {
  it('renders the declaration copy and PEP questions', () => {
    const wrapper = mount(StepDeclarations, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain(
      'We have read and can confirm that the information provided above is true and correct.',
    )
    expect(wrapper.text()).toContain('PEP Declaration')
    expect(wrapper.text()).toContain('I am a politically exposed person (PEP)')
    expect(wrapper.text()).toContain('I am related to a politically exposed person (PEP)')
    expect(wrapper.find('#pep-yes').exists()).toBe(true)
    expect(wrapper.find('#related-pep-no').exists()).toBe(true)
  })

  it('emits inputChange when a PEP radio is selected', async () => {
    const form = reactive(makeFormData())
    const wrapper = mount(StepDeclarations, {
      props: stepProps(form),
      attrs: {
        onInputChange: (field: keyof IndividualFormData, value: unknown) => {
          ;(form as unknown as Record<string, unknown>)[field] = value
        },
      },
    })
    await wrapper.get('#pep-no').trigger('click')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['isPEP', 'NO'])
    expect(form.isPEP).toBe('NO')
  })
})

describe('KycIndividual', () => {
  it('renders step 0 and navigates with arrow keys', async () => {
    const wrapper = mountController()
    expect(wrapper.text()).toContain('Personal Information')
    expect(wrapper.text()).toContain('Step 1 of 5')
    expect(wrapper.find('#firstName').exists()).toBe(true)
    expect(wrapper.find('#idNumber').exists()).toBe(false)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Identification & Immigration')
    expect(wrapper.text()).toContain('Step 2 of 5')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Personal Information')
  })

  it('updates form state as the user types', async () => {
    const wrapper = mountController()
    await wrapper.get('#firstName').setValue('Jane')
    await wrapper.get('#lastName').setValue('Banda')
    await buttonByText(wrapper, 'Add Policy Number').trigger('click')
    await wrapper.get('#policy-0').setValue('POL-001')
    expect(wrapper.text()).toContain('1 policy number(s) added')
  })

  it('validates phone input and reflects error state in the DOM', async () => {
    const wrapper = mountController()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Contact & Next of Kin')

    await wrapper.get('#cellNumber').setValue('123')
    expect(wrapper.text()).toContain(
      'Phone number must start with 09 or 08 and be exactly 10 digits',
    )

    await wrapper.get('#cellNumber').setValue('0999888777')
    expect(wrapper.text()).not.toContain(
      'Phone number must start with 09 or 08 and be exactly 10 digits',
    )
  })

  it('gates the Next button on step validity', async () => {
    const wrapper = mountController()
    expect(buttonByText(wrapper, 'Next').attributes('disabled')).toBeDefined()

    await wrapper.get('#firstName').setValue('Jane')
    await wrapper.get('#lastName').setValue('Banda')
    expect(buttonByText(wrapper, 'Next').attributes('disabled')).toBeDefined()
  })

  it('enables submit on the last step once both PEP questions are answered', async () => {
    const wrapper = mountController()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Declarations')
    const submitButton = buttonByText(wrapper, 'Submit KYC')
    expect(submitButton.attributes('disabled')).toBeDefined()

    await wrapper.get('#pep-no').trigger('click')
    expect(buttonByText(wrapper, 'Submit KYC').attributes('disabled')).toBeDefined()

    await wrapper.get('#related-pep-no').trigger('click')
    expect(buttonByText(wrapper, 'Submit KYC').attributes('disabled')).toBeUndefined()
  })
})
