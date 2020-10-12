<!-- TOC -->

- [中间件原理](#中间件原理)
  - [compose](#compose)
- [Koa与Express中间件的区别](#koa与express中间件的区别)

<!-- /TOC -->

## 中间件原理
需要在KoaMiddle类中实现以下方法
* constructor: 定义一个中间件列表Middle再调用this.composeFn = compose(this.middleWareList)
* use: 将中间件函数逐个push到this.middleWareList
* listen: 调用const server = http.createServer，在回调调用createContext，再调用this.composeFn(ctx)，最后做响应的处理。对server执行listen方法。

### compose
定义需要返回的能够接收ctx的函数，在其中定义派发器函数dispatch，取出middleWareList的第i个中间件函数fn，在try-catch中执行
Promise.resolve(
  fn(ctx, dispatch.bind(null, i + 1))
)
抛出异常用Promise.reject(err)捕获。最后调用dispatch(0)即从第一项开始执行。

## Koa与Express中间件的区别
* koa基于promise实现，实现了支持异步的洋葱头模型
* express基于递归调用实现，仅支持同步洋葱头模型(无法await next)，只能显式调用Promise。
