<template>
  <div class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
    <div class="border-b border-gray-200 pb-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">customRef 测试用例</h1>
      <h4 class="text-sm font-semibold text-gray-700 mb-3">说明：</h4>
      <div class="bg-green-50 rounded-lg p-4">
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
            <span>customRef 方法用于创建一个自定义的 ref，并暴露获取和设置函数，可手动操作何时获取依赖及更新</span>
          </li>
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
            <span>customRef 方法的第一个参数是两个函数，分别是 track 和 trigger。</span>
          </li>
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
            <span>track 函数用于跟踪依赖，trigger 函数用于触发更新。</span>
          </li>
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
            <span>customRef 方法的返回值是一个对象，包含 get 和 set 函数。</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          输入文本（2秒防抖）
        </label>
        <input type="text" 
               v-model="text"
               placeholder="试试输入一些文字..."
               class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all outline-none text-gray-900 placeholder-gray-400">
      </div>
      
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
        <span class="text-xs font-semibold text-green-700 uppercase tracking-wide">响应式值（延迟 2 秒更新）</span>
        <p class="font-mono text-2xl font-bold text-green-700 mt-2">{{ text || '(空)' }}</p>
        <p class="text-xs text-gray-500 mt-2">💡 提示：输入后等待 2 秒观察效果</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customRef, type Ref } from 'vue';
defineOptions({
    name: 'CustomRef',
});
const text: Ref<string, string> = customRef((track:() => void, trigger:() => void) => {
    let value: string = '';
    let timeout: ReturnType<typeof setTimeout>;
    return {
        get() {
            track();
            return value;
        },
        set(newValue) {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                value = newValue
                trigger();
            }, 2000)
        }
    }
})
</script>