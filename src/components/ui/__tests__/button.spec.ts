import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'
import Input from '../Input.vue'
import Card from '../Card.vue'
import ValidationErrorBanner from '../ValidationErrorBanner.vue'

describe('Button', () => {
  it('renders a native button element', () => {
    const wrapper = mount(Button, { slots: { default: 'Continue' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Continue')
  })

  it('merges a custom class onto the default variant classes', () => {
    const wrapper = mount(Button, {
      props: { class: 'mt-8' },
      slots: { default: 'Go' },
    })
    expect(wrapper.classes()).toContain('mt-8')
    expect(wrapper.classes()).toContain('inline-flex')
    expect(wrapper.classes()).toContain('rounded-full')
  })

  it('applies size and variant classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'outline', size: 'sm' },
      slots: { default: 'Go' },
    })
    expect(wrapper.classes()).toContain('border-om-green')
    expect(wrapper.classes()).toContain('h-9')
  })
})

describe('Input', () => {
  it('renders an input that merges a custom class', () => {
    const wrapper = mount(Input, { props: { class: 'w-64' } })
    expect(wrapper.element.tagName).toBe('INPUT')
    expect(wrapper.classes()).toContain('w-64')
    expect(wrapper.classes()).toContain('h-10')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })
})

describe('Card', () => {
  it('renders a div and merges a custom class', () => {
    const wrapper = mount(Card, {
      props: { class: 'shadow-none' },
      slots: { default: 'Body' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.text()).toBe('Body')
    expect(wrapper.classes()).toContain('shadow-none')
    expect(wrapper.classes()).toContain('bg-card')
  })
})

describe('ValidationErrorBanner', () => {
  it('renders the message and emits dismiss', async () => {
    const wrapper = mount(ValidationErrorBanner, {
      props: { message: 'Please fix 2 fields', onDismiss: () => undefined },
    })
    expect(wrapper.text()).toContain('Please fix 2 fields')
    await wrapper.get('[aria-label="Dismiss"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('renders the step link only when both stepName and a handler are relevant', async () => {
    const wrapper = mount(ValidationErrorBanner, {
      props: {
        message: 'Fix errors',
        stepName: 'Address',
        onDismiss: () => undefined,
      },
    })
    const link = wrapper.find('button.underline')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Go to Address')
    await link.trigger('click')
    expect(wrapper.emitted('goToStep')).toHaveLength(1)
  })
})
