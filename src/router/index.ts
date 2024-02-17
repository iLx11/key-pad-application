import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../window/HomePage.vue'
import ChildPage from '../window/ChildPage.vue'

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
      path: '/child',
      component: () => import('../window/ChildPage.vue')
    }
  ]
})

export default router
