import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { reactive } from 'vue'
import ErrorIcon from '../ErrorIcon.vue'
import StepClientDetails from '../StepClientDetails.vue'
import StepDeclaration from '../StepDeclaration.vue'
import StepSignatories from '../StepSignatories.vue'
import StepSupportingDocuments from '../StepSupportingDocuments.vue'
import FileUploadArea from '@/components/ui/FileUploadArea.vue'
import KycGroup from '@/views/KycGroup.vue'
import { createConfirmPlugin } from '@/plugins/confirm'
import type { GroupFormData, Signatory } from '../interfaces'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

function emptySignatory(): Signatory {
  return {
    fullName: '',
    address: '',
    phone: '',
    email: '',
    occupation: '',
    idType: '',
    idDocument: null,
    idDocumentFront: null,
    idDocumentBack: null,
    addressProof: '',
    addressProofFile: null,
  }
}

function emptyForm(): GroupFormData {
  return {
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
  }
}

const openWrappers: Array<{ unmount: () => void }> = []

function track<T extends { unmount: () => void }>(wrapper: T): T {
  openWrappers.push(wrapper)
  return wrapper
}

function mountKycGroup() {
  return track(
    mount(KycGroup, {
      global: { plugins: [createConfirmPlugin()] },
    }),
  )
}

function buttonByText(wrapper: VueWrapper, text: string) {
  const match = wrapper.findAll('button').find((b) => b.text().includes(text))
  if (!match) throw new Error(`Button not found: ${text}`)
  return match
}

afterEach(() => {
  while (openWrappers.length > 0) {
    openWrappers.pop()?.unmount()
  }
  document.body.innerHTML = ''
})

describe('ErrorIcon', () => {
  it('renders the error svg', () => {
    const wrapper = track(mount(ErrorIcon))
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('path').attributes('fill')).toBe('#910822')
  })
})

