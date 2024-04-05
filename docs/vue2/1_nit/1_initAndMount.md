# new Vue 实例的初始化

> **Vue.js** 是由 **原型链** 来实现的库，最终构造函数在 **src/core/instance/index.js**

## 构造函数 Vue

```js
// src/core/instance/index.js
function Vue(options) {
  if (process.env.NODE_ENV !== 'production' &&　!(this instanceof Vue)) {
    warn(...)
    // 必须是以 new Vue 方式来创建实例
  }
  this._init(options)
}
// 下面函数在 Vue.prototype 中定义特定方法和属性，经该构造函数实例化出来的Vue实例可直接使用
  
// 定义 _init 方法，包含 Vue 的实例化过程
initMixin(Vue)
// 定义 $data/$props 和 $set/$delete/$watch
stateMixin(Vue)
// 定义事件相关 $on/$once/$off/$emit
eventsMixin(Vue)
// 定义 _update 方法，$destroy/$destroy
lifecycleMixin(Vue)
// 定义了 _render 方法
renderMixin(Vue)
  
```



## 初始化(_init)

```js
function initMixin(Vue) {
	Vue.prototype._init = function (options) {
    const vm = this // 存储当前实例
    vm._uid = uid++ // 每个 vm 实例的 唯一uid
    ...
    vm._isVue = true // 标识自身为Vue实例
    if (options && options._isComponent) { // _isComponent 是自定义组件实例的标识
      // 对于传入组件的options的合并
      // 主要包含 options 传递的父节点和父VNode 等属性， 添加到当前 vm 属性上
			initInternalComponent(vm, options)
    } else { // new Vue() 执行过程中的 option 合并
			vm.$options = mergeOptions(
      	resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      ) // mergeOptions 将传入的options和构造函数的options合并到实例本身的$options
    }
    // vm 属性 _renderProxy，之后用于读取 vm 的属性时用到
    if (!isProd) {
      initProxy(vm)
    } else {
      vm._renderProxy = vm // 生产环境下该属性为 vm 本身（this）
    }
    // expose real self
    vm._self = vm // 记录自身 vm 实例
    initLifecycle(vm) // 初始化生命周期的相关属性
    initEvents(vm) // 初始化vm实例的事件，将事件的回调函数 添加到vm属性中
    initRender(vm) // 定义 vm 实例的$createElement方法，添加响应式属性$attrs/$listeners
    // beforeCreate hook
    callHook(vm, 'beforeCreate') // 此处取不到props/data等的值
    initInjections(vm) // resolve injections before data/props
    initState(vm) // 初始化处理 Vue 实例传入的data/props...等，设置为响应式数据
    initProvide(vm) // resolve provide after data/props
    // created hook
    callHook(vm, 'created') // 到此都没有渲染 DOM，此处可访问 props/data等
    if (vm.$options.el) {
      // 如果合并之后的选项中有 el，则将其进行挂载
      vm.$mount(vm.$options.el)
    }
  }
}
```

上面描述的是 vm 实例**初始化 （init）**的过程，初始化之后的下一步就是**挂载**



## 挂载过程($mount)

在 **附带compiler** 的版本中，$mount 的实现方式如下

> 位置：src/platform/web/entry-runtime/with-compiler.js

```js
// src/platform/web/entry-runtime/with-compiler.js
const mount = Vue.prototype.$mount // 缓存原有$mount方法
// hydrating == false 与SSR（服务端渲染相关）
Vue.prototype.$mount = function (el, hydrating) {
  el = el && query(el) // 调用原生 js 方法:document.querySelector(el)
  const options = this.$options
  if (!options.render) { // 传入的options 没有render选项
    let template = options.template
    if (template) {
      // 判断是否有template参数
      if (typeof tempalte === 'string') {
        if (template.charAt(0) === '#') {
          // e.g. template: '#app'
          // 获取内部的innerHtml
	        template = idToTemplate(template) 
        }
      } else if (template.nodeType){ // template为 DOM 节点
        template = template.innerHTML
      } else { /* 异常 */}
    } else {
      // 没有传入 template 参数，使用el来获取
      // 返回的是 el 的outerHTML 或者 一个el 的副本 innterHTML
      template = getOuterHTML(el)
    }
    if (template) {
      ...
      // 此处为编译相关部分
      // 调用compileToFunctions 将 template 编译，返回 render 函数和 静态render函数
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating) // 调用原来的 $mount 方法, return vm
}
```



