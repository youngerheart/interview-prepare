const http = require('http');

class Koa {
  constructor () {
    this.middleWareList = []
    this.composeFn = compose(this.middleWareList)
  }

  use (fn) {
    this.middleWareList.push(fn)
    return this
  }

  listen(...args) {
    const server = http.createServer((req,res) => {
      const ctx = createContext(req, res)
      this.composeFn(ctx)
      res.write("hello nodejs");
      res.end();
    })
    return server.listen(...args)
  }
}

//传入中间件列表，拼装为一个洋葱模型执行函数
function compose(middleWareList) {
  //返回一个函数 接收ctx
  return function(ctx) {
    //定义一个派发器，内部实现了next机制
    function dispatch(i) {
      //获取当前中间件
      const fn = middleWareList[i]
      if (!fn) return;
      try {
        // 保证函数执行的结果必须是 Promise 类型
        return Promise.resolve(
          //通过i+1获取下一个中间件
          fn(ctx, dispatch.bind(null, i + 1))
        )
      } catch(err) {
        return Promise.reject(err)
      }
    }
    //开始派发第一个中间件
    return dispatch(0)
  }
}

// 拼装ctx对象，这里只做最简单操作
function createContext (req, res) {
  const ctx = {
    req,
    res
  }
  return ctx;
}

module.exports = Koa
