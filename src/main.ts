import './assets/styles/main.css'

import { createApp } from 'vue'
import type { App as VueApp } from 'vue'
import type { Router } from 'vue-router'
import { createPinia } from 'pinia'

import App from './App.vue'
import { createAppRouter } from './router'

let app: VueApp<Element> | null = null
let router: Router | null = null

interface QiankunProps {
  container?: HTMLElement
  routerBase?: string
  baseRoute?: string
}

function render(props: QiankunProps = {}) {
  const { container, routerBase, baseRoute } = props
  const base = (window as any).__POWERED_BY_QIANKUN__
    ? routerBase ?? baseRoute ?? '/'
    : import.meta.env.BASE_URL

  router = createAppRouter(base)
  app = createApp(App)
  app.use(createPinia())
  app.use(router)

  const mountPoint = container
    ? container.querySelector<HTMLElement>('#MyVueApp') ?? (container as HTMLElement)
    : document.querySelector<HTMLElement>('#MyVueApp')

  if (!mountPoint) {
    throw new Error('Mount container #MyVueApp not found')
  }

  app.mount(mountPoint)
}

if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() { }
export async function mount(props: QiankunProps) {
  (window as any).__QIANKUN_CONTAINER__ = props.container
  render(props)
}
export async function unmount() {
  app?.unmount()
  app = null
  router = null
  delete (window as any).__QIANKUN_CONTAINER__
}
