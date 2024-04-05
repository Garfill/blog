# slot 插槽
> 用于向子组件传入内容到预先定义好的dom位置

## 解析时（parse）
在将**模版字符串**转化成**ast节点**的过程中，每个节点都会执行一次**processElement**中的**processSlot**，这里是针对slot 的处理
```js
// compiler/parser/index.js
function processElement(element, options) {
  //...
  processSlot(element)
}

function processSlot(el) {
  // el 是 ast节点
  if (el.tag === 'slot') {
    // <slot>
    // slot 节点添加name
    el.slotName = getBindingAttr(el, 'name')
  } else {
    let slotScope
    if (tag === 'template') {
      // ...
      // 获取作用域插槽的内容，添加到slotScope
      el.slotScope = getAndRemoveAttr(el, 'slot-scope')
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      // 非template上的作用域插槽
      el.slotScope = slotScope
    } else {
      // v-slot
    }
    // slot="name"
    const slotTarget = getBindingAttr(el, 'slot')
    // 当el有slot="name"属性，el 添加 slotTarget 属性
    if (slotTarget) {
      // 获取插槽名
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
      if (el.tag !== 'template' && !el.slotScope && !nodeHas$Slot(el)) {
        addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
      }
    }
  }
}
```

## 代码生成（genData）
### 父节点的代码生成
在**父节点**生成**render函数**过程中，会将**ast节点**转化
```js
// compiler/codegen/index.js
function getData() {
  // ...
  if (el.slotTarget && !el.slotScope) {
    // 普通具名插槽，没有作用域
    data += `slot:${el.slotTarget},`
  }
  if (el.slotScope) {
  // 作用域插槽
    data += `${genScopeSlots(el.scopedSlots, state)}`
  }
}

function genScopedSlots(slots, state) {
  return `scopedSlots:_u([${
    Object.keys(slots).map(key => {
      return genScopedSlot(key, slots[key], state)
    }).join(',')
  }])`
}

function genScopedSlot(key, el, state) {
  // ....
  // 所以在作用域插槽，可以通过解构来获取值，因为生成render函数这里可以在参数解构
  const fn = `function (${String(el.slotScope)}){` +
    `return ${el.tag === 'template'}
     ? el.if
       ? `(${el.if})?${genChildren(el, state) || 'undefined'}:undefined`
       : genChildren(el, state) || 'undefined'
    : genElement(el, state)
    }}`
  return `{key:${key},fn:${fn}}` 
}
```
### 子节点的代码生成
在**子节点**生成**render函数**过程中，会调用**genElement**，然后会生成**slot**节点
```js
// compiler/codegen/index.js
function genSlot(el, state) {
  const slotName = el.slotName || '"default"'
  // <slot>default content</slot>
  const children = genChildren(el,state) 
  // 这里生成slot内的默认预备内容vnode
  let res = `_t(${slotName}${children ? `,${children}` : ''}`
  //...
  return res
}
```
其中 **_t** 就是 **renderSlot** 方法

#### 普通插槽
```js
// core/instance/render-helpers/render-slot.js
function renderSlot(name, fallback, props, bindObject) {
  // fallback就是默认内容
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes
  if (scopedSlotFn) {
    // 作用域插槽的部分
    props = props || {}
    if (bindObject) {
      props = extend(extend({}, bindObject), props)
    }
    nodes = scopedSlotFn(props) || fallback
  } else {
    // 通过slotName拿到对应的$slots属性值
    nodes = this.$slots[name] || fallback
  }
  
  const target = props && props.slot
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    // 当有这个对应name的值，就返回
    return nodes
  }
}

// src/core/instance/render.js
// 子组件init过程是在父组件patch过程中
function initRender (vm: Component) {
  // ...
  // the placeholder node in parent tree
  const parentVnode = vm.$vnode = options._parentVnode
  const renderContext = parentVnode && parentVnode.context
  // _renderChildren 是在创建 组件vnode 节点过程中传入的children
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
}

//src/core/instance/render-helpers/resolve-slots.js
function resolveSlots(children, context) {
// context传入的是父节点的context
  const slots = {}
  // ...
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    if (data && data.attrs && data.attrs.slot) {
        // 父组件传入的子节点，当成slot解析
        delete data.attrs.slot
    }
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      // data.slot 就是插槽名字
      // 具名插槽的内容
      const name = data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || [])
      } else {
        slot.push(child)
      }
    } else {
      // 这里是对没写slot=name 的传入子节点，当成默认插槽
      (slots.default || (slots.default = [])).push(child)
    }
  }
  //...
  return slots
  // 最终得到的是
  // slots: { slotName: [vnode], default: [vnode] } 
  // 这样的对象
}
```

注意，resolve的时候，也就是运行**子组件render函数**的时候，父组件其实已经创建出vnode，模版的变量值也已经转成真实值，所以，直接就用父组件传入的vnode进行渲染

initRender是**先于组件render函数**执行的，通过resolve拿到对应**name**的插槽内容，返回到**renderSlot**

> 上面返回的slots也就是 **$slots属性值**，通过**resolveSlots** 方法，**renderSlot** 函数就能在 **子节点** 拿到 **父节点** 的slot内容，最终通过_t的渲染函数，渲染到子节点上


# 作用域插槽
> 在父组件访问子组件的数据

分为**父组件**和**子组件**
## 父组件
### 解析parse
**解析parse**还是在**processSlot**过程
```js
// compiler/parser/index.js
function processSlot(el) {
//...
    let slotScope
    if (tag === 'template') {
      // ...
      // 获取作用域插槽的内容，添加到slotScope
      // slot-scope="props" 这里 el.slotScope=props
      el.slotScope = getAndRemoveAttr(el, 'slot-scope')
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      // 非template上的作用域插槽
      el.slotScope = slotScope
    }
    // 无论是template标签还是普通标签都能获取 slot-scope
}
```
之后在**该节点构造ast节点**过程中
```js
// compiler/parser/index.js
function closeElement(el) {
  // ...
  else if (element.slotScope) {
    currentParent.plain = false
    const name = element.slotTarget || "'default'"
    ;(currentParent.scopedSlots || currentParent.scopedSlots = {})[name] = element
    // 这里currentParent一般就是组件占位节点
    // 也就是说作用域插槽不会当成children传到组件中，而是作为scopedSlots对象传入
  }
}
```
### 代码生成genData
```js
// compiler/codegen/index.js
// genData过程中
  if (el.scopedSlots) {
    data += `${genScopedSlots(el.scopedSlots, state)},`
  }
  
  // slots是传入的上面的scopedSlots对象
  function genScopedSlots(slots, state) {
    return `scopedSlots:_u([${
      Object.keys(slots).map(key => {
        return genScopedSlot(key, slots[key], state)
      }).join(',')
    }])`
  }
  // 往组件占位节点的data对象上添加scopedSlots属性
  // 返回 _u([ {key, fn} ])
  
  function genScopedSlot (
      key: string,
      el: ASTElement,
      state: CodegenState
    ): string {
      if (el.for && !el.forProcessed) {
        return genForScopedSlot(key, el, state)
      }
      // 这里将slotScope的表达式传入做参数，因此可以解构
      // slot-scope="{msg}"
      const fn = `function(${String(el.slotScope)}){` +
        `return ${el.tag === 'template'
          ? el.if
            ? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`
            : genChildren(el, state) || 'undefined'
          : genElement(el, state)
        }}`
        // 通过不同的标签，生成不同的生成代码字符串
        // template则直接生成内部子节点的
      return `{key:${key},fn:${fn}}`
    }
```
### 运行时
#### resolveScopedSlots
**_u** 对应就是 **resolveScopedSlots** 方法
```js
// core/instance/render-heplpers/resolve-slots.js
function resolveScopedSlots (
  fns: ScopedSlotsData,
  res?: Object
): { [key: string]: Function } {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      // 根据对象key和fns返回
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
  // 最后返回对象 {key: fn}，值是函数
}
```
> 父组件：把作用域插槽当成**scopedSlots**对象，添加到vnode节点的**data对象**中

## 子组件
> 编译过程和普通插槽类似

### 代码生成genData
```js
// compiler/codegen/index.js
function genSlot(el, state) {
  const slotName = el.slotName || '"default"' // 插槽名字
  const children = genChildren(el, state) // 默认内容
  let res = `_t(${slotName}${children ? `,${children}` : ''}`
  // attrs 就是slot绑定的值 <slot attr="msg">
  // 转化成 {attr: msg} 字符串
  const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  //...
  return res + ')'
  // 最后返回 _t(name, children/null, attrs) 
}
```

### 运行时
> _t 就是 renderSlot

```js
function renderSlot(name, fallback, props, bind) {
  // 根据插槽名字获取内容，获取的传入的data对象的scopedSlots，值是函数
  const scopedSlotFn = this.$scopedSlots[name]
  let nodes
  if (scopedSlotFn) {
    props = props || {}
    if (bindObject) {
      //...
      props = extend(extend({}, bindObject), props)
    }
    // props 就是从 slot标签 解析出来的 绑定数据对象attrs
    nodes = scopedSlotFn(props) || fallback
}
// 通过执行传入的函数，生成对应slot的vnode节点
```

子组件从**父组件传入的data对象**中拿到对应插槽的函数，将绑定的数据对象当参数传入

# tips
> 更新父组件的时候，为什么子组件插槽内容会一起更新？

在更新父组件数据，会重新 **patch** 父组件，会重新执行到 **patchVnode** 方法
```js
// core/vdom/patch.js
function patchVnode() {
 // ...
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }
    // patch组件节点之前，先执行prepatch钩子
}

// core/vdom/create-component.js
  prepatch (oldVnode, vnode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  }
// 钩子内执行updateChildComponent

// core/instance/lifecycle.js
function updateChildComponent() {
    /// .. haschildren = true
    const hasChildren = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      parentVnode.data.scopedSlots || // has new scoped slots
      vm.$scopedSlots !== emptyObject // has old scoped slots
    )
  
  // ... 注意这里vm是子组件的vm，parentVnode是组件占位节点
  // 强制更新子组件
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }
}
```