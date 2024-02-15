import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../window/HomePage.vue'
import test from '../window/test.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homePage',
      component: HomePage
    },
    {
      path: '/test',
      name: 'test',
      component: test
    }
  ]
})

export default router
