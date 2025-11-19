<template>
    <div class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div class="border-b border-gray-200 pb-4 mb-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">MarkRaw 测试用例</h1>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">说明：</h4>
            <div class="bg-green-50 rounded-lg p-4">
                <ul class="space-y-2 text-sm text-gray-700">
                    <li class="flex items-start">
                        <span
                            class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                        <span>
                            将一个对象标记为不可被转为代理。返回该对象本身。
                            被标记为markRaw的对象，会丢失响应式数据。
                        </span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="space-y-4">
            <div>
                <input v-model="state.name"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all outline-none text-gray-900 placeholder-gray-400"
                    placeholder="请输入姓名"></input>
                <br></br>
                <input v-model="state.age" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all outline-none text-gray-900 placeholder-gray-400" placeholder="请输入年龄"></input>
                <br></br>
                <div>姓名：{{ state.name }}</div>
                <br></br>
                <div>年龄：{{ state.age }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, markRaw, ref, computed } from 'vue';
defineOptions({
    name: 'MarkRaw',
});

let state = markRaw({
    name: 'John',
    age: 30,
});

const flag = ref(false);

const updateState = ():void => {
    flag.value = !flag.value;
    if(flag.value){
        state = markRaw(state);
    }else{
        state = reactive(state);
    }
}

</script>