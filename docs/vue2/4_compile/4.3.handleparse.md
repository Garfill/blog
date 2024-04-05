# 处理匹配的标签

> 当之前的while循环匹配到对应的开始标签、结束标签、文本、注释等节点时，调用传入的各回调函数生成对应的 **AST节点**

回调函数在 **parser执行编译** 的时候传入



## start实现

```js
// src/compiler/parser/index.js
start(tag, attrs, unary, start, end) {
  // attrs = [{ name, value }]
  ...
  let element = createASTElement(tag, attrs, currentParent)
  // 创建AST元素 => js Object
  ...
  if (isForbiddenTag(element) && !isServerRendering()) {
    // tag 不能style/script
  }
  for (let i = 0; i < preTransforms.length; i++) {
    // 平台相关的预处理函数
    element = preTransform[i](element, options) || element
  }
  if (!inVPre) {
    processPre(element)
    // v-pre指令会跳过编译成render的部分
    // v-pre赋值element.pre = true
    if (element.pre) {
      inVPre = true;
    }
  }
  if (platformIsPreTag(element.tag)) {
    inPre = true // pre标签(不同平台的表现形式不同)
  }
  if (inVPre) {
    precessRawAttrs(element)
  } else if (!element.processed) {
    processFor(element) // v-for
    processIf(element) // v-if
    processOnce(element) // v-once
  }
  if (!root) {
    root = element
    // 组件创建时的根节点
  }
  if (!unary) {
    currentParent = element // 不是自闭合标签
    stack.push(element) // 同样以一个栈结构数据维护
  } else {
    closeElement(element)
  }
}

```



### processRawAttrs

```js
function processRawAttrs (el) {
  // 作用是将element的属性value序列化成字符串，防止解析成模板
  const list = el.attrsList
  const len = list.lenght
  if (len) {
    const attrs = el.attrs = new Array(len)
    for (let i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value) // 序列化value
      }
      if (list[i].start != null) {
        attrs[i].sart = list[i].start
        attrs.end = list[i].end
      }
    }
  } else if (!el.pre) {
    el.plain = true
  }
  // 这里传入的是AST节点的引用，所以修改都会反馈到外面 start 函数的AST节点
}
```



### processFor

```js
function processFor (el) {
  let exp
  if ((exp = getAndRemoveAttrs(el, 'v-for'))) {
    // exp: "(item, index) in list" 也就是v-for里面的表达式
    const res = parseFor(exp)
    if (res) {
      extend(el, res)
    } else if () {
      // 错误处理
    }
  }
}

function parseFor (exp) {
  const inMatch = exp.match(forAliasRE)
  //const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
  // 匹配 for 或者 of 循环
  if (!inMatch) return
  const res = {}
  res.for = inMatch[2].trim() // list
  // (item, index) => item, index
  const alias = inMatch[1].trim().replace(stripParensRE, '') // item, index
  const iteratorMatch = alias.match(forIteratorRE) // [',index', ' index', ..]
  // const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/
  // 这个iteratorRE 匹配的是 ,index 以及之后的字符串
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '')
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      // 对象的循环
      res.iterator2 = iteratorMatch[2].trim()
    }
  } else {
    res.alias = alias
  }
  return res
  // { for: 'list', alias: 'item', iterator1: 'index' }
}
```



### processIf

```js
function processIf (el) {
  const exp  getAndRemoveAttr(el, 'v-if')
  if (exp) {
    exp.if = exp
    addIfCondition(el, {
      exp: exp,
      block: el // block其实就是生成的AST节点
    })
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    if (elseif) {
      el-elseif = elseif
    }
  }
}

function addIfCondition(el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  // 收集所有的if 条件到el的条件数组
  el.ifConditions.push(condition)
}
```



### processOnce

```js
function processOnce (el) {
  // v-once只会渲染一次，随后视为静态内容，用于优化更新性能
  const once = getAndRemoveAttr(el, 'v-once')
  if (once != null) {
    el.once = true
  }
}
```



