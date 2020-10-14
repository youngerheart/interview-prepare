* 写出打印结果
```js
var result = [];
var a = 3;
var total = 0;
function foo(a) {
  var i = 0;
  for (; i < 3; i++) {
    result[i] = function() {
      total += i * a;
      console.log(total);
    }
  }
}
// 闭包将值固定住
foo(1);
result[0](); // 3
result[1](); // 6
result[2](); // 9
```

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2 start');
  return new Promise((resolve, reject) => {
    resolve();
    console.log('async2 promise');
  })
}

console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
  console.log('promise1');
  resolve(); // 直接resolve，状态为finished，相比于return promise会更快执行
}).then(function() {
  console.log('promise2');
}).then(function() {
  console.log('promise3');
});

console.log('script end');

/*
script start
async1 start
async2 start
async2 promise
promise1
script end
promise2
promise3
async1 end
setTimeout
*/
```

* 32进制加法
  * 36进制由0-9，a-z，共36个字符表示，最小为'0'
  * '0''9'对应十进制的0/9，'a''z'对应十进制的10/35
  * 例如：'1b' 换算成10进制等于 1 * 36^1 + 11 * 36^0 = 36 + 11 = 47
  * 要求按照加法规则计算出任意两个36进制正整数的和
  * 如：按照加法规则，计算'1b' + '2x' = '48'

```js
{
  let nums = '0123456789abcdefghijklmnopqrstuvwxyz'
  function addfor36BitNum(a, b) {
    let aIndex = a.length - 1
    let bIndex = b.length - 1
    let currentNum, resultArr = [], shouldPlus = false
    let get10BitNum = (num) => {
      return num ? nums.indexOf(num) : 0
    }
    while (aIndex > -1 || bIndex > -1) {
      currentNum = get10BitNum(a[aIndex]) + get10BitNum(b[bIndex]) + (shouldPlus ? 1 : 0)
      console.log(currentNum)
      if (nums[currentNum]) {
        resultArr.unshift(nums[currentNum])
        shouldPlus = false
      } else {
        resultArr.unshift(nums[currentNum - 36])
        shouldPlus = true
      }
      aIndex--
      bIndex--
    }
    if (shouldPlus) resultArr.unshift(1)
    return resultArr.join('')
  }
}
```

* 二叉树所有根到叶节点数值之和
```js
{
  let sum
  // 测试数据如下：
  let root = {
    val: 1,
    left: {
      val: 2,
      left: null,
      right: {
        val: 91,
        left: null,
        right: null
      },
    },
    right: {
      val: 3,
      left: null,
      right: null
    }
  }
  // 结果： 7 = （1+2）+（1+3）
  // 实现：运用递归的思想
  function sumTree(root) {
    if (isNaN(sum)) sum = 0
    if (!root) return 0
    sum += root.val
    if (!root.left && !root.right) {
      let oldSum = sum
      sum = undefined
      return oldSum
    }
    return sumTree(root.left) + sumTree(root.right)
  }
  sumTree(root)
}

```

* javascript 实现一个带并发限制的异步调度器，保证同时最多运行2个任务
```js
class Scheduler {
	constructor() {
		this.tasks = [], // 待运行的任务
		this.usingTask = [] // 正在运行的任务
	}
	// promiseCreator 是一个异步函数，return Promise
	add(promiseCreator) {
		return new Promise((resolve, reject) => {
			promiseCreator.resolve = resolve
			if (this.usingTask.length < 2) {
				this.usingRun(promiseCreator)
			} else {
				this.tasks.push(promiseCreator)
			}
		})
	}

	usingRun(promiseCreator) {
		this.usingTask.push(promiseCreator)
		promiseCreator().then(() => {
			promiseCreator.resolve()
			this.usingMove(promiseCreator)
			if (this.tasks.length > 0) {
				this.usingRun(this.tasks.shift())
			}
		})
	}

	usingMove(promiseCreator) {
		let index = this.usingTask.findIndex(promiseCreator)
		this.usingTask.splice(index, 1)
	}
}

const timeout = (time) => new Promise(resolve => {
	setTimeout(resolve, time)
})

const scheduler = new Scheduler()

