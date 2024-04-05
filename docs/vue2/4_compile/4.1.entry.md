# 编译入口

在日常开发中，会通过 **vue-loader** 将**vue模板文件里的template编译成render** 函数

在之前的组件初始化过程可以知道：

> 在组件初始化过程中，当调用$mount方法时会通过mountComponent函数，调用 vm实例的_render 方法，生成vnode，最后传给 vm.\_update 方法进行挂载

而在附带了Compiler的版本中，则会先通过编译，**将模板部分HTML编译成对应的render函数**

```js
// platform/web/entry-runtime-with-compiler.js
const mount = Vue.prototype.$mount // 缓存原有方法
Vue.prototype.$mount = function(el, hydrating) { // hydrating === false
  /// 省略部分代码
  const options = this.options
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') { // template: '#app'
          template = idToTemplate(template) // 模板内部字符串innerHTML
        }
      } else if (template.nodeType) { // template传入的html节点实例
        template = template.innerHTML
      } else {
        // 无效template
        return this
      }
    } else if (el) {
      // el.outerHTML或者el的复制
      template = getOuterHTML(el)
    }
    if (template) {
      // 当通过上述方法获得template，注意这里的template是 !!! String类型 !!!
       // 编译相关，编译成 render函数和 静态render函数
      const { render, staticRenderFns } = compileToFunctions(template, { 
        // 编译入口：src/compiler/to-function.js
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

    }
  }
  return mount.call(this, el, hydrating)
}
```

> 小结：当实例化过程中没有定义options.render函数时则通过template来编译得到对应的render函数



## compileToFunctions 函数

```js
// platforms/web/compiler/index.js
import { baseOptions } from './options' // 平台相关的选项和函数
import { createCompiler } from 'compiler/index' // src/compiler/index
// 返回的compileToFunctions就是我们调用的编译函数
const { compile, compileToFunctions } = createCompiler(baseOptions)
export { compile, compileToFunctions }

```

### createCompiler 函数

```js
// compiler/index.js
const createCompiler = createCompilerCreator(function baseCompile(template, options) {
  // 这里是编译最重要的部分
  // 将template字符串传入解析，生成ast（抽象语法数）
  // ast进行优化
  // 通过ast生成render函数的代码
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenerFns: code.staticRenderFns,
  }
})
```

> 小结：createCompiler 由 createCompilerCreator 函数调用返回，这个函数接受**基本编译器流程函数**的参数



### createCompilerCreator

```js
// compiler/create-compiler.js
function createCompilerCreator(baseCompile) {
  return function createCompiler (baseOptions) {
    // 这里就是最终调用的compileToFunctions
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```



# 最终编译入口位置

## createCompileToFunctionFn

```js
// compiler/to-function.js
function createCompileToFunctionFn(compile) {
  const cache = Object.create(null)
  // 最终的编译入口
  return function compileToFunctions(template, options, vm) {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn;
    if (process.env.NODE_ENV !== 'production') {
      try {
        new Function('return 1') 
        // 非生产环境测试Function生成器
        // 传入的template是字符串的
      } catch (e) {
        // ...
      }
    }
    
    const key = options.delimiters ? String(options.delimiters) + template : template
    if (cache[key]) {
      return cache[key] // 缓存命中
    }
    // !!! 编译过程，将传入的template字符串转化的过程
    const compiled = compile(template, options)
    // 省略一些检错代码
    const res = {}
    const fnGenErrors = []
    // compiled.render 是字符串，通过 new Function() 转为函数
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })
    
    return (cache[key] = res) // 缓存并返回
  }
}

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}
```

