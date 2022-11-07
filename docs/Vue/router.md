# vue-router
## Vue.use实现
首先，说明**Vue使用插件**的原理，也就是 **Vue.use**的实现
在 Vue 中的代码定义如下
```js
// core/global-api/use.js
function initUse(Vue) {
  Vue.use = function(plugin) {
    const installedPlugins = (this._installedPlugins || this._installPlugins
    // 注意这个use方法是vue的静态方法，this = vue
    if (installedPlugins.indexOf(plugin) > -1) {
      // 已经安装过的，有缓存
      return this
    }
    const args = toArray(arguments, 1)
    args.unshift(this) // Vue 作为参数注入到，作为第一个参数
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args) // 注意看这里，调用的上下文为null
    }
    installedPlugins.push(plugin)
    return this
    // return Vue
  }
}
```
### toArray 实现
```js
// shared/util.js
function toArray(list, start) {
  // 也就是将 start 位置开始的数组 复制到一个新的数组返回
  start = start || 0
  let i = list.length - start
  const ret = new Array(i)
  while(i--) {
    ret[i] = list[i + start]
  }
  return ret
}

```
> 接下来就是对 **router的具体实现**

## router 的具体入口
在vue-router使用中，一般是**导出之后使用 Vue.use(VueRouter)**
```js
// index.js
class VueRouter {
  static install: () => void
  //...
}
VueRouter.install = install

// install.js
function install(Vue) {
  if (install.installed && _Vue === Vue) return 
  // _Vue 是内部变量，Vue的副本
  install.installed = true
  _Vue = Vue
  const isDef = v => v !== undefined
  const registerInstance = (vm, callVal) => {
    // 路由注册方法
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }
  
  Vue.mixin({
    // 通过mixin混入钩子函数
    // Vue.mixin直接合并到Vue.options上，之后的每个组件都会执行这两个钩子
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        // 根节点，初始化router
        this._router.init(this)
        // 根节点设置响应式对象 this._route = this._router.history.current
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 非根节点，往上递归找到 根节点的router选项
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 通过 defineProperty 设置 this.$router 和 this.$route
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
  // view和link 组件注册
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
  // 合并策略
  const strats = Vue.config.optionMergeStrategies
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created

}

```
## init
**根组件**都会在 **beforeCreate钩子** 中执行 this.$options.init()
```js
// index.js 的 class 中
init(app) {
  this.apps.push(app)
  app.$once('hook:destroyed', () => {
    // 当注册的 vue实例销毁时，就要删除对应的router实例
    const index = this.apps.indexOf(app)
    if (index > -1) this.apps.splice(index, 1)
    if (this.app === app) this.app = this.apps[0] || null
    if (!this.app) this.history.teardown()    
  })
  
  if (this.app) return; // 已经注册过了
  this.app = app
  const history = this.history 
  // 一般先new 一个 router对象，所以这里会获取到 其history属性
if (history instanceof HTML5History || history instanceof HashHistory) {
  // 浏览器环境下的路由history属性
  const handleInitialScroll = routeOrError => {
    const from = history.current
    const expectScroll = this.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll && 'fullPath' in routeOrError) {
      handleScroll(this, routeOrError, from, false)
    }
  }
  const setupListeners = routeOrError => {
    history.setupListeners()
    handleInitialScroll(routeOrError)
  }
  history.transitionTo(
    // init 过程中，获取当前的路由地址，执行首次 transitionTo 的过渡
    history.getCurrentLocation(),
    setupListeners,
    setupListeners
  )
}

  history.listen(route => {
    this.apps.forEach(app => {
    // 路由变化，根实例的 _route 属性变化
    // 在上面mixin过程中，_route是根实例的响应式数据，子组件递归找到的也是新的_route
      app._route = route
    })
  })  
}
```

### transitionTo
这是history基本类的方法
```js
// history/base.js
class History {
  transitionTo (location, onComplete, onAbort) {
    const route = this.router.match(location, this.current)
    // 实际上调用了 router 的 match 方法，生成一条 route 路径
    // ...
    this.confirmTransition(
      route, // 上一步生成的路径对象
      () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
       //...
      }
    }
    
  }
}

// index.js
match (raw, current, redirectedFrom) {
  // 实际上就是 matcher 的 match 方法
  return this.matcher.match(raw, current, redirectedFrom)
}
```

