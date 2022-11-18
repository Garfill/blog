vue-lazyload 插件源码分析

**简介**

> vue-lazyload是一个用于图片懒加载的插件，基于Vue，具体用法可参考(https://github.com/hilongjw/vue-lazyload)


# 入口分析

> ***文章所分析的版本为1.3.3***

从github上下载到源码后，观察package.json，观察其 main 选项可得知平时引用的文件为根目录下的vue-lazyload.js文件
通过其脚本代码 build：node build，分析 build.js 文件，根据 rollup 打包设置可看到，入口文件为 src/index 



# 源码分析

## 插件的安装

index.js下向外暴露出的对象中包含一个install方法，用于用户的 Vue.use 调用
  ```js
    export default {
    	install(Vue, options = {}) {
        const LazyClass = Lazy(Vue)
        const lazy = new LazyClass(options)
        const lazyContainer = new LazyContainer({ lazy })
        // 以上是对其Lazy类的实例化
        
        const isVue2 = Vue.version.split('.')[0] === '2' // 判断为Vue2.x的版本
        // 在Vue原型上注册方法，用于之后生成的每个实例中使用
        Vue.prototype.$Lazyload = lazy
        // 全局注册组件
        if (options.lazyComponent) {
          Vue.component('lazy-component', LazyComponent(lazy))
        }
        if (options.lazyImage) {
          Vue.component('lazy-image', LazyImage(lazy))
        }
        
        // vue2.x版本下的情况，进行指令注册
        if (isVue2) {
          Vue.directive('lazy', {
            bind: lazy.add.bind(lazy),
            update: lazy.update.bind(lazy),
            componentUpdated: lazy.lazyLoadHandler.bind(lazy),
            unbind: lazy.remove.bind(lazy)
          })
          Vue.directive('lazy-container', {
            bind: lazyContainer.bind.bind(lazyContainer),
            componentUpdated: lazyContainer.update.bind(lazyContainer),
            unbind: lazyContainer.unbind.bind(lazyContainer)
          })
        }
        ... 
        // Vue1.x版本类似
      }
    }
  ```

## Lazy 类

接下来分析 lazy类 的代码，其实现在 lazy.js 文件下

```js
    // 默认加载loading图片
    const DEFAULT_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    // 监听的事件列表
    const DEFAULT_EVENTS = ['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend', 'touchmove']
    const DEFAULT_OBSERVER_OPTIONS = {
      rootMargin: '0px',
      threshold: 0
    }
    // const LazyClass = Lazy(Vue) 在index中执行该语句则是返回Lazy类
    export default function (Vue) {
      return class Lazy {
    		constructor({ ... }) {  //参数解构用于下面的初始化
    			...
          this.version = '__VUE_LAZYLOAD_VERSION__'
          this.mode = modeType.event
          this.ListenerQueue = []
          this.TargetIndex = 0
          this.TargetQueue = []
          this.options = {
            ...// 一系列参数初始化
          }
          ...
          this._initEvent() // 初始化事件监听
          this._imageCache = new ImageCache({ max: 200 }) // 图片缓存对象
          this.lazyLoadHandler = throttle(this._lazyLoadHandler.bind(this), this.options.throttleWait) 
          // _lazyLoadHandler是事件回调函数，throttle对其进行节流
          this.setMode(this.options.observer ? modeType.observer : modeType.event)
          // 这句是设置监听的模式，一般可认为是 this.mode = 'event'
        }
      }
    }
```

## throttle的实现：

```js
    function throttle (action, delay) {
    	let timeout = null
      let lastRun = 0
      return function () {
        if (timeout) return
        let elapsed = Date.now() - lastRun
        let context = this //  节流返回的函数中，this指向的是实例化的Lazy上下文
        let args = arguments
        let runCallback = function() {
          lastRun = Date.now()
          timeout = false
          action.apply(context, args)
        }
        if (elapsed >= delay) {
    			runCallback()
        } else {
          timeout = setTimeout(runCallback, delay)
        }
      }
    }
```

## Lazy 类的初始化
```js
    class Lazy {
      ...
      // 初始化事件相关的函数，包括$on,$once,$off,$emit函数
      _initEvent() {
        this.Event = {
          listeners: {
            loading: [],
            loaded: [],
            error: []
          }
        }
        // 添加事件监听
        this.$on = (event, func) => {
          if (!this.Event.listeners[event]) this.Event.listeners[event] = []
          this.Event.listeners[event].push(func)
        }
        
        // 一次性事件监听
        // 结合 $off 来看实现思路：将其内部的on函数传入回调列表，在回调执行时实际上则执行了on函数，在 on 函数内部，先剔除回调列表内其on函数本身，保证下次该事件触发时不会执行到该函数，然后再执行回调函数
      	this.$once = (event, func)   => {
          const vm = this
          function on () {
            vm.$off(event, on)
            func.apply(vm, arguments)
          }
          this.$on(event, on)
        }
        
        // 删除某个事件中的某个对应回调函数
        this.$off = (event, func) => {
          if (!func) {
            if (!this.Event.listeners[event]) return
            this.Event.listeners[event].length = 0
            return
          }
          remove(this.Event.listeners[event], func)
          // remove实现原理：在数组中利用array.splice移除对应的回调函数
        }
        
        // 事件触发函数
        this.$emit = (event, context, inCache) => {
          if (!this.Event.listeners[event]) return
          this.Event.listeners[event].forEach(func => func(context, inCache))
        }
      }
    }
```

## 图片缓存的初始化

初始化事件相关函数后，就是对图片缓存对象 **ImageCache** 的初始化；

```js
    class ImageCache {
      // 初始化
      constructor ({ max }) {
        this.options = {
          max: max || 200
        }
        this._caches = []
      }
      // 判断是否已经缓存某张图片
      has (key) {
        return this._caches.indexOf(key) > -1
      }
      // 加入缓存列表
      add (key) {
    		if (this.has(key)) return
        this._caches.push(key)
        if (this._caches.length > this.options.max) {
          this.free()
        }
      }
      // 当列表达到上限，剔除第一项
      free() {
        this._caches.shift()
      }
    }
```

### _lazyLoadHandler

下面是 _lazyLoadHandler 回调函数的实现

```js
    class Lazy {
    	...
      _lazyLoadHandler () {
        const freeList = []
        this.listenerQueue.forEach((listener, index) => {
          if (!listener.el || !listener.el.parentNode) {
            freeList.push(listener)
          }
          const catIn = listener.checkInView()
          if (!catIn) return
          listener.load()
        })
        freeList.forEach(item => {
          remove(this.listenerQueue, item)
          item.$destroy()
        })
      }
    }
```
其实实现思路很简单，当该事件回调函数被执行时，会将数组 listenerQueue 进行一次遍历，满足 checkInView 的项将调用该项的load方法

至此，Lazy类的实例化构建已经分析完成了，下面对其关于Vue的调用进行分析



## Vue的调用

可以看到在 index.js 中，install方法 里有这么一部分代码
```js
    if (isVue2) {
      Vue.directive('lazy', {
        bind: lazy.add.bind(lazy),
        update: lazy.update.bind(lazy),
        componentUpdated: lazy.lazyLoadHandler.bind(lazy),
        unbind: lazy.remove.bind(lazy)
      })
    }
```
可以看到，这是对Vue全局指令的定义方法，也是我们平时用法中 v-lazy的由来，其中里面各个函数通过bind绑定的作用域lazy，也就是之前实例化的到的Lazy类实例

### add 函数实现

首先是lazy里的 add 函数实现
```js
    add (el, binding, vnode) {
      // 若绑定元素已经在监听队列中，直接执行类中的 update 方法，然后执行 lazyLoadHandler方法
      if (some(this.listenerQueue, item => item.el === el)) {
        this.update(el, binding)
        return Vue.nextTick(this.lazyLoadHandler)
      }
      // 取出绑定的 src图，loading图，error图，若没指定则用默认配置
      let { src, loading, error } = this._valueFormatter(binding.value)
      
      Vue.nextTick(() => {
        src = getBestSelectionFromSrcset(el, this.options.scale) || src 
        // 若有设置多个图片源，则根据图片父元素大小选择对应大小的图片源，否则直接使用指定的源
        this._observer && this._observer.observe(el)
        const container = Object.keys(binding.modifiers)[0]
        let $parent
    
        if (container) {
          $parent = vnode.context.$refs[container]
          $parent = $parent ? $parent.$el || $parent : document.getElementById(container)
        }
        if (!$parent) {
          $parent = scrollParent(el) // 获取到最近上层可滚动(有设置overflow为scroll或auto)元素
        }
        // 针对每一个绑定的元素创建一个监听对象
        const newListener = new ReactiveListener({
          bindType: binding.arg,
          $parent,
          el,
          loading,
          error,
          src,
          elRenderer: this._elRenderer.bind(this),
          options: this.options,
          imageCache: this._imageCache
        })
        // 监听对象加入到监听队列
        this.ListenerQueue.push(newListener)
    
        if (inBrowser) { // 添加window和上层可滚动元素到监听队列
          this._addListenerTarget(window)
          this._addListenerTarget($parent)
        }
        // 绑定执行完先调用一次，这样一来一开始就在屏幕可见区域内的图片即可加载
        this.lazyLoadHandler()
        Vue.nextTick(() => this.lazyLoadHandler())
      })
    }
    // 针对window和目标可滚动元素的事件监听
    _addListenerTarget (el) {
      if (!el) return
      let target = find(this.TargetQueue, target => target.el === el)
      if (!target) {
        target = {
          el: el,
          id: ++this.TargetIndex,
          childrenCount: 1,
          listened: true
        }
        this.mode === modeType.event && this._initListen(target.el, true)
        this.TargetQueue.push(target)
      } else {
        target.childrenCount++
      }
      return this.TargetIndex
    }
    // 事件监听
    _initListen (el, start) {
      this.options.ListenEvents.forEach((evt) => _[start ? 'on' : 'off'](el, evt, this.lazyLoadHandler))
    }
    // ListenEvents具体为['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend', 'touchmove']
```

### 监听对象 ReactiveListener
接下来看一下监听对象的创建（ReactiveListener）
```js
    // listener.js
    
    export default class ReactiveListener {
    	constructor({ el, src, error, loading, bindType, $parent, options, elRenderer, imageCache }) {
        this.el = el
        this.src = src
        this.error = error
        this.loading = loading
        this.bindType = bindType
    	 ...
       // 一系列参数初始化
        this.filter()
        this.initState()
        this.render('loading', false)
      }
      // 对filter做处理
      filter() {
        ObjectKeys(this.options.filter).map(key => {
          this.options.filter[key](this, this.options)
        })
      }
      // 设置监听器状态
      initState () {
        if ('dataset' in this.el) {
          this.el.dataset.src = this.src
        } else {
          this.el.setAttribute('data-src', this.src)
        }
        this.state = {
          loading: false,
          error: false,
          loaded: false,
          rendered: false
        }
      }
      // 进行各个状态的渲染
      render (state, cache) {
        this.elRenderer(this, state, cache) // elRenderer可追溯回lazy类内部，在初始化监听器时传入
      }
    }
    
    // lazy.js
    _elRenderer (listener, state, cache) {
      if (!listener.el) return
      const { el, bindType } = listener
    
      let src
      switch (state) {
        case 'loading':
          src = listener.loading
          break
        case 'error':
          src = listener.error
          break
        default:
          src = listener.src
          break
      }
      if (bindType) {
        el.style[bindType] = 'url("' + src + '")' // 一般用于背景的懒加载
      } else if (el.getAttribute('src') !== src) {
        el.setAttribute('src', src)
      }
      el.setAttribute('lazy', state)
    
      this.$emit(state, listener, cache)
      this.options.adapter[state] && this.options.adapter[state](listener, this.options)
      // 针对各个状态的自定义的函数执行
      ...
    }
```

### 如何获取上层可滚动元素

下面这个是如何获取上层可滚动元素的函数实现：
```js
    // util.js
    
    // scrollParent函数：从自身元素开始，父元素循环查找符合条件的元素
    const scrollParent = (el) => {
      if (!inBrowser) return
      if (!(el instanceof HTMLElement)) {
        return window
      }
      let parent = el
      while (parent) {
        if (parent === document.body || parent === document.documentElement) {
          break
        }
        if (!parent.parentNode) {
          break
        }
        if (/(scroll|auto)/.test(overflow(parent))) {
          return parent
        }
        parent = parent.parentNode
      }
      return window
    }
    
    // overflow函数
    const overflow = (el) => {
      return style(el, 'overflow') + style(el, 'overflow-y') + style(el, 'overflow-x')
    }
    // style函数：通过getComputedStyle获取计算属性值
    const style = (el, prop) => {
      return typeof getComputedStyle !== 'undefined'
        ? getComputedStyle(el, null).getPropertyValue(prop)
        : el.style[prop]
    }
```
**至此，整个懒加载初始化过程结束，接下来就是当页面发生变化，如滚动，resize等事件时候的处理**


> 由之前初始化事件监听的代码可知

```js
    // 事件监听
    _initListen (el, start) {
      this.options.ListenEvents.forEach((evt) => _[start ? 'on' : 'off'](el, evt, this.lazyLoadHandler))
    }
```

> 对于事件的处理函数是 lazyLoadHandler 函数，分析可知也就是利用 throttle 封装的 _lazyLoadHandler 函数

```js
    _lazyLoadHandler () {
      const freeList = []
      // 针对监听列表进行循环
      this.ListenerQueue.forEach((listener, index) => {
        if (!listener.el || !listener.el.parentNode) {
          freeList.push(listener)
        }
        // 若是符合checkInview 函数条件的则执行监听器内部的load方法
        const catIn = listener.checkInView()
        if (!catIn) return
        listener.load()
      })
      freeList.forEach(item => {
        remove(this.ListenerQueue, item)
        item.$destroy()
      })
    }
```
### checkInview函数
那么来看看 checkInview 函数的实现，这是在 ReactiveListener 监听器内部实现的，比较简单
```js
    checkInView () {
      this.getRect()
      return (
        this.rect.top < window.innerHeight * this.options.preLoad
        && this.rect.bottom > this.options.preLoadTop)
      	&& (this.rect.left < window.innerWidth * this.options.preLoad && this.rect.right > 0)
    }
    
    getRect () {
      this.rect = this.el.getBoundingClientRect()
    }
```

其内部实现逻辑：
- 通过 getBoundingClientRect  获取元素的尺寸
- 将元素距屏幕边界的距离 与其 预设值 进行计算对比，若是符合预算值范围内的则返回 true



当监听器返回 true 的结果后，就会执行其内部的 load　方法
```js
    load (onFinish = noop) {
      // onFinish 为传入的函数
      // 在初始化监听器时，会设置一个尝试次数（attemp），每执行一次load会从0开始加1，若当次 load 方法执行时已经超过该尝试次数，且之前都还未加载出来，则return
      if ((this.attempt > this.options.attempt - 1) && this.state.error) {
        if (!this.options.silent) console.log(`VueLazyload log: ${this.src} tried too more than ${this.options.attempt} times`)
        onFinish()
        return
      }
      // 若之前已成功加载，直接return
      if (this.state.rendered && this.state.loaded) return
      // 若图片缓存里有，则直接改变状态，然后return
      if (this._imageCache.has(this.src)) {
        this.state.loaded = true
        this.render('loaded', true)
        this.state.rendered = true
        return onFinish()
      }
    	// 若以上都不符合，则该图片需要进行加载，使用 renderLoading 方法进行加载，该函数接收回调函数做处理
      this.renderLoading(() => {
        this.attempt++
        this.options.adapter['beforeLoad'] && this.options.adapter['beforeLoad'](this, this.options)
        this.record('loadStart')
        loadImageAsync({
          src: this.src
        }, data => {
          this.naturalHeight = data.naturalHeight
          this.naturalWidth = data.naturalWidth
          this.state.loaded = true
          this.state.error = false
          this.record('loadEnd')
          this.render('loaded', false)
          this.state.rendered = true
          this._imageCache.add(this.src)
          onFinish()
        }, err => {
          !this.options.silent && console.error(err)
          this.state.error = true
          this.state.loaded = false
          this.render('error', false)
        })
      })
    }
    
    renderLoading(cb) {
      this.state.loading = true
      loadImgAsyc({
        src: this.loading
      }, data => {
        this.render('loading', false)
        this.state.loading = false
        cb()
      }, () => {
        cb()
        this.state.loading = false
        ...
      })
    }
```
其中关于 loadImgAsyc 的实现如下
```js
    // util.js
    
    const loadImageAsync = (item, resolve, render) => {
      let image = new Image()
      ...
      image.src = item.src
      image.onload = function() {
        resolve({
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
          src: image.src
        })
      }
      image.onerror = function() {
        reject(e)
      }
    }
```
> 所以说，一张图片在使用懒加载过程中，会执行两次 loadImageAsync，一次加载loading，一次加载src