## 真正的挂载（mount）过程

```js
// src/platform/web/runtime/index.js 原$mount方法
Vue.prototype.$mount = function(el, hydrating) {
  el = el && inBrowser ? query(el) : undefined // 通过传入的 el 来选择对应的容器元素
  return mountComponent(this, el) // return vm
}

// src/core/instance/lifecycle.js (经简化)
function mountComponent(vm, el) {
  vm.$el = el // 缓存 el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode // vm 中没有 render 函数，默认创建空节点
  }
  // beforeMount hook
  callHook(vm, 'beforeMount')
  let updateComponent = () => {
    vm._update(vm._render())
  }
  
  // 创建 vm 对应的一个 渲染Watcher
  // 渲染 Watcher!渲染 Watcher!渲染 Watcher!
  // 渲染 watcher 创建过程中会执行一次 updateComponent，进行挂载
  new Watcher(vm, updateComponent, noop, {
		before() {
			if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* 渲染watcher标志 */)
  
  if (vm.$vnode == null) {
    // 注意：这里 $vnode == null ，$vmode代表该 vm 的父VNode，根节点没有父VNode
    // 表明只是对根 Vue 实例的挂载处理
    vm._isMounted = true
    // mounted hook
    // 此时 vm 已经挂载到真实 dom 上
    callHook(vm, 'mounted')
  }
  return vm
}
```



### 创建 渲染Watcher 的过程

```js
// src/core/observer/watcher.js
class Watcher {
	constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm // Vue 实例
    if (isRenderWatcher) {
      // 若为renderWatcher 则 vm._watcher 会赋值为watcher
      vm._watcher = this
    }
    vm._watchers.push(this) // vm 的 _watcher 列表
    // 传入的 options 的处理
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before // 在 new Watcher()　过程传入了 before 的函数
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb // watch 的回调
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = [] // 依赖项列表
    this.newDeps = [] //　新依赖项列表
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString() // 是上面传入的 upateComponent 函数
      : ''
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn // this.getter 其实就是定义Water时候传入的 updateComponent
    } else {
      this.getter = parsePath(expOrFn) // 在深度watch时候返回一个函数，会返回watch的key的对应值
    }
    this.value = this.lazy ? undefined : this.get() // this.lazy == false
     // 所以在计算 this.value 的过程中，this.get()执行过程中，传入的 getter 函数执行了一次
  }
    
  get() {
    pushTarget(this) // 将当前的 Watcher 赋予一个全局变量，就可以随意访问
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm) 
      // 所以getter(也就是updateComponent)执行，进行挂载，函数上下文为vm，参数为vm
    } catch (e) {
      ...
    } finally {
      if (this.deep) {
        traverse(value) // 深度遍历值
      }
      popTarget() // 删除上面缓存的 Watcher
      this.cleanupDeps()
    }
    return value
  }
}
```



### 分析 **updateComponent** 函数

