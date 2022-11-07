# 计算属性 

```js
// instance/state.js
if (opts.computed) initComputed(vm, opts.computed)

function initComputed (vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null) // vm中定义计算watcher
  const isSSR = isServerRendering() // 服务端渲染判断 false
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get // 获取定义
    if (!isSSR) {
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOpt){
        // computedWatcherOptions === { lazy: true }
      }
    }
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else {
      // 与props或者data属性重名了
    }
  }
}
```



## Computed  类 Watcher

```js
// observer/watcher.js
class Watcher {
  constructor (vm, expOrFn, cb, options, isRenderWatcher) {
    // vm, getter, noop, { lazy: true }, undeined
    this.vm = vm
    ...
    if (options) {
      this.lazy = !!options.layz // lazy = true
    }
    ...
    this.dirty = this.lazy
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    }
    
    this.value = this.lazy ? undefined : this.get()
    // lazy = true, 第一次初始化watcher实例的时候是不计算的，延迟计算
  }
  evaluate () {
    // 专门给 计算watcher使用的
    this.value = this.get()
    this.dirty = false
  }
}
```



## Computed 计算的时机

> 上面知道在创建watcher的时候是延迟计算的，那么真正的计算，获取值的时机是defineComputed

### defineComputed

```js
// instance/state.js
function defineComputed (target, key, userDef) {
  const shouldCache = !isServerRendering() // true
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
    	?	createComputedGetter(key) // 返回一个函数
    	: createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    // 当设置的computed 是一个对象的时候
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

### createComputedGetter

```js
function createComputedGetter (key) {
  return function computedGetter () { // _render 创建vnode过程中访问
    const watcher = this._computedWatchers && this._computedWatchers[key] 
    // this = vm，拿到vm实例中对应的计算watcher
    if (watcher) {
      if (watcher.dirty) { // 第一次计算的时候true
        watcher.evaluate()
        // 这一步执行watcher传入的getter，这一步中 Dep.target会变成当前 computedWatcher，那么计算过程中所需要的各个data/props则会收集到这个watcher加入他们的订阅者队列
        // evaluate过程后 Dep.target 出栈当前的 computedWatcher
      }
      if (Dep.target) { 
        // 假如还有上一层watcher，如渲染watcher或者另一个调用的computedWatcher
        watcher.depend()
        // dep 的订阅者添加 渲watcher，watcher依赖池添加dep，这些dep是计算过程中收集的
      }
      return watcher.value // 返回计算值
    }
  }
}

```



## 当修改computed所依赖的数据

从之前defineReactive中可以知道，修改computed所以依赖的（data、props），会重新触发watcher 的update 方法

```js
// observer/watcher.js
update () {
  if (this.lazy) {
    this.dirty = true; // 更改dirty标识位，标记为脏数据
  } else {
    ...
  }
}
```

然后由于在上面计算过程中，computed属性的**依赖数据的订阅者**会添加**渲染watcher**，因此会触发（data、props）的watcher的update，也就是**queueWatcher**方法，将渲染watcher推入更新队列

> 以前版本中，计算watcher 还会有专门为 调用它的 渲染watcher 设置一个dep实例用于存放渲染watcher，但依赖的data就不会收集这个渲染watcher，这样个人感觉不利于维护，对于这个特殊的dep实例难以理解，换成新版本时，直接在依赖项收集渲染watcher更符合思维惯性