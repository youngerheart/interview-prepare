function CustomPromise(func) {
  this.status = 'pending'
  this.value = undefined;
  this.error = undefined;
  this.onReslovedFuncs = [];
  this.onRejectedFuncs = [];
  let reslove = (value) => {
    // 一旦promise状态变为成功或者失败就不会再改变
    if (this.status === 'pending') {
      this.status = 'resolved';
      this.value = value
      this.onReslovedFuncs.forEach(func => func());
    }
  }
  let reject = (error) => {
    if (this.status === 'pending') {
      this.status = 'rejected';
      this.error = error;
      this.onRejectedFuncs.forEach(func => func());
    }
  }
  func(reslove, reject);
}

CustomPromise.prototype.then = function (onResloved, onRejected) {
  // 如果未定义参数则赋值
  if (typeof onResloved !== 'function') onResloved = data => data
  if (typeof onRejected !== 'function') onRejected = err => {
    throw err
  }
  // 创建新的promise作为返回值
  let promise = new CustomPromise((resolve, reject) => {
    // 异步调用，正在pending状态
    if (this.status === 'pending') {
      this.onReslovedFuncs.push(() => {
        try {
          let res = onResloved(this.value)
          // 当上一个Promise成功后调用下一个Promise的resolve, reject来触发下一个Promise的回调
          resolvePromise(promise, res, resolve, reject);
        } catch (err) {
          reject(err)
        }
      })
      this.onRejectedFuncs.push(() => {
        try {
          let error = onRejected(this.error)
          resolvePromise(promise, error, resolve, reject);
        } catch (err) {
          reject(err)
        }
      })
    }
    // 如果调用then的时候已经resolved或者rejected
    if (this.status === 'resolved') {
      try {
        let res = onResloved(this.value)
        resolvePromise(promise, res, resolve, reject);
      } catch (err) {
        reject(err)
      }
    }
    if (this.status === 'rejected') {
      try {
        let error = onRejected(this.error)
        resolvePromise(promise, error, resolve, reject);
      } catch (err) {
        reject(err)
      }
    }
  })
  return promise
}

CustomPromise.prototype.catch = function (onRejected) {
  this.then(null, onRejected)
}

CustomPromise.all = function (promises) {
  let results = []
  let index = 0
  return new Promise((resolve, reject) => {
      function processData(i, data) {
          results[i] = data
          index++
          if (index === promises.length) {
              resolve(results)
          }
      }
      promises.forEach((promise, i) => {
          promise.then(data => {
              processData(i, data)
          }, reject)
      })
  })
}

/**
 * 解析then返回值与新Promise对象
 * @param {Object} promise 新的Promise对象
 * @param {*} data 上一个then的返回值
 * @param {Function} resolve promise的resolve
 * @param {Function} reject promise的reject
 */
function resolvePromise(promise, data, resolve, reject) {
  if (promise === data) {
    reject(new TypeError('Promise发生循环引用'));
  }

  if (data instanceof CustomPromise) {
    try {
        data.then.call(
          data,
          res => {
            // 递归调用，传入res若是Promise对象，继续循环
            resolvePromise(promise, res, resolve, reject);
          },
          err => {
            reject(err);
          },
        );
    } catch (e) {
      reject(e);
    }
  } else {
    resolve(data);
  }
}

module.exports = CustomPromise
