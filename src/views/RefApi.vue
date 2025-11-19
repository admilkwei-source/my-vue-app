<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Vue Reactivity API 演示</h1>
        <p class="text-lg text-gray-600">探索 Vue 3 的响应式系统进阶用法</p>
      </div>
      
      <div class="space-y-8">
        <ShallowRef />
        <CustomRef />
        <ShallowReactive />
        <ToRaw></ToRaw>
        <MarkRaw></MarkRaw>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ShallowRef from '@/components/refApi/ShallowRef.vue';
import CustomRef from '@/components/refApi/CustomRef.vue';
import ShallowReactive from '@/components/refApi/ShallowReactive.vue';
import ToRaw from '@/components/refApi/ToRaw.vue';
import MarkRaw from '@/components/refApi/MarkRaw.vue';
</script>

<style scoped>

</style>