```js
// 定义  src/core/instance/lifecycle.js
let updateComponent = () => {
  vm._update(vm._render()) // 参数为 vnode
}
// 先分析 _render()
// src/core/instance/render.js
function renderMixin(Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype) // Vue原型上一些快捷方法的定义(_o, _n等等)
  // nextTick的定义
  // TODO：之后单独分析 nextTick的实现
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  // _render的定义
	Vue.prototype._render = function () {
    const vm = this
    const { render, _parentVnode } = vm.$options // 在$mount时定义好的
    if (_parentVnode) {
      // 设置 vm 的插槽
      // todo 后续分析插槽的实现
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }
    vm.$vnode = _parentVnode // 存储 父vnode 节点，对于组件来说就是占位vnode
    let vnode
    try {
      currentRenderingInstance = vm // 保存当前的 vm 实例
      vnode = render.call(vm._renderProxy, vm.$createElement) // 返回一个 VNode 节点
      // vm._renderProxy.render(vm.$createElement)
      // vm._renderProxy == vm (生产环境下)
      // 等价于 render.call(vm, vm.$createElement) ，函数上下文为vm，render 经上面 $mount 的编译过程中产生
      // 也就是说平时手写 render(h){} 中 h = $createElement
    } catch (e) {}
    finally {
  		currentRenderingInstance = null
  	}
    if (Array.isArray(vnode) && vnode.length === 1) {
      // 保证函数只返回一个节点
      vnode = vnode[0]
    }
    vnode.parent = _parentVnode
    return vnode
    // 返回一个由 编译/自带的 render 函数执行得到的 vnode
  } 
}
  
// render 函数的调用其实就是 $createElement 的执行
// 同一个文件中有这样的定义
// initRender 函数中
// 在 _init 方法初始化过程中，会调用initRender(vm)
vm.$createElement = (a,b,c,d) => createElement(vm,a,b,c,d,true)
// createElement 定义在 src/core/vdom/create-element.js
```



### 分析 createElement

```js
// src/core/vdom/create-element.js
function createElement(vm, tag, data, children, normalizationType, alwaysNormalize) {
	if (Array.isArray(data) || isPrimitive(data)) {
    // 参数重载
    normalizationType = children
    children = data
    data = undefined
  }
  return _createElement(context, tag, data, normalizationType) // return vnode
}

function _createElement(context, tag, data, children, normalizationType) { //context = vm
	...
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // 没定义 tag，返回空 vnode 节点
    return creatEmptyVNode();
  }
	...
  // 将children 拍平成一维数组
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  
  let vnode, ns
  if (typeof tag === 'string') {
    // 适用于传入一个由编译生成或者按格式编写 tag
    if (config.isReservedTag(tag)) {
      // 平台原有的 tag  标签，如H5的div等
      vnode = new VNode(
      	config.parsePlatform(tag), data, children, 
        undefined, undefined, context
      )
    } else if (
      (!data || !data.pre) && 
      isDef(Ctor = resolveAssest(context.$options, 'components' ,tag))
    ) {
      // 创建组件的vnode
      // 单文件组件的创建
			vnode = createComponent(Ctor, data, context, children, tag) // return vnode
    } else {
      // 未知的，带有命名空间的 元素
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // 适用于直接传入一个导出的 .vue 文件到render函数
    // e.g. render: h => { return h(App) }
    // 此处 h 相当于 createElement
    // tag == App
		vnode = createComponent(tag, data, context, children) // return vnode
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    ...
    return vnode
  } else {
    return createEmptyVNode() // 空白vnode
  }
}
// 因此 vm._render() 函数会生成 vm 对应的 vnode 并返回给 vm._update 函数

// 分析 createComponent 函数
// src/core/vdom/create-component.js
function createComponent (Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) { return } // 没有传入构造函数/信息
  const baseCtor = context.$options._base // 其实就是Vue，在合并选项的时候会合并进去 initGlobalAPI
	if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
    // 传入的构造信息通过 Vue.extend 转为构造函数
    // 也就是说，在工程化中每个单文件组件都是通过Vue.extend得到的构造函数
  }
  ...
  installComponentHooks(data)
  // 安装组件钩子，合并到data对象
  /*
    data = {
      on: {...},
      hook: {
      	insert() {},
      	init() {},
      	prepatch() {},
      	destroy() {},
      }
    }
  */
	const name = Ctor.options.name || tag
  const vnode = new VNode(
  	`vue-component-${Ctor.c_id}${name ? `-${name}` : ''}`,
    data ,undefined, undefined, undefined, context, 
    { Ctor, propsData, listeners, tag, children }, // 该对象为componentOptions参数
    asyncFactory
  )
  return vnode
}
```



