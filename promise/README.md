<!-- TOC -->

- [CustomPromise](#custompromise)
  - [then函数](#then函数)
  - [resolvePromise函数](#resolvepromise函数)
- [工具与静态函数](#工具与静态函数)
  - [CustomPromise.prototype.catch](#custompromiseprototypecatch)
  - [CustomPromise.all](#custompromiseall)

<!-- /TOC -->

## CustomPromise

实现一个CustomPromise的构造函数类，包括

参数:
* func 传入的promise执行函数

成员变量:
* status 保存当前状态
* value promise结果值
* error promise异常值
* onReslovedFuncs reslove函数队列
* onRejectedFuncs reject函数队列

函数:
* reslove 对于传入的结果值参数，在状态为`pending`时，将结果值赋值为参数，将状态改为`resolved`，顺序执行reslove队列内的函数。
* reject 对于传入的异常值参数，在状态为`pending`时，将异常值赋值为参数，将status赋值为`rejected`，顺序执行rejected队列内的函数

最后执行传入的promise执行函数：`func(reslove, reject)`

### then函数
* 首先补全未传的onResloved, onRejected函数: 直接返回数据与抛出异常
* 通过返回新的promise对象来构造链式调用，在promise回调中执行以下操作。
* 如果当前是`pending`状态，说明异步任务尚未执行完成，则向reslove/reject函数队列push一个函数：先将this.value传入，调用onResloved/onRejected函数得到其返回值res，再调用函数resolvePromise(promise, res, resolve, reject)来执行新promise。
* 如果当前是`resolved/rejected`状态，说明是同步执行完毕，直接调用onResloved/onRejected函数得到其返回值res，再调用函数resolvePromise(promise, res, resolve, reject)来执行新promise。
* 最终返回该新promise对象。

### resolvePromise函数
该函数的四个参数分别为
* promise: 上一个promise对象
* data: 上一个promise回调返回值，大概率是一个promise
* resolve: 当前promise的resolve函数
* reject: 当前promise的reject函数
顺序执行以下逻辑
* 判断如果promise === data，说明promise对线的回调返回值为自身，会造成死循环，直接抛出异常。
* 如果data instanceof CustomPromise 为真，则在try中继续执行其then函数，依次传入
  1. 使用promise对象作为上下文
  2. resolve函数，继续对参数执行resolvePromise(promise, data, resolve, reject)
  3. reject函数，对参数直接执行reject(err)
* 如果try中抛出异常，则在catch中执行reject(err)
* 返回值不是CustomPromise实例，则直接resolve(data)

## 工具与静态函数

### CustomPromise.prototype.catch
由于该函数参数即rejected，无需有resolve逻辑，即如下执行then
```js
CustomPromise.prototype.catch = function (onRejected) {
  this.then(null, onRejected)
}
```

### CustomPromise.all
传入参数为一个promise数组，返回值为一个promise，在其resolve中需要返回原promise数组顺序的返回值，rejected中返回错误值。
定义如下局部变量
* results 结果数组
* finishedNum 当前执行完成promise数量
执行以下逻辑
* 直接return new promise
* 在其回调中对promise()数组使用一个forEach((promise, index))来执行每一项的then函数，对于resolved的项，将results中序号为index的赋值为data，并将finishedNum++，如果finishedNum等于promise数组长度了则可以resolve(results)，但是如果有一个promise rejected则直接reject(error)
