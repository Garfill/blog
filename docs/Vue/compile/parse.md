# Parse 过程分析

> parse的作用：将传入的 template 转换成AST（抽象语法树）

## parse的调用

```js
// compiler/index.js
const ast = parse(template.trim(), options) // template = <App/>

// compiler/parser/index.js
function parse(template: String, optinos: CompilerOptions): ASTElement | void {
  // options 转换过程中的平台相关选项 web => platforms/web/compiler/options.js中的baseOptions
  // 省略一些初始化代码
  parseHTML(template, {
    // 转化的选项和回调方法
    start() {},
  	end() {},
  	char() {},
  	comment() {}
  	// 一些回调方法
  })
  // 返回的AST根节点（children数组）
  return root 
}
```



## parseHTML

> 将 **template** 字符串 转换成 **AST**

```js
// compiler/parser/html-parser.js
function parserHTML (html, options) {
  // html字符串
  // 主要是利用各种正则表达式来进行字符串的匹配
  const stack = []
  const expectHTML = options.expectHTML
  const isUnaryTag = options.isUnaryTag || no
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
	let index = 0;
  let last, lastTag
  while(html) {
    // 里面是对html字符串的正则匹配和处理
  }
  // 清除剩余的
  parseEndTag()
}
```



### while 循环里的逻辑

```js
while (html) {
  last = html // 剩余的字符串
  // 下面的逻辑会对html字符串做处理，切片
  if (!lastTag || !isPlainTextElement(lastTag)) { 
    // 首部开始 或 不在 script,style 标签内
    let textEnd = html.indexOf('<') // 匹配左尖角
    if (textEnd === 0) {
      // 左尖角匹配到字符串首位
      if (comment.test(html))  {
        // const comment = /^<!\--/ 匹配到注释节点
        const commendEnd = html.indexOf('-->')
        if (commendEnd >= 0) {
          if (options.shouldKeepComment) {
            options.comment(html.substring(4, commendEnd), index, index + commendEnd + 3)
          }
          advance(commendEnd + 3) 
          // 注意这个advance 方法，会增加index（匹配到的位置），同时截去已匹配的字符串
          // 直接进入下一个循环
          continue
        }
      }
      
      // 这一个条件主要是匹配 IE的条件判断
      if (conditionalComment.test(html)) {
        const conditionalEnd = html.indexOf(']>')
        if (conditionalEnd >= 0) {
          advance(conditionalEnd + 2)
          continue
        }
      }
      // 匹配到 <!DOCTYPE html>
      const doctypeMatch = html.match(doctype)
      if (doctypeMatch) {
        advance(doctypeMatch[0].length)
        continue
      }
      // 匹配到结束尖角 </div>
      // 注意这里的 endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
      // 所以是左尖角在htmlz
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        const curIndex = index
        advance(endTagMatch[0].length)
        parseEndTag(endTagMatch[1], curIndex, index)
        continue
      }
      // 匹配到开始尖角 
      // 这里也是解析标签传入属性的过程
      // <div v-loading:[arg]>
      const startTagMatch = parseStartTag()
      //{ tagName: 'div', attrs: [标签或组件传入的属性 的正则匹配结果，每一项都是数组，attrs为二维数组]}
      if (startTagMatch) {
        handleStartTag(startTagMatch) // 处理匹配到的开始标签
        // 走到这里已经生成 对应 start 标签 的AST节点
        if (shouldIgnortFirstNewline(startTagMatch.tagNam, html)) {
          // pre 和  textare 标签
          advance(1)
        }
        continue
      }
    }
    let test, rest, next
    if (textEnd >= 0) {
      // 左尖角不在第一位
      rest = html.slice(textEnd)
      // 切到尖角号开始
      while (
      	!endTag.test(rest) &&
        !startTagOpen.test(rest) &&
        !comment.test(rest) && 
        !conditionalComment.test(rest)
        // 这里的左尖角是一个纯文本，没有匹配到上述任何的标签
      ) {
        next = rest.indexOf('<', 1)
        if (next < 0) break; // 没有下一个尖角
        textEnd += next
        rest = html.slice(textEnd)
        // 寻找文本左尖角之后的下一个左尖角
      }
      text = html.substring(0, textEnd) // 新的左尖角的前面的内容
    }
    if (textEnd < 0) {
      text = html // 就剩下文本了
    }
    if (text) {
      advance(text.length)
    }
    if (options.chars && text) {
      options.chars(text, index - text.length, index) // 建立文本语法树节点
    }
  } else {
    // 这里是 处理 PlainTextElement
    let endTagLength = 0
    const stackedTag = lastTag.toLowerCase() // 转小写
    const reStackedTag = reCache[stackedTag] || (reCached[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
    const rest = html.replace(reStackedTag, function(all, text, entTag) {
      endTagLength = endTag.length
      if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
      }
      if (shouldIgnorFirstNewline(stackedTag, text)) {
        text = text.slice(1)
      }
      if (options.chars) {
        options.chars(text)
      }
      return ''
    })
  } 
  if (html === last) {
    options.chars && options.chars(html)
    break;
  }
}
```



## advance

```js
function advance(n) {
  // 当前html字符串索引自增
  index += n
  // html 字符串往后截断到对应位置，这样才能满足上面html的while循环退出条件
  html = html.substring(n)
}
```



## parseStartTag

> 一般情况下是匹配到的尖角号是**开始标签**的左尖角