## 初始化路由对象
然后通过 **new VueRouter** 初始化路由对象呢
```js
class VueRouter {
  //...
  constructor(options = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)
    
    let mode = options.mode || 'hash'
    // 判断是否支持 history 模式
    this.fallback = 
      mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
        // 不支持就改用 hash 模式
        mode = 'hash'
    }
    if (!inBrowser) {
        // 服务器 使用 抽象模式
        mode = 'abstract'
    }
    this.mode = mode
    // 根据不同的模式，建立不同的 history 对象
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
}

```
> 初始化：router对象实例化，主要有 **matcher对象属性** 和 **history 对象属性**
### supportsPushState 
用于判断是否在浏览器环境，同时判断该浏览器是否支持 history 模式
```js
  inBrowser = typeof window !== 'undefined'
  inBrowser &&
  (function () {
    const ua = window.navigator.userAgent

    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      // 特定 ua 直接返回false
      return false
    }

    return window.history && typeof window.history.pushState === 'function'
  })()
  // 主要判断 window.history 对象是否存在
```
### matcher
```js
// create-matcher.js
function createMatcher(routes, router) {
  // routes 就是传入的路由列表
  // 创建路由映射表
  const { pathList, pathMap, nameMap } = createRouteMap(routes)
  // 根据routes列表，生成对应的路由属性
  // ... 一些以后会用的 matcher 的属性方法
  function addRoutes (routes) {
    // 这里传入的是第一次生成返回的对象引用
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  return {
    match,
    addRoute,
    getRoutes,
    addRoutes
  }
  // 这个返回的对象就是matcher，返回的属性是上面定义的方法
}
```

### createRouteMap
```js
// create-route-map.js
function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap, parentRoute) {
  // routes 就是定义的路由列表
  const pathList = oldPathList || []
  const pathMap = oldPathMap || Object.create(null)
  const nameMap = oldNameMap || Object.create(null)
  
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route, parentRoute)
  }
  
  // 通配符，放到最后一位
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }
  // 返回对象引用，可用于后续动态添加路由
  return {
    pathList,
    pathMap,
    nameMap,
  }
}

function addRouteRecord(pathList, pathMap, nameMap, route, parent, matchAs)  {
  // 获取用户设置的path和name
  const { path, name } = route
  const pathToRegexpOptions = route.pathToRegexpOptions || {}
  // 就是获取完整path，如果有parent的话就拼起来
const normalizedPath=normalizePath(path,parent,pathToRegexpOptions.strict)
 // routeRecord 对象创建
 const record = {
   path: normalizedPath,
   regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
   alias: route.alias
      ? typeof route.alias === 'string'
        ? [route.alias]
        : route.alias
      : [],
    instances: {},
    enteredCbs: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props:
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props }
 }
 if (route.children) {
    // 遍历子路由，递归调用 addRouteRecord
    route.children.forEach(child => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
 }
  // 以完整的 path 为key，记录在map
   if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }
  // ... name也是根据 route.name记录在nameMap

}

// index.js
// VueRouter类中，需要手动添加 route 的时候，一般是用于权限控制
addRoutes(routes) {
  this.matcher.addRoutes(routes)
  //...
}
```
### match 方法
在 **transitionTo** 过程中，最终调用了 **matcher 的 match** 方法，生成一个 **route 路径对象**返回
```js
// create-matcher.js
function match(raw, currentRoute, redirectFrom) {
  // 生成一个对应的location
  const location = normalizeLocation(raw, currentRoute, false, router)
  const { name } = location
  if (name) {
    // 有设置name的情况
    const record = nameMap[name]
    if (!record) return _createRoute(null, location)
    const paramNames = record.regex.keys.filter(key => !key.optional).map(key => key.name)
    if (typeof location.params !== 'object') {
      location.params = {}
    }
    if (currentRoute && typeof currentRoute.params === 'object') {
      for (const key in currentRoute.params) {
        if (!(key in location.params) && paramNames.indexOf(key) > -1) {
          location.params[key] = currentRoute.params[key]
        }
      }
    }
    location.path = fillParams(record.path, location.params, `named route "${name}"`)
    return _createRoute(record, location, redirectedFrom)
  } else if (location.path) {
    location.params = {}
    for (let i = 0; i < pathList.length; i++) {
      const path = pathList[i]
      const record = pathMap[path]
      if (matchRoute(record.regex, location.path, location.params)) {
        return _createRoute(record, location, redirectedFrom)
      }
    }
  }
  return _createRoute(null, location) // 这是没有匹配到的情况
}
```
#### normalizeLocation
用于根据输入来计算返回新的 **location** 对象
```js
// util/location.js
function normalizeLocation(raw, current, append, router) {
  let next = typeof raw === 'string' ? { path: raw } : raw
  // ...
  const parsedPath = parsePath(next.path || '')
  const basePath = (current && current.path) || '/'
  // 根据前后的path对比，得到新的path
  const path = parsedPath.path
    ? resolvePath(parsedPath, basePath, append || next.append)
    : basePath
  //...
  // 返回的location对象
  return {
    _normalized: true,
    path,
    query,
    hash,
  }
  // query 和 hash 也是根据前后的变化计算得到
}

```

