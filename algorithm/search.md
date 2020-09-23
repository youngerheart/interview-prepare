## 顺序查找
```js
function requenceSearch(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      return i
    }
  }
  return -1
}
```

## 二分查找

```js
// 递归方式
function binarySearch(arr, value, start, end) {
  if (start > end) return -1
  end = isNaN(end) ? arr.length - 1 : end
  start = isNaN(start) ? 0 : start
  let index = Math.floor((start + end) / 2)
  if (arr[index] === value) return index
  if (arr[index] > value) {
    end = index - 1
    return binarySearch(arr, value, start, end)
  } else {
    start = index + 1
    return binarySearch(arr, value, start, end)
  }
  return -1
}
```

## 差值查找
```js
// 将二分查找的点改为
// index = start + (end - start) * (value - arr[start]) / (arr[end] - arr[start])
function InsertionSearch (arr, value, start, end) {
  if (start > end) return -1
  end = isNaN(end) ? arr.length - 1 : end
  start = isNaN(start) ? 0 : start
  let index = Math.floor(start + (end - start) * (value - arr[start]) / (arr[end] - arr[start]))
  if (arr[index] === value) return index
  if (arr[index] > value) {
    end = index - 1
    return InsertionSearch(arr, value, start, end)
  } else {
    start = index + 1
    return InsertionSearch(arr, value, start, end)
  }
  return -1
}
```

## 斐波那契查找
* 在斐波那契数列F中找到第k项，满足：F[k] - 1 > 有序数组的最大序列号 > F[k - 1] - 1
* 将数组扩充到长度为F[k] - 1，并使扩充项的值都等于有序数组的最后一项。
* 分割点索引index = start + F[k - 1] - 1，左段长F[k - 1] - 1，右段长F[k - 2] - 1
* 如果查找值大于index则start = index + 1, k = k - 2，如果查找值小于index则end = index - 1, k = k - 1

```js
function FibonacciSearch(array, value) {
  let start = 0;
  let end = array.length - 1;
  let indexNum = array.length - 1;
  let index = 0;
  let k = 0;
  // 构建一个长度大于array数组的Fibonacci数组
  let f = [];
  f[0] = 0;
  f[1] = 1;
  for (let i = 2; i < end + 1; i++) {
    f[i] = f[i - 1] + f[i - 2]
  }
  // 寻找第k项
  while (end > f[k] - 1) {
    k++
  }

  // 补全数组
  for (let i = end; i < f[k] - 1; i++) {
    array[i] = array[end]
  }

  while (start <= end) {
    index = start + f[k - 1] - 1
    if (value < array[index]) {
      end = index - 1
      k = k - 1
    } else if (value > array[index]) {
      start = index + 1;
      k = k - 2
    } else {
      if (index <= indexNum) return index
      return indexNum
    }
  }
}
```