describe('StepClientDetails', () => {
  it('renders the client detail fields and product list', () => {
    const form = reactive(emptyForm())
    const wrapper = track(
      mount(StepClientDetails, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    expect(wrapper.text()).toContain('Group Name')
    expect(wrapper.text()).toContain('Products/Schemes (select at least one)')
    expect(wrapper.text()).toContain('Scheme Numbers/Investment Numbers/Policy Numbers')
    expect(wrapper.find('#groupName').exists()).toBe(true)
    expect(wrapper.findAll('#product-0, #product-1, #product-2, #product-3')).toHaveLength(4)
    expect(wrapper.text()).toContain('Add Scheme Number')
  })

  it('emits input, product and scheme events', async () => {
    const form = reactive(emptyForm())
    const wrapper = track(
      mount(StepClientDetails, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    await wrapper.get('#groupName').setValue('Acme Group')
    expect(wrapper.emitted('inputChange')?.[0]).toEqual(['groupName', 'Acme Group'])

    await wrapper.get('#product-0').trigger('click')
    expect(wrapper.emitted('productChange')?.[0]).toEqual(['MPICO Property', true])

    await buttonByText(wrapper, 'Add Scheme Number').trigger('click')
    expect(wrapper.emitted('addSchemeNumber')).toHaveLength(1)
  })

  it('writes emitted input into the parent form state', async () => {
    const form = reactive(emptyForm())
    const wrapper = track(
      mount(StepClientDetails, {
        props: { formData: form, errors: {}, fileSelections: {} },
        attrs: {
          onInputChange: (field: keyof GroupFormData, value: unknown) => {
            ;(form as unknown as Record<string, unknown>)[field] = value
          },
          onProductChange: (product: string, checked: boolean) => {
            if (checked) {
              form.products = [...form.products, product]
            } else {
              form.products = form.products.filter((p) => p !== product)
            }
          },
          onAddSchemeNumber: () => {
            form.schemeNumbers = [...form.schemeNumbers, '']
          },
          onUpdateSchemeNumber: (index: number, value: string) => {
            form.schemeNumbers = form.schemeNumbers.map((s, i) => (i === index ? value : s))
          },
          onRemoveSchemeNumber: (index: number) => {
            form.schemeNumbers = form.schemeNumbers.filter((_, i) => i !== index)
          },
        },
      }),
    )

    await wrapper.get('#groupName').setValue('Wired Group')
    expect(form.groupName).toBe('Wired Group')

    await wrapper.get('#product-0').trigger('click')
    expect(form.products).toEqual(['MPICO Property'])

    await buttonByText(wrapper, 'Add Scheme Number').trigger('click')
    expect(form.schemeNumbers).toHaveLength(1)

    await wrapper.find('input[placeholder="Enter scheme/investment/policy number"]').setValue('SCH-001')
    expect(form.schemeNumbers[0]).toBe('SCH-001')

    await buttonByText(wrapper, 'Remove').trigger('click')
    expect(form.schemeNumbers).toHaveLength(0)
  })
})

describe('StepSupportingDocuments', () => {
  it('renders the selects and upload areas', () => {
    const form = reactive(emptyForm())
    const wrapper = track(
      mount(StepSupportingDocuments, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    expect(wrapper.text()).toContain('Founding Document')
    expect(wrapper.text()).toContain('Source of Funds')
    expect(wrapper.text()).toContain('Bank Account Proof')
    expect(wrapper.text()).toContain('founding document file')
    expect(wrapper.text()).toContain('source of funds document file')
    expect(wrapper.text()).toContain('bank account proof document file')
  })

  it('emits input and file changes', async () => {
    const form = reactive(emptyForm())
    const wrapper = track(
      mount(StepSupportingDocuments, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    const docComponent = wrapper.findComponent(FileUploadArea)
    docComponent.vm.$emit('fileChange', 'documents.founding', null)
    expect(wrapper.emitted('fileChange')?.[0]).toEqual(['documents.founding', null])
  })
})

describe('StepSignatories', () => {
  it('renders signatory rows and emits field updates', async () => {
    const form = reactive(emptyForm())
    form.signatories = [{ ...emptySignatory(), idType: 'Passport' }]
    const wrapper = track(
      mount(StepSignatories, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    expect(wrapper.text()).toContain('Signatory 1')
    expect(wrapper.text()).toContain('Full Name')
    expect(wrapper.text()).toContain('Phone Number')
    expect(wrapper.text()).toContain('Email Address')
    expect(wrapper.text()).toContain('Occupation')
    expect(wrapper.text()).toContain('Address')
    expect(wrapper.text()).toContain('ID Type')
    expect(wrapper.text()).toContain('Address Proof Type')
    expect(wrapper.text()).toContain('ID document')
    expect(wrapper.text()).toContain('address proof file')

    await wrapper.get('#signatory-0-fullName').setValue('Jane Doe')
    expect(wrapper.emitted('updateSignatory')?.[0]).toEqual([0, 'fullName', 'Jane Doe'])
  })

  it('shows National ID front and back slots for National ID', () => {
    const form = reactive(emptyForm())
    form.signatories = [{ ...emptySignatory(), idType: 'National ID' }]
    const wrapper = track(
      mount(StepSignatories, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    expect(wrapper.text()).toContain('National ID front side')
    expect(wrapper.text()).toContain('National ID back side')
    expect(wrapper.text()).not.toContain('ID document')
    expect(wrapper.text()).toContain('address proof file')
  })

  it('emits add and remove signatory events', async () => {
    const form = reactive(emptyForm())
    form.signatories = [{ ...emptySignatory() }, { ...emptySignatory() }]
    const wrapper = track(
      mount(StepSignatories, {
        props: { formData: form, errors: {}, fileSelections: {} },
      }),
    )
    await buttonByText(wrapper, 'Add Signatory').trigger('click')
    expect(wrapper.emitted('addSignatory')).toHaveLength(1)

    await buttonByText(wrapper, 'Remove').trigger('click')
    expect(wrapper.emitted('removeSignatory')?.[0]).toEqual([0])
  })
})

describe('StepDeclaration', () => {
  it('renders the declaration text and updates form state on toggle', async () => {
    const form = reactive(emptyForm())
    const wrapper = track(
      mount(StepDeclaration, {
        props: { formData: form, errors: {}, fileSelections: {} },
        attrs: {
          onInputChange: (field: keyof GroupFormData, value: unknown) => {
            ;(form as unknown as Record<string, unknown>)[field] = value
          },
        },
      }),
    )
    expect(wrapper.text()).toContain(
      'We have read and can confirm that the information provided above is true and correct.',
    )
    expect(wrapper.text()).toContain('I agree to the declaration and consent to the terms above.')

    await wrapper.get('#declaration').trigger('click')
    expect(wrapper.emitted('inputChange')?.[0]?.[0]).toBe('declaration')
    expect(form.declaration).toBe(true)
  })
})

describe('KycGroup', () => {
  it('renders step 0 and navigates with arrow keys', async () => {
    const wrapper = mountKycGroup()
    expect(wrapper.text()).toContain('Client Details')
    expect(wrapper.text()).toContain('Step 1 of 4')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Supporting Documents')
    expect(wrapper.text()).toContain('Step 2 of 4')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Client Details')
  })

  it('updates form state as the user types and unlocks Next', async () => {
    const wrapper = mountKycGroup()
    const next = () => buttonByText(wrapper, 'Next')
    expect(next().attributes('disabled')).toBeDefined()

    await wrapper.get('#groupName').setValue('Acme Group')
    await wrapper.get('#product-0').trigger('click')
    await buttonByText(wrapper, 'Add Scheme Number').trigger('click')
    await wrapper.find('input[placeholder="Enter scheme/investment/policy number"]').setValue('SCH-001')

    expect(next().attributes('disabled')).toBeUndefined()
  })

  it('adds and removes signatories', async () => {
    const wrapper = mountKycGroup()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Signatories')

    await buttonByText(wrapper, 'Add Signatory').trigger('click')
    await buttonByText(wrapper, 'Add Signatory').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Signatory 1')
    expect(wrapper.text()).toContain('Signatory 2')

    await buttonByText(wrapper, 'Remove').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Signatory 1')
    expect(wrapper.text()).not.toContain('Signatory 2')
    expect(wrapper.findAll('h4')).toHaveLength(1)

    await buttonByText(wrapper, 'Remove').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('h4')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Signatory 1')
  })
})