> 根据normalizeLocation生成的location，其中的name或者path属性，匹配到对应的 **RouteRecord**
> 最后使用 **_createRoute** 将 **RouteRecord** 生成一个 **Route** 对象

```js
// crate-matcher.js
function _createRoute(record, location, redirectedFrom) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    // 一般情况考虑最后这分枝
    return createRoute(record, location, redirectedFrom, router) 
}

// util/route.js
function createRoute(record, location, redirectedFrom, router) {
  let query = location.query || {}
  try {
    // 复制query
    query = clone(query)
  } catch (e) {}
  const route = {
    name: location.name || (record && record.name)
    // ...
    // matched 用于之后渲染组件提供了依据，包括路径上匹配的所有 RouteRecord
    matched: record ? formatMatch(record) : []
  }
  // 最终返回一条Route路径
  return Object.freeze(route) // 封冻route对象，不可修改属性
}

// util/route.js
function formatMatch(record) {
  const res = []
  while(record) {
    res.unshift(record)
    record = record.parent
  }
  return res
  // 往上递归寻找 RouteRecord 的父级
}
```
> 总结：初始化router对象实例，创建路由映射表routemap和pathmap等，之后matcher根据location生成路径对象route，最后根据route进行视图切换

## 路径切换
通过上面可以知道，**history对象** 通过 **transitionTo** 方法，实现路径切换
```js
// history/base.js
transition(location, onComplete, onAbort) {
  let route
  // 创建路径对象route
  route = this.router.match(location, this.current)
  const prev = this.current // 没切换之前的路径对象
  this.confirmTransition(route, () => {
    // 可以看到实际上调用了 confirmTransition 方法
    // 传递参数是生成的 新路径对象route，成功回调，失败回调
    this.updateRoute(route)
    onComplete && onComplete(route)
    this.ensureURL()
    this.router.afterHooks.forEach(hook => {
      hook && hook(route, prev)
    })
    
    if (!this.ready) {
    // 这是初始化 histroy 切换的时候会用的
      this.ready = true
      this.readyCbs.forEach(cb => cb(route))
    }
  }, () => { /**/ }
}

confirmTransition(route, onComplete, onAbort) {
  const current = this.current // 这是 history 实例维护的 当前route对象
  this.pending = route // 需要切换到的 路径route
  // ...
  const lastRouteIndex = route.matched.length - 1
  const lastCurrentIndex = current.matched.length - 1
  
  // 前后的 route 对象是一样的
  if (isSameRoute(route, current)
    && lastRouteIndex === lastCurrentIndex
    && route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]) {
      this.ensureURL()
      if (route.hash) {
        // 页面滑动到对应的hash位置
        handleScroll(this.router, current, route, false)
      }
      return //
    }

 // 根据前后 route 计算得到 对应不同状态的组件更新的队列
  const { updated, deactivated, activated } = resolveQueue(this.current.matched, route.matched)
  
  // 之后需要执行的路由守卫函数列表
  // 组件离开、路由进入、组件更新、组件进入、异步组件
  // 数组项是函数 (to, from, next) => {}
  const queue = [].concat(
    extractLeaveGuards(deactivated),
    this.router.beforeHooks,
    extractUpdateHooks(updated),
    activated.map(m => m.beforeEnter),
    resolveAsyncComponents(activated),
  )
  
  // 路由守卫迭代器函数
  const iterator = (hook, next) => {
    // 当前切换路由与pending的不对应
    if (this.pending !== route) {
        return abort(...)
    }
    try {
      // hook 三个参数对应路由守卫的 to, from, next 三个参数
      // 只有当守卫参数中的 next 调用的时候，才会调用到 迭代器函数的 next，才能执行下一个守卫函数
      hook(route, current, (to) => {
        if (to === false) {
          // 这里是用于 next(false) 的实现
          // 也就是中止路由跳转的
          this.ensureURL(true)
          abort(...)
        } else if (isError(to)) {
          this.ensureURL(true)
          abort(to)
        } else if (
          typeof to === 'string' ||
          (typeof to === 'object' &&
            (typeof to.path === 'string' || typeof to.name === 'string'))
        ){
          // ...
          if (typeof to === 'object' && to.replace) {
            this.replact(to)
          } else {
            this.push(to)
          }
        } else {
          next(to)
        }
      })
    } catch {}
  }
  
  runQueue(queue, iterator, () => {
    const enterGuards = extractEnterGuards(activated)
    const queue = enterGuards.concat(this.router.resolveHooks)
    // ...
  })
}
```

