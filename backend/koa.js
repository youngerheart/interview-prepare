const http = require('http')

class Koa {
  constructor() {
    this.middleWareList = []
  }
  // use方法，将函数push到数组
  use(fn) {
    this.middleWareList.push(fn)
  }
  listen(...arg) {
    http.createServer((req, res) => {
      // 将所有中间件按promise调用组装成一个函数
      let composedFn = compose(this.middleWareList)
      composedFn({ req, res })
    }).listen(...arg)
  }
}

function compose(middleWareList) {
  return function(ctx) {
    function dispatch(index) {
      let fn = middleWareList[index]
      if (!fn) return Promise.resolve()
      // 强制转换为promise，保证异步洋葱头实现
      try {
        return Promise.resolve(
          // next必须被调用才能加载下一个中间件
          fn(ctx, dispatch.bind(null, index + 1))
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }
    dispatch(0)
  }
}

module.exports = Koa
