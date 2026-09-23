import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Header from '../Header.vue'
import FloatingProgressIndicator from '../FloatingProgressIndicator.vue'
import ConfirmationDialog from '../ConfirmationDialog.vue'
import FormPageLayout from '../../layouts/FormPageLayout.vue'
import Home from '../../views/Home.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Header', () => {
  it('renders the adviser bar, logo and title', () => {
    const wrapper = mount(Header, { props: { title: 'Individual KYC' } })
    expect(wrapper.text()).toContain('0860 66 66 59')
    expect(wrapper.text()).toContain('Individual KYC')
    expect(wrapper.find('img').attributes('src')).toBe('/Logo banner.png')
  })
})

describe('FloatingProgressIndicator', () => {
  const steps = [
    { label: 'Personal', completed: true, percentage: 100 },
    { label: 'Contact', completed: false, percentage: 40 },
    { label: 'Employment', completed: false, percentage: 0 },
  ]

  it('renders overall progress and lists incomplete steps', () => {
    const wrapper = mount(FloatingProgressIndicator, {
      props: { steps, overallProgress: 33, formType: 'Individual' },
    })
    expect(wrapper.text()).toContain('Individual KYC: 33% complete')
    expect(wrapper.text()).toContain('Incomplete: Contact, Employment')
  })

  it('emits close', async () => {
    const wrapper = mount(FloatingProgressIndicator, {
      props: { steps, overallProgress: 33, formType: 'Individual' },
    })
    await wrapper.get('[aria-label="Close progress indicator"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

describe('ConfirmationDialog', () => {
  const dialogOf = () => document.body.querySelector('[role="dialog"]')

  it('renders nothing while closed', () => {
    mount(ConfirmationDialog, {
      props: { open: false, message: 'Delete this?' },
      attachTo: document.body,
    })
    expect(dialogOf()).toBeNull()
  })

  it('renders title, message and both buttons when open', () => {
    mount(ConfirmationDialog, {
      props: {
        open: true,
        title: 'Remove file',
        message: 'This cannot be undone.',
        tone: 'danger',
      },
      attachTo: document.body,
    })
    const text = dialogOf()?.textContent ?? ''
    expect(text).toContain('Remove file')
    expect(text).toContain('This cannot be undone.')
    expect(text).toContain('Confirm')
    expect(text).toContain('Cancel')
  })

  it('hides the cancel button when hideCancel is set', () => {
    mount(ConfirmationDialog, {
      props: { open: true, message: 'Heads up', hideCancel: true },
      attachTo: document.body,
    })
    const text = dialogOf()?.textContent ?? ''
    expect(text).toContain('Confirm')
    expect(text).not.toContain('Cancel')
  })
})

describe('FormPageLayout', () => {
  const baseProps = {
    title: 'Individual KYC',
    activeStep: 1,
    totalSteps: 5,
    stepLabels: ['Personal', 'ID', 'Employment', 'Contact', 'Declare'],
    isLastStep: false,
    isSubmitting: false,
  }

  it('renders the step counter and title', () => {
    const wrapper = mount(FormPageLayout, {
      props: baseProps,
      slots: { default: '<p>step body</p>' },
    })
    expect(wrapper.text()).toContain('Step 2 of 5')
    expect(wrapper.text()).toContain('Individual KYC')
    expect(wrapper.text()).toContain('step body')
  })

  it('disables Previous on the first step and emits navigation', async () => {
    const wrapper = mount(FormPageLayout, {
      props: { ...baseProps, activeStep: 0 },
      slots: { default: '<p>b</p>' },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[0].attributes('disabled')).toBeDefined()

    await buttons[1].trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('shows the submit label on the last step and emits submit', async () => {
    const wrapper = mount(FormPageLayout, {
      props: { ...baseProps, activeStep: 4, isLastStep: true },
      slots: { default: '<p>b</p>' },
    })
    expect(wrapper.text()).toContain('Submit KYC')
    await wrapper.get('button:last-of-type').trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('shows the validation banner and emits goToStep with the target step', async () => {
    const wrapper = mount(FormPageLayout, {
      props: {
        ...baseProps,
        validationError: 'Fix 2 fields',
        validationErrorStep: 2,
        validationErrorStepLabel: 'Employment',
      },
      slots: { default: '<p>b</p>' },
    })
    expect(wrapper.text()).toContain('Fix 2 fields')
    await wrapper.get('button.underline').trigger('click')
    expect(wrapper.emitted('goToStep')?.[0]).toEqual([2])
  })
})

describe('Home', () => {
  it('renders the three KYC cards with router links', () => {
    const wrapper = mount(Home, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.text()).toContain('Welcome, please select one of the forms below to begin')
    expect(wrapper.text()).toContain('Group KYC')
    expect(wrapper.text()).toContain('Corporate KYC')
    expect(wrapper.text()).toContain('Individual KYC')
    expect(wrapper.findAll('a')).toHaveLength(3)
  })
})
