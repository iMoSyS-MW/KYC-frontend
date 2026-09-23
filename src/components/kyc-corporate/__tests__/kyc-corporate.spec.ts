import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createConfirmPlugin } from '@/plugins/confirm'
import KycCorporate from '@/views/KycCorporate.vue'
import StepClientDetails from '@/components/kyc-corporate/StepClientDetails.vue'
import StepContactDetails from '@/components/kyc-corporate/StepContactDetails.vue'
import StepSupportingDocuments from '@/components/kyc-corporate/StepSupportingDocuments.vue'
import StepDeclaration from '@/components/kyc-corporate/StepDeclaration.vue'
import { isRequired, type CorporateFormData, type FileSelections } from '@/components/kyc-corporate/interfaces'

afterEach(() => {
  document.body.innerHTML = ''
})

function makeFormData(): CorporateFormData {
  return {
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
  }
}

function makeFileSelections(): FileSelections {
  return {
    identification: null,
    addressProof: null,
    articles: null,
    directorsId: null,
    sourceOfFunds: null,
    bankAccount: null,
  }
}

function stepProps(formData: CorporateFormData, errors: Record<string, string> = {}) {
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
  return mount(KycCorporate, {
    global: { plugins: [router, confirmPlugin] },
  })
}

describe('interfaces', () => {
  it('knows which fields are required', () => {
    expect(isRequired('organizationName')).toBe(true)
    expect(isRequired('declaration')).toBe(true)
    expect(isRequired('email')).toBe(false)
    expect(isRequired('pepDeclaration')).toBe(false)
  })
})

describe('StepClientDetails', () => {
  it('renders the main labels and fields', () => {
    const wrapper = mount(StepClientDetails, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('Organisation Name')
    expect(wrapper.text()).toContain('Products/Schemes')
    expect(wrapper.text()).toContain('Scheme Numbers/Investment Numbers/Policy Numbers')
    expect(wrapper.text()).toContain('Identification Document')
    expect(wrapper.text()).toContain('Add Scheme Number')
    expect(wrapper.text()).toContain('identification document file')
    expect(wrapper.find('#organizationName').exists()).toBe(true)
    expect(wrapper.find('#product-0').exists()).toBe(true)
  })

  it('marks required labels with the red asterisk', () => {
    const wrapper = mount(StepClientDetails, { props: stepProps(makeFormData()) })
    expect(wrapper.find('span.text-om-error').exists()).toBe(true)
  })

  it('emits inputChange when the organisation name changes', async () => {
    const wrapper = mount(StepClientDetails, { props: stepProps(makeFormData()) })
    await wrapper.get('#organizationName').setValue('Acme Corp')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['organizationName', 'Acme Corp'])
  })

  it('emits productChange when a product checkbox is toggled', async () => {
    const wrapper = mount(StepClientDetails, { props: stepProps(makeFormData()) })
    await wrapper.get('#product-0').trigger('click')
    expect(wrapper.emitted('productChange')?.[0]).toEqual(['MPICO Property', true])
  })

  it('emits scheme-number list events', async () => {
    const formData = makeFormData()
    formData.schemeNumbers = ['ABC-1']
    const wrapper = mount(StepClientDetails, { props: stepProps(formData) })

    await wrapper.findAll('button').find((b) => b.text().includes('Add Scheme Number'))!.trigger('click')
    expect(wrapper.emitted('addSchemeNumber')).toHaveLength(1)

    await wrapper.find('input[placeholder="Enter scheme/investment/policy number"]').setValue('XYZ-9')
    expect(wrapper.emitted('updateSchemeNumber')?.[0]).toEqual([0, 'XYZ-9'])

    await wrapper.findAll('button').find((b) => b.text().includes('Remove'))!.trigger('click')
    expect(wrapper.emitted('removeSchemeNumber')?.[0]).toEqual([0])
  })

  it('renders the scheme summary from form state', () => {
    const formData = makeFormData()
    formData.schemeNumbers = ['A-1', '']
    const wrapper = mount(StepClientDetails, { props: stepProps(formData) })
    expect(wrapper.text()).toContain('Summary:')
    expect(wrapper.text()).toContain('scheme number(s) added')
    expect(wrapper.text()).toContain('empty')
  })
})