### resolveQueue
用于对比前后route对象的 matched 数组的差异，其中每一项是 RouteRecord
```js
// history/base.js
function resolveQueue(current, next) {
  let i
  const max = Math.max(current.length, next.length)
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  // 通过找到首个不一样的点，进行前后分割，得到三个不用的record列表
  // 之后就可以针对不同的列表，执行不同的路由守卫函数
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i),
  }
}
```
> 在确定好不同状态的record列表之后，就是抽离对应的路由导航钩子

```js
// history/base.js
function bindGuard(gurad, instance) {
  // 其中 instance 是 vue实例
  // 也就是将 guard 的上下文绑定为 instance
  if (instance) {
    return function boundRouteGuard() {
      return guard.apply(instance, arguments)
    }
  }
}

function extractLeaveGuards(deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractGuards(records, name, bind, reverse) {
  // 通过 flatMapComponents 获取所有 record 中的对应 name 的路由导航
  const guards = flatMapComponents(records, (def, instance, match, key) => {
    const guard = extractGuard(def, name) // 获取对应的钩子函数
    if (guard) {
      return Array.isArray(guard)
        // 绑定 路由导航函数 的 上下文 到 instance也就是vm实例上
        ? guard.map(guard => bind(guard, instance, match, key)
        : bind(guard, instance, match, key)
    }
  })
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard(def, key) {
  if (typeof def !== 'function') {
    def = _Vue.extend(def) // 传入的是component选项对象的话，先用extend方法，生成一个组件构造器函数
  }
  return def.options[key] // 也就是传入的options选项中的钩子函数
}
```

### runQueue
> 这是用在之前抽离的**路由导航列表**的**导航钩子任务队列**实现

```js
// util/async.js
function runQueue(queue, fn, cb) {
  // step 是每一步执行的函数
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        // fn 就是 迭代器函数 itarator
        // queue 就是hook队列
        // 函数参数 就是 迭代器第二个参数，当路由守卫的next调用，才会调用该参数
        // 最后递归调用 队列中 下一个路由守卫
        fn(queue[index], () => {
          step(index+1)
        }
      } else {
        step(index + 1)
      }
    }
  }
  
  step(0)
}

```
### flatMapComponents
> 在抽离导航守卫的过程中，用到 **flatMapComponents** 方法

```js
// util/resolve-components.js
function flatMapComponents (matched, fn) {
 // matched 是 RouteRecord 列表
 // flatten 作用是 二维数组拍平一维数组
  return flatten(matched.map(m => {
    // 返回的是 路由导航列表
    return Object.keys(m.components).map(key => fn(
      m.components[key],
      m.instances[key],
      m, key
    ))
  })
}

```

