# 组件更新（渲染vnode相同）


当修改 vm 实例的data时候，就会调用对应的 **reactiveSetter 函数**，触发 **dep实例** 的notify，让订阅者watcher都进入更新队列

其中，对于**渲染 watcher**，就会重新触发 **mountComponent 函数**，重新调用**render函数**来生成**新的渲染vnode**，然后**重新 patch**

重新 patch 的执行过程 ，与新建节点时的 patch 有所不同

```js
// vdom/patch.js
function patch (oldVnode, vnode) {
  // 这里oldVnode传入的是当前的vnode
  const isRealElement = isDef(oldVnode.nodeType) // false
  if (!isRealElement && sameVnode(oldVnode, vnode)) {
    // patch前后的vnode是一样的tag和key
    // 下一篇讨论
    patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
  } else {
    // 当patch前后的渲染vnode不一样的时候（比如一个是div，一个是ul）
    const oldElm = oldVnode.elm;
    const parentElm = nodeOps.parentNode(oldElm)
    // 根据新的vnode创建新的dom节点并插入
    // 这里执行之后dom上会有新旧两个dom
    createElm(vnode, insertedVnodeQueue, parentElm, nodeOps.nextSibling(oldElm))
    
    if (isDef(vnode.parent)) {
      let ancestor = vnode.parent // 占位符vnode
      const patchable = isPatchable(vnode) // 如果是组件vnode递归寻找其最里面的非组件vnode
      while (ancestor) {
        // 执行外层占位符vnode的钩子更新
        // 比如一些指令的unbind
        for (let i = 0; i < cbs.destroy.length; ++i) {
          cbs.destroy[i](ancestor)
        }
        ancestor.elm = vnode.elm
        if (patchable) {
          // 外层占位符vnode的创建钩子
          for (let i = 0; i < cbs.create.length; ++i) {
            cbs.create[i](emptyNode, ancestor)
          }
          const insert = ancestor.data.hook.insert
          if (insert.merged) {
            // 一些insert钩子，比如指令的inserted，从下标 1 开始，不触发vnode自身的mounted
            for (let i = 1; i < insert.fns.length; i++) {
              insert.fns[i]()
            }
          }
        } else {
          registerRef(ancestor) // ref 的赋值
        }
        // 递归寻找外层占位符vnode
        ancestor = ancestor.parent
      }
    }
    
    if (isDef(parentElm)) {
      // 替换旧节点，这里面也会触发vnode的destroy钩子
      removeVnode([oldVnode], 0, 0)
    } else if (isDef(oldVnode.tag)) {
      invokeDestroyHook(oldVnode)
    }
  }
  // 执行到这里的只有 渲染Vnode（组件内最外层节点），Vue应用根实例vm的Vnode
  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```



> 总结：当更改前后渲染节点前后不一致的时候，patch逻辑与创建新节点时类似，增加了旧节点的 **destroy钩子**，以及会重新触发**占位符节点的create钩子和insert钩子**