```js
function parseStartTag () {
  const start = html.match(startTagOpen)
  if (start) {
    // 匹配到开始标签<div class="..." ...>
    const match = {
      tagName: start[1],
      attrs: [],
      start: index,
    }
    // 先将模板字符串截断到开始标签结束为止(如<div)，然后开始匹配开始标签中的属性
    advance(start[0].length)
    let end, attr
    // 1. 先匹配到自闭合标签<img />、<div />等 或者是开始标签的右尖角符 /^\s*(\/?)>/
    // 2. 匹配动态参数属性: v-test:[attr] 这种以 [] 中括号包含的属性key
    // 3. 匹配普通属性：可以是 id="123" / :id="test" / @id="handle" 对应 attrs / props / event 
    // 普通属性就是我们一般写组件用到的，或者是元素原生属性，与第2步的动态参数属性相对应，普通属性则不带动态参数
		while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attritube))) {
      // 属性键值对匹配 key=value
      attr.start = index
      // 截断到下一个属性的位置
      advance(attr[0].length)
      attr.end = index
      // 推入当前解析的AST节点的属性数组
      match.attrs.push(attr)
      // 如此循环一直匹配到开始标签的结束
    }
    if (end) {
      // 如果匹配到标签闭合
      match.unarySlash = end[1]
      advance(end[0].length)
      match.end = index
      return match // 最终返回AST节点，接着由 handleStartTag 处理深加工
    }
  }
}

function handleStartTag(match) {
  const tagName = match.tagName
  const unarySlash = match.unarySlash
  
  if (expectHTML) {
    // web平台为true
    // 这里后续分析
  }
  // 是否为一元标签 (platforms/web/compiler/util.js) 或者是否自闭合
  const unary = isUnaryTag(tagName) || !!unarySlash 
	const l = match.attrs.length
  const attrs = new Array(l)
  for (let i = 0; i < l; i++) {
    const args = match.attrs[i] // args 为之前匹配的数组输出
    const value = arg[3] || arg[4] || arg[5] || ''
    const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines
    // a 标签中链接编码
    // 每个属性解析成 name/value 的对象，插入attrs数组
    attrs[i] = {
      name: agrs[1],
      value: decodeAttr(value, shouldDecodeNewlines)
    }
    // 循环处理，最后得到一个对象数组
  }
  if (!unary) {
    // 也就是说这个是未匹配闭合的标签，即后面可能有文字或者组件等
    // 用一个栈类型的数组来维护
    stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
    lastTag = tagName 
    // 这里就是改变tagName，下次匹配html字符串的时候就执行匹配标签内的文字的逻辑
		})
  }
	if (options.start) {
    options.start(tagName, attrs, unary, match.start, match.end) 
    // 这里就是创建start的AST节点，不同平台的api不同，在之前用 回调函数的形式 start(){} 传入
    // start 会在之后分析
  }
}
```



## parseEndTag

> 当匹配到 **结束标签** 的时候，会解析结束标签

```js
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
// 开头左尖角的闭合 (</)
const endTagMatch = html.match(endTag)
if (endTagMatch) {
  const curIndex = index
  advance(endTagMatch[0].length)
  parseEndTag(endTagMatch[1], curIndex, index)
  continue
}

function parseEndTag (tagName, start, end) {
  let pos, lowerCasedTagName
  if (start == null) start = index
  if (end == null) end = index
  
  if (tagName) {
    lowerCasedTagName = tagName.toLowerCase()
    for (pos = stack.length - 1; pos >= 0; pos--) {
      if (stack[pos].lowerCasedTag === lowerCasedTagName) {
        // 匹配之前stack栈中存入的tag，找到对应的tag
        break;
      }
    }
  } else { 
    pos = 0 
  }
  
  if (pos >= 0) {
  	// 找到对应匹配的标签
    for (let i = stack.length - 1; i >= pos; i--) {
      if (i > pos || !tagName) {
        // 这里是针对 i > pos 的处理
        // 正常情况：stack最后一个就是匹配的标签
        // 异常情况: <div><span></div> 这里的</div>无法匹配到span
      }
      if (options.end) {
        // AST 结束节点
        options.end(stack[i].tag, start, end)
      }
    }
    stack.length = pos // 将匹配到的标签出栈
    lastTag = pos && stack[pos - 1].tag // 获取新的栈尾元素，下一次while循环的时候做匹配
  } else if (lowerCasedTagName === 'br') {
    	// <br /> 元素
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
	}
}
```



##　文本解析

```js
while() {
  // ... textEnd === 0 的情况
  // 这里匹配的是左尖角符不在模板字符串首位，也就是首位有其他文本
  let text, rest, next
  if (textEnd >= 0) {
    rest = html.slice(textEnd)
    while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {
      // 文本节点之后的左尖角开头字符串，匹配上述正则失败
      // 寻找下一个左尖角
			next = rest.indexOf('<', 1)
      if (next < 0) break;
      textEnd += next
      rest = html.slice(textEnd)
      // 一直循环匹配到能对应上述四个正则之一的左尖角
      // rest则是截断之后的模板
    }
    // text是最终匹配到的文本节点
    text = html.substring(0, textEnd)
  }
  if (textEnd < 0) {
    // 剩下html字符串的全是文本
    text = html
  }
  if (text) {
    advance(text.length) // html截断到新的
  }
  if (options.chars && text) {
    // AST 文本节点生成
    options.chars(text, idnex - text.length, index)
  }
  
}
```

