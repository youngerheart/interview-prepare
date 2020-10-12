// 实现一个基于promise/A+规范的CustomPromise
// 构造函数，需要传入定义函数
function CustomPromise(func) {
  this.status = 'pending'
  this.onFulFilledFuncs = []
  this.onRejectedFuncs = []
  this.value = undefined
  this.reason = undefined
  // 定义fulfilled和rejected函数
  let fulfilled = (value) => {
    // pending可转换为该状态，该函数只执行一次
    if (this.status === 'pending') {
      // fulfilled不能转换为其他状态，必须有一个value且不可改变
      this.status = 'fulfilled'
      this.value = value
      // 当状态为fulfilled，所有onFulfilled按顺序执行
      this.onFulFilledFuncs.forEach(func => func())
    }
  }
  let rejected = (reason) => {
    if (this.status === 'pending') {
      this.status = 'rejected'
      this.reason = reason
      this.onRejectedFuncs.forEach(func => func())
    }
  }
  func(fulfilled, rejected)
}

CustomPromise.prototype.then = function(onFulfilled, onRejected) {
  if (!onFulfilled) onFulfilled = data => data
  if (!onRejected) onRejected = error => {
    throw error
  }
  // then方法一定返回一个promise，同一个promise实例中，then可以链式调用多次
  let promise = new CustomPromise((fulfilled, rejected) => {
    // 异步调用，promise正在pending，使用闭包封装外界参数，推入数组
    if (this.status === 'pending') {
      this.onFulFilledFuncs.push(() => {
        try {
          // 取得上一个onFulfilled的返回值
          let res = onFulfilled(this.value)
          resolvePromise(promise, res, fulfilled, rejected)
        } catch (err) {
          rejected(err)
        }
      })
      this.onRejectedFuncs.push(() => {
        try {
          // 取得上一个onRejected的返回值
          let err = onRejected(this.reason)
          resolvePromise(promise, err, fulfilled, rejected)
        } catch (err) {
          rejected(err)
        }
      })
    }
    // 如果调用then时已经是fulfilled或rejected，直接执行
    if (this.status === 'fulfilled') {
      try {
        // 取得上一个onFulfilled的返回值
        let res = onFulfilled(this.value)
        resolvePromise(promise, res, fulfilled, rejected)
      } catch (err) {
        rejected(err)
      }
    }
    if (this.status === 'rejected') {
      try {
        // 取得上一个onRejected的返回值
        let err = onRejected(this.reason)
        resolvePromise(promise, err, fulfilled, rejected)
      } catch (err) {
        rejected(err)
      }
    }
  })
  return promise
}

/**
 * 解析then中onFulfilled/onRejected返回值与该then的Promise对象
 * @param {Object} promise 该then的Promise对象
 * @param {*} data 上一个onFulfilled/onRejected返回值
 * @param {Function} fulfilled promise的resolve
 * @param {Function} rejected promise的reject
 */
function resolvePromise(promise, data, fulfilled, rejected) {
  if (promise === data) {
    rejected(new TypeError('loop in existing promise object!'))
  }
  if (data instanceof CustomPromise) {
    try {
      // 返回了promise，执行并传入回调
      data.then.call(data, res => resolvePromise(promise, res, fulfilled, rejected), err => rejected(err))
    } catch (err) {
      rejected(err)
    }
  } else fulfilled(data)
}

CustomPromise.prototype.catch = function(reject) {
  return this.then(null, reject)
}

module.exports = CustomPromise
