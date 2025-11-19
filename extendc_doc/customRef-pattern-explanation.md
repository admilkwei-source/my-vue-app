# CustomRef 参数传递模式详解

## 🎯 核心问题
你的疑问：`customRef((track, trigger) => {...})` 中的 `track` 和 `trigger` 是如何能够被调用的？

## 📝 简单答案
这是 JavaScript 的**回调函数**和**闭包**机制。`customRef` 函数内部定义了 `track` 和 `trigger`，然后把它们作为参数传递给你的回调函数。

---

## 🔍 逐步拆解

### 步骤 1️⃣：customRef 内部定义函数
```javascript
function customRef(factory) {
    // 内部定义两个函数
    const track = () => {
        console.log('收集依赖');
    };
    
    const trigger = () => {
        console.log('触发更新');
    };
    
    // ... 下一步
}
```

### 步骤 2️⃣：调用你传入的回调函数，并传参
```javascript
function customRef(factory) {
    const track = () => { /* ... */ };
    const trigger = () => { /* ... */ };
    
    // 调用 factory 函数，把 track 和 trigger 传给它
    const result = factory(track, trigger);
    //                     ↑      ↑
    //                     |      |
    //            这两个函数被传递给你的回调
    
    return result;
}
```

### 步骤 3️⃣：你的回调函数接收参数
```javascript
customRef((track, trigger) => {
    //        ↑      ↑
    //        |      |
    //   接收传入的两个函数
    
    let value = '';
    
    return {
        get() {
            track();  // ✅ 可以调用！因为它是传入的参数
            return value;
        },
        set(newValue) {
            value = newValue;
            trigger();  // ✅ 可以调用！因为它是传入的参数
        }
    };
});
```

---

## 🌟 完整执行流程

```
┌─────────────────────────────────────────────────────────┐
│  你调用：customRef((track, trigger) => {...})           │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  customRef 函数执行：                                    │
│  1. const track = () => { 依赖收集逻辑 }                 │
│  2. const trigger = () => { 触发更新逻辑 }               │
│  3. 调用你的回调：factory(track, trigger)               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  你的回调函数执行：                                      │
│  参数 track   ← 接收到 customRef 传入的 track 函数      │
│  参数 trigger ← 接收到 customRef 传入的 trigger 函数    │
│                                                          │
│  返回 { get() {...}, set() {...} }                      │
│  get/set 内部可以调用 track 和 trigger（闭包）          │
└──────────────────────────────────────────────────────────┘
```

---

## 💡 类比生活中的例子

想象你去餐厅吃饭：

```javascript
function 餐厅(你的订餐回调) {
    // 餐厅内部有两个服务
    const 点菜 = () => console.log('服务员记录你的订单');
    const 上菜 = () => console.log('服务员端菜上桌');
    
    // 把这两个服务交给你使用
    你的订餐回调(点菜, 上菜);
}

// 你去餐厅
餐厅((点菜服务, 上菜服务) => {
    点菜服务();  // 你调用点菜
    // 等待一会儿
    上菜服务();  // 你调用上菜
});
```

**餐厅（customRef）** 提供了服务（track, trigger），你只需要在合适的时候调用它们即可！

---

## 🧪 最简化的实现

```javascript
// 这就是核心原理！
function customRef(callback) {
    const track = () => console.log('track 被调用');
    const trigger = () => console.log('trigger 被调用');
    
    return callback(track, trigger);
    //     ↑        ↑      ↑
    //     |        |      |
    //     调用     传参1   传参2
}

// 使用
customRef((t, tr) => {
    t();   // 输出: track 被调用
    tr();  // 输出: trigger 被调用
});
```

---

## 🔑 关键概念

### 1. **高阶函数**
`customRef` 是一个高阶函数，它接收一个函数作为参数。

### 2. **回调函数**
你传入的 `(track, trigger) => {...}` 是一个回调函数，会被 `customRef` 调用。

### 3. **闭包**
你返回的 `get` 和 `set` 函数能够访问外层的 `track` 和 `trigger` 参数，这就是闭包。

```javascript
customRef((track, trigger) => {
    // track 和 trigger 在这个作用域
    
    return {
        get() {
            track();  // ✅ 闭包：可以访问外层的 track
        },
        set() {
            trigger();  // ✅ 闭包：可以访问外层的 trigger
        }
    };
});
```

---

## 📊 对比你的 Vue 代码

```javascript
// 你的代码
const text = customRef((track, trigger) => {
    let value = '';
    
    return {
        get() {
            track();    // ← 为什么能调用？因为它是参数
            return value;
        },
        set(newValue) {
            value = newValue;
            trigger();  // ← 为什么能调用？因为它是参数
        }
    };
});
```

**为什么 `track` 和 `trigger` 能调用？**
- 因为它们是 `customRef` 内部创建并传递给你的函数参数
- 就像任何函数的参数一样，可以直接调用

```javascript
function example(fn1, fn2) {
    fn1();  // ✅ 参数是函数，可以调用
    fn2();  // ✅ 参数是函数，可以调用
}

example(
    () => console.log('第一个函数'),
    () => console.log('第二个函数')
);
```

---

## ✅ 总结

| 问题 | 答案 |
|------|------|
| `track` 和 `trigger` 从哪来？ | `customRef` 内部定义的 |
| 为什么能在回调中使用？ | `customRef` 把它们作为参数传递给你的回调函数 |
| 原理是什么？ | JavaScript 的函数参数传递 + 闭包 |
| 难吗？ | 不难！这是 JS 基础特性，和普通函数传参一样 |

**核心就是：** `customRef` 创建了两个函数，然后把它们传递给你的回调函数，你就可以使用了！