### 小结

> 上面的代码，解释了AST开始节点的二次加工过程，根据编译的结果，先后进行v-for / v-if / v-once的处理



## end 实现

```js
end (tag, start, end) {
  const element = stack[stack.length - 1]
  stack.length -= 1 // 更新栈尾
  currentParent = stack[stack.length - 1]
  closeElement(element) // 用之前栈尾的开始节点做结束处理
}

function closeElement(element) {
  ...
  if (!inVPre && !element.processed) {
    // 非 v-pre 的节点要先处理
    // 这里的处理之后解析
    element = processElement(element, options)
  }
  if (!stack.length && element !== root) {
    // 此时闭合的节点已经是组件的根节点之一，也就是存在组件的根节点会有v-if/v-else的存在
    if (root.if && (element.elseif || element.else)) {
      addIfCondition(root, {
        exp: element.elseif,
        block: element,
      })
    } else if () { /** 错误处理 **/ }
  }
  if (currentParent && !element.forbidden) {
    // currentParent就是栈内element的前一个入栈元素，也就是树形结构中的父节点
    if (element.elseif || element.else) {
      processIfConditions(element, currentParent)
    } else {
      if (element.slotScoped) {
        // element是作用域插槽内容
        const name = element.slotTarget || '"default"'
        // 将插槽slot赋值到父节点的插槽map对象中
        ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
      }
      currentParent.children.push(element)
      element.parent = currentParent
    }
  }
  // element设置children，slot的话则是设置默认内容
  element.children = element.children.filter(c => !c.slotScope)
  ...
  // 重置 pre 的标识位
  if (element.pre) {
    inVPre = false
  }
  if (platformIsPreTag(element.tag)) {
    inPre = false
  }
}
```



### processElement

> 这是几乎每个AST节点都会执行的逻辑，v-pre的除外
>
> 主要是处理节点中的一些属性

```js
function processElement (element, options) {
  // 处理element中的key: el.key = index
  // 检测是否有template中的key属性，或者transition-group的key属性
  processKey(element)
  element.plain = (
    // 判断节点的复杂性
    !element.key && !element.scopedSlots && !element.attrsList.length
  )
  // 处理ref以及for循环的ref
  processRef(element)
  // 处理 slot 的属性
  processSlotContent(element)
  // 处理 slot 标签节点 <slot>
  processSlotOutlet(element)
  // component is属性处理
  processComponent(element)
  ...
  // 处理element的属性列表
  processAttrs(element)
  return element
  // 最终返回处理过后的节点
}
```



### processSlotContent

```js
function processSlotContent(el) {
  let slotScope
  // 在传入之前处理插槽slot节点
  if (el.tag === 'template') {
    // <template scope="xxx">
    // <template slot-scope="xxx">
		slotScope = getAndRemoveAttr(el, 'scope')
    el.slotScopd = slotScope || getAndRemoveAttr(el, 'slot-scope')
  } else if (slotScope = getAndRemoveAttr(el, 'slot-scope')) {
    // <div slot-scope="xxx">
    el.slotScope = slotScope
  }
  // 上述代码获取作用域插槽的内容
  
  // <div slot='xxx'>
  // <template slot='xxx'>
  // 获取插槽插入的位置，最终存到 element 的 attrs 列表中
  const slotTarget = getBindingAttr(el, 'slot')
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
    el-slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot'])
    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'))
    }
  }
}
```



### processAttrs

