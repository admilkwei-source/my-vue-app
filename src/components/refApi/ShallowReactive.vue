<template>
  <div class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
    <div class="border-b border-gray-200 pb-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">shallowReactive 测试用例</h1>
      <h4 class="text-sm font-semibold text-gray-700 mb-3">说明：</h4>
      <div class="bg-green-50 rounded-lg p-4">
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
            <span>shallowReactive 方法用于创建一个浅层的响应式对象，只处理对象的第一层属性，不会递归处理子属性。</span>
          </li>
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
            <span>点击按钮触发更新，嵌套对象属性没有响应式更新。</span>
          </li>
          <li class="flex items-start">
            <span class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
            <span>有看到 state.nested.bar 在视图上也有更新，但这是由于 foo 的更新触发了整个对象的重新渲染。</span>
          </li>
        </ul>
      </div>
    </div>

    <button @click="updateState"
            class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 mb-6">
      🚀 更新状态
    </button>

    <div class="bg-gray-50 rounded-lg p-4 space-y-3">
      <div class="bg-white rounded p-3 border-l-4 border-indigo-500">
        <span class="text-xs font-semibold text-gray-500 uppercase">完整对象</span>
        <p class="font-mono text-sm text-gray-800 mt-1">{{ stateString }}</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-3">
        <div class="bg-white rounded p-4 border-l-4 border-green-500">
          <span class="text-xs font-semibold text-gray-500 uppercase">state.foo (立即更新)</span>
          <p class="font-mono text-3xl font-bold text-green-600 mt-2">{{ state.foo }}</p>
        </div>
        <div class="bg-white rounded p-4 border-l-4 border-emerald-500">
          <span class="text-xs font-semibold text-gray-500 uppercase">state.nested.bar (1秒后)</span>
          <p class="font-mono text-3xl font-bold text-emerald-600 mt-2">{{ state.nested.bar }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed,  shallowReactive, type ShallowReactive } from 'vue';
defineOptions({
    name: 'ShallowReactive',
});

interface stateInterface {
    foo: number;
    nested: {
        bar: number;
    };
}

const state: ShallowReactive<stateInterface> = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
});

const stateString = computed(() => {
    return JSON.stringify(state);
});

const updateState = (): void => {
    state.foo++;
    setTimeout(() => {
        state.nested.bar++;
    }, 1000);
};

</script>

<style scoped>

</style>