describe('StepContactDetails', () => {
  it('renders the main labels and fields', () => {
    const wrapper = mount(StepContactDetails, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('Office Phone Number')
    expect(wrapper.text()).toContain('Office Email Address')
    expect(wrapper.text()).toContain('Office Address')
    expect(wrapper.text()).toContain('Contact Person Details')
    expect(wrapper.text()).toContain('Proof of Office Address')
    expect(wrapper.text()).toContain('address proof document file')
    expect(wrapper.find('#phone').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#address').exists()).toBe(true)
  })

  it('emits inputChange and shows inline errors from props', async () => {
    const formData = makeFormData()
    const wrapper = mount(StepContactDetails, {
      props: stepProps(formData, { phone: 'Phone number must start with 09 or 08 and be exactly 10 digits' }),
    })
    expect(wrapper.text()).toContain('Phone number must start with 09 or 08 and be exactly 10 digits')

    await wrapper.get('#phone').setValue('0999888777')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['phone', '0999888777'])
  })
})

describe('StepSupportingDocuments', () => {
  it('renders all four document blocks', () => {
    const wrapper = mount(StepSupportingDocuments, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('Articles of Association/Constitution')
    expect(wrapper.text()).toContain('Directors/Senior Management ID')
    expect(wrapper.text()).toContain('Source of Funds')
    expect(wrapper.text()).toContain('Bank Account Proof')
    expect(wrapper.text()).toContain('articles of association file')
    expect(wrapper.text()).toContain('directors ID document file')
    expect(wrapper.text()).toContain('source of funds document file')
    expect(wrapper.text()).toContain('bank account proof document file')
  })
})

describe('StepDeclaration', () => {
  it('renders the declaration copy and checkboxes', () => {
    const wrapper = mount(StepDeclaration, { props: stepProps(makeFormData()) })
    expect(wrapper.text()).toContain('PEP Declaration')
    expect(wrapper.text()).toContain('I confirm that this organization is not a Politically Exposed Entity')
    expect(wrapper.text()).toContain('I agree to the declaration and consent to the terms above')
    expect(wrapper.find('#pepDeclaration').exists()).toBe(true)
    expect(wrapper.find('#declaration').exists()).toBe(true)
  })

  it('emits inputChange with a coerced boolean for the declaration checkbox', async () => {
    const wrapper = mount(StepDeclaration, { props: stepProps(makeFormData()) })
    await wrapper.get('#declaration').trigger('click')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['declaration', true])
  })
})

describe('KycCorporate', () => {
  it('renders the first step with its fields', () => {
    const wrapper = mountController()
    expect(wrapper.text()).toContain('Step 1 of 4')
    expect(wrapper.text()).toContain('Client Details')
    expect(wrapper.find('#organizationName').exists()).toBe(true)
    expect(wrapper.find('#phone').exists()).toBe(false)
  })

  it('updates the form state when step inputs emit changes', async () => {
    const wrapper = mountController()

    await wrapper.get('#organizationName').setValue('Acme Corp')
    await wrapper.findAll('button').find((b) => b.text().includes('Add Scheme Number'))!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text().includes('Add Scheme Number'))!.trigger('click')

    expect(wrapper.text()).toContain('Summary:')
    expect(wrapper.text()).toContain('(2 empty)')

    await wrapper.findAll('button').find((b) => b.text().includes('Add Scheme Number'))!.trigger('click')
    const schemeInput = wrapper.find('input[placeholder="Enter scheme/investment/policy number"]')
    await schemeInput.setValue('POL-001')
    expect(wrapper.text()).toContain('1 scheme number(s) added')
    expect(wrapper.text()).toContain('(2 empty)')
  })

  it('validates emitted input and reflects error state in the DOM', async () => {
    const wrapper = mountController()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Contact Details')
    expect(wrapper.find('#phone').exists()).toBe(true)

    await wrapper.get('#phone').setValue('123')
    expect(wrapper.text()).toContain('Phone number must start with 09 or 08 and be exactly 10 digits')

    await wrapper.get('#phone').setValue('0999888777')
    expect(wrapper.text()).not.toContain('Phone number must start with 09 or 08 and be exactly 10 digits')
  })

  it('gates the Next button on step validity', async () => {
    const wrapper = mountController()
    const nextButton = wrapper.findAll('button').find((b) => b.text().trim() === 'Next')!
    expect(nextButton.attributes('disabled')).toBeDefined()

    await wrapper.get('#organizationName').setValue('Acme Corp')
    await wrapper.findAll('button').find((b) => b.text().includes('Add Scheme Number'))!.trigger('click')
    await wrapper.find('input[placeholder="Enter scheme/investment/policy number"]').setValue('POL-001')
    await wrapper.get('#product-0').trigger('click')
    expect(
      wrapper.findAll('button').find((b) => b.text().trim() === 'Next')!.attributes('disabled'),
    ).toBeDefined()
  })

  it('enables submit on the last step once the declaration is checked', async () => {
    const wrapper = mountController()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.findAll('button').find((b) => b.text().includes('Submit KYC'))!
    expect(submitButton.attributes('disabled')).toBeDefined()

    await wrapper.get('#declaration').trigger('click')
    expect(
      wrapper.findAll('button').find((b) => b.text().includes('Submit KYC'))!.attributes('disabled'),
    ).toBeUndefined()
  })

  it('blocks submission with a validation banner when required fields are missing', async () => {
    const wrapper = mountController()
    const submitish = wrapper.findAll('button').find((b) => b.text().includes('Next') || b.text().includes('Submit'))
    expect(submitish).toBeTruthy()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Declaration')
    const submitButton = wrapper.findAll('button').find((b) => b.text().includes('Submit KYC'))!
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})
