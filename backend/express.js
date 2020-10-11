var http = require('http')

function express() {
  var funcs = [] // 待执行的函数数组
  var app = {}
  app.use = function (task) {
    funcs.push(task)
  }
  app.listen = function (...args) {
    http.createServer((req, res) => {
      var i = 0
      function next() {
        var task = funcs[i++]
        if (!task) return
        // next必须被调用才能加载下一个中间件
        task(req, res, next)
      }
      next()
    }).listen(...args)
  }
  return app
}

module.exports = express

