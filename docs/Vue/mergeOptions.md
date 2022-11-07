# 合并配置

在 Vue 执行过程中有**两处时机**进行 **配置合并**

- new Vue() 初始化实例过程
- 初始化子组件的过程



## 首先分析 Vue.mixin 方法

```js
// global-api/mixin.js
function initMixin (Vue) {
  // 注意这里调用的Vue的静态方法，其中this类似Vue.extend方法中的this
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```

这里的initMixin 是传入mixin选项，赋值到Vue上

```js
// instance/init.js
function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    ...
    if (options && options._isComponent) {
      initInternalComponent(vm, options) // 组件的配置合并
    } else {
      vm.$options = mergeOptions(
      	resolveConstructorOptions(vm.constructor), // 传入组件实例构造器函数（Vue）
        options || {},
        vm
      )
      // 这里是外部调用初始化实例的配置合并
      // new Vue(options)
    }
    ...
  }
}
```



## 在初始化 Vue 实例过程中

### resolveConstructorOptions 分析

```js
function resolveConstructorOptions (Ctor) {
  // Ctor 构造器函数
  let options = Ctor.options
  if (Ctor.super) {
    // 这里是通过Vue.extend方法返回的构造器函数，进行实例化时执行的
  }
  return options // 返回构造器的options （Vue.options)
}
```

### mergeOptions 的实现

```js
// util/options.js
function mergeOptions (parent, child, vm) {
  // 一些选项的格式化
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)
  
  if (!child._base) {  
    // 这里用_base保证传入的options不是另一个 mergeOptions 过的结果
    // 因为 Vue.options._base = Vue
    
    // 针对传入的options中，如果包含了mixins选项和extends选项
    // 先递归合并到parent选项中
    if (child.extends) {
      parent = mergeOptions(parent, child.extend, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
    
    const options = {}
    let key
    // 分别遍历 parent 和child 的 key 来合并
    for (key in parent) {
      mergeField(key)
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key)
      }
    }
    // 根据不同的选项执行不同的合并策略
    function mergeField (key) {
      const strat = strats[key] || defaultStrat
      options[key] = strat(parent[key], child[key], vm, key)
    }
    return options
  }
}
```



## 在组件实例初始化过程中

### initInternalComponent 分析

```js
// instance/init.js
function initInternalComponent (vm, options) {
  // 已构造器的options 为原型构造
  // options 是在初始化组件vm实例时，调用组件的init hook传入的
  /**      
  	options = {
      _isComponent: true,
      _parentVnode: vnode, 占位vnode
      parent: parent, 父 vm 实例
  	}
  **/
  // 通过Vue.extend返回的合并后的构造器的options
  const opts = vm.$options = Object.create(vm.constructor.options)
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  // componentOptions 在创建占位vnode 传入
  // { Ctor, propsData, listeners, tag, children }
  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
```

> TODO：之后章节会对各类合并策略进行分析

