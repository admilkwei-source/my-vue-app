import { createRouter, createWebHistory } from 'vue-router'
import type { Router, RouteRecordRaw } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import staticRoutes from './staticRoutes'

const TOKEN_STORAGE_KEY = 'token'
const routes: RouteRecordRaw[] = [...staticRoutes]

export const createAppRouter = (base?: string): Router => {
  const router = createRouter({
    history: createWebHistory(base ?? import.meta.env.BASE_URL),
    routes,
  })

  router.beforeEach((to, _from, next) => {
    const isLoginRoute = to.path === '/login'
    const hasToken =
      typeof window !== 'undefined' &&
      Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY))

    if (!hasToken) {
      const userInfoStore = useUserInfoStore()
      userInfoStore.logout()

      if (!isLoginRoute) {
        next({ path: '/login', replace: true })
        return
      }
    }

    next()
  })

  return router
}