const addTask = (time, order) => {
	scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(400, 4) 
addTask(200, 2) 
addTask(300, 3) 
addTask(100, 1) 

// 2, 4, 3, 1
```
* 给定如下对象，描述了模块之间的依赖关系，实现sortByDep方法将其排序，使得被依赖模块排在依赖模块之前

```js
let modules = [
  { name: 'a', requires: ['b', 'c'] },
  { name: 'b', requires: ['c'] },
  { name: 'c', requires: [] },
]

let output = []
let registeredModules = []
function sortByDep(modules) {
  for (let i = 0; i < modules.length; i++) {
    if (registeredModules.indexOf(modules[i].name) == -1 && (modules[i].requires.length === 0 || modules[i].requires.every(req => registeredModules.indexOf(req) > -1))) {
      let item = modules.splice(i, 1)[0]
      registeredModules.push(item.name)
      output.push(item)
      sortByDep(modules)
    }
  }
  return output
}

sortByDep(modules)

// output
[
  { name: 'c', requires: [] }, // first, no dependencies, and required by both the others
  { name: 'b', requires: ['c'] }, // second, because it needs `c` first
  { name: 'a', requires: ['b', 'c'] }, // last, because requires both the others
]
```

## 如何监控网页白屏/崩溃
### beforeunload
利用creashed页面在刷新或关闭窗口时不会触发 beforeunload，可以结合onload设置本地储存记录大致的崩溃时间
### PWA(Progressive Web Apps)
有自己独立的工作线程，与网页区分开，可以使用心跳监测
* 网页加载后，postMessage每5S给service worker发送一个心跳，sw将在线的网页登记下来，更新登记时间。
* 网页在beforeunload后，告知自己已经正常关闭，sw可以清除该网页的心跳
* sw间隔一段时间（如10s）检测一遍登记中的网页，如果发现超时（如15s）即可判定该网页crash
```js
// 主执行栈
if (navigator.serviceWorker && navigator.serviceWorker.controller !== null) {
  // 当前页存在sw
  let intervalTime = 5000
  let heartbeat = function () {
    navigator.serviceWorker.controller.postMessage({
      type: 'heartbeat',
      data: { // 当前页信息
        id,
        url,
        user
      }
    })
  }
  window.addEventListener('beforeunload', function() {
    navigator.serviceWorker.controller.postMessage({
      type: 'unload'
    })
  })
  setInterval(heartbeat, intervalTime)
}

// sw.js
let intervalTime = 10000
let crashTime = 15000
let pages = {}
let timer
function checkCreash () {
  let now = performance.now()
  for (let id in pages) {
    if (now - pages[id].time > crashTime) {
      // 上报错误!
      delete pages[id]
    }
  }
  if (Object.keys(pages).length === 0) {
    // 可以不轮询了
    clearInterval(timer)
    timer = null
  }
}
worker.addEventListener('message', ({ data }) => {
  if (data.type === 'heartbeat') {
    pages[data.id] = { time: performance.now(), ...data }
    if (!timer) setInterval(checkCreash, intervalTime)
  } else if (data.type === 'unload') {
    delete pages[data.id]
  }
})
```

## 如何监控页面卡顿
通过 requestAnimationFrame API 来定时执行一些 JS 代码，如果浏览器卡顿，无法很好地保证渲染的频率，1s 中 frame 无法达到 60 帧，即可间接地反映浏览器的渲染帧率。
```js
let lastTime = performance.now()
let sampling = [], lastSample = ''

function step(){
  let curTime = performance.now()
  // console.log('step...')
  let fps = curTime - lastTime>0 ? 1000 / (curTime - lastTime) : 0
  // 100个时间差来采样得出帧率
  if(sampling.length < 100){
    sampling.push(fps)
  } else {
    lastSample = Math.floor(sampling.reduce((t, c) => t + c, 0) / sampling.length) + 'fps'
    console.log(`${new Date()}----平均采样帧率：${lastSample}`)
    sampling = []
  }
  window.requestAnimationFrame(step)
  lastTime = curTime
}
step()
```

## 利用 fetch 请求 url 且需要实现超时重新请求的功能，支持设置重发次数
* 对于XMLHttpRequest对象可以设置其timeout属性，使用xhr.ontimeout来监听超时
* AbortController 用于手动终止一个或多个DOM请求，通过该对象的AbortSignal注入的Fetch的请求中。所以需要完美实现timeout功能加上这个就对了

```js
// 基本用法
function doSomethingAsync({signal}) {
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))

  return new Promise((resolve, reject) => {
    console.log('Promise Started');
    const timeout = window.setTimeout(resolve, 2500, 'Promise Resolved')

    // Listen for abort event on signal
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeout)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
```
```js
// abortcontroller用于中断fetch请求
let controller = new AbortController();
let signal = controller.signal;
 
let timeoutPromise = (timeout) => {
 return new Promise((resolve, reject) => {
  setTimeout(() => {
   resolve(new Response("timeout", { status: 504, statusText: "timeout " }));
   controller.abort();
  }, timeout);
 });
}
let requestPromise = (url) => {
 return fetch(url, {
  signal: signal
 });
};
// 顾名思义，Promse.race就是赛跑的意思，意思就是说，Promise.race([p1, p2, p3])里面哪个结果获得的快，就返回那个结果，不管结果本身是成功状态还是失败状态。
Promise.race([timeoutPromise(1000), requestPromise("https://www.baidu.com")])
 .then(resp => {
  console.log(resp);
 })
 .catch(error => {
  console.log(error);
 });
```

## 有n个柱子，现在要给柱子染色，有k种颜色可以染，求有多少种染色方案
思路
* 当n = 1的时候，有k种方案，当n = 2时有k * k种方案
* 当n = 3时
  1. 前两个柱子颜色相同(k，相当于一个柱子)，那么第三个柱子的颜色必须不同：k * (k - 1)
  2. 前两个柱子颜色不同(k * (k - 1))，那么第三个柱子的颜色无所谓：k * (k - 1) * k，相当于(k - 1) * 两根柱子的情况
* 可以假定公式为
f(n) = (k - 1)f(n - 2) + (k - 1)f(n - 1)，带入数字可验证

```js
function colorful(n, k) {
  let n1 = k
  let n2 = k * k
  let length = parseInt((n - 1) / 2)
  for (let i = 0; i < length; i++) {
    
  }
}
```
