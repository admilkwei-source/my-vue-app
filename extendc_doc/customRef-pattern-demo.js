// ========================================
// 演示：customRef 参数传递模式的实现原理
// ========================================

// 1. 最简单的例子：理解回调函数接收参数
console.log('=== 示例1：基础回调函数 ===');
function simpleExample(callback) {
    // 函数内部定义两个函数
    const sayHello = () => console.log('Hello!');
    const sayBye = () => console.log('Bye!');
    
    // 调用回调函数，并把这两个函数传递给它
    callback(sayHello, sayBye);
}

// 使用时，你的回调函数就能接收到这两个函数
simpleExample((hello, bye) => {
    hello();  // 输出: Hello!
    bye();    // 输出: Bye!
});


// 2. 模拟 customRef 的实现原理
console.log('\n=== 示例2：模拟 customRef ===');
function myCustomRef(factory) {
    // 内部定义 track 和 trigger 函数
    const track = () => {
        console.log('[track] 收集依赖');
    };
    
    const trigger = () => {
        console.log('[trigger] 触发更新');
    };
    
    // 调用用户传入的工厂函数，把 track 和 trigger 传给它
    // 用户的函数会返回一个包含 get 和 set 的对象
    const refObject = factory(track, trigger);
    
    return refObject;
}

// 使用方式（和你的 Vue 代码类似）
const myRef = myCustomRef((track, trigger) => {
    let value = 'initial';
    
    return {
        get() {
            track();  // 调用传入的 track 函数
            return value;
        },
        set(newValue) {
            value = newValue;
            trigger();  // 调用传入的 trigger 函数
        }
    };
});

console.log(myRef.get());  // 输出: [track] 收集依赖 \n initial
myRef.set('updated');       // 输出: [trigger] 触发更新


// 3. 更详细的示例：展示闭包的作用
console.log('\n=== 示例3：闭包的作用 ===');
function createCounter(setup) {
    let count = 0;
    
    // 定义内部函数
    const increment = () => {
        count++;
        console.log(`count 增加到: ${count}`);
    };
    
    const decrement = () => {
        count--;
        console.log(`count 减少到: ${count}`);
    };
    
    // 调用 setup 函数，传入这两个函数
    // setup 函数可以决定何时、如何调用它们
    return setup(increment, decrement);
}

// 使用：创建一个只能增加的计数器
const onlyIncrease = createCounter((inc, dec) => {
    return {
        add: () => {
            inc();  // 我们可以调用传入的 inc
        }
        // 我们选择不暴露 dec，所以外部无法减少
    };
});

onlyIncrease.add();  // 输出: count 增加到: 1
onlyIncrease.add();  // 输出: count 增加到: 2


// 4. 完整模拟你的 Vue customRef 使用场景
console.log('\n=== 示例4：完整模拟 ===');
function customRef(factory) {
    // 依赖收集器（简化版）
    const deps = new Set();
    
    const track = () => {
        console.log('📌 正在收集依赖（谁在读取这个值）');
        // 实际 Vue 中会记录当前的 effect
    };
    
    const trigger = () => {
        console.log('🔔 通知所有依赖更新（触发重新渲染）');
        // 实际 Vue 中会执行所有收集的 effects
    };
    
    // 关键点：调用 factory，把 track 和 trigger 传进去
    const { get, set } = factory(track, trigger);
    
    // 返回一个 ref 对象
    return {
        get value() {
            return get();
        },
        set value(newVal) {
            set(newVal);
        }
    };
}

// 使用（和你的代码一样）
const debouncedRef = customRef((track, trigger) => {
    let internalValue = '';
    let timer;
    
    return {
        get() {
            track();  // ← 这里能调用 track
            return internalValue;
        },
        set(newValue) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                internalValue = newValue;
                trigger();  // ← 这里能调用 trigger
            }, 1000);
        }
    };
});

console.log('读取值:', debouncedRef.value);  // 触发 get
debouncedRef.value = 'hello';                 // 触发 set
setTimeout(() => {
    console.log('1秒后，值被更新为:', debouncedRef.value);
}, 1100);


// ========================================
// 核心原理总结
// ========================================
console.log('\n=== 核心原理 ===');
console.log(`
1. customRef 函数内部定义了 track 和 trigger 两个函数
2. 它调用你传入的回调函数（工厂函数），并把这两个函数作为参数传递
3. 你的回调函数接收这两个参数，就可以在返回的 get/set 中调用它们
4. 这是通过【闭包】实现的：你的 get/set 函数可以访问外层传入的 track 和 trigger

伪代码：
function customRef(yourCallback) {
    const track = () => { /* 依赖收集逻辑 */ };
    const trigger = () => { /* 触发更新逻辑 */ };
    
    // 把 track 和 trigger 传给你的回调
    return yourCallback(track, trigger);
}
`);

