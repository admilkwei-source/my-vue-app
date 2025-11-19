<script setup lang="ts">
import { useRouter, type RouteRecordNormalized } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

const router = useRouter()

interface RouteMeta {
  title: string
  description: string
  icon: string
  color: string
}

interface GuideItem {
  title: string
  description: string
  path: string
  icon: string
  color: string
}

// 类型守卫函数：检查路由是否有完整的 meta 信息
function hasCompleteMeta(route: RouteRecordNormalized): route is RouteRecordNormalized & { meta: RouteMeta } {
  return !!(
    route.meta &&
    typeof route.meta === 'object' &&
    'title' in route.meta &&
    'description' in route.meta &&
    'icon' in route.meta &&
    'color' in route.meta
  )
}

const guides: Array<GuideItem> = router
  .getRoutes()
  .filter(hasCompleteMeta)
  .map((route) => ({
    title: route.meta.title,
    description: route.meta.description,
    path: route.path,
    icon: route.meta.icon,
    color: route.meta.color
  }))

// 预加载定时器
let prefetchTimer: ReturnType<typeof setTimeout> | null = null
const prefetchedRoutes = new Set<string>()

// 预加载单个路由组件
const prefetchRoute = (path: string) => {
  // 避免重复预加载
  if (prefetchedRoutes.has(path)) return
  
  const route = router.resolve(path)
  if (route.matched.length > 0) {
    const matched = route.matched[route.matched.length - 1]
    // 如果组件是懒加载函数，则执行预加载
    if (matched && matched.components?.default) {
      const component = matched.components.default
      // 检查是否是懒加载函数（返回 Promise 的函数）
      if (typeof component === 'function') {
        try {
          const result = (component as unknown as () => Promise<any>)()
          // 如果返回的是 Promise，说明是懒加载函数
          if (result && typeof result.then === 'function') {
            prefetchedRoutes.add(path)
            result.catch(() => {
              // 忽略预加载错误，不影响正常使用
            })
          }
        } catch {
          // 如果不是懒加载函数，忽略错误
        }
      }
    }
  }
}

// 预加载所有路由组件
const prefetchAllRoutes = () => {
  guides.forEach((guide) => {
    prefetchRoute(guide.path)
  })
}

const navigateTo = (path: string) => {
  router.push(path)
}

// 获取应用标题
const appTitle = import.meta.env.VITE_APP_mode_TITLE || 'Vue应用'

// 组件挂载后，设置5秒后自动预加载所有路由
onMounted(() => {
  prefetchTimer = setTimeout(() => {
    prefetchAllRoutes()
    prefetchTimer = null
  }, 5000) // 5秒后预加载
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (prefetchTimer) {
    clearTimeout(prefetchTimer)
    prefetchTimer = null
  }
})
</script>

<template>
  <main class="guide-container">
    <div class="header">
      <h1>欢迎（{{ appTitle }}）</h1>
      <p>选择一个向导开始探索</p>
    </div>

    <div class="guide-grid">
      <div 
        v-for="guide in guides" 
        :key="guide.path"
        class="guide-card"
        @click="navigateTo(guide.path)"
        :style="{ '--card-color': guide.color }"
      >
        <div class="card-icon">{{ guide.icon }}</div>
        <h2 class="card-title">{{ guide.title }}</h2>
        <p class="card-description">{{ guide.description }}</p>
        <div class="card-arrow">→</div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.guide-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.header p {
  font-size: 1.2rem;
  color: $primary-color;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.guide-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.guide-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.guide-card:hover::before {
  transform: scaleX(1);
}

.guide-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--card-color);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.guide-card:hover .card-icon {
  transform: scale(1) rotate(5deg);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.card-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-arrow {
  font-size: 1.5rem;
  color: var(--card-color);
  font-weight: bold;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.guide-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .guide-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .header p {
    font-size: 1rem;
  }

  .guide-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .guide-card {
    padding: 1.5rem;
  }
}

@media (prefers-color-scheme: dark) {
  .guide-card {
    background: #1e1e1e;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .card-title {
    color: #e0e0e0;
  }

  .card-description {
    color: #b0b0b0;
  }

  .header p {
    color: #999;
  }
}
</style>
