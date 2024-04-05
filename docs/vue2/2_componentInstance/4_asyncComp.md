# 异步组件



## 工厂函数实现异步组件

```js
// 示例
Vue.component('async-test', function(resolve, reject) {
  require(['./components/Test.vue'], resolve)
})
// 同样扩展到 Vue.options.components
```

工厂函数会**异步解析**组件定义，只有需要渲染时才触发工厂函数，并**缓存结果**

### 分析 Vue.component 的实现

```js
// global-api/assets.js
Vue[type] = function (id, definitino) {
  // 这里对于异步组件来说啥都没执行
  // 就只是返回了那个构造函数
  this.options[type + 's'][id] = definition
  return definition
}
```



### 创建异步组件 VNode

**只有当某个组件中需要进行这个异步组件的渲染，才会进行文件的加载**

```js
// vdom/create-component
// 需要这个异步组件的时候， 所包含的 组件渲染vnode 发生变化，重新渲染生成对应 vnode
function createComponent (Ctor, data, context, childrend, tag) {
  const baseCtor = context.$options._base // Vue
  // 中间这部分为常规组件的Ctor处理
  // Ctor = 传入的构造函数 f(res, rej)
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
    if (Ctor === undefined) {
      // 第一次加载的时候返回的Ctor = undefined
      // 返回注释节点占位渲染
      // 实际渲染函数没有变
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }
}

// vdom/helpers/resolve-async-component.js
function resolveAsyncComponent(factory, baseCtor) {
  if (isDef(factory.resolved)) {
    // 这是加载之后强制渲染的执行
    // 返回编译好的构造函数作为Ctor来生成组件
    return factory.resolved
  }
  // 第一次加载
  // factory 就是传入的构造函数
  const owners = factory.owners = [owner] // 当前异步组件所在的实例vm
  let sync = true;
	owner.$on('hook:destroyed', () => remove(owners, owner))
  const forceRender = (renderCompleted) => {
    for (let i = 0, l = owners.length; i < l; i++) {
      owners[i].$forceUpdate() // 强制渲染，因为可能在这过程中vm 的数据发生变化
    }
  } 
  
  const resolve = once((res)=> {
    // 加载后的回调
    // 就是Vue.extend返回的构造函数
    // 构造函数缓存到工厂函数中，不用每次加载都来一次
    factory.resolved = ensureCtor(res, baseCtor)
    if (!sync) {
      // 加载后强制渲染一次
      forceRender(true)
    } else {
      owners.length = 0
    }
  })
  const reject = once(reason => {
  })
  
  const res = factory(resolve, reject) // 执行加载文件的逻辑
  // 如果异步组件的文件加载是个异步的过程，那么会先执行完当前代码
  sync = false
  return factory.loading
    ? factory.loadingComp
  : factory.resolved
}

function createAsyncPlaceholder (factory, data, context, children, tag) {
  const node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data, context, children, tag }
  return node
  // 创造一个空vnode返回，这个vnode会被浏览器解释成一个注释节点(<!---->)
}
```



### 重新渲染

重新渲染的时候，会重新走一次vnode的渲染





## Promise实现异步组件

```js
Vue.component('async-comp', () => {
  return import('path/to/async/comp')
})
```

加载的顺序和之前工厂函数的类似

不同地方在于

```js
function resolveAsyncComponent() {
  const res = factory(resolve, reject) // import在webpack中返回一个promise
  if (isObject(res)) {
    if (isPromise(res)) {
      if (isUndef(factory.resolved)) {
        res.then(resolve, reject)
      }
    }
  }
  // 之后与工厂函数一样，第一次返回undefined，加载之后执行resolve ，再执行强制渲染
}
```

