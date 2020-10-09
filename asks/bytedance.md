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
