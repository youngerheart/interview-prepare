function CustomPromise(func) {
  this.status = 'pending'
  this.value = undefined;
  this.error = undefined;
  this.onReslovedFuncs = [];
  this.onRejectedFuncs = [];
  let reslove = (value) => {
    if (this.status === 'pending') {
      this.value = value
      this.onReslovedFuncs.forEach(func => {
        this.value = func(this.value)
      });
      this.status = 'resolved';
    }
  }
  let reject = (error) => {
    if (this.status === 'pending') {
      this.onReslovedFuncs.forEach(func => func(error));
      this.status = 'rejected';
      this.error = error
    }
  }
  func (reslove, reject);
}

CustomPromise.prototype.then = function (onResloved, onRejected) {
  // 如果是异步的话，这个地方进来还是pending 状态
  if (this.status === 'pending') {
    if (typeof onResloved === 'function') {
      this.onReslovedFuncs.push(onResloved);
    }
  
    if (typeof onRejected === 'function') {
      this.onRejectedFuncs.push(onRejected);
    }

    return this;
  }
  let promise = new CustomPromise((resolve, reject) => {
    if (this.status === 'resolved') {
      try {
        let x = onResloved(this.value);
        resolvePromise(promise, x, resolve, reject);
      } catch (e) {
        reject(e);
      }
    }

    if (this.status === 'rejected') {
      onRejected(this.reason);
    }
  })
  return promise;
}

module.exports = CustomPromise
