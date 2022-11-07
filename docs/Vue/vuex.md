# Vuex

Vuex 是Vue专属的**状态管理库**

## 安装

同样是**Vue.use**安装
```js
// store.js
function install (_Vue) {
  if (Vue && _Vue === Vue) {
    // 重复安装
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
// mixin.js
function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    // Vue2 使用 mixin 注入到beforeCreate
    Vue.mixin({ beforeCreate: vuexInit })
  }
}

function vuexInit () {
    const options = this.$options
    if (options.store) {
      // 根节点
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      // 非根节点向上递归，类似 router
      this.$store = options.parent.$store
    }
}
```

## 初始化

一般是使用 **new Vuex.Store(options)** 传入配置对象，返回store实例

```js
// store.js
class Store {
  constructor(options = {}) {
    const {
      plugins = [],
      strict = false
    } = options
    // 一些参数初始化
    this._committing = false // 提交操作中的标识
    this._actions = Object.create(null)
    this._actionSubscribers = []
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)
    // 将 modules 的 state 写成树状 ModuleCollection
    this._modules = new ModuleCollection(options)
    this._modulesNamespaceMap = Object.create(null)
    this._subscribers = []
    this._watcherVM = new Vue()
    this._makeLocalGettersCache = Object.create(null)
    // 绑定 $store.commit/dispatch 的 上下文
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }
    // 根部的 state，不包含module的state
    const state = this._modules.root.state
    installModule(this, state, [], this._modules.root)
    resetStoreVM(this, state)
    //...
  }
}


function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length // 根 state 标识
  // 当前的state的命名空间
  const namespace = store._modules.getNamespace(path) 
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      // 重复的命名空间
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    // 每个命名空间是存到 store 的 _modulesNamespaceMap 上
    store._modulesNamespaceMap[namespace] = module
  }

  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      // .. 响应式注册 modules 的state 到父级state上
      // 因此可以通过 $store.state[modulesName] 获取到嵌套的state
      Vue.set(parentState, moduleName, module.state)
    })
  }
  
  // 生成local，用于mutation或者action或者getter调用
  const local = module.context = makeLocalContext(store, namespace, path)
  // 绑定local，以便外部调用的时候可以找到对应的state
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key // module/mutation
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

### makeLocalContext

> 返回用于store执行**getters**等的上下文

```js
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === '' // 是否有设置命名空间
  // local 就是返回的结果
  // 如果没有命名空间，就用回 store实例上 的方法
  const local = {
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._actions[type]) {
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters // 跟state或者是没有命名空间的
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}

function makeLocalGetters (store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    const gettersProxy = {}
    const splitPos = namespace.length
    Object.keys(store.getters).forEach(type => {
      // 遍历所有存储到getters上的
      // 不是这个命名空间的跳过
      if (type.slice(0, splitPos) !== namespace) return

      // 将属于这个命名空间的存起来缓存
      const localType = type.slice(splitPos)
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      })
    })
    store._makeLocalGettersCache[namespace] = gettersProxy
  }
  // 有缓存过直接拿
  return store._makeLocalGettersCache[namespace]
}
```

#### local各模块相关的注册

```js
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
  // 最后会注册到 store._mutations 以数组形式存储
}

function registerAction (store, type, handler, local) {
  // 注册action，同样是以数组形式存储
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    if (!isPromise(res)) {
      // 最终转换，返回一个promise
      res = Promise.resolve(res)
    }
    return res    
  })
}

