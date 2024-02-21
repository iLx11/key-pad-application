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
      redirect: '/config/6',
      component: () => import('../window/KeyConfigPage.vue'),
      children: [
        {
          path: '/config/0',
          component: () => import('../views/CompKey.vue')
        },
        {
          path: '/config/1',
          component: () => import('../views/SendText.vue')
        },
        {
          path: '/config/2',
          component: () => import('../views/CompDelay.vue')
        },
        {
          path: '/config/3',
          component: () => import('../views/FilePath.vue')
        },
        {
          path: '/config/4',
          component: () => import('../views/MediaKey.vue')
        },
        {
          path: '/config/5',
          component: () => import('../views/MouseFunc.vue')
        },
        {
          path: '/config/6',
          component: () => import('../views/MenuFunc.vue')
        }
      ]
    }
  ]
})

export default router
