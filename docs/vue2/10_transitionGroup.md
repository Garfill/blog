# transition-group
用于实现列表过渡
## 组件定义
```js
// platforms/web/runtime/components/transition-group.js
export default {
  props,
  beforeMount() {
    const update = this._update
    this._update = (vnode, hydrating) => {
      const restoreActinveInstance = setActiveInstance(this)
      // 强制移除旧的节点
      this.__patch__(
        this.vnode,
        this.kept,
        false, // hydrating
        true, //removeOnly
      )
      this._vnode = this.kept
      restoreActiveInstance()
      // 调用回原方法
      update.call(this, vnode, hydrating)
    }
  }，
  
    render (h: Function) {
      const tag = this.tag || this.$vnode.data.tag || 'span'
      const map = Object.create(null)
      // 之前的子元素列表
      const prevChildren = this.prevChildren = this.children
      // 当前需要渲染元素列表
      const rawChildren = this.$slots.default || []
      const children = this.children = []
      // 获取过渡动画信息
      const transitionData = extractTransitionData(this)
    
    for (let i = 0; i < rawChildren.length; i++) {
      const c: VNode = rawChildren[i]
      // 根据key缓存当前列表节点，如果没有设置key就抛异常
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c)
          map[c.key] = c
          // 将过渡的信息保存到每个列表vnode的data对象中
          // 这样就能在之后实现单个元素节点的过渡
          ;(c.data || (c.data = {})).transition = transitionData
        } else if (process.env.NODE_ENV !== 'production') {
          const opts: ?VNodeComponentOptions = c.componentOptions
          const name: string = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag
          warn(`<transition-group> children must be keyed: <${name}>`)
        }
      }
    }

    if (prevChildren) {
      // 之前有旧子节点
      const kept: Array<VNode> = []
      const removed: Array<VNode> = []
      for (let i = 0; i < prevChildren.length; i++) {
        const c: VNode = prevChildren[i]
        // 赋值到data对象
        c.data.transition = transitionData
        c.data.pos = c.elm.getBoundingClientRect()
        // 获取旧节点的位置
        if (map[c.key]) {
          kept.push(c)
        } else {
          removed.push(c)
        }
      }
      this.kept = h(tag, null, kept)
      this.removed = removed
    }

    return h(tag, null, children)
  },
  updated () {
    // 列表数据发生变化的情况
    const children: Array<VNode> = this.prevChildren
    const moveClass: string = this.moveClass || ((this.name || 'v') + '-move')
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
    // 没有设置move过渡样式 v-move
      return
    }

    
    children.forEach(callPendingCbs)
    children.forEach(recordPosition)
    children.forEach(applyTranslation)
    // 将旧节点通过transform先暂时保存的旧位置

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight
    // 通过获取 offsetHeight 触发浏览器重绘，因为上面的循环会改变样式

    children.forEach((c: VNode) => {
      // 这一部分是针对旧节点因为数据变化而产生样式变化瞬间的优化
      // 主要是运用了 FLIP，通俗来说就是动画反转，将动画终点作为起点，通过添加样式回到动画起点，然后删除样式，这样可以保留一个干净的dom节点
      if (c.data.moved) {
        const el: any = c.elm
        const s: any = el.style
        // 添加列表过渡样式 v-move
        addTransitionClass(el, moveClass)
        // 删除上面的旧节点保存位置
        s.transform = s.WebkitTransform = s.transitionDuration = ''
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb)
            el._moveCb = null
            // 移除过渡样式 v-move
            removeTransitionClass(el, moveClass)
          }
        })
      }
    })
  },
  
}
```

## updated 过程中的三轮循环
```js
// 在updated钩子中，对children有这样的循环
children.forEach(callPendingCbs)
children.forEach(recordPosition)
children.forEach(applyTranslation)

// 三个循环的函数定义如下
function callPendingCbs (c: VNode) {
  // 调用元素节点保存的钩子函数
  if (c.elm._moveCb) {
    c.elm._moveCb()
  }
  if (c.elm._enterCb) {
    c.elm._enterCb()
  }
}

function recordPosition (c: VNode) {
  // 记录元素位置到 data对象 上
  c.data.newPos = c.elm.getBoundingClientRect()
}

function applyTranslation (c: VNode) {
  const oldPos = c.data.pos
  const newPos = c.data.newPos
  const dx = oldPos.left - newPos.left
  const dy = oldPos.top - newPos.top
  if (dx || dy) {
    // 通过设置transform将样式暂时固定到旧位置上
    // 之后通过添加 v-move，再移除该样式，从而实现过渡效果
    c.data.moved = true
    const s = c.elm.style
    s.transform = s.WebkitTransform = `translate(${dx}px,${dy}px)`
    s.transitionDuration = '0s'
  }
}
```