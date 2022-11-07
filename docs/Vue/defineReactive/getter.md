# 依赖收集的过程

上面的一章中，在 **defineReactive** 函数中，定义了**getter**和**setter**

其中**getter**就是用来做**依赖收集**使用的，每次有函数访问这个getter对应的值，就会收集一次依赖

```js
// observer/index.js
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val // 一开始就定义个普通对象，getter是空
    if (Dep.target) {
      dep.depend()
      if (childOb) {
        // 如果这个值是对象类型，那么里面的obserber触发depend方法
        childOb.dep.depend()
        if (Array.isArray(value)) {
          dependArray(value)
        }
      }
    }
  }
})
```

其中：

- **Dep.target** 是一个全局变量，用于**存放当前正在计算的Watcher**
- **dep** 是Dep的实例化，每次defineReactive都会实例化一个新的



## Dep的实现

```js
// observer/dep.js
class Dep {
  static target
  id // 自增id
  subs // Watcher实例列表
  constructor () {
    this.id = uid++
    this.subs = []
  }
  // depend的实现
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this) // 也就是会触发Dep.target的addDep方法
    }
  }
}
```

## Dep.target是怎么来的

> 以之前在实例化组件为例，通过mountComponent方法来挂载组件的过程中，会触发vm实例render方法，在此过程中，还会创建一个渲染Watcher

### Watcher 中的get方法

```js
// observer/watcher.js
get () {
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)
  }.finally {
    if (this.deep) { traverse(value) } // 深度遍历watcher使用的
    popTarget()
    this.clearupDeps()
  }
  return value
}
```

```js
// observer/dep.js
Dep.target = null
const targetStack = [] // watcher栈
export function pushTarget (target: ?Watcher) {
  // 赋值
  targetStack.push(target)
  Dep.target = target
}
export function popTarget () {
  // 函数执行结束，返回上一个watcher
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

结论：**Dep.target** 就是当前正在使用的**watcher**



### Watcher中的addDep方法

```js
// observer/watcher.js
addDep (dep: Dep) { // 参数是一个Dep实例
  const id = dep.id
  // 在watcher的依赖池中添加传入的依赖
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      dep.addSub(this) // 最后如果这个依赖是新加进来的，就触发他的addSub方法
    }
  }
}
```

```js
// observer/dep.js
addSub (sub) {
  this.subs.push(sub) //sub == watcher
  // 也就是向订阅者队列中添加watcher
}
```

至此为止，订阅者和依赖项完成绑定

- 依赖项（Dep）的订阅者队列（subs）中会添加订阅者（watcher）
- 订阅者（watcher）的依赖池（depIds）会添加依赖项（Dep）

> 什么时候会访问到getter？
>
> 以渲染watcher为例，在通过render 函数生成对应的VNODE节点的时候就会访问到，其他不同类型的watcher也会有自己的访问时机



### Watcher 的clearupDeps 方法

在watcher的get方法最后会做一个依赖的比对，清除依赖池中不必要的依赖

```js
// observer/watcher.js
class Watcher {
  constructor() {
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
  }
  cleanupDeps () {
    let i = this.deps.length
    // 在get方法的依赖收集完成之后
    // newDeps newDepIds 两个都是这一轮需要重新订阅的依赖
    // deps depIds 是正在使用的依赖池
    while (i--) {
      const dep = this.deps[i]
      // 逐个比对，没有的话就会在Dep实例的订阅者列表中移除
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    // 再将比对好的赋值过去
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
}
```

