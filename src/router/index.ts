import { createRouter, createWebHistory } from 'vue-router'
import { getPageTitle } from '@/lib/pageTitle'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/kyc/individual',
      name: 'kyc-individual',
      component: () => import('../views/KycIndividual.vue'),
    },
    {
      path: '/kyc/group',
      name: 'kyc-group',
      component: () => import('../views/KycGroup.vue'),
    },
    {
      path: '/kyc/corporate',
      name: 'kyc-corporate',
      component: () => import('../views/KycCorporate.vue'),
    },
    {
      path: '/kyc/update/individual/:token',
      name: 'kyc-individual-update',
      component: () => import('../views/KycIndividualUpdate.vue'),
      props: true,
    },
    {
      path: '/kyc/update/group/:token',
      name: 'kyc-group-update',
      component: () => import('../views/KycGroupUpdate.vue'),
      props: true,
    },
    {
      path: '/kyc/update/corporate/:token',
      name: 'kyc-corporate-update',
      component: () => import('../views/KycCorporateUpdate.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.afterEach((to) => {
  document.title = getPageTitle(to.path)
})

export default router
