<!-- TOC -->

- [基础](#基础)
  - [js对象的深度克隆](#js对象的深度克隆)
  - [++i 与 i++](#i-与-i)
- [拓扑排序](#拓扑排序)
  - [课程表](#课程表)
- [动态规划](#动态规划)
  - [爬楼梯](#爬楼梯)
  - [对称数](#对称数)
  - [移动零](#移动零)
  - [汇总区间](#汇总区间)
  - [找出字符串中连续出现最多的字符](#找出字符串中连续出现最多的字符)
  - [实现sum(1,2,3) == sum(1)(2)(3)](#实现sum123--sum123)
  - [两数之和](#两数之和)
  - [两数相加](#两数相加)
  - [无重复字符的最长子串](#无重复字符的最长子串)
- [内存策略](#内存策略)
  - [LRU算法](#lru算法)

<!-- /TOC -->

## 基础
### js对象的深度克隆
*可以通过`JSON.stringify/JSON.parse`实现，不过不能拷贝正则表达式类型、函数类型*
```js
function clone(obj) {
  var buf;
  if (obj instanceof Array) {
    buf = [];
    obj.forEach((item, index) => buf[index] = clone(item));
    return buf;
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {}
}
```

### ++i 与 i++
* 先自增后计算 & 先计算后自增
```
let i = 0;
i ++ === 0 // true
let i = 0;
++ i === 0 // false
```

## 拓扑排序

### 课程表

你这个学期必须选修 numCourse 门课程，记为 0 到 numCourse-1 。

在选修某些课程之前需要一些先修课程。 例如，想要学习课程 0 ，你需要先完成课程 1 ，我们用一个匹配来表示他们：[0, 1]

给定课程总量以及它们的先决条件，请你判断是否可能完成所有课程的学习？

**思路**

* 示例 ：n = 6，先决条件表：[[3, 0], [3, 1], [4, 1], [4, 2], [5, 3, [5, 4]]
* 0, 1, 2 没有先修课，可以直接选。其余的，都要先修2门课
* 我们用`有向图`描述这种依赖关系(做事的先后关系)
* 把这样一个 有向无环图 变成 线性的排序 就叫 拓扑排序
有向图中有入度 和 出度：如果存在一条有向边A->B，则这条边给A增加了1个出度，给B增加了1个入度，所以顶点 0、1、2 的 入度为 0。 顶点 3、4、5 的入度为2

作者：hyj8
链接：https://leetcode-cn.com/problems/course-schedule/solution/bao-mu-shi-ti-jie-shou-ba-shou-da-tong-tuo-bu-pai-/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


作者：hyj8
链接：https://leetcode-cn.com/problems/course-schedule/solution/bao-mu-shi-ti-jie-shou-ba-shou-da-tong-tuo-bu-pai-/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

```js
/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
var canFinish = function(numCourses, prerequisites) {

};
```

## 动态规划

### 爬楼梯
假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

注意：给定 n 是一个正整数。

```js
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
  // 爬到n阶楼梯的方案数等于爬到n-1和爬到n-2阶方案数之和
  let p = 0;
  let q = 0;
  let r = 1;
  for (let i = 0; i < n; i++) {
    p = q;
    q = r;
    r = p + q;
  }
  return r;
};
```
### 对称数
* 各位数字左右对称
```js
let result=[]
for(let i=1;i<10;i++){
    result.push(i)
    result.push(i*11)
    for(let j=0;j<10;j++){
        result.push(i*101+j*10)
        result.push(i*1001+j*110)
        ...
    }
}
```

### 移动零
* 将数组中的零移动到末尾

```js
function moveZeroes(nums) {
    let j = 0; // j <= i
    for(let i=0;i < nums.length; ++i) {
        if(nums[i]!=0) {
            nums[j++] = nums[i];
        }
    }
    //非0元素统计完了，剩下的都是0了
    //所以第二次遍历把末尾的元素都赋为0即可
    for(let i=j;i<nums.length;++i) {
        nums[i] = 0;
    }
    return nums;
}
```

### 汇总区间
* 将递增的区间用'i->j'汇总至数组
```text
[0,1,2,4,5,7,13,15,16]

expect output: ['0->2', '4->5', '7', '13', '15->16']
```

```js
const nums = [0,1,2,4,5,7,13,15,16]
function summaryRanges(nums) {
    const ans = []
    let i = 0
    for (let j = 0; j < nums.length; ++j) {
        // 判断下一位是否为当前值+1，注意边界
        if (j + 1 < nums.length && nums[j + 1] == nums[j] + 1)
            continue;
        // 否则生成序列
        if (i == j)
            ans.push(nums[i] + "");
        else
            ans.push(nums[i] + "->" + nums[j]);
        i = j + 1;
    }
    return ans
}
```
### 找出字符串中连续出现最多的字符
* (.) .表示单个字符，放在圆括号中表示一个group，后面可以用\n(n=1-9)引用
* \1表示第一个group,即(.),\1+表示前面的group重复1到多次
* (.)\1+表示匹配重复的字符
```js
const find = s => {
    if(s === '') return 0
    const matcher = s.match(/(.)\1+/g)
    if(matcher) {
        return matcher.sort((a, b) => b.length - a.length)[0].length
    }
    return 1
}
```
* 或者用一个对象遍历储存每个字符连续出现的次数

扑克牌的打乱与复原
* sort a < b: 返回负值
```js
const randomPoke = (arr) => {
  return arr.sort(() => Math.random() - 0.5)
}

const sortPoke = (arr) => {
  return arr.sort((x, y) => x - y)
}
```

### 实现sum(1,2,3) == sum(1)(2)(3)
* 闭包
* 并不能相等，chrome首先判定为函数，再输出了toString值
* 但是一方显式调用了toString后则被判定为相等
```js
function sum(...args) {
  let inner = function(...innerArgs) {return args.push(...innerArgs); return inner;}
  inner.toString = function() {return args.reduce((addNum, num) => addNum + num)}
  inner.toNumber = function() {return args.reduce((addNum, num) => addNum + num)}
  return inner;
}
```

### 两数之和
* 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。
* pop: 直接删除原数组最后一个元素并返回
* shift: 直接删除原数组第一个元素并返回
```js
var twoSum = function(nums, target) {
  // 有序的情况
  let i = 0, j = nums.length - 1
  // 从两段向中心查找
  while(i < j) {
    s = nums[i] + nums[j]
    if (s > target) j -= 1
    else if (s < target) i += 1
    else return [nums[i], nums[j]]
  }
  return []
};
var twoSum = function(nums, target) {
  // 无序的情况
  let lastNum;
  let i = nums.length;
  let currentIndex;
  while (i > 1) {
    // 防止角标重复的情况
    lastNum = nums.pop();
    i--;
    currentIndex = nums.indexOf(target - lastNum);
    if (currentIndex !== -1) return [currentIndex, i];
  }
  return [];
}
```
### 两数相加
* 给出两个 非空 的链表用来表示两个非负的整数。其中，它们各自的位数是按照 逆序 的方式存储的，并且它们的每个节点只能存储 一位 数字。
* 如果，我们将这两个数相加起来，则会返回一个新的链表来表示它们的和。
* 可以假设除了数字 0 之外，这两个数都不会以 0 开头。
```
示例：
输入：(2 -> 4 -> 3) + (5 -> 6 -> 4)
输出：7 -> 0 -> 8
原因：342 + 465 = 807
```
```js
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */

function ListNode(val) {
  this.val = val;
  this.next = null;
}

let l1 = {val: 5}
let l2 = {val: 5}

var addTwoNumbers = function(l1, l2) {
  // 要理解这里的链表(构造函数)！
  // [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
  // [5,6,4]
  // 有坑！处理大整数，直接运算即可，数字类型运算会挂掉！
  let res = new ListNode(null);
  let add = 0;
  let recentNum;
  let pointer = res;
  // 遍历两个列表
  while (l1 || l2) {
    recentNum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + add;
    pointer.next = new ListNode(recentNum % 10);
    pointer = pointer.next;
    add = recentNum > 9 ? 1 : 0;
    l1 && (l1 = l1.next);
    l2 && (l2 = l2.next);
  }
  // 结束遍历后进行进位操作
  add && (pointer.next = new ListNode(add))
  return res.next;
};
```

### 无重复字符的最长子串
* 给定一个字符串，返回不含有重复字符的最长子串长度

```js
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  s.match(/(.)(.*\\1)/g)
};
```

## 内存策略

### LRU算法

* 运用你所掌握的数据结构，设计和实现一个  LRU (最近最少使用) 缓存机制。它应该支持以下操作： 获取数据 get 和 写入数据 put 。

* 获取数据 get(key) - 如果关键字 (key) 存在于缓存中，则获取关键字的值（总是正数），否则返回 -1。
* 写入数据 put(key, value) - 如果关键字已经存在，则变更其数据值；如果关键字不存在，则插入该组「关键字/值」。当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据值，从而为新的数据值留出空间。
* 进阶:
你是否可以在 O(1) 时间复杂度内完成这两种操作？
```js
/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
  this.cache = new Map();
  this.capacity = capacity;
};

/** 
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
  if (this.cache.has(key)) {
    let value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  return -1
};

/** 
 * @param {number} key 
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  } else if (this.cache.size >= this.capacity) {
    // 删除最近没有使用的
    this.cache.delete(this.cache.keys().next().value);
  }
  this.cache.set(key, value);
};

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
 ```
