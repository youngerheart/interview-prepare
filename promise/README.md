<!-- TOC -->

- [CustomPromise](#custompromise)
  - [then函数](#then函数)

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
* reslove 对于传入的结果值参数，在状态为`pending`时，将结果值赋值为参数，顺序执行reslove函数并不断将结果值赋值为函数返回值，最终将状态改为`resolved`
* reject 对于传入的异常值参数，在状态为`pending`时，顺序执行rejected函数，将异常值赋值为参数，将status赋值为`rejected`

最后执行传入的promise执行函数：`func(reslove, reject)`

### then函数
* 如果当前是`pending`状态，直接将reslove与reject函数push到队列并返回
* 