### 分析  **vm._update**

```js
// src/core/instance/lifecycle.js
function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode, hydrating) { // hydratng == false
    const vm = this
    const prevEl = vm.$el // 在 mountComponent 函数中缓存，没传则为 undefined
    const prevVnode = vm._vnode // 更新 vnode 过程中的旧vnode，一开始为空
    vm._vnode = vnode // 缓存当前新 vnode 到实例的 _vnode属性
    const restoreActiveInstance = setActiveInstance(vm) // 当前 vm实例 缓存到一个全局变量
    // 存储当前的 vm 实例到 activeInstance
    // 组件实际插入到 DOM 对象是在 __patch__ 过程中
    if (!prevVnode) {
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false)
    } else {
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance() // 重新释放当前 vm 实例，activeInstance 回退到上一个 vm 实例
   	
    if (prevEl) {
      prevEl.__vue__ = null // 删除旧 domEl 上的 vm 实例引用
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm // 因此可以使用 domEl.__vue__ 来访问vm实例对象
    }
    // 组件直接将 $el 更新到 父实例 的$el 
    // 也就是将 组件 封装一层，返回一个新的组件
    // 新组件 vnode 中只有这个旧的组件 vnode
    // 建议参考 react 中的高阶组件定义进行对比
    // 比如根节点初始化一般会执行 render(h) { return h(App) }
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
  }
}
// 至此实例的渲染 Watcher 创建完成，实例挂载结束
```

### 组件 VNode 插入到 DOM 的过程分析

在 __patch__  函数中，

```js
// src/platforms/web/runtime/index.js
Vue.prototype.__patch__ = inBrowser ? patch : noop
// 这个patch 函数就是实际上调用的函数
// 经分析最后 patch 函数在 src/core/vdom/patch.js 的 createPatchFunction 中返回
// 简化版 patch
function patch (oldVnode, vnode, hydrating, removeOnly) {
    // 首次渲染时 oldVnode 为一个真实dom($el)，vnode为 createElement得到的 vnode
    // 若是组件的patch，oldVndoe 为空
	if (isUndef(vnode)) {
    // 只有传入了旧节点的信息
    if (isDef(oldVnode)) invokeDestroy(oldVnode) // 销毁旧节点
  }
  let isInitialPatch = false // 是否为初始化节点
  const insertedVnodeQueue = []
  if (isUndef(oldVnode)) {
    // 没有 oldVnode 则为组件初始化节点
    // 或者 vm.$mount() 参数没传$el的情况下
    isInitialPatch = true // 初始化patch
    crateElm(vnode, insertedVnodeQueue)
  } else {
    //  new Vue({el: '#app', render: (h) => h(App)}) 传入的 oldVnode 是 elDOM
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVndoe(oldVnode, vnode)) {
      // 新旧节点相同
      // patch已存在的根节点
      patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
      // 新旧节点不同
      if (isRealElement) {
        ...
        oldVnode = emptyNodeAt(oldVnode) // 用 el 元素创建一个 oldVnode
      }
      const oldElm = oldVnode.elm // 就是传入的 el元素
      const parentElm = nodeOps.parentNode(oldElm) // el的父元素
      
      // 创建新节点，传入父元素
      createElm(
        vnode,
        insertedVnodeQueue,
        oldElm._leaveCB ? null : parentElm,
        nodeOps.nextSibling(oldElm) // oldElm 的下一个兄弟节点
      )
      ...
      // 移除旧的vnodej
      if (isDef(parentElm)) {
        removeVnodes([oldVnode], 0, 0)
      } else if (isDef(oldVnode.tag)) {
        invokeDestroyHook(oldVnode)
      }
    }
  }
  // patch 之后通过insert钩子触发组件的mounted钩子
  // 这里只有 组件实际vnode的根部vnode能来到，其他的通过createChildren直接创建createElm
  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch) 
  return vnode.elm // elm元素 返回给__patch__ ，赋值给vm.$el
}
```

### 重点分析 **createElm** 函数