## 路由导航执行逻辑
路由导航钩子的执行顺序：实际就是 **导航钩子队列** 的顺序
```js
// history/base.js
const queue = [
  extractLeaveGuards(deactivated), // 组件的beforeRouteLeave
  this.router.beforeHooks, // router 全局 beforeEach
  extractUpdateHooks(updated), // 组件 beforeRouteUpdate
  activated.map(m => m.beforeEnter), // router 中 routeRecord 配置中的 beforeEnter
  resolveAsyncComponents(activated), // 异步组件
]
```
### beforeHooks
全局路由进入前的钩子
```js
// src/index.js
beforeEach(fn) {
  return registerHook(this.beforeHooks, fn)
}

function registerHook (list, fn) {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
```
VueRouter中其他**全局钩子** 实现原理一样，只是换了个钩子名。本质是将钩子函数存在**数组中**，调用的时候按顺序调用，**注册的时候返回的函数可以用于删除该钩子，做到动态钩子导入或删除**
#### resolveAsyncComponents
用于解析**router定义中的异步组件**，如**动态import或者require**
解析过程类似于**动态组件**
```js
// utils/resolve-components.js
function resolveAsyncComponents(matched) {
  // matched是匹配的record列表
  return (to, from, next) => {
    // 返回的函数作为钩子队列中的一项
    let hasAsync = false
    let pending = 0
    //..
    flatMapComponents(matched, (def, _, match, key) => {
      if (typeof def === 'function' && def.cid === undefined) {
        // () => import(comp)
        hasAsync = true
        pending++
        const resolve = once((resolvedDef) => {
          if (isESModule(resolvedDef)) {
            // es 模块化方案
            resolvedDef = resolvedDef.default
          }
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : _Vue.extend(resolvedDef)
          match.components[key] = resolvedDef 
          // 替换原来match的动态导入，下一次再用这个组件也不用重新加载
          pending--
          if (pending <= 0) {
            // matched 是通过map执行flatMapComponents的，当pending = 0 就是全部加载了
            next()
          }
        })
        const reject = () => { ... }
        let res
        try {
          res = def(resolve, reject) // def 动态导入函数执行
        }
        if (res) {
          if (typeof res.then === 'function') {
            // 返回promise，也就是webpack的import
            res.then(resolve, reject)
          } else {
            const comp = res.component
            // ... 也是 promise的处理
            comp.then(resolve, reject)
          }
        }
      }
    })
    if (!hasAsync) next()
  }
}

```
> 加载完所有**异步组件**之后，再调用**next**，之后是执行 **enterGuard导航钩子** 逻辑
```js
runQueue(queue, iterator, () => {
  // activated 的 record，抽离beforeRouteEnter
  // beforeRouteEnter 导航的next传入函数作为回调，可以访问vm实例 next(vm => {})
  const enterGuards = extractEnterGuards(activated)
  // router 的 全局beforeResolve 钩子
  const queue = enterGuards.concat(this.router.resolveHooks)
  runQueue(queue, iterator, () => {
    // 同样是任务队列的实现
    if (this.pending !== route) { return }
    this.pending = null
    onComplete(route)
    if (this.router.app) {
      // 所有enter执行之后的下一个tick
      this.router.app.$nextTick(() => {
        handleRouteEntered(route)
      })
    }
  })
})

// util/route.js
function handleRouteEntered (route: Route) {
  // route 当前切换到的 路径对象
  for (let i = 0; i < route.matched.length; i++) {
    const record = route.matched[i]
    for (const name in record.instances) {
      const instance = record.instances[name]
      const cbs = record.enteredCbs[name]
      if (!instance || !cbs) continue
      delete record.enteredCbs[name]
      for (let i = 0; i < cbs.length; i++) {
        // 这里是 beforeRouteEnter 的 next中传入的回调函数的执行，因为这时候已经可以访问到vm实例
        if (!instance._isBeingDestroyed) cbs[i](instance)
      }
    }
  }
}
```
> confirmTransition 执行过程到 **beforeResolve**， 之后就是 **onComplete 回调**