```js
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, syncGen, isDynamic
  for (let i = 0, l = list.length; i < l; i++) {
    // 循环之前解析到的AST属性列表[{ name, value }]
    name = rawName = list[i].name
    value = list[i].value
    if (dirRE.test(name)) {
      // 各个指令匹配
      //^v-|^@|^:|^#/
      el.hasBindings = true // 标识有绑定的值
      modifiers = parseModifiers(name.replace(dirRE, '')) // 获取modifier (v-a.b)中的b
      name = name.replace(modifierRE, '') // 去掉修饰符，拿到纯净的指令名称
    }
    // 上面指令处理过后，这里的name已经是单纯的指令没有修饰符
    if (bindRE.test(name)) {
      // v-bind
      name = name.replace(bindRE, '') // 绑定属性名 :name => name
      value = parseFileters(value) 
      // 这里会处理filter的情况，原理和解析标签一样，循环处理整个字符串，碰到相应的字符进行处理，最后得到类似_f("filterName")(exp = 传入的属性值)，每次得到的新的 _f 也作为下次匹配到的filter 的属性值
      isDynamic = dynamicArgRE.test(name) // 是否是动态属性名[name] = value
      if (isDynamic) {
        name = name.slice(1, -1)
      }
      ...
      if (modifiers.sync) {
        // 有sync修饰符
        syncGen = genAssignmentCode(value, `$event`)
        // addHandler 往el（AST）元素的event 属性添加 对应的事件
        if (isDynamic) {
          addHandler(el, `update:${camelize(name)}`), syncGen, null, false, warn, list[i])
        } else {
          addHandler(le, `"update:" + (${name})`, syncGen, null, false, warn, list[i], true)
        }
        ....
      }
    } else if (onRE.test(name)) {
      // v-on 事件，也是添加到 event
      name = name.replace(onRE, '')
      isDynamic = dynamicArgRE.test(name)
      ...
      addHandler(el, name, value, modifiers, false, warn, list[i], isDynamic)
    } else {
      // v-model 会走到 自定义指令也会
      name = name.replace(dirRE, '')
      const argMatch = name.match(argRE) // 匹配指令的 binding.argument
      let arg = argMatch && argMatch[1]
      isDynamic = false
      if (arg) {
        name = name.slice(0, -(arg.length + 1)) // 去除 :arg
        if (dynamicArgRE.test(arg)) {
          arg = arg.slice(1, -1)
          isDynamic = true
        }
        // el.directive.push(obj) 是一个数组
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i])
      }
    } else {
      ...
      // 普通属性 推入 el.attrs 数组
      addAttr(el, name, JSON.Stringify(value), list[i])
    }
  }
}
```



## chars 实现

```js
chars (text, start, end) {
  if (!currentParent) {
    return
    // 文本定义在根节点之外
  }
  ...
  const children = currentParent.children
  if (inPre || text.trim()) {
    // script / style 标签，直接返回文本
    // 其他的，要做decode
    text = isTextTag(currentParent) ? text : decodeHTMLCached(text)
  } else if (!children.length) {
    text = ''
    // 移除开始标签后面的空格
  }
  ...
  if (text) { 
		if (!inPre && whitespaceOption === 'condense') {
      text = text.replace(whitespaceRE, ' ') // 多个空格替换成一个
    }
    let res
    let child
    if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
      // 有插值的文本 {{text}}
      child = {
        type: 2,
        expression: res.expression,
        token: res.tokens,
        text
      }
    } else if (text !== ' ' || !children.length || children[children.length -1].text !== ' ') {
      // 纯文本 <span>123</span>
      child = {
        type: 3,
        text,
      }
    }
    if (child) {
      children.push(child) // text的AST节点加到当前父节点
    }
  }
  
}
```



### parseText

```js
// compiler/parser/text-parser.js
function parseText (text, dlimiters) {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  // const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
  // 插值的正则匹配
  const tokens = []
  const rowTokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tegRE.exec(text))) {
    index = match.index
    if (index > lastIndex) {
			rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    const exp = parseFilters(match[1].trim()) // filters
    tokens.push(`_s(${exp}`)
    rawTokens.push({'@binding': exp})
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastInex))
    tokens.push(JSON.stringify(tokenValue))
  }
  // 将文本逐个单词都token化，最后形成token数组和表达式返回
  return {
    expression: tokens.join('+'),
    tokens: rawTokens,
  }
}
```

