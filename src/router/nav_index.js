import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home'
import Tabletop from '../views/Tabletop'
import Doc_list from '../views/Doc_list'
import Doc_upload from '../views/Doc_upload'
import Doc_hall from '../views/Doc_hall'
import Authc_list from '../views/Authc_list'
import Audit from '../views/Audit'
import Login from '../views/Login'
import { getToken } from '../utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/home/tabletop',
      children: [
        {
          path: '/home/tabletop',
          name: 'tabletop',
          component: Tabletop
        },
        {
          path: '/home/doc_list',
          name: 'doc_list',
          component: Doc_list
        },
        {
          path: '/home/doc_upload',
          name: 'doc_upload',
          component: Doc_upload
        },
        {
          path: '/home/doc_hall',
          name: 'doc_hall',
          component: Doc_hall
        },
        {
          path: '/home/authc_list',
          name: 'authc_list',
          component: Authc_list
        },
        {
          path: '/home/audit',
          name: 'audit',
          component: Audit
        }
      ]
    },
    // 未匹配到的地址统一回到桌面，避免出现空白页
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home/tabletop'
    }
  ],
  scrollBehavior() {
    return { left: 0, top: 0 }
  }
})

router.beforeEach(to => {
  if (to.path === '/login') return true
  if (!getToken()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
