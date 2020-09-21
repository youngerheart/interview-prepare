const http = require('http');

class koaMiddleWare {
  constructor () {
    this.middlewareList = []
  }

  use (fn) {
    this.middlewareList.push(fn)
    return this
  }

  createContext (req, res) {
    return ctx = {
      req,
      res
    }
  }

  handleRequest(ctx, middleWare){
    //这个middlWare就是compose函数返回的fn
    //执行middleWare(ctx) 其实就是执行中间件函数,然后再用Promise.then封装返回
    return middleWare(ctx)
  }

  callback () {
    const fn = compose(this.middleWareList)

    return (req,res) => {
      const ctx = this.createContext(req,res)
      return this.handleRequest(ctx, fn)
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    return server.listen(...args)
  }
}

//传入中间件列表
function compose(middlewareList){
  //返回一个函数 接收ctx
  return function(ctx){
    //定义一个派发器，内部实现了next机制
    function dispatch(i){
      //获取当前中间件
      const fn = middlewareList[i]
      try{
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
