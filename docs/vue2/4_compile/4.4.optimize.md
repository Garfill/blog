## Optimize - 优化生成的AST树

> 之前的代码中，已经将传入的template字符串，逐个解析成了ast语法树，之后就是对该语法树的优化操作。
> 通过深度遍历AST树，对节点进行标记。

optimize 方法在 compiler/optimizer.js
```js
function optimize (root, options) {
  if（!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // 标记静态节点
  markStatic(root)
  // 标记静态根节点
  markStaticRoots(root, false)
}


function markStatic  (node)  {
  node.static = isStatic(node)
  // 通过AST节点的类型还标记是否为static，表达式(type=2)为false，纯文本(type=3)为true，一般节点(type=1)根据其是否有绑定值，且不能是组件
  if (node.type === 1) {
    if (!isPlatformReservedTag(node.tag) && node.tag !== 'slot' && node.attrsMap['inline-template'] == null ){
      return 
    }
    for (let i = 0, l = node.children.length; i<l; i++) {
      const child = node.children[i]
      markStatic(child) // 递归标记子节点
      if (!child.static) {
        node.static = false
      }
    }
    ...
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor // 最外层根节点为false
    }
    if (node.static && node.children.length && !(node.children.length === 1 && node.children[0].type === 3) {
      node.statkcRoot = true
      return
      // 当前节点为静态节点，且子节点不是纯文本的时候
    } else {
      node.staticRoot = false
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i<l; i++) {
        markStaticRoots(node.children[i], isInFor || !1node.for)
      }
    }
    ...
  }
}
```

> 经过上面的代码分析，可以看到是从根节点开始，逐个子节点进行递归，根据节点类型以及其子节点类型进行标记