```js
function createElm (
	vnode,
   insertedVnodeQueue,
   parentElm,
   refElm,
   nested,
   ownerArray,
   index
) {
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      // vnode可直接创建一个组件
      // e.g. 单文件组件
      return
    }
    
    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      ...
      // 利用 vnode 的 tag 属性直接生成一个原生元素(div)
      vnode.elm = nodeOps.createElement(tag, vnode)
      // 创建子节点，实际上也是调用 createElm
      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        // 插入 insertedVnode 队列
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
      // 插入到父节点
      insert(parentElm, vnode.elm, refElm)
    } else if (isTrue(vnode.isComment)) {
      // 注释节点创建
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      // 文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }

// 插入到队列
  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    // 每个vnode都会走到这
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook 
    // 只有 vnodeData 中有 hook 属性的 组件占位vnode 才能走到这从而进入队列等待触发mount钩子
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }

// createChildren
function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    // 接受数组类型
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(children)
    }
    for (let i = 0; i < children.length; ++i) {
      // 实际上将父 vnode 的 elm 作为父元素传入
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
  }
}

// createComponent
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */) 
      // 调用hooks中的init钩子，在 create-component.js 中componentVNodeHooks
    }
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm) // 插入到父元素 DOM
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}

// src/core/vdom/create-component.js
// init钩子函数
function init (vnode, hydrating) {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroy && 
    vnode.data.keepAlive
  ) {
    ... // keep-alive的组件
  } else {
    // createComponentInstanceForVnode 函数返回一个vm实例
    // 实际上是调用了 vnode 的componentOptions.Ctor 来构造子组件
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    // 上面生成的实例挂载(el是undefined)
    child.$mount(hydrating ? vnode.elm : undefined) // hydrating == false
  }
}
  
// createComponentInstanceForVnode
// parent为当前的父vm，就是需要创建的vm的父vm == activeInstance
// 也就是拥有 componentInstance 的 vnode 所在的 vm实例
function createComponentInstanceForVnode (vnode, parent) {
  const options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  ...
  return new vnode.componentOptions.Ctor(options)
  // 该 Ctor 是由传入到 createComponent 的 Ctor，经 Vue.extend(Ctor) 返回新的Ctor函数
  // 这里会返回一个 Ctor 实例化的 vm 对象
  // 重新走一次 _init 流程
}

// 执行完组件的 init钩子 之后
function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el; // 组件vnode的elm = 组件vm实例的$el
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
}
  
// 在每个节点 patch 之后会做 invokeInsertHook 操作
  function invokeInsertHook (vnode, queue, initial) {
    if (isTrue(initial) && isDef(vnode.parent)) {
      // 对于是属于刚初始化的节点
      // 将insert钩子触发的时机延迟，交给他的组件占位vnode去决定
      // 组件占位 vnode 在上面 initComponent 之后会增加自身 占位vnode 到等待队列中
      vnode.parent.data.pendingInsert = queue;
    } else {
      // 一直这样递归到最外层的旧节点，或者在新建时候为根节点，他的 oldVnode 不是空值
      // 再按顺序从内到外触发insert钩子
      // 注意最外层的根节点由于其initial = false ，所以根实例的mounted 触发是由 watcher 实现
      // 这里的队列中的 insert 触发的是占位vnode 对应的 组件实例中的mounted
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }
  
  // vdom/create-component.js 
  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted') // 也就是触发组件的 mounted 钩子
    }
    if (vnode.data.keepAlive) {
      // keep-alive 相关
      if (context._isMounted) {.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },
```

```js
new Vue - vm.mount - mountComponent(vm) - vm._render(vmVnode) - vm.componentOptions - vm._update(vmVnode) - patch - createElm(vmVnode) - createComponent(vmVnode) - vm.hook.init - new child - vm.componentInstance - child.mount - createComponent(vmVnode) - insert

new child - child.mount - mountComponent(child) - child._update(childVnode) - patch - createElm(childVnode) - createElement(childVnode) - insert(child)
```

