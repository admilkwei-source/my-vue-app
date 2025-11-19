import { defineStore } from 'pinia'

enum StorageKey {
  USER_INFO = 'userInfo',
  TOKEN = 'token',
}

export type UserPayload = Record<string, any> | null

function readFromStorage(): UserPayload {
  if (typeof window === 'undefined') return null
  const cache = window.localStorage.getItem(StorageKey.USER_INFO)
  if (!cache) return null
  try {
    return JSON.parse(cache)
  } catch {
    window.localStorage.removeItem(StorageKey.USER_INFO)
    return null
  }
}

export const useUserInfoStore = defineStore('userInfo', {
  state: (): { userData: UserPayload } => ({
    userData: readFromStorage(),
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.userData),
  },
  actions: {
    setUserData(data: UserPayload) {
      this.userData = data

      if (typeof window === 'undefined') return

      if (data) {
        window.localStorage.setItem(StorageKey.USER_INFO, JSON.stringify(data))
        window.localStorage.setItem(StorageKey.TOKEN, data.accessToken)
      } else {
        window.localStorage.removeItem(StorageKey.USER_INFO)
        window.localStorage.removeItem(StorageKey.TOKEN)
      }
    },
    loadFromStorage() {
      this.userData = readFromStorage()
    },
    logout() {
      this.setUserData(null)
    },
  },
})
