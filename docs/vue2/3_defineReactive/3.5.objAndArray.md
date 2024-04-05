# Vue 中 对象 和 数组 的修改

对于Vue的vm实例，提供了 **vm.\$set** 和 **vm.\$del** 的方法修改 **对象类型** 的数据，数组通过**原型链改写**来修改了数组的原生方法来适应vm实例的数组修改



## $set 方法的实现

```js
// obsrver/index.js
function set (target, key, val) {
  if (isUndef(target) || isPrimitive(target)) {
    // target 是undefined或者非Object/Array类型
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 数组类型判断：修改的序号是合法的序号
    target.length = Math.max(target.lengt, key)
    target.splice(key, 1, val) // 利用数组splice方法，这里是经过原型链改写的方法
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    // key是修改对象上的y属性
    target[key] = val
    return val
  }
  const ob = target.__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    // 不能直接修改 vm 实例的属性，也不能直接增加vm实例上的rootData里的数据
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  // set进去的值也变成响应式数据
  // observer实例里的value存储了值
  defineReactive(ob.value, key, val)
  // 每个observer会有一个dep实例，手动通知渲染watcher（或者其他watcher）重新渲染
  // 之前setter函数也会调用dep.notify()
  ob.dep.notify()
  return val
}
```

> 总结：因为有这个set方法，所以我们可以使用 this.\$set(obj, key, val) 和 this.\$set(arr, index, val)，在set方法的时候，会手动触发 dep实例的 notify 方法来通知watcher更新



## 数组Array类型的原型链改写

在设立 Array 类型响应式数据的时候，会在array内增加一个observer实例

```js
// observer/index.js
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const hasProto = '__proto__' in {}

class Observer {
  constructor (value) {
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 数组类型判断
      // 是否支持__proto__ 这个属性
      if (hasProto) {
        // 改写原型链
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
    }
  }
}

function protoAugment (target, src) {
  target.__proto__ = src
  // 将数组的原型改为创建出来的Array对象，在调用数组修改方法的时候就会先找到这个新原型上的方法
}
```



### 数组的新原型 arrayMethods

从上面可以知道，数组Array类型的数据 会被 重新指定原型 **arrayMethods**

```js
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
methodsToPatch.forEach(function (method) {
  // 先缓存原方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 同样是利用defineProperty来定义这个新原型上的方法，不可枚举
    // 先执行原有方法
    const result = original.apply(this, args)
    const ob = this.__ob__ // 数组内的observer实例
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 数组长度经过上面三个操作的话会发生数组长度的变化，有新元素插入或者旧元素被剔除
    if (inserted) ob.observeArray(inserted)
    // 手动通知数组的依赖项
    ob.dep.notify()
    return result
  })
})


```

> 数组通过原型链修改的方法，会先调用原生数组方法，然后通过之前设置响应式数据时，在数组内部添加的ob实例，手动通知这个数组的订阅者watcher



## $del方法的实现

```js
// observer/index.js
function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 数组类型直接调用splice，经过新的原型会手动通知数组的订阅者
    target.splice(key, 1)
    return;
  }
  const ob = target.__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    // vm实例属性 或者 vm实例根data不可修改
    return;
  }
  if (!hasOwn(target, key)) {
    return // target内压根原来就没有key这个属性
  }
  delete target[key] // 直接删除属性
  if (!ob) return
  ob.dep.notify() // 手动通知对象的订阅者
}
```

> del的逻辑跟set类似，都是根据不同的数据类型，调用不同的逻辑，最后都会手动调用它们内部的ob实例来更新watcher



## ob实例内的watcher是什么时候收集的

> 在使用defineReactive定义响应式对象的时候，会有如下逻辑来完成内部的响应式设置

```js
// observer/index.js
function defineReactive (obj, key, val, customSetter, shallow) {
  let childOb = !shallow && observer(val) // 传入的值是对象或数组，递归观察，返回子ob
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend() // 依赖收集
        if (childOb) {
          childOb.dep.depend() // 子ob在getter函数进行收集依赖
          if (Array.isArray(value)) {
            // 对于数组的话，数组内每一项都收集这个依赖
            dependArray(value)
          }
        }
      }
      return value
    },
  })
}
```

> 总结，当设置对象类型或者数组类型的响应式数据时，会递归调用observe来观察其子项，设置子ob实例，当用上面那些方法更改时，就出触发ob实例内部的dep.notify()
>
> 比如之前执行 observe(data) 的时候，不仅会在根data内设立ob实例，每个data内的属性数据设置响应式，如果该数据还是对象或者数组，会递归observe，生成子ob，依次类推
