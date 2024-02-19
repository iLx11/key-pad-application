import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../window/HomePage.vue'
import KeyConfigPage from '../window/KeyConfigPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: () => import('../window/HomePage.vue')
    },
    {
      path: '/config',
      component: () => import('../window/KeyConfigPage.vue')
    }
  ]
})

export default router
