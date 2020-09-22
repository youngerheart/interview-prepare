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
