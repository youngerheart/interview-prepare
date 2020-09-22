const CustomPromise = require('./index');

const promise = new CustomPromise((resolve) => {
  console.log('resolve after 1000ms');
  setTimeout(() => resolve('resolved value'), 1000)
})

promise.then((value) => {
  console.log('part 1 finished with value:', value)
  return new CustomPromise((resolve, reject) => {
    console.log('reject after 1000ms');
    setTimeout(() => reject('rejected error'), 1000)
  })
}).catch((err) => {
  console.log('part 2 finished with error:', err)
});
