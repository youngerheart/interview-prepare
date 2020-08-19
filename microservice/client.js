const Seneca = require('seneca');
// 建立一个客户端
Seneca().client({
  type: 'tcp',
  pin: 'role: math'
}).act('role: math, cmd: sum, left: 1, right: 2.3', console.log)
// { answer: 3 }
