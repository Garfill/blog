# 组件生命周期

在 Vue实例 的运行过程中，会在不同时机执行不同的生命周期函数

```js
// instance/lifecycle.js
// 调用生命周期钩子函数的统一入口
function callHook (vm, hook) {
  ...
  // 在创建组件时候，通过mergeOptions会将hook都合并到一个list中
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      // 绑定当前vm 实例作为函数作用域
      // handlers.call(vm)
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  ...
}
```

## 简单分析不同生命周期的执行时机

### beforeCreate 和 created

```js
// instance/init.js
Vue.prototype._init = function (options) {
  ...
  vm._self = vm
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  // beforeCreate hook
  callHook(vm, 'beforeCreate') // 此处取不到props/data等的值
  initInjections(vm) // resolve injections before data/props
  initState(vm) // 初始化 Vue 实例传入的data/props...等
  initProvide(vm) // resolve provide after data/props
  // created hook
  callHook(vm, 'created') // 到此都没有渲染 DOM，此处可访问 props/data等
  ...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }

}
```

以上是 **beforeCreate** 和 **created** 生命周期钩子的执行时机，都在 vm 实例的 **_init** 阶段调用

调用顺序：**先父后子**



### beforeMount 和 mounted

```js
// 在组件执行 vm.$mount 的时候，最终会执行到 mountComponent
// instance/lifecycle.js
function mountComponent(vm, el, hydrating) {
  vm.$el = el
  ...
  callHook(vm, 'beforeMount')
  ...
}
```

可以看到每个组件实例化之后都会调用一次 boforeMount 钩子

调用顺序：**先父后子**



对于 **mounted** 声明周期来说，调用的时机**有两处**

```js
// 对于根实例来说，也就是 new Vue() 出来的vm实例
// 会在 mountComponent 最后调用
function mountComponent() {
  ...
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false
  
  // 可以看到这里是通过判断实例的$vnode来判断是否为根节点
  // 因为除了根节点之外都是子组件，他们的 $vnode 会存储其 父vnode 的值
  if (vm.$vnode == null) {
    // 这里仅仅是对根 Vue 实例的挂载处理
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
  ...
}
```

```js
// 对于子组件来说
// 在patch组件过程中，vdom/patch.js
function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
  ...
  if (isDef(i = i.hook) && isDef(i = i.init)) {
    i(vnode, false /* hydrating */)
    // 调用hooks中的init钩子，在 create-component.js中componentVNodeHooks
  }
  // 在调用init hook 创建完实例之后，下面这里进行实例的初始化和插入
  if (isDef(vnode.componentInstance)) {
    initComponent(vnode, insertedVnodeQueue)
    insert(parentElm, vnode.elm, refElm)
    if (isTrue(isReactivated)) {
      reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
    }
    return true
  }
  ...
}
function initComponent (vnode, insertedVnodeQueue) {
  ...
  invokeCreateHooks(vnode, insertedVnodeQueue) 
  // 将子组件占位vnode推入队列
  ...
}
// 对于普通元素
function createElm(vnode) {
  ...
  createChildren(vnode, children, insertedVnodeQueue)
  if (isDef(data)) {
    invokeCreateHooks(vnode, insertedVnodeQueue); 
    // 普通元素（div）的vnode推入队列，可惜他们没有insert钩子
    // 可以通过render函数，对其vnodeData 对象手动添加 hook
  }
  insert(parentElm, vnode,elm, refElm); // 插入到 DOM 的操作
  ...
}

function invokeCreateHooks (vnode, insertedVnodeQueue) {
  if (isDef(i)) {
    if (isDef(i.create)) i.create(emptyNode, vnode)
    if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
  }
  // 也就是把 vnode 节点推入 insertedVnodeQueue 这个队列中
}
```

可以看到，**insertedVnodeQueue** 这个队列，会在执行过程中不断添加 vnode，添加顺序是**先子后父**

因为在父组件创建（init钩子）的过程中，如果有子组件的创建，子组件会先走到 **initComponent** 的方法，然后才**递归回到**父组件的 **initComponent** ，所以子组件的 vnode 先进入队列

```js
// vdom/patch.js
function patch () {
  ...
  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
  ...
}
```

在 **组件patch** 的最后，会通过 **invokeInsertHook** 触发队列中的 vnode 的钩子

```js
function invokeInsertHook (vnode, queue, initial) {
  if (isTrue(initial) && isDef(vnode.parent)) { // vnode.parent是占位vnode
    // 对于第一次挂载的组件延迟执行时机
    // 在initComponent时推入队列，等到整个组件真正挂载到DOM上在执行
    vnode.parent.data.pendingInsert = queue
  } else {
    // 递归回到 最外层需要update 组件节点 时 或者 根节点
    // 对于根节点的initial = false
    // 同时 根节点的 <APP/> 也是最后一个推入queue中的vnode（initComponent的时候）
    for (let i = 0; i < queue.length; ++i) {
      queue[i].data.hook.insert(queue[i])
    }
  }
}

function initComponent(vnode, insertedVnodeQueue) {
  if (isDef(vnode.data.pendingInsert)) {
    // 首次挂载的组件 占位vnode中的 pendingInsert 取出来
    insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
    vnode.data.pendingInsert = null;
  }
  invokeCreateHooks(vnode, insertedVnodeQueue) // 这里推入队列的是 占位vnode
  // 这里也是子组件先进队列，然后是父组件
}

// 调用组件占位vnode的 insert hook
// vdom/create-component.js
const componentVNodeHooks = {
  insert(vnode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      // 手动更新挂载状态
      componentInstance._isMounted = true
      // 触发组件关联的 vm 实例的 mounted 钩子
      callHook(componentInstance, 'mounted')
    }
    // keep-alive相关
  }
}
```

所以 **mounted** 钩子的执行顺序是：**先子后父**



### beforeUpdate 和 updated

在每个组件创建 **渲染Watcher** 的时候

```js
// instance/lifecycle.js
function mountComponent () {
  // 创建渲染Watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
}

// 来看下 Watcher 的定义
// observre/watcher.js
class Watcher {
  // 通过 class类 来实现
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    // 可知通过最后一个参数来判断 watcher 的类型
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this // 所以 vm 实例中的 _watcher 是渲染watcher
    }
    vm._watchers.push(this) // 并且推入到 vm 实例的watchers列表中
  }
}
// 可以看到这里传入的 options 中会有before函数，这就是调用更新前的调用 beforeUpdate
// 而 updated 的钩子的更新将会是在 flushSchedulerQueue 函数中
// observer/scheduler.js
function flushSchedulerQueue() {
  // 这里涉及到 nextTick 的实现，之后细说
  ...
  callUpdatedHooks(updatedQueue) // 而且这里仅针对 渲染Watcher，里面会调用update钩子
  ...
}
```

**beforeUpdate** 调用顺序：**先父后子**

**updated** 调用顺序：**先子后父**



### beforeDestroy 和 destroyed

```js
// instance/lifecycle.js
Vue.prototype.$destroy = function () {
  callHook(vm, 'beforeDestroy')
  // 一些组件属性的销毁
  vm._isDestroyed = true
  vm.__patch__(vm._vnode, null) // 递归调用子组件的销毁
  callHook(vm, 'destroyed')
}
```

**beforeDestroy** 调用顺序：**先父后子**

**destroyed** 调用顺序：**先子后父**

