const Seneca = require('seneca');

function math () {
  this.add('role: math, cmd: sum', function sum(msg, respond) {
    respond(null, { answer: msg.left + msg.right })
  })
  this.add('role: math, cmd: product', function product(msg, respond) {})
  this.wrap('role: math', function sum(msg, respond) {
    msg.left = Number(msg.left) || 0;
    msg.right = Number(msg.right) || 0;
    this.prior(msg, respond);
  })
}

// 监听
// 启动一个进程，不是一个web服务器，http仅仅作为消息传输机制(10101端口)。
// 也可以使用tcp
// 使用pin分发服务
Seneca().use(math).listen({
  type: 'tcp',
  pin: 'role: math'
})
// 调用
// seneca.use(math).act('role: math, cmd: sum, left: 1, right: 2', console.log)
// 访问 http://localhost:10101/act?role=math&cmd=sum&left=1&right=2 查看结果
