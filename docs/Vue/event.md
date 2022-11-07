# event 事件
> event 是组件或者元素由于用户交互所触发的行为
## 编译时(parse)
在将**模板字符串**编译成**ast树**的时候，闭合一个标签的时候，会对标签上的属性进行处理，也就是**processAttrs**函数
```js
// compiler/parser/index.js
function processAttrs(el) {
  ...
  if (dirRE.test(name)) {
    // name: 指令原始名称 @click.native.prevent / @child-event
    el.hasBindings = true
    // 获取修饰符集合
    modifiers = parseModifiers(name.replace(dirRE, ''))
    name = name.replace(modifierRE, '') // 纯净版指令名 @click @child-event
    
    ...
    name = name.replace(onRE, '')
    // 向AST节点内部添加事件处理
    addHandler(el, name, value, modifiers, false)
  }
}

function parseModifiers(name) {
  const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g
  const match = name.match(modifierRE)
  if (match) {
    const ret = {}
    match.forEach(m => { ret[m.slice(1)] = true })
    return ret
  }
  // ret = { native: true, prevent: true }
}
```

> 上面是通过解析ast节点内的属性对来操作，得到事件名和事件修饰符
```js
// compiler/helpers.js
function addHandler(el, name, value, modifiers, important) {
 // import = false
 if (modifiers.right) {
   name = 'contextmenu' // 鼠标右键
   delete modifiers.right
 } else if (modifiers.middle) {
   name = 'mouseup' // 中键
 }
 ...
 let events
 if (modifiers.native) {
   delete modifiers.native
   events = el.nativeEvents || (el.nativeEvents = {})
 } else {
   events = el.events || (el.events = {})
 }
 // 创立ast节点的events或者nativeEvents属性
 const newHandler = rangeSetItem({value: value.trim()})
 // 其实可以看作就是参数内部的那个对象
 newHandler.modifiers = modifieres
 const handlers = events[name]
 // 然后就是将handler添加进去events作为其属性，如果原来就有的话就改写成数组
 el.plain = false
}
```

