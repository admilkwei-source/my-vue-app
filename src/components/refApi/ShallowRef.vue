<template>
  <div class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
    <div class="border-b border-gray-200 pb-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">shallowRef 测试用例</h1>
      <h4 class="text-sm font-semibold text-gray-700 mb-3">说明：</h4>
      <div class="bg-green-50 rounded-lg p-4">
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
            <span>浅层 ref 的内部值将会原样存储和暴露，并且不会被深层递归地转为响应式。</span>
          </li>
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
            <span>只有对 .value 的访问是响应式的。</span>
          </li>
        </ul>
        <a href="https://vuejs.org/api/reactivity-advanced.html#shallowref" 
           target="_blank"
           class="inline-flex items-center mt-4 text-green-600 hover:text-green-800 font-medium text-sm transition-colors">
          📖 官方文档
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
      <button @click="updateRef('fail')"
              class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95">
        ❌ 无效更新
      </button>
      <button @click="updateRef('trigger')"
              class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95">
        ⚡ 强制更新
      </button>
      <button @click="updateRef('success')"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95">
        ✅ 有效更新
      </button>
    </div>

    <div class="bg-gray-50 rounded-lg p-4 space-y-2">
      <div class="bg-white rounded p-3 border-l-4 border-indigo-500">
        <span class="text-xs font-semibold text-gray-500 uppercase">完整对象</span>
        <p class="font-mono text-sm text-gray-800 mt-1">{{ shallowRefValString }}</p>
      </div>
      <div class="bg-white rounded p-3 border-l-4 border-purple-500">
        <span class="text-xs font-semibold text-gray-500 uppercase">shallowRefVal.count</span>
        <p class="font-mono text-lg font-bold text-purple-600 mt-1">{{ shallowRefVal.count }}</p>
      </div>
      <div class="bg-white rounded p-3 border-l-4 border-pink-500">
        <span class="text-xs font-semibold text-gray-500 uppercase">shallowRefVal.testObj.count</span>
        <p class="font-mono text-lg font-bold text-pink-600 mt-1">{{ shallowRefVal.testObj.count }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, shallowRef, triggerRef, type ShallowRef } from 'vue';

defineOptions({
  name: 'ShallowRef',
});

interface shallowRefValInterface {
  count: number;
  testObj: {
    count: number;
  };
}

const shallowRefVal: ShallowRef<shallowRefValInterface> = shallowRef({
  count: 0,
  testObj: {
    count: 0,
  }
});

const shallowRefValString = computed(() => {
  return JSON.stringify(shallowRefVal.value);
});

type updateType = 'fail' | 'success' | 'trigger';
function updateRef(updateType: updateType) {
  if (updateType == 'fail') {
    shallowRefVal.value.count++;
    shallowRefVal.value.testObj.count++;
  }else if(updateType == 'trigger'){
    shallowRefVal.value.count++;
    shallowRefVal.value.testObj.count++;
    // triggerRef 方法强制更新浅ref数据更新
    triggerRef(shallowRefVal);
  } else if (updateType == 'success') {
    shallowRefVal.value = {
      count: 5,
      testObj: {
        count: 5,
      }
    }
  }
}
</script>

<style scoped></style>