function registerGetter (store, type, rawGetter, local) {
  // 以函数形式，存储getters
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```

### resetStoreVM

```js
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm
  store.getters = {}
  store._makeLocalGettersCache = Object.create(null)
  // 初始化是空对象，在local安装之后会对应每个命名空间的getter
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // key是包含命名空间的
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })
  // 上面将命名空间作为key，对应的wrappedGetter作为value，保存到computed对象
  // 同时设置了 store.getters 属性，之后可以直接 $store.getters[key] 取值
  
  const silent = Vue.config.silent
  Vue.config.silent = true
  // 本质上 state和getter 还是通过 Vue 建立的 vm实例，所以vuex才是Vue专属的
  store._vm = new Vue({
    data: {
      $$state: state
      // store 类中，针对 store的state，是通过设置了get来重定位到 $$state 的值
    },
    computed
    // getter 转化成computed，妙啊
  })
  if (oldVm) {
    // 如果执行动态注入模块，需要销毁旧组件实例
    if (hot) {
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

```

## API

Vuex 进行**数据修改**，本质上就是对**store._vm**里面的data进行修改

### mutation

> mutation 的注册参考上面**installModule**

```js
// 当使用 $store.commit 来调用
  // 这是没有命名空间的情况
  commit (_type, _payload, _options) {
    // 参数格式化
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    const entry = this._mutations[type]
    // 注册过程中，将mutation函数放在数组中
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        // 逐一调用注册的处理函数
        handler(payload)
        // 最后handler的传入参数是 local.state 和 payload
      })
    })
    // ...
  }
```

### action

> mutation适用于同步修改数据的操作，如果需要跟后端进行交互的异步操作，则是需要使用action

```js
// $store.dispatch 调用
  dispatch (_type, _payload) {
    // check object-style dispatch
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    const entry = this._actions[type]
    // 初始化过程中会注册actions
    if (!entry) {
        return
    }

    try {
      this._actionSubscribers
        .slice()
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    }
    // 执行注册的actions
    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
    
    // entry 返回的都是 已经resolve的Promise
    // dispatch 最终返回的是 Promise
    return new Promise((resolve, reject) => {
      result.then(res => {
        try {
          // 如果有store的订阅就会执行
          this._actionSubscribers
            .filter(sub => sub.after)
            .forEach(sub => sub.after(action, this.state))
        }
        resolve(res)
      }, error => {
        try {
          this._actionSubscribers
            .filter(sub => sub.error)
            .forEach(sub => sub.error(action, this.state, error))
        }
        reject(error)
      })
    })
  }

```


## 语法糖

### mapState为例子，其他几个辅助函数都一样流程原理

> 用于将 store 的 state 作为 **vm实例的compputed** 使用

```js
// helper.js
mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  // normalizeMap 将传入的states格式化成 { key, val } 形式
  // 其中val就是传入的定义，可能是函数，或者是字符串
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      // res 是返回给computed，执行的this是vm上下文
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        // 如果有命名空间
        // 在初始化的时候会注册，这里是到 store._modulesNamespaceMap 取出module
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        // module.context 其实就是之前生成的 local
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})

function normalizeNamespace (fn) {
  // 返回一个函数，函数返回的结果是一个对象作为computed
  return (namespace, map) => {
    // 如果传入第一个参数是字符串，就认为是 命名空间
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    // 返回上面的res作为compputed
    return fn(namespace, map)
  }
}
```

## 动态更新模块

> 适用于**初始化store之后**，在**重新注入新的模块**

### registerModule

```js
  registerModule (path, rawModule, options = {}) {
    if (typeof path === 'string') path = [path]
    this._modules.register(path, rawModule)
    installModule(this, this.state, path, this._modules.get(path), options.preserveState)
    // 重新设立vm实例，并销毁旧的vm实例
    resetStoreVM(this, this.state)
  }
```

### unregisterModule

```js
  unregisterModule (path) {
    if (typeof path === 'string') path = [path]
    // 在模块中删除，之后重新初始化注册的时候就不会注册这个子模块
    this._modules.unregister(path)
    this._withCommit(() => {
      // 删除指定的模块的state的响应式属性
      const parentState = getNestedState(this.state, path.slice(0, -1))
      Vue.delete(parentState, path[path.length - 1])
    })
    resetStore(this)
  }
  
  
function resetStore (store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  // 重新执行初始化
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state, hot)
}

```

