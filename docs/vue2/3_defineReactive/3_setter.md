# 派发更新

> 上一文中可以知道，在渲染函数执行的过程中，会访问到data数据，从而触发getter，进行依赖收集，在Dep实例的订阅者列表中添加渲染Watcher，在渲染Watcher的依赖池中会添加Dep实例



那么，当要修改data中的某个值的时候，就会触发对应的setter

```js
// observer/index.js
set: function reactiveSetter (newVal) {
  const value = getter ? getter.call(obj) : val;
  if (newVal === value || newVal !== newVal && value !== value) {
    // 前后值相同，中断
    return;
  }
  if (process.env.NODE_ENV !== 'production' && customSetter) {
    // 这里就是我们平时可能修改props时看到的 Avoid mutating props...
    // 在开发环境下会，进行props响应式设立时会传入对应的customSetter
    customSetter()
  }
  if (getter && !setter) return; // 这一行是对于一些没有setter的属性：computed
  if (setter) {
    setter.call(obj, newVal)
  } else {
    val = newVal
  }
  childOb = !shallow && observer(newVal) 
  // 如果重新赋值的也是个对象类型，就将他也变为响应式数据
  dep.notify() // 这就是通过这个值对应的Dep实例来派发更新
}
```



## notify

```js
// observer/dep.js
notify () {
	const subs = this.subs.slice() // 订阅者watcher列表
  subs.sort((a, b) => a.id - b.id) 
  // 对watcher排序
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
    // 调用watcher的update方法
  }
}
```

## update

```js
// observer/watcher.js
update () {
  if (this.lazy) {
    this.dirty = true; // 延迟计算的属性
  } else if (this.sync) {
    this.run() // sync修饰符
  } else {
    queueWatcher(this) // 将订阅这个值变化的watcher推入更新队列
  }
}
```

## queueWatcher

```js
// ovserver/scheduler.js
function queueWatcher (watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flusing) { // 更新开始的标识位
      // 还没开始更新
      queue.push(watcher) // 队列推入
    } else {
      // 更新已经开始
      let i = queue.length - 1 // 当前队列最后一个，排序之后id最大的一个
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher) // 找到刚好放下这个id的watcher的位置，插入
    }
    if (!waiting) { // 一开始是设置为false
      waiting = true
      nextTick(flushSchedulerQueue) // 下一帧开始flush更新，这是个异步的过程
    }
  }
}
```

## flushSchedulerQueue

```js
// observer/scheduler.js
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true // 开始更新的标识
  let watcher, id
  queue.sort((a, b) => a.id - b.id) 
  // 将队列中的watcher排序，父组件创建在先，排序后也在前面
  // 组件内的watch选项或者$watch，他们创建的 user-watcher 也在 渲染watcher 之前
  // 若是父组件运行过程中被销毁，就会忽略子组件的watcher更新
  
  for (index = 0; index < queue.length; index++) {
   	watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null // 执行之后剔除
    watcher.run() // 这里就是每个watcher 的更新
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      // 这里是由于可能在watcher的run方法中，重新又修改了某个之前本已经被剔除出去的值
      // 导致这个值对应的watcher又触发了
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        // 更新栈过大，可能是循环更新
      }
    }
    const active  const activatedQueue = activatedChildren.slice()
    const updatedQueue = queue.slice()
    resetSchedulerState() // 重置一些状态
    callActivatedHooks(activatedQueue) // keep-alive相关
    callUpdatedHooks(updatedQueue) // updated钩子 仅对渲染watcher
  }
  
}
```



## Watcher里的run

```js
// observer/watcher.js
run () {
  if (this.active) { // 创建的时候设为true
    const value = this.get()
    // 渲染watcher来说，this.cb为noop，调用this.get() 就是调用 updateComponent，重新patch
    if (value !== this.value || isObject(value) || this.deep)  {
      // 前后值不一样、对象类型数据、深度遍历watcher
      const oldValue = this.value
      this.value = value
      this.cb.call(this.vm, value, oldValue) // watchx
    }
  }
}
```

