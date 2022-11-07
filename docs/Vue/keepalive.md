# keep-alive
内置组件
```js
  // core/global-api/index.js
  function initGlobalAPI() {
    //...
    extend(Vue.options.components, builtInComponents)
    // 创建组件的时候会合并到组件的options上
  }
```

## 定义
里面的 **builtInComponents** 就是 keep-alive 的定义
```js
// core/components/keep-alive.js
export default {
  name: 'keep-alive',
  abstract: true, // 抽象组件
  props: {
    includes: [String, RegExp, Array],
    excluude: [String, RegExp, Array],
    max: [String, Number]
  },
  created() {
    this.cache = Object.create(null) // 缓存组件
    this.keys = []
  },
  destroyed() {
    for (const key in this.cache) {
      // 销毁时销毁所有缓存的组件
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
  mounted() {
    this.$watch('include', val => {
      pruceCache(this, name => matches(val, name))
    })
    // 同样 $watch 监听 exclude
  },
  
  render() {
    // 最终返回vnode
    const slot = this.$slots.default
    // 找到内部slot的第一个组件vnode, 所以一般搭配router-view或者component组件
    const vnode = getFirstComponentChild(slot) 
    // 组件配置项
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      const name = getComponentName(componentOptions)
      const { include, exclude } = this
      // 渲染组件不匹配缓存条件的，直接返回vnode
      if (
        (include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))
      ) { return vnode }
      
      const { cache, keys } = this
      const key = vnode.key == null
        ? componentOptions.Ctor.cid + (ComponentOptions.tag ? ...)
        : vnode.key
      // 获取key
      if (cache[key]) {
        // 命中缓存
        vnode.componentInstance = cache[key].componentInstance
        // LRU 算法
        // 将最近访问的放到最后
        remove(keys, key)
        keys.push(key)
      } else {
        // 第一次渲染或者没命中
        cache[key] = vnode
        keys.push(key)
        // 缓存数量超过限额，删除最少访问的组件keys[0]
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }
      
      vnode.data.keepAlive = true // 标识keep-alive组件
    }
    return vnode || (slot && slot[0])
  }
}
```

## 渲染

### 首次渲染
**首次渲染**过程与**普通组件**渲染过程没有太大区别，最后通过 **patch** 方法执行到 **createComponent** 方法
```js
// core/vdom/patch.js
function createComponent(...) {
  // 这里的vnode是keep-alive组件render返回的vnode，也就是插槽的vnode
  let i = vnode.data
  if (isDef(i)) {
    // 如果非首次渲染的keepalive组件 isReactive = true
    // 首次渲染的组件componentInstance = undefined
    const isReactive = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode) // 调用组件init钩子
    }
    
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode) // 与普通组件一样
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactive)) {
        reactivateComponent(vnode)
      }
      return true
    }
  }
}
```
> 之后的initComponent和普通组件一样的流程，会执行 vnode.elm = vnode.componentInstance.$el 进行赋值
#### init
```js
// core/vdom/create-component.js
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
    // 首次渲染还没有componentInstance，执行else分支
    // 缓存命中之后执行该分支逻辑
      const mountedNode: any = vnode
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
      // 所以缓存命中不会创建新的vm实例，也不会执行created和mounted
    } else {
    // else分支就是普通组件渲染逻辑
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

```

#### reactivateComponent
当keep-alive组件vm创建之后，执行的激活操作
```js
  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i
    let innerNode = vnode
    while (innerNode.componentInstance) {
      // 递归记录子组件的 transition
      innerNode = innerNode.componentInstance._vnode
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode)
        }
        insertedVnodeQueue.push(innerNode)
        break
      }
    }   
    insert(parentElm, vnode.elm, refElm)
  }
```

### 缓存渲染
> 当下一个渲染的组件命中缓存

切换keep-alive组件的时候，引发<keep-alive /> 所在的组件的render重新渲染，**重新patch**
对于**组件重新patch**，会先执行组件**prepatch**钩子，其中会有**updateChildComponent**方法，用来**更新子组件**
#### updateChildComponent
```js
// core/instance/lifecycle.js
function updateChildComponent(vm, propsData...) {
  // ...
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
    // 强制调用keep-alive的forceUpdate，重新执行其render（也就是上面的render）
  }
}
```
**重新render**得到的vnode，重新**patch**，同样执行之后的**createComponent**，如果是**命中缓存**的
```js
// core/vdom/patch.js
function createComponent() {
  //...
  if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode) 
      // 调用组件init钩子
      // 这里的init钩子执行，与首次渲染不同
    }
  // 由于之前的缓存，所以拿到的是缓存的 vnode, 同时也已经有 componentInstance
  if (isTrue(isReactivated)) {
    // true
    reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
  }
}
```

### activated
在组件重新**patch**最后，会有**invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)**，其中会调用组件的**insert**钩子
```js
// core/vdom/create-component.js
const componentVNodeHooks = {
  insert(vnode) {
    // 这里vnode是组件占位vnode
    const { context, componentInstance } = vnode
    //... 这里是未挂载组件的mounted钩子
    if (vnode.data.keepAlive) {
      // 一开始初始化的标识
      if (context._isMounted) {
        // 包含keep-alive的组件已经mounted
        queueActivatedComponent(componentInstance)      
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}

// core/instance/lifecycle.js
export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      // 递归调用调用子组件
      activateChildComponent(vm.$children[i])
    }
    // activated钩子，发生在mounted之后
    callHook(vm, 'activated')
  }
}

// core/observer/schedule.js
// 外层组件之前已经mounted
export function queueActivatedComponent (vm: Component) {
  vm._inactive = false
  activatedChildren.push(vm) // 这是个数组
}

// 最终在flush的时候
function flushSchedulerQueue () {
  //...
  const activatedQueue = activatedChildren.slice()
  callActivatedHooks(activatedQueue)  
}
function callActivatedHooks (queue) {
  // 本质上还是循环队列，然后调用上面的方法
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}
```


### deactivated
同样是组件hook触发

```js
// core/vdom/create-component.js
const componentVNodeHooks = {
  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        // 触发
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}
```
#### 定义
```js
//core/instance/lifecycle.js
export function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    // 思路跟activated类似
    callHook(vm, 'deactivated')
  }
}
```
