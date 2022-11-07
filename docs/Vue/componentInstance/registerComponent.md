# 组件注册

组件在使用之前都需要先注册

注册方式有

- 全局注册
- 局部注册



## 全局注册实现

```js
// global-api/assets.js
function initAssetRegisters (Vue) {
  // 实例资源分为 组件、指令、过滤器 三类
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        if (type === 'component' && isPlainObject(definition)) {
          // 取名字，后续生成组件占位vnode用到
          definition.name = definition.name || id
          // Vue上的静态方法，this = Vue
          // 这里其实就是 Vue.extend 返回的构造器函数
          definition = this.options._base.extend(definition)
        }
        // directive 相关
        this.options[type + 's'][id] = definition
        // 扩展到Vue.options上
        // 可以通过Vue.options.components[id] 来访问对应的构造器函数
        return definition
      }
    }
  })
}
// 上面这个函数会在 initGlobalApi(Vue) 函数中调用

// 关于这些组件、指令这些资源的初始化
// global-api/index.js
function initGlobalAPI (Vue) {
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })
  extend(Vue.options.components, builtInComponents) 
  // 内置组件赋值到Vue.options.components
}
```

在**初始化vnode**过程中，会通过 render 函数调用 **createElement** 方法

```js
// vdom/create-element.js
function _createElement() {
  ...
  if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // 这里通过 resolve 到对应的 components 定义，创建对应的组件vnode
    vnode = createComponent(Ctor, data, context, children, tag)
  }
  ...
}
  
// util/options.js
function resolveAsset(options, type, id, warn) {
  // options = vm.$options
  // 注意这里的 $options 是通过合并配置之后的options
  const assets = options[type]
  if (hasOwn(assets, id)) return assets[id]
  // 小驼峰写法
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  // 首字母大写
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // 注意上面这些都是用 Object.prototype.hasOwnProperty 来判断是否存在的，也就是非继承的
	const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  return res
  // 最后所有写法都找不到，就通过原型链去找
}
```

结论：通过 **Vue.component** 来注册，就会通过 **options** 扩展到 **Vue.options** 上，最后通过options 来寻找到对应的定义



## 局部注册

```js
// global-api/extend.js
Vue.extend = function (extendOptions) {
  ...
  Sub.options = mergeOptions(Super.options, extendOptions) // Super = Vue
  ...
}
// 可以通过 vm.$options.components 访问
// 通过mergeOptions扩展到构造函数的options上
// 然后子构造函数初始化时就可以通过options找到
```

### mergeOptions 合并 components 的规则

```js
// util/options.js
function mergeAssets (parentVal, childVal, vm, key) {
  // parentVal = Vue.options
  const res = Object.create(parentVal || null)
  if (childVal) {
    return extend(res, childVal)
  } else {
    return res
  }
}
// 在Sub的mergeOptions合并中，将 Vue.options 作为 parentVal ，以此为原型创建一个新对象，然后再将 extendOptions 的 assets(组件、指令等)合并到新对象中，返回作为子构造函数的options，这样在组件构造函数的初始化过程中就能通过原型链进行访问

// 局部注册的组件，也是会通过 _createElement 方法来创建 组件vnode ，具体分析见上面
```

