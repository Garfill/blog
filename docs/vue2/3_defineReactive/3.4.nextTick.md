# nextTick 的实现

> 上一文 setter 篇中，flushSchedulerQueue 代表的是将 待更新的watcher 排序并逐个执行 run 方法的函数，而这个函数的执行，并不是同步的，而是在异步的
>
> 也就是说，当我们更新data里的数据的时候，并不是立马就能执行其渲染watcher的 run 方法，而是一个异步的过程



## nextTick的原理

```js
// util/next-tick.js
function nextTick (cb, ctx) {
  let _resolve
  // 向callbacks队列中推入匿名函数
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handlerError(e)
      }
    } else if (_resolve) {
      // 不传回调函数，用promise实现
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true;
    timeFunc() //队列函数的触发
  }
  // nextTick 的链式调用实现
  if (!cb && typeof Promise !== undefined) {
    // 当前环境下有Promise
    return new Promise(resolve =>{
      // 在之后callbacks里的函数调用时候，就能将返回的promise实例resolve掉，执行then方法
      _resolve = resolve
    })
  }
}
```



## timeFunc实现

```js
// util/next-tick.js
let timeFunc
if (typeof Promise !== undefined && isNative(Promise)) {
  // 原生Promise，不是打polyfill的
  const p = Promise.resolve()
  timeFunc = () => {
    p.then(flushCallBacks)
  }
  isUsingMicroTask = true // 微任务队列标识
} else if (!isIE && typeof MutationObserver !== 'undefined' && (isNative(MutationObserver))) {
  // 原生MutationObserver
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  // 通过创建一个文本节点，改变他的文本内容
  // mutationObserver 实例会因为文本更新，从而触发flushCallbacks
  isUsingMicroTask = true
} else if (typeof setImmediate !== undefined && isNative(setImmediate)) {
  // 不在以上两种原生微任务环境下，就降级使用宏任务来做nextTick
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

总结：当更新vm实例的数据时候，会触发setter，从而告知订阅者watcher，watcher推入更新队列queueWatcher，然后将flushSchedulerQueue这个函数推入callbacks的队列，在下一个任务时机来触发队列中所有的函数