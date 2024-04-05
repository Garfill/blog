# Codegen 代码生成

> 上面的optimize已经将ast节点进行逐个标记是否为静态节点，之后就是根据标记的节点进行代码的生成

## generate 的函数定义

```js
// compiler/codegen/index.js
  function generate(ast, options) {
    // 通过传入的ast代码，生成渲染函数的字符串，之后会用eval执行
    const state = new CodegenState(options)
    const code = ast ? genElement(ast, state) : '_c("div")'
    return {
      render: `with(this){ return ${code} }`,
      staticRenderFns: state.staticRenderFns
    }
  }
  
  // 这里生成的render会返回到外部的$mount方法中，赋值给 vm.$options.render
```