# v-model
v-model 一般用于**数据绑定**，或者**组件与父组件的数据绑定**

## 编译时（parse）
在编译模板字符串过程中，会将**v-model**指令进行处理
```js
// compiler/parser/index.js
function processAttrs(el) {
  ...
  name = name.replace(dirRE, '') // name = model
  ...
  addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i])
}

// compiler/helper.js
function addDirective(el, name, rawName, value, arg,  isDynamic, modifiers, range) {
  (el.directives || el.directives = [])).push(rangeSetItem({
     name, rawName, value, arg, isDynamic, modifiers
    }, range)
  el.plain = false
  
  // 也就是将 model指令相关数据，添加到el（ast节点）的directives数组中，其他自定义指令也一样
  // 返回的ast节点就会包含该指令属性
}
```

## 代码生成（codegen）
处理过程在**genData**过程
```js
// compiler/codegen/index.js
function getData(el, state) {
  let data = '{'
  // 指令需优先处理，因为指令内部可能会改变vm实例的其他属性
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','
  ...
}

function genDirectives(el, state) {
  const dirs = el.directives
  if (!dirs) return
  let res = 'directives: ['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    // state 是根据不同平台生成的 CodegenState
    // 具体定义属于 platform/web/compiler/index.js中的baseOptions
    const gen = state.directives[dir.name]
    if (gen) {
      needRuntime = !!gen(el, dir, state.warn)
    }
    if (needRuntime) {
      hasRunTime = true
      res += `...`
      // 根据传入的directive信息（value，arg，modifiers）来生成res字符串
    }
  }
  if (hasRumtime) {
    return res.slice(0, -1) + ']'
  }
}
```

### model这个gen的实现

```js
// platform/web/compiler/directives/model.js
function model(el, dir, warn) {
  // 对于正常文本input的v-model
  ...
  else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers)
  }
}

function genDefaultModel(el, value, modifiers) {
  const { lazy, number, trim } = modifiers || {}
  // 这个属性用于解决频繁输入触发input
  const needCompositionGuard = !lazy && type !== 'range'
  let valueExpression = '$event.target.value'
  ...
  let code = genAssignmentCode(value, valueExpression)
  if (needCompositionGuard) {
    code = `if ($event.target.composing)return;${code}`
  }
  // v-model语法糖本质，就是给对应的ast添加value的prop
  addProp(el, 'value', `(${value})`)
  // 添加事件处理函数到ast的events[event]，参考上篇文章的事件处理
  // 当回到外层genData中，el上就有events，就能生成事件处理的代码
  addHandler(el, event, code, null, true)
}
```

## 运行时（runtime）
在**patch**过程中，也就是通过将**render函数**转换成**vnode**，最后转换成**dom**的过程，当遇到指令的时候，会在不同时机调用指令的**钩子函数**
**patch**过程通过**invokeCreateHooks**来触发**平台钩子函数（created等）**，然后平台钩子函数中会调用**callHook**来触发指令的不同钩子
```js
// vdom/modules/directives.js
function updateDirectives (oldVnode, vnode) {
  // 这里是调用create钩子的逻辑
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode)
  }
}

function (old, vnode) {
  const isCreate = old === empty
  const isDestroy = vnode === empty
  // 格式化新旧节点的指令合集
  // 同时在directives中 添加 def 定义（通过vm实例内部获得）
  const oldDirs = normalize(old.data.directives, old.context)
  const newDirs = normalize(vnode.data.directives, vnode.context)
  const dirsWithInsert = []
  const dirsWithPostpatch = []
  
  let key, oldDir, dir
  for (key in newDirs) {
    oldDir = oldDirs[key]
    dir = newDirs[key]
    if (!oldDir) {
      // 调用指令的bind钩子
      callHook(dir, 'bind', vnode, oldVnode)
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir)
      }
    } else {
      // 类似于bind，调用update钩子
    }
  }
  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0; i < dirsWithInsert.length; i++) {
        // 上面调用了bind钩子，这里就是inserted钩子
        callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode)
      }
    }
    
    if（!isCreate) {
      // 新创建的节点，合并到节点的insert回调，patch过程中一起调用
      mergeVNodeHook(vnode, 'insert', callInsert)
    } else {
      callInsert()
    }
  }
}
```
### 运行时的实现
```js
// platforms/web/runtime/directives/model.js
const directive = {
  inserted(el, binding, vnode, oldVnode) {
    //...
    el._vModifiers = binding.modifiers
    if (!binding.modifiers.lazy) {
      // 这里主要是用的input的compositon相关事件
      el.addEventListener('compositionstart', onCompositionStart)
      el.addEventListener('comppositionend', onCompositionEnd)
      //...
    }
  }
}

function onCompositionStart (e) {
  // 上面生成代码的时候，在input事件中会判断 e.target.composing = true 就会 return 的实现
  e.target.composing = true
}

function onCompositionEnd(e) {
  if (!e.target.composing) return
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger (el, type) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatch(e)
  // 手动触发input
}
```


## 组件上的v-model
**v-model**在**组件中**也是语法糖
**解析过程（parse）** 和原生的v-model是一样的，而在**codegen（代码生成）** 阶段，则是不同
```js
// platforms/web/compiler/directives/model.js
function model(el, dir) {
  //... el是ast节点
  else if (!config.isReservedTag(tag) {
    genComponentModel(el, value, modifiers)
    return fales
  }
}
```
### genComponentModel
> 用于解析**组件上的v-model**指令
```js
// compiler/directives/model.js
function genComponentModel(el, value, modifiers) {
  const baseValueExpression = '$$v'
  //... 关于修饰器的解析和input的类似
  const assignment = genAssignmentCode(value, valueExpress)
  el.model = {
    value: `(${value})`,
    expression: JSON.stringify(value),
    callback: `function(${baseValueExpression}) {${assignmentCode}}`
  }
  // 通过这个函数，给对应组件的ast节点，生成model属性
}
```
**执行完genComponentModel之后**，el这个ast节点返回外层**生成render函数**的**genData**过程中，其中对**el的model**属性做处理
```js
// compiler/codegen/index.js
function genData(el, state) {
  //...
  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`
  }
  // 对model属性处理，生成对应代码字符串，加到render函数字符串
}
```

在**生成组件vnode过程中**，对组件的model属性处理
```js
// src/core/vdom/create-component.js
function createComponent(Ctor, data...) {
  // model就在data对象中传入
  // ...
  if (isDef(data.model) {
    transformModel(Ctor.options, data)
  }
}

// prop, event解析出来，然后分别往data对象里的props和on属性添加，实现v-model语法糖
function transformModel (options, data: any) {
  const prop = (options.model && options.model.prop) || 'value'
  const event = (options.model && options.model.event) || 'input'
  ;(data.props || (data.props = {}))[prop] = data.model.value
  const on = data.on || (data.on = {})
  if (isDef(on[event])) {
    on[event] = [data.model.callback].concat(on[event])
  } else {
    on[event] = data.model.callback
  }
}
```

### 小结
也就是通过解析v-model指令，往组件添加props和对应的事件回调，从而实现v-model的值的更新