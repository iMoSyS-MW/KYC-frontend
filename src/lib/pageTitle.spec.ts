import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'
import { getPageTitle } from './pageTitle'
import { createConfirmPlugin } from '@/plugins/confirm'

describe('getPageTitle', () => {
  it('titles the landing page', () => {
    expect(getPageTitle('/')).toBe('KYC Form Selection')
    expect(getPageTitle('/nope')).toBe('KYC Form Selection')
  })

  it('titles each create form', () => {
    expect(getPageTitle('/kyc/group')).toBe('Group KYC Form')
    expect(getPageTitle('/kyc/corporate')).toBe('Corporate KYC Form')
    expect(getPageTitle('/kyc/individual')).toBe('Individual KYC Form')
  })

  it('titles each token update flow by prefix', () => {
    expect(getPageTitle('/kyc/update/individual/abc')).toBe('Update Individual KYC')
    expect(getPageTitle('/kyc/update/group/abc')).toBe('Update Group KYC')
    expect(getPageTitle('/kyc/update/corporate/abc')).toBe('Update Corporate KYC')
  })
})

describe('App header', () => {
  const routerFor = () =>
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
    })

  it('renders the adviser bar and the route title', async () => {
    const router = routerFor()
    await router.push('/kyc/individual')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router, createConfirmPlugin()] },
      attachTo: document.body,
    })

    expect(wrapper.text()).toContain('To speak to a financial adviser, call us:')
    expect(wrapper.text()).toContain('0860 66 66 59')
    expect(wrapper.text()).toContain('Individual KYC Form')

    wrapper.unmount()
    document.body.innerHTML = ''
  })
})
