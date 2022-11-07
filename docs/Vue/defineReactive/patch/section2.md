# 组件更新（渲染节点相同）



经过上文的分析其实可以知道，组件更新时会生成新的渲染vnode，与旧的vnode对比进行patch

当新旧 **渲染vnode** 不相同，会直接生成用新的vnode去替换旧的vnode



本文分析更新前后 新旧 **渲染vnode** **相同** 的情况



## patchVnode 实现

```js
// vdom/patch.js
if (!isRealElement && sameVnode(oldVnode, vnode)) {
  // 更新过程 removeOnly = undefined
  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
}

function patchVnode (oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
	if (oldVnode === vnode) return;
  if (isDef(vnode.elm) && isDef(ownerArray)) {
    vnode = ownerArray[index] = cloneVNode(vnode) // 如果vnode是列表一员可用于复用
  }
  const elm = vnode.elm = oldVnode.elm // 由于没有创建新vnode的过程，所以要直接赋值
  // 对于异步占位符（异步组件）的更新
  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
    } else {
      vnode.isAsyncPlaceholder = true
    }
    return
  }
  // 静态的vm组件
  if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
    vnode.componentInstance = oldVnode.componentInstance
    return
  }
  // 如果是占位符 vnode，则触发prepatch钩子
  let i
  const data = vnode.data
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode)
  }
  
  const oldCh = oldVnode.children
  const ch = vnode.children
  if (isDef(data) && isPatchable(vnode)) {
    // 如果是组件的占位vnode，则触发 update 钩子
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
  }
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      // 新旧都有子vnode
      // 更新子项vnode
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      // 新vnode有子项，旧的没有
      if (process.env.NODE_ENV !== 'production') {
        // 子vnode重复key的检查
        checkDuplicateKeys(ch)
      }
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      // 仅旧vnode有子项，直接删除节点
      removeVnodes(oldCh, 0, oldCh.length - 1)
    }
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text) // 仅仅是内部文案的不同，直接设置文案
  }
}

// addVnodes就是直接调用之前分析的createElm函数
// 传入oldVnode.elm 作为插入节点
function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
  for (; startIdx <= endIdx; ++startIdx) {
    createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx)
  }
}


function removeVnodes (vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx]
    if (isDef(ch)) {
      if (isDef(ch.tag)) {
        // 如果是组价节点的话就触发remove钩子，比如一些指令的unbind
        // 不是的话就直接移除DOM节点
        removeAndInvokeRemoveHook(ch)
        // destroy钩子，递归触发子项vnode 的destroy钩子
        // 注意这里是实际会触发组件的 $destroy 方法，而不是直接 destroyed钩子，组件到这里还没被销毁
        // $destroy 方法会调用__patch__(vm._vnode, null)，这里开始被销毁
        // 当第二个参数传入null就会触发子节点 invokeDestroyHook 方法，递归
        invokeDestroyHook(ch)
      } else { // Text node
        // 文本节点直接移除DOM
        removeNode(ch.elm)
      }
    }
  }
}

```

> 小结：分析可知，当新旧节点只有一个有子节点的时候，直接做插入或删除的操作





以下分析新旧都有子节点的情况：

## updateChildren 函数

**updateChildren 的实现 是 diff 算法的重点，是核心逻辑**

```js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  let oldStartIdx = 0 // 旧节点开始游标
  let newStartIdx = 0 // 新节点开始游标
  let oldEndIdx = oldCh.length - 1 // 旧节点结束游标
  let oldStartVnode = oldCh[0] 
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1 /// 新节点结束游标
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // removeOnly 是仅针对 transition-group 组件使用的标识
  const canMove = !removeOnly
	// key 查重
  if (process.env.NODE_ENV !== 'production') {
    checkDuplicateKeys(newCh)
  }

  // 递归diff算法，递归调用 patchVnode 更新子 vnode 节点
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
      // 上面两个条件，选出有效的 oldVnode
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 新旧头结点相同（tag，key，节点isComment，input类型（如果是的话）均相同）
      // 再次调用patchVnode，这次patch的是子vnode
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
      // 头部游标 +1
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 新旧尾节点相同
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
      // 尾部游标向前-1
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 旧的头结点 与 新的尾节点相同
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
      // canMove = true
      // 直接操作DOM移动节点
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      // 新旧游标向中间移动
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 旧的尾节点 与 新的头结点相同
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      // 头尾都没有一样的
      // 首先，构造旧的child 列表，{ key：index } 的映射关系
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
      : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      // 寻找 新的节点 对应key 的 index
      if (isUndef(idxInOld)) { // New element
        // 没有对应的key，就创建对应的新元素插入
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
      } else {
        vnodeToMove = oldCh[idxInOld] // 确定旧的child列表中对应key的节点
        if (sameVnode(vnodeToMove, newStartVnode)) { // 两者相同类型，直接patch
          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
          oldCh[idxInOld] = undefined
          // 将更新的旧vnode的elm往前移动
          canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          // same key but different element. treat as new element
          // 类型不同就按创造新元素的逻辑执行
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        }
      }
      // 注意，这里仅移动了新的 child 的游标 +1
      newStartVnode = newCh[++newStartIdx]
    }
  }
  // 这里循环结束，新旧游标往中间靠拢至任意一方交错
  if (oldStartIdx > oldEndIdx) {
    // 旧游标交错，新游标还没交错，也就是新child有增多
    // 直接插入DOM，新游标 的头尾中间还有没插入的，就取最后一次插入的endVnode，在此之前插入
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
   	// 新游标交错
    // 将旧child的多余节点移除
    removeVnodes(oldCh, oldStartIdx, oldEndIdx)
  }
}
```

