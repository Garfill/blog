# transition

transition 组件，用于执行元素显示或者隐藏过程的过渡动画
transition 组件与平台相关，**不同平台实现不同**

```js
// platforms/web/runtime/index.js
// 扩展到components组件上，与keep-alive类似，在组件初始化会合并入组件选项
extend(Vue.options.components, platformComponents)
```
## 定义
```js
// platforms/web/runtime/components/transition.js
export default {
  name: 'transition',
  abstract: true, // 同样是抽象组件，与keep-alive一样，实际自身不添加dom
  render(h) {
    let children = this.$slots.default
    if (!children) {
        return
    }
    // 内部的节点不能是纯文本节点
    children = children.filter(isNotTextNode)
    if (children.length > 1) {
      // transition组件只能有一个子节点，多个则报错提示改用transition-group
    }
    
    const mode = this.mode
    // mode 只支持 in-out/out-in
    const rawChild = children[0]
    if (hasParentTransition(this.$vnode)) {
      // this.$vnode是组件占位vnode <transition />
      // 如果外层 <transition /> 是根节点
      // 直接返回子节点vnode
      return rawChild
    }
    const child = getRealChild(rawChild)
    // 如果过渡组件是abstract组件，递归寻找其内部非抽象组件
    if (!child) {
      // 一般child为过渡组件vnode !== false
        return rawChild
    }
    // ...
    // 生成组件id和过渡元素的key
    const id = `__transition-${this._uid}-`
    child.key = child.key == null
          ? child.isComment
            ? id + 'comment'
            : id + child.tag
          : isPrimitive(child.key)
            ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
            : child.key
    
    // 将transition的相关属性赋值到子组件
    const data = (child.data || (child.data = {})).transtion = extractTransition(this)
    const oldRawChild = this._vnode
    const oldChild = getRealChild(oldRawChild)
    // 这里就是找到 渲染前的 内部非抽象元素/组件
    if (oldChild && oldChild.data 
        && isSameChild(child, oldChild) && isAsyncPlaceholder(oldChild)
        && !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
        const oldData = oldChild.data.transition = extend({}, data)
        if (mode === 'out-in') {
          this._leaving = true // 标识正在隐藏
          mergeVNodeHook(oldData, 'afterLeave', () => {
            // 旧元素隐藏之后的回调
            this._leaving = false
            // 重新解析transition子组件更新
            this.$forceUpdate()
          })
          
        } else if (mode === 'in-out') {
            if (isAsyncPlaceholder(child)) {
              return oldRawChild
            }
            let delayedLeave
            const performLeave = () => { delayedLeave() }
            mergeVNodeHook(data, 'afterEnter', performLeave)
            mergeVNodeHook(data, 'enterCancelled', performLeave)
            mergeVNodeHook(oldData, 'delayLeave', leave => { delayedLeave = leave })
        }
    }
    // 最终渲染的还是子节点，本质是slot
    return rawChild
  }
}

// 将transition组件的属性赋值给子组件
function extractTransitionData (comp: Component): Object {
  // comp 是 transition的vm实例
  const data = {}
  const options = comp.$options
  // props
  // 转移transition的props
  for (const key in options.propsData) {
    data[key] = comp[key]
  }
  // events
  // 转移事件处理函数
  const listeners = options._parentListeners
  for (const key in listeners) {
    data[camelize(key)] = listeners[key]
  }
  return data
}
```
> 小结：render函数内，只是定义了transition组件内的渲染逻辑，还没有加入过渡动画的逻辑

## 动画控制
transition组件，通过**添加和删除css类名**，从而控制元素动画过渡效果
主要是通过扩展在transition的**钩子函数**实现
### 动画逻辑实现
```js
// platforms/web/modules/transition.js
function _enter (_: any, vnode: VNodeWithData) {
  if (vnode.data.show !== true) {
    // 不是用v-show控制
    // 最终调用enter函数
    enter(vnode)
  }
}
export default inBrowser ? {
  // create和activate钩子会在创建patch函数的时候注入到baseCompileOption选项中
  // patchvnode的时候会触发对应钩子
  create: _enter,
  activate: _enter,
  remove (vnode: VNode, rm: Function) {
    if (vnode.data.show !== true) {
      leave(vnode, rm)
    } else {
      rm()
    }
  }
} : {}
```