```js
// 这是传入的onComplete
  () => {
    this.updateRoute(route) // route 是需要切换到的 路径对象route
    onComplete && onComplete(route)
    this.ensureURL()
    this.router.afterHooks.forEach(hook => {
      // router 全局 afterEach
      hook && hook(route, prev)
    })
    if (!this.ready) {
      // 首次执行初始化的成功回调
      this.ready = true
      this.readyCbs.forEach(cb => {
        cb(route)
      })
    }
  },

// history/base.js
  updateRoute (route: Route) {
  // 将新的 route 对象赋值给 this.current
    this.current = route 
    // 执行 cb 回调，这里的cb是初始化时候 history.listen传入
    this.cb && this.cb(route)   
  }

```
> updateRoute之后，**导航被确认**， 调用 **afterEach**，之后会**触发DOM** 更新，最后通过 nextTick 执行 beforeRouteEnter 传入的 **next回调**

```js
  // index.js
  // VueRouter 在 init 过程中的最后逻辑
  // 在初始化history的时候，_route 会设置成响应式，改变值就会通知使用的组件派发更新
    history.listen(route => {
      this.apps.forEach(app => {
        app._route = route
      })
    })
```

## url
当点击 **router-link** 的时候，或者当使用 **this.$router.push** 的时候，就会 **切换router-view** 的视图组件
```js
// push 方法在各个 扩展history 类里面实现
// index.js
push (location) {
  // router中调用history的push方法
  this.history.push(location)
}

// history/html5.js
push (location) {
  const { current } = this
  this.transitionTo(location, route => {
    // 浏览记录入栈处理
    pushState(cleanPath(this.base + route.fullPath))
    // router的 全局scrollBehavior 的处理
    handleScroll(this.router, route, fromRoute, false)
    //...
  })
}
// 原理类似，将location转换成route对象，然后路径转换
// 路径转换成功的回调，pushState
// util/push-state.js
function pushState(url, replace) {
  saveScrollPosition()
  // 主要是利用了window.history原生属性进行 浏览状态的入栈和出栈
  const history = window.history
  try {
    if (replace) {
      const stateCopy = extend({}, history.state)
      stateCopy.key = getStateKey()
      history.replaceState(stateCopy, '', url)
    } else {
      // key是一个与 window.performance 相关的字符串
      history.pushState({
        key: setStateKey(genStateKey()), 
        '',
        url
      })
    }
  } catch {
    /// 
  }
}
```
> 在 hashHistory 中则是另一种实现

```js
// history/hash.js
push(location) {
  const { current: fromRoute } = this
  // 同样是 transitionTo 转换到对应的 路径对象，然后执行回调
  this.transitionTo(
    location,
    route => {
      pushHash(route.fullPath)
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    },
    onAbort
)}

function pushHash (path) {
  if (supportsPushState) {
    // 同样是用 window.history.pushState 实现
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}
function getUrl (path) {
  // 拼装成 完整的 带hash（#）路径返回到上层，执行pushState
  const href = window.location.href
  const i = href.indexOf('#')
  const base = i >= 0 ? href.slice(0, i) : href
  return `${base}#${path}`
}
```

### setupListeners


当点击浏览器**后退按钮**的时候也能切换视图，这是由于监听了**popstate事件/hashchange事件**
在history**第一次transitionTo**的时候，回调函数的**setupListeners**实现了监听

```js
// index.js
const handleInitialScroll = routeOrError => {
  const from = history.current
  const expectScroll = this.options.scrollBehavior
  const supportsScroll = supportsPushState && expectScroll
  if (supportsScroll && 'fullPath' in routeOrError) {
    handleScroll(this, routeOrError, from, false)
  }
}
const setupListeners = routeOrError => {
  // 调用history实例的setupListeners
  history.setupListeners()
  handleInitialScroll(routeOrError)
}
```

> 不同模式下定义方法不同

```js
// history/html5.js
setupListeners () {
  const router = this.router
  //...
  const handleRoutingEvent = () => {
    const current = this.current
    const location = getLocation(this.base)
    //...
    this.transitionTo(location, route => {
      // 针对滚动的处理
    })
  }
  // 通过监听 popstate，然后当改变了state的时候使用transitionTo改变route对象引起视图更新
  window.addEventListener('popstate', handleRoutingEvent)
  // 在router销毁的时候，会逐一执行listeners的函数
  this.listeners.push(() => {
      window.removeEventListener('popstate', handleRoutingEvent)
  })
}

