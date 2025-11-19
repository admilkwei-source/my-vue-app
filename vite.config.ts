import { resolve } from "path";
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dayjs from 'dayjs'
import pkg from "./package.json";
// 设置打包key 用于版本判断
let buildDate = dayjs(new Date()).format("YYYYMMDDHHmmss");
const { version } = pkg;
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  // 使用相对路径，这样可以直接打开 index.html 文件，
  base: './',
  server:{
    // 配置代理解决跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/baidu-tiles': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/baidu-tiles/, '')
      },
      '/local': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => {
          // 将 /local/mockFlatData 重写为 /mockFlatData.json
          if (path.startsWith('/local/mockFlatData')) {
            return '/mockFlatData.json'
          }
          return path
        },
      }
    },
    // 配置 CORS 头
    cors: true, // 默认就是 true，允许跨域
  },
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias:{
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  build: {
    assetsDir: `releases/${buildDate}_${version}`,
    // 消除打包大小超过500kb警告
    chunkSizeWarningLimit: 4000,
    // 将小于 4 KB 的图片内联到 JavaScript 中
    assetsInlineLimit: 1024,
    rollupOptions: {
      // 打包入口
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      // 打包出口
      output: {
        // 分包处理
        manualChunks(id){
          if(id.includes('node_modules/element-plus')){
            return "vendor-element-plus";
          }else if(id.includes('node_modules/maptalks')){
            return "vendor-maptalks";
          }else if(id.includes('node_modules/zw-npm-store')){
            return "vendor-zw-npm-store";
          }else if(id.includes('node_modules')){
            return "vendor-common";
          }
        },
        // 打包chunk文件名
        chunkFileNames: `releases/${buildDate}_${version}/js/[name]-[hash].js`,
        // 打包入口文件名
        entryFileNames: `releases/${buildDate}_${version}/js/[name]-[hash].js`,
        // 打包资源文件名
        assetFileNames: `releases/${buildDate}_${version}/[ext]/[name]-[hash].[ext]`,
      }
    }
  },
  css: {
    // 使用全局css变量
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  }
})