### 具体enter实现
由上面可以看出，enter参数是**过渡元素/组件的vnode**
```js
// platforms/web/runtime/modules/transition.js
function enter(vnode, toggleDisplay/*这是个函数*/) {
  const el = vnode.elm // el是通过vnode.elm获取，所以就算是组件也可以过渡
  //...
  // 解析出之前赋值给vnode 的transition数据
  const data = resolveTransition(vnode.data.transition)
  if (isUndef(data)) { return }
  //...
  // 解析data各项
  const {
    css,
    type,
    enterClass,
    enterToClass,
    enterActiveClass,
    appearClass,
    appearToClass,
    appearActiveClass,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled,
    beforeAppear,
    appear,
    afterAppear,
    appearCancelled,
    duration
  } = data
  // context 是transition的vm
  let context = activeInstance
  let transitionNode = activeInstance.$vnode // <transition />
  while (transition && transition.parent) {
    // transition在根节点
    transitionNode = transitionNode.parent
    context = transitionNode.context
  }
  // 一通操作下来，transitionNode就是 <transition> ，context就是transition范围最外层的vm
  const isAppear = !context._isMounted || !vnode.isRootInsert
  if (isAppear && !appear && appear !== '') {
    // 如果不设置appear属性，首次就不执行过渡效果
   return 
  }
  const startClass = isAppear && appearClass ? appearClass : enterClass
  // ... 同样的方法得到activeClass、toClass还有那些钩子函数
  const expectCSS = css !== false && isIE9
  // 这是用于移除过渡类名的回调函数
  const cb = el._enterCb = once(() => {
    if (expectsCSS) {
      // 移除类名
      removeTransitionClass(el, toClass)
      removeTransitionClass(el, activeClass)
    }
    // 如果有设置回调钩子的话
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass)
      }
      enterCancelledHook && enterCancelledHook(el)
    } else {
      afterEnterHook && afterEnterHook(el)
    }
    el._enterCb = null
  })
  // ...
  // 过渡逻辑核心
  beforeEnterHook && beforeEnterHook(el)
  if (expectsCSS) {
    // 添加 v-enter、v-enter-active
    addTransitionClass(el, startClass)
    addTransitionClass(el, activeClass)
    // 就是window.requestNextFrame
    nextFrame(() => {
      // 移除v-enter
      removeTransitionClass(el, startClass)
      if (!cb.cancelled) {
        // 添加v-enter-to
        addTransitionClass(el, toClass)
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration)
          } else {
            // 动画结束时候的移除类名操作，注意这里的cb就是上面定义的 cb回调函数
            whenTransitionEnds(el, type, cb)
          }
        }
      }
    })
  }
  
  if (vnode.data.show) {
    // v-show处理
    toggleDisplay && toggleDisplay()
    enterHook && enterHook(el, cb)
  }

}
```
#### whenTransitionEnds 实现
```js
// platforms/web/runtime/transition-util.js
export function whenTransitionEnds (
  el: Element,
  expectedType: ?string,
  cb: Function
) {
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType)
  // 其实就是获取到过渡属性的各项信息 window.getComputedStyle
  // 比如过渡类系（transition/animation），过渡css属性个数，过渡时间等
  if (!type) return cb()
  // 动画结束事件
  const event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    // 当所有css元素属性过渡完，移除监听器
    el.removeEventListener(event, onEnd)
    // 同时cb回调，移除active类名和to类名
    cb()
  }
  const onEnd = e => {
    if (e.target === el) {
      // 当全部过渡元素css属性完成过渡
      if (++ended >= propCount) {
        end()
      }
    }
  }
  // 定时器，就算过渡元素属性个数还没完全过渡完，也强制执行
  setTimeout(() => {
    if (ended < propCount) {
      end()
    }
  }, timeout + 1)
  // 监听过渡动画结束事件，执行onEnd
  el.addEventListener(event, onEnd)
}

```
> 隐藏的动画（leave）执行逻辑也和enter类似