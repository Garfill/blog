# 侦听属性



## 侦听属性的初始化

同样是在 initState 的时候

```js
// instance/state.js
if (opts.watch && opts.watch !== nativeWatch) {
  initWatch(vm, opts.watch)
}
```

## initWatch

```js
// instance/state.js
function initWatch (vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) { 
        // 如果watch的定义中handler是个数组
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```

## createWatcher

```js
function createWatcher (vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    // 参数规范化
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler] // 回调是vm实例中的method
  }
  return vm.$watch(expOrFn, handler, options) // 最终的调用$watch
}
```

## $watch

```js
// instance/state.js
Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this // vm
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options) // 组件内手动调用的$watch
  }
  opions = options || {}
  options.user = true
  const watcher = new Watcher(vm, expOrFn, cb, options) // userWatcher
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value) 
      // 如果immediate=true，立即执行一次，注意这时候还没挂载，还在initState的调用栈内
    }
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}
```

## userWatcher

```js
// observer/watcher.js
class Watcher {
  contructor(vm, expOrFn, options, isRenderWatcher) {
    // expOrFn 则是要观察的数据对象key，一般为字符串
    if (options) {
      this.user = !!opions.user // true
    }
    if (typeof expOrFn === 'function') {
      // 其实观察的key也可以是个函数，相当于观察一个computed的值
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn) // 根据字符串返回值
    }
    this.value = this.lazy ? undefined : this.get() 
    // 先调用一次get，求一次值
  }
  get () {
    pushTarget(this) // 这里Dep.target变为了这个userWatcher
    try {
      value = this.getter.call(vm, vm) 
      // 求值函数的调用
      // 如果观察的key是函数，就直接调用，如果不是就是上面parsePath的返回
    }
  }
}
```



### parsePath

```js
// util/lang.js
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`) 
// /[^unicode.$_num]/  其中.是字符串，非转义，num代表数字
function parsePath (path) {
  if (bailRE.test(path)) {
    return;
  }
  const segments = path.split('.')
  // 返回的函数就是getter，调用时Dep.target是userWatcher
  // 调用到vm实例内的数据则会触发其get函数，收集依赖
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segment[i]]
    }
    return obj
  }
}
```



### 当修改了watch的数据

> 修改了已经被watch 的数据，会触发watcher的update，最终执行watcher的run

```js
// observer/watcher.js
run () {
  if (this.active) {
    const value = this.get() // getter函数触发，进行求值
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value
      this.value = value
      if (this.user) {
      	try {
          // cb就是定义好的watch回调
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
}
```



## 深度遍历deep

> watch 的定义中有个deep选项

```js
// observer/watcher.js
get () {
  pushTarget(this)
  if (this.deep) {
    traverse(value) // 深度遍历
  }
  popTarget()
}
```

### traverse

```js
// observer/traverse.js
const seenObjects = new Set()
function traverse (val) {
  _traverse(val, seenObject)
  seenObject.clear()
}

function _traverse (val, seen) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return // 非对象类型，或者已经冻结的对象值
  }
  if (val.__ob__) {
    // 有ob实例，被观测的
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return;// 避免重复添加
    }
    seen.add(depId)
  }
  // 这样就能达到遍历了对象或者数组里面所有值的效果，遍历过程中就能触发他们的get，从而收集此时的userWatcher作为其订阅者，从而修改深层数据也能触发
  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
```





