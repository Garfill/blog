# 响应式原理

主要是利用了 **Object.defineProperty** 的方法

```js
Object.defineProperty(obj, prop, descriptor)
```

Vue 的原理是在 **描述符descriptor对象** 中定义了**getter / setter** 函数



## 响应式分析

在**初始化vm实例**过程中会执行一次 **initMixin** 函数

```js
// instance/init.js
function initMixin (Vue) {
  // 在 _init 函数中
  // 初始化 Vue 实例传入的data/props
  initState(vm); 
}
```

```js
// instance/state.js
function initState (vm) {
  vm._watchers = [] // 所有不同类型的watcher列表
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true)
  }
  // 初始化计算属性
  if (opts.computed) initComputed(vm, opts.computed) 
  if (opts.watch && opts.watch !== nativeWatch) { 
    // nativeWatch == ({}).watch == undefined
    initWatch(vm, opts.watch) // watch属性初始化
  }
}
```



## initProps

```js
// instance/state.js
function initProps (vm, propOptions) {
  // 父组件占位 vnode的componentOptions里的propData
  // 在创建 组件vm实例 初始化_init过程中合并到$options
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  
  if (!isRoot) {
    // 非根实例vm, 传入的不用设立观察者
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    // props 的校验
    const value = validateProp(key, propsOptions, propData, vm)
    defineReactive(props, key, value) // 响应式
    if (!(key in vm)) {
      // 这是以防在创建组件的时候传入构造器之外的props
      // 不是真正的props的数据劫持
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```

### props真正的数据劫持

```js
// global-api/extend.js
// 前面代码已经进行 mergeOptions
if (Sub.options.props) {
  initProps(Sub)
}

// 将props数据劫持到构造函数原型上，之后一旦进行实例化vm，就会自动在实例带上该属性
function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}
// proxy中真正进行数据劫持的是this，也就是vm实例
// 因此在访问实例vm的时候
// vm[key] = vm['_props'][key]
```

> 在**创建构造器函数**的时候就已经执行一次props的数据劫持，因此在vm实例初始化的时候一般不需要再进行数据劫持



### 重点分析 defineReactive

```js
// observre/index.js
function defineReactive (obj, key, val, cutomSetter, shallow) {
  const dep = new Dep() // 依赖收集用到的依赖列表
  const property = Object.getOwnPropertyDescriptor(obj, key) // 对应key的描述符对象
  if (property && property.configurable === false) return;
  
  // 原有的getter/setter
  const getter = property && property.get
  const setter = peroperty && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val) // 递归观察
  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举
    configurable: true, // 可设置
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      // 依赖收集相关
    },
    set: function (reactiveSetter) (newVal) {
    	const value = getter ? getter.call(obj) : val
  		// 判断前后不一样
  		if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
  		if (getter && !setter) return // no setter
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
  		// 派发更新相关
  	}
  })
}
```

**defineReactive** 是利用 **Object.defineProperty** 设置响应式数据

从而在引用值（如渲染函数执行）的时候**触发getter**来**收集对应的依赖Watcher**，改变值的时候**触发setter**引发更新



### observe

```js
// observer/index.js
function observe (value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return // 只针对对象类型的数据s响应式
  }
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 该数据对象已经做过响应式观察
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() && // 不是服务端渲染
    (Array.isArray(value) || isPlainObject(value)) && // 对象类型数据
    Object.isExtensible(value) && // 可扩展
    !value._isVue
  ) {
    ob = new Observer(value) // 观察者实例
  }
  
  if (asRootData && ob) {
    // 组件的data选项
    ob.vmCount++
  }
  return ob // 返回观察者实例，在defineReactive中用于递归观察深层次数据和派发更新用
}
```



### Observer类

```js
// Oberver/index.js
class Observer {
  constructor (value) {
    this.value = value;
    this.dep = new Dep(); // 该观察者实例的订阅者列表
    this.vmCount = 0;
    def(value, '__ob__', this) // obj.__ob__ = observer // 不可枚举
    // 针对数据类型进行深度遍历
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
        // arrayMethods: 数组原型上的方法对象
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
     	this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

只针对数据类型为 **数组** 和 **对象** 的数据设置**观察者____ob____，** 同时观察者实例中会有 **Dep** 订阅者列表



## initData

```js
// instance/index.js
if (opts.data) {
  initData(vm)
} else {
  observe(vm._data = {}, true)
}
```

### initData

```js
function initData (vm) {
  let data = vm.$options.data
  // 如果组件内的data是函数就调用函数，返回对象
  data = vm._data = typeof data === 'function' 
    ? getData(data, vm)
  	: data || {}
  const keys = Object.keys(data)
  const props = vm.$options.props
  const method = vm.$options.methods
  let i = keys.length
  while(i--) {
    const key = key[i]
    // 1. 检测有没有method和data重名
    // 2. 检查props和data的重名
    proxy(vm, `_data`, key) // 数据劫持
  }
  observe(data, true)
}
```

> 需要注意的是：在initData 过程中，shouldOberve是打开的（true），因此会进行深度遍历设置观察者



## proxy数据劫持的实现

```js
// instance/state.js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
// 这个数据劫持也是利用了 对象属性的描述符对象 来完成的
// getter 触发 vm[key] => vm['_data'][key]
function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

