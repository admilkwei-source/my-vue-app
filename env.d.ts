/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_mode_TITLE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{},{},any>
  export default component
}

declare module '*.css?inline' {
  const content: string
  export default content
}