## 代码生成(codegen)
上面通过编译得到**ast节点**之后，下一步就是根据节点信息**生成代码字符串**
也就是在**genElement**过程中，会通过**genData**生成节点的**data对象**
```js
// compiler/codegen/index.js
function genData(el, state) {
  ...
  if (el.events) { 
  // 上面编译parse 时添加到el节点的events属性
  // data是最终返回的代码字符串
    data += `${genHandler(el.events, false)}`
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el,nativeEvents, true)}`
  }
  // 上面两次函数调用差别在于第二个参数传入，标识是否为web原生事件
  ...
}
```

### genHandlers 实现
```js
// compiler/codegen/events.js
function genHandlers(events, isNative) {
  const prefix = isNative ? 'nativeOn:' : 'on'
  let staticHandlers = ''
  for (const name in events) {
    // 遍历每个event事件
    const handlerCode = genHandler(event[name])
    staticHandlers += `"${name}": ${handlerCode},`
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`
  return prefix + staticHandlers
}

function genHandler (handler) {
  if (!handler) { return 'function() {}' }
  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }
  const isMethodPath = simplePathRE.test(handler.value) 
  // @click="handler" 正常写法
  const isFunctionExpression = fnExpRE.test(handler.value)
  // @click="function a(){} || () => {}" 函数声明式或者箭头函数
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, '')
  // @click="handler($event)"
  if (!handler.modifiers) {
    // 没有修饰符
    if (isMethodPath || isFunctionExpression) {
      // 前两种写法，直接返回表达式
      return handler.value
    }
    // 第三种写法，需要在外面包一层函数声明，将$event参数出入
    return `function($event) {
      ${isFunctionInvocation ? `return ${handler.value}` : handler.value
    }`
  } else {
    // 包含修饰符
    let code = ''
    let genModifierCode = ''
    const keys = []
    for (const key in handler.modifiers) {
      if (modifierCode[key]){
        genModifierCode += modifierCode[key] // 不用修饰符添加不同代码
      } else if (key === 'exact') {
        const modifiers = handler.modifiers
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(i => !modifiers[i])
            .map(i => `$event.${i}Key`
            .join('||')
      } else {
        keys.push(key)
      }
    }
    if (keys.length) { code += genKeyFilter(keys) }
    if (genModifierCode) code += genModifierCode
    // 这里是将修饰符的代码先合并到事件处理代码前半部
    const handlerCode = isMethodPath
      ? `return ${handler.value}($event)`
      : isFunctionExpression
        ? `return (${handler.value})($event)` // 做一个立即执行函数
        : isFunctionInvocation
          ? `return ${handler.value}`// 直接用就行，这里是第三种写法，已经自己传入$event
          : handler.value
    return `function($event){${code}${handlerCode}}`
    // 最终返回事件处理函数的字符串
  }
}
```
## 小结
> 上述生成的**事件处理函数字符串**，返回到**generate** 函数中返回的code，返回成vm实例的data对象，具体可参考[渲染函数生成vue组件中的数据对象](https://cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1)

## 事件绑定的时机
> 事件的绑定时机，发生在生成vnode之后的create钩子函数调用，也就是**patch过程中invokeCreateHooks**

总共有两个调用时机
- createElm过程中，创建普通vnode节点之后
- createComponent过程中，组件初始化initComponent过程中

### updateDOMListeners
定义实现是对应**不同平台的modules**
```js
// platforms/web/runtime/modules/events.js
function updateDOMListeners(oldVnode, vnode) {
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  // 这些是vnode节点里面的事件对象
  target = vnode.elm
  // 取出绑定元素
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  // 添加事件
  target = undefined
}
```

#### updateListeners
```js
// core/vdom/helpers/udpate-listeners.js
function updateListeners(on, oldOn, add, remove, createOnceHandler, vm) {
  let name, def, cur, old, event
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    // 这里是针对之前如果有特定修饰符，如once的，会在name的字符串前加～，这里将其解析回来
    if (isUndef(old) {
      // 没有oldvnode的事件，也就是新绑定事件
      if (isUndef(cur.fns) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      // 这里是组件更新，导致这些事件处理函数也更新的情况
      // 这里只更新了invoker的fns属性，因为最终执行时间处理的时候是取出该属性值进行计算，所以只需要修改属性值的指向即可
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name]){
      // 组件更新，删去无用的事件处理
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}

function createFnInvoker(fns, vm) {
  function invoker() {
    // 最终的事件处理逻辑，取出fns属性值进行执行
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      for (let i = 0; i < fns.length; i++) {
        fns[i].apply(null, arguments)
      }
    } else {
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns
  return invoker
  // 这里的invoker也就是最终返回到外面cur上的方法，也就是最终事件调用函数
  // 每次调用事件，就会将传入的fns取出，然后执行
}
```

#### add 实现
```js
// platforms/web/runtime/modules/events.js
function add (name, handler, capture, passive) {
  // handler = cur
  if (useMicrotaskFix) {
    const attachedTimestamp = currentFlushTimestamp
    const original = handler
    handler = original._wrapper = function(e) {
      if (e.target === e.currentTarget || 
          e.timeStamp >= attachedTimestamp ||
          e.timeStamp <= 0 ||
          e.target.onwerDocument !== document
        ) {
          return original.apply(this, arguments)
        }
    }
    // 对传入的目标元素绑定事件处理
    target.addEventListener(name, handler, supportPassive ? {capture, passive} : capture)
  }
}

```

> 这里会有个疑问：组件的原生事件是用nativeOn存储，但是上面取出绑定的是on属性
> 分析：在创建组件vnode的过程中发生过一次变量交换

```js
// core/vdom/create-components.js
function createComponent() {
  ...
  const listener = data.on
  data.on = data.nativeOn
  // 所以组件自定义事件是用 listener 属性存储了
  const vnode = new VNode(
    `vue-component-${Ctor.cid}-${name}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  // listeners 最后是作为组件占位VNode的属性传入
}
```

## 自定义事件的实现
> 上面是对原生事件的绑定实现，下面则是对组件的自定义事件的实现

**自定义事件**是存储到**listeners**对象中，并存储到组件vnode的属性中
在创建**组件vm实例**的时候，会对组件事件进行初始化

```js
// core/instance/init.js
Vue.prototype._init = function(options) {
  // 这里的options是在createComponentInstanceForVnode的时候传入
  if (options && options._isComponent) {
    initInternalComponent(vm, options)
    // component的合并配置
  }
  ...
  initEvents(vm)
}


function initInternalComponent(vm, options) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // 创建组件options
  ...
  opts._parentVnode = parentVnode
  // 这里是组件占位符vnode
  const vnodeComponentOptions = parentVnode.componentsOptions
  ...
  opts._parentListeners = vnodeComponentOptions.listeners
  // 这里是将组件vnode的listeners赋值给组件vm实例里的_parentListeners
  // 然后回到外面的initEvents
}

function initEvents(vm) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  const listeners = vm.$options._parentListeners
  if (listeners) {
    // 组件事件绑定
    updateComponentListeners(vm, listeners)
  }
}

function updateComponentListeners(vm, listeners, oldListeners) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  target = null
  // target 全局变量，存储当前vm
}
```

> 这里的updateListeners和web原生事件绑定时的updateListeners是同个函数，只是传入的方法不一样

#### 自定义事件内部实现
```js
function add(event, fn) {
  target.$on(event, fn)
}
function remove(event, fn) {
  target.$off(event, fn)
}
// 通过vm实例的$on/$off 进行事件的绑定和删除
Vue.prototype.$on = function(event, fn){
  const vm = this
  if (Array.isArray(event)) {
    // 传入的是列表event，循环调用$on
  } else {
    (vm._events[event] || (vm._events[event] = [])).push(fn)
    // 组件vm的自定义事件，就是将回调函数推入_events[event]的数组中
    // 调用的时候就循环调用该数组
    if (hookRE.test(event)) {
      // 可以用 hook:mounted 这样来定义一个钩子事件
      vm._hasHookEvent = true
    }
    return true
  }
}

