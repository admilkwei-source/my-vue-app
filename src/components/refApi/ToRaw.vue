<template>
    <div class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div class="border-b border-gray-200 pb-4 mb-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">ToRaw 测试用例</h1>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">说明：</h4>
            <div class="bg-green-50 rounded-lg p-4">
                <ul class="space-y-2 text-sm text-gray-700">
                    <li class="flex items-start">
                        <span
                            class="inline-block w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                        <span>
                            toRaw() 可以返回由 reactive()、readonly()、shallowReactive() 或者 shallowReadonly() 创建的代理对应的原始对象。
                            <br>
                            这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。
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
                <br></br>
                <button @click="updateState" class="sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 mb-6">{{ flagText }}</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, toRaw, ref, computed } from 'vue';
defineOptions({
    name: 'ToRaw',
});

let state = reactive({
    name: 'John',
    age: 30,
});

const flag = ref(false);

const flagText = computed(() => {
    return flag.value ? '设为reactive状态' : '设为toRaw状态';
});

const updateState = ():void => {
    flag.value = !flag.value;
    if(flag){
        state = toRaw(state);
    }else{
        state = reactive(state);
    }
}

</script>