// history/hash.js
  const handleRoutingEvent = () => {
    const current = this.current
    if (!ensureSlash()) {
        return
    }
    this.transitionTo(getHash(), route => {
        // ...
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    }
    // 同样是监听popstate，如果不支持就监听hashchange
    const eventType = supportsPushState ? 'popstate' : 'hashchange'
    window.addEventListener(
      eventType,
      handleRoutingEvent
    )
    this.listeners.push(() => {
      window.removeEventListener(eventType, handleRoutingEvent)
    })
```

## 组件

### router-view

```js
// components/view.js
export default {
  //...
  functional: true, // 函数式组件
  render (_, { props, children, parent, data}) {
    // 在data对象中标记
    data.rotuerView = true
    const h = parent.$createElement
    const name = props.name
    const route = parent.$route // 父组件vm的$route
    //...
    let depth = 0
    while (parent && parent._routeRoot !== parent) {
      const vnodeData = parent.$vnode ? parent.$vnode.data : {}
      if (vnodeData.routerView) {
        depth++
      }
      //..
      parent = parent.$parent // 往上寻找到视图根节点
    }
    data.routerViewDepth = depth
    //...
    
    const matched = route.matched[depth] // matched 是 route 路径对象的 匹配到的组件路径
    const component = matched && matched.components[name] // 获取对应的视图组件
    //..
    data.registerRouteInstance = (vm, val) => {
      // 注册 registerRouteInstance 方法
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        // 这里就是 在路径对象route上的instances加对应的组件引用，之后导航守卫钩子（beforeRouteEnter）中调用就能拿到对应的matched.instance
        matched.instances[name] = val
      }
    }
   
   //...
   // 最后是渲染matched匹配到的组件
   return h(component, data, children) 
  }
}
```

### registerRouteInstance
> 这是用于注册路由视图组件到matched的方法

```js
// install.js
const registerInstance = (vm, callVal) => {
    // 当前router-view渲染的组件vnode（上面matched到的），data也是上面传的标记
    // vm 是router-view渲染组件vm
    let i = vm.$options._parentVnode 
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

Vue.mixin({
  beforeCreate() {
    //..
    registerInstance(this, this)
  },
   destroyed: function destroyed () {
     // 用于切换时候销毁
        registerInstance(this);
    }
})
```

### router-link
```js
// component/link.js
export default {
  render (h) {
    const router = this.$router
    const current = this.$route
    // 使用 router 的 resolve 方法，得到对应这个link链接的location对象和route路径对象
    const { location, route, href } = router.resolve(
      this.to,
      current,
      this.append
    )

    //... 最终的目标路径对象
    const compareTarget = route.redirectedFrom
      ? createRoute(null, normalizeLocation(route.redirectedFrom), null, router)
      : route
    // ... 事件处理函数
    const handler = e => {
      if (guardEvent(e)) {
        if (this.replace) {
          router.replace(location, noop)
        } else {
          router.push(location, noop)
        }
      }
    }
    // 渲染函数 data对象 中的on事件对象
    // guardEvent 就是阻止默认事件
    const on = { click: guardEvent }
    if (Array.isArray(this.event)) {
      this.event.forEach(e => {
        on[e] = handler
      })
    } else {
      on[this.event] = handler
    }

    if (this.tag == 'a'){
      data.on = on
      //..
    } else {
      // 寻找 默认插槽 中的 a标签元素
      const a = findAnchor(this.$slots.default)
      if (a) {
        a.isStatic = false
        const aData = (a.data = extend({}, a.data))
        aData.on = aData.on || {}
        // ... 将on事件对象与adata中的on合并未数组
      } else {
        data.on = on
      }
    }
    // 最后根据传入的tag渲染
   return h(this.tag, data, this.$slots.default)
  }
}

```