Vue.prototype.$once = function (event: string, fn: Function): Component {
  const vm: Component = this
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

Vue.prototype.$off = function(event, fn) {
  const vm = this
  if (!arguments.length) {
    // 不传任何参数，就会删掉vm实例所有事件回调函数
    vm._events = Object.create(null)
    return vm
  }
  if (Array.isArray(event)) {
    // 循环调用$off
    return vm
  }
  const cbs = vm._events[event]
  if (!cbs) {
    return vm
  }
  if (!fn) {
    vm._events[event] = null
    return vm
    // 不传入fn参数，就直接删除该事件所有回调
  }
  let cb, i = cbs.length
  while (i--) {
    cb = cbs[i]
    if (cb === fn || cb.fn === fn) { 
      // 在回调数组中找到匹配的，然后删除
      cbs.splice(i, 1)
      break
    }
  }
  return vm
}

Vue.prototype.$emit = function(event) {
  const vm = this
  ...
  let cbs = vm._events[event]
  if (cbs) {
    cbs.length > 1 ? toArray(cbs) : cbs
    const args = toArray(arguments, 1)
    // 也就是$emit(event, args)，这里的args是将emit的入参从下标1开始取，舍弃了event参数
    for (let i = 0, l = cbs.length; i < l; i++) {
      // 循环调用cbs回调
      try {
        cbs[i].apply(vm, args)
      } catch (e) {
        handleError(e, vm, `event handler for "${event}"`)
      }
    }
  }
}
```

#### 总结
经典事件中心实现，利用vm._events存储所有的组件事件，然后vm内部触发本身定义的事件
但是，由于传入的回调函数是在**父级组件**定义，所以调用的时候就是调用父级组件的方法