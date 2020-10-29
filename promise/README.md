<!-- TOC -->

- [Promise标准(Promises/A+)](#promise标准promisesa)
  - [术语](#术语)
  - [状态](#状态)
  - [then方法](#then方法)
- [CustomPromise](#custompromise)
  - [构造函数](#构造函数)
  - [then函数](#then函数)
  - [resolvePromise](#resolvepromise)

<!-- /TOC -->

## Promise标准(Promises/A+)
### 术语
* promise 是一个有then方法的object或function
* thenable 是then方法定义的object或function
* value 是一个js合法值(包括undefined, thenable, promise)
* exception 是一个throw语句抛出的错误的值
* reason 是一个表明promise失败的原因的值
### 状态
* 一个promise有且只有一个状态(pending, fulfilled/满足, rejected 之一)
* 在pending状态可能转变为fulfilled或rejected状态
* 在fulfilled不能转换为其他状态，必须有一个value且不可改变
* 在rejected不能转换为其他状态，必须有一个reason且不可改变
### then方法
* 一个promise必须提供一个then方法，用来获取最终的value或reason
* 接收onFulfilled和onRejected两个参数，如果不是函数会被忽略，均为可选参数，最多被调用一次。
* onFulfilled一定在promise是fulfilled后调用，接受一个参数value。
* onRejected一定在promise是rejected后调用，接受一个参数reason
* 两者上下文指向global，严格模式undefined
* 同一个promise实例中，then可以链式调用多次。当状态为fulfilled，所有onFulfilled按顺序执行，当状态为rejected，所有onRejected按顺序执行。
* then方法一定返回一个promise：`promise2 = promise1.then(onFulfilled, onRejected);`
* 如果onFulfilled或onRejected返回一个x，那么会以`[[Resolve]](promise2, x)`处理
* 如果promise1的onFulfilled或onFulfilled中抛出异常，promise2必须捕获此错误。
* 如果当前then没有定义onFulfilled或onFulfilled且状态不为pending，下一个then一定会收到一样的value/reason

## CustomPromise

### 构造函数
* 传入定义函数func，成员变量有status, value, reason, onFulFilledFuncs, onRejectedFuncs
* 定义fulFilled函数：为保证只运行一次，当状态为pending将状态改为fulFilled,value赋值为传入值，对当前onFulFilledFuncs顺序调用
* 定义rejected函数：为保证只运行一次，当状态为pending将状态改为rejected,reason赋值为传入值，对当前onRejectedFuncs顺序调用
最后执行func(fulFilled, rejected)

### then函数
* 首先检查传入的onFulFilled和onRejected，如果未传值则分别赋值`data => data` 与`error => { throw error }`
* 返回一个新的CustomPromise p，传入值为fulFill与reject。这就是链式调用的对象
* 在定义函数中，如果当前promise仍在pending，向onFulFilledFuncs push一个函数：try中通过onFulFilled(this.value)获取其返回值data，再调用resolvePromise(p, data, fulFill, reject)，如果catch到错误直接调用reject(err)。向onRejectFuncs push 类似函数。
* 如果当前promise已经fulfilled及rejected，直接执行try/catch语句。

### resolvePromise
* 首先检测data(上个fulFilled/rejected的返回值)和p(上个then的promise)如果相等，则是同一个promise对象，会造成循环调用。直接rejected错误。
* 如果data是一个promise对象，则在try中继续调用：`data.then.call(data, res => resolvePromise(p, res, fulFill, reject), err => reject(err))`catch中调用reject(err)
* 如果data不是一个promise对象，直接fulFill(data)
