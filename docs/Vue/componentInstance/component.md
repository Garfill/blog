# 组件化

> 本章节主要分析 Vue 组件的创建过程

在创建  **VNode** 过程中，调用到 **vdom** 的 **create-element.js**

调用栈：$mount  -> mountComponent -> Watcher -> get -> updateComponent(vm._update) -> render ->  createElement

```js
// vdom/create-element.js
function _createElement(context, tag, data, children, normalizationType) {
  // 以 render(h) { return h(APP)} 为例子
  // 传入的tag是APP对象
  vnode = createComponent(tag, data, context, children) // 根据构造的信息创建组件的 vnode
  
  // 如果是通过 components 注册使用的组件
  if ((!data || !data.pre) && isDef(Ctor = resolveAssest(context.$options, 'components', tag))){
    vnode = createComponent(Ctor, data, context, children, tag)
  }
  ...
  // 这里的context 都是指当前的 vm 实例
  return vnode // 最后是返回生成的 组件vnode
}
```



## 分析createComponent函数

```js
// vdom/create-components.js
function createComponnet(Ctor, data, context, children, tag) {
  ...
  const baseCtor = context.$options._base 
  // 这里 baseCtor = Vue, 之前通过初始化过程中混入 (global-api.js)
  // Vue.options._base = Vue
  // 之后再通过 mergeOptions 合并到实例
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor) // 这里就是 Vue.extend(Ctor)，返回一个用该配置生成的构造器
  }
  ...
  installComponentHooks(data) // data是创建时提供，就是render函数写法中的data对象
  const name = Ctor.options.name || tag
  const vnode = new VNode(
  	`vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children }, 
    asyncFactory
  )
  // 这一行是创建 vnode 过程，其中的倒数第二个参数为 componentOptions 选项
  ...
  return vnode // 返回生成的组件 vnode
}
```



## 组件构造器生成函数（extend）

上述生成 **组件vnode** 的过程中，会调用 **Vue.extend** ，生成组件对应的构造器函数

```js
// global-api/extend.js
function initExtend (Vue) {
  Vue.cid = 0
  let cid = 0
  
  Vue.extend = function(extendOptions) {
    extendOptions = extendOptions || {}
    // 注意这里是 Vue 的静态方法，this = Vue
    const Super = this 
    const SuperId = Super.cid
    // 缓存已创建过的构造器
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    const name = extendOptions.name || Super.options.name;
    // 子类构造器，开发过程中的单文件组件就是通过这个构造器生成
    const Sub = function VueComponent(options) {
      // 实际上执行Sub.prototype._init => S
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    // 以上构成 Sub 继承 Super 的原型链
    Sub.cid = cid++
    // 合并传入的选项和 Super 的选项
    Sub.options = mergeOptions(Super.options, extendOptions)
    Sub['super'] = Super
    // 将Super 的 静态方法赋值 给Sub 使用，之后也可以将 Sub 作为新的 Super 进行 Sub.extend() 等等
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use
    // ['component', 'directive', 'filter'] Super的选项混入
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    if (name) {
      Sub.options.components[name] = Sub
    }
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)
    cachedCtors[SuperId] = Sub // 缓存已生成的构造器，当传入相同对象的时候就能获取，避免重复生成
    return Sub
  }
}
```



## 组件的钩子函数安装

在上述生成 **组件vnode** 的过程中，调用到 **installComponentHooks** 函数来安装 **组件的钩子**

```js
// vdom/create-component.js
function installComponentHooks (data) {
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[i]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}
// 简单来说就是将传入的data中的 hook 对象与组件默认的hooks合并
const componentVNodeHooks = {
  init() {},
  prepatch() {},
  insert() {},
  destroy() {},
}
```

**到这里为止，已经生成 组件vnode（也可以叫占位vnode）， 接下来是将 vnode 返回给上一个调用栈，一般来说是 vdom/create-element.js 中的 _createElement 方法**

**在  _createElement 方法中再将返回的 vnode 返回到上一级调用栈，就是 vm 的 _update 方法**

**在 _update 方法中，通过 patch 方法，最终会将 vnode 传递到 vdom/patch.js 的 patch 方法中**

**再通过其中的 createComponent 方法生成对应的 patch**

```js
// vdom/patch.js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */) 
      // 调用hooks中的init钩子
      // 在 vdom/create-component.js 中生成占位 vnode 添加的 componentVNodeHooks
    }
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```



## 组件的 init 钩子函数

```js
// vdom/create-components.js
const componentVNodeHooks = {
  init(vnode, hydrating) {
    if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      // kept-alive components
      const mountedNode = vnode
      componentVNodeHooks.prepatch(mountedNode, mountedNode) // keep-alive 重复渲染会当成prepatch
    } else {
      // 传入对应的 占位vnode
      // createComponentInstanceForVnode 会返回一个 vm 实例！！！
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance // 这里的 activeInstance 就是这个 组件vnode 的 父vm 实例
      )
      // 这里$mount 传入的是 undefined
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  }
  ...
}
```

### createComponentInstanceForVnode 函数

```js
function createComponentInstanceForVnode (vnode, parent) {
  const options = {
    _isComponent: true, // 组件标识
    _parentVnode: vnode, // 占位 vnode
    parent
  }
  ...
  return new vnode.componentOptions.Ctor(options)
  // 这里的这个 componentOptions 也就是本篇一开始创建这个组件占位vnode时，出入的那个对象参数 
  // { Ctor, propsData, listeners, tag, children }
  // 其中Ctor 是通过 extend 得到的 Sub(或者叫 VueComponent) 构造器函数
  // 也就是会重新利用这个options得到一个新的组件 vm 实例返回
}
```

### 组件的初始化 _init

```js
// instance/init.js
Vue.prototype._init = function (options) {
  ...
  if (options && options._isComponent) {
    initInternalComponent(vm, options)
  } else {
    /** 这里是new Vue的合并options **/
  }
  ...
}
```

```js
function initInternalComponent(vm, options)  {
  const opts = vm.$options = Object.create(vm.constructor.options) // 这里就是 Sub 的 options
  const parentVnode = options._parentVnode // 占位vnode
  opts.parent = options.parent // 父 vm 实例
  options._parentVnode = parentVnode
  ...
  // 这里就将 Sub 的options 加到了组件实例的 $options上
}
```

```js
// 在创建完组件 vm 实例之后
// 进行实例挂载
// child.$mount(undefined)
// platform/web/runtime/index.js
Vue.prototype.$mount = function(el, hydrating /* false */) {
  ...
  return mountComponent(this, el, hydrating) // el = undefined
}
```

```js
// instance/lifecycle.js
function mountComponent(vm, el, hydrating) {
  // el = undefined
	//  hydrating = false
  // 接下来就是通过之前的流程，创建渲染 Watcher -> updateComponent -> vm._render -> vm._update
  // _render 中调用的 $options.render 是在 vue-loader 解析单文件时候得到的，也可以手写render函数
}
```

### 组件的 _update 过程

还是调用**Vue原型上的_update函数**

```js
const prevEl = vm.$el
const prevVnode = vm._vnode // 实例vm 刚创建出来，没有这个_vnode属性
const restoreActiveInstance = setActiveInstance(vm) // 这里就是存储当前 vm 实例的过程
vm._vnode = vnode // 实例 vm 的_vnode 属性是当前的 组件实际vnode而非占位vnode
if (!prevVnode) {
  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false) // 通过patch 之后赋值 $el
}
...
// 到这里为止其实还没有进行挂载到真实的dom上，因为在child.$mount()传进来的是空
```

### 回到createComponent方法中

```js
// vdom/patch.js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */) 
      // 调用hooks中的init钩子
      // 在 vdom/create-component.js中生成占位vnode添加的componentVNodeHooks
    }
    // 初始化完之后，对组件进行初始化和插入到DOM
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue) // vnode.elm = vnode.componentInstance.$el
      insert(parentElm, vnode.elm, refElm) // 插入到DOM
      ...
      return true
    }
  }
}
```

> 从根节点开始 -> 通过render生成得到 占位 vnode（\<App/\>） -> 通过 占位vnode 的 Ctor 生成其对应的vm 实例（vm.componentInstance）  ->　通过实例下的 render 方法，生成其 渲染vnode（也就是文中的实际 vnode） ->　最后通过initComponent 、insert 等方法插入 组件 到 DOM 节点中

到这里，就已经将创建出来的 **VueComponent** 插入到对应的 DOM节点中，并且已经关联好对应的 **vm 实例**

在 **createComponent** 返回 **true** 之后，调用栈回到  **patch** 函数内，返回 **vnode.elm**，最后回到  **vm._update** 内部


