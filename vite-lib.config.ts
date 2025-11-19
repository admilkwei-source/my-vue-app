import { resolve } from "path";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dayjs from 'dayjs'
import pkg from "./package.json";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const buildDate = dayjs(new Date()).format("YYYYMMDDHHmmss");
const { version, name } = pkg;

export default defineConfig({
  base: './',
  server:{
    port: 3000,
  },
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {},            // 如果某些依赖直接读取 process.env
    'process': { env: {} },       // 兜底，避免仍然访问 process
  },
  build: {
    outDir: 'dist-lib',
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'MyVueApp',
      formats: ['umd'],
      fileName: (format) => `MyVueApp.${format}.js`
    },
    rollupOptions: {
      output: {
        // format: 'umd',
        // globals: {
        //   vue: 'Vue'
        // }
        exports: 'auto',
        interop: 'auto'
      },
      // external: ['vue']
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  }
})
