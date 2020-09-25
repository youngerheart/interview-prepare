<!-- TOC -->

- [基础](#基础)
  - [js对象的深度克隆](#js对象的深度克隆)
  - [++i 与 i++](#i-与-i)
  - [重建二叉树](#重建二叉树)
  - [两个栈实现队列](#两个栈实现队列)
  - [反转链表](#反转链表)
  - [创建二叉树](#创建二叉树)
  - [遍历二叉树](#遍历二叉树)
  - [字典树](#字典树)
  - [爬楼梯](#爬楼梯)
  - [变态爬楼梯](#变态爬楼梯)

<!-- /TOC -->
## 基础
### js对象的深度克隆
1. 可以通过`JSON.stringify/JSON.parse`实现，不能拷贝正则表达式类型/函数类型/循环使用对象/undefined
2. 使用MessageChannel（异步），不能拷贝函数
```js
function deepCopy(obj) {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port2.onmessage = event => resolve(event.data);
    port1.postMessage(obj);
  });
}
```
3. 遍历
```js
function deepClone(obj) {
  //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
  var objClone = Array.isArray(obj) ? [] : {};
  //进行深拷贝的不能为空，并且是对象或者是
  if (obj && typeof obj === "object") {
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepClone(obj[key]);
        } else {
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
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

### 重建二叉树
需求: 输入某二叉树的前序和中序遍历的结果，重建该二叉树
* 前序: 根左右
* 中序: 左根右
思路:
1. 找到根节点
2. 根据找到的根节点和中序序列，找到树的左右子树
3. 对左右子树进行1、2步的递归操作

```js
let frontSort = [1, 2, 4, 7, 3, 5, 6, 8]
let middleSort = [4, 7 ,2, 1, 5, 3, 8, 6]
// 节点构造函数
function TreeNode (val) {
  this.val = val;
  this.left = null;
  this.right = null;
}

function rebuildTree(frontSort, middleSort) {
  if (frontSort[0]) {
    // 找到根节点
    let rootVal = frontSort[0]
    // 根节点在中序序列的位置
    let index = middleSort.indexOf(rootVal)
    // 前序序列-左子树: frontSort[1] ~ frontSort[index] 右子树: frontSort[index + 1] ~ frontSort[end]
    // 中序序列-左子树: middleSort[0] ~ middleSort[index - 1] 右子树: middleSort[index + 1] ~ frontSort[end]
    // slice函数需要截取到当前位的话第二个参数+1
    let leftTree = rebuildTree(frontSort.slice(1, index + 1), middleSort.slice(0, index))
    let rightTree = rebuildTree(frontSort.slice(index + 1), middleSort.slice(index + 1))
    console.log();
    let rootNode = new TreeNode(rootVal)
    rootNode.left = leftTree
    rootNode.right = rightTree
    return rootNode;
  }
}
rebuildTree(frontSort, middleSort)
```

### 两个栈实现队列
栈: 先进后出 队列: 先进先出

入队操作算法流程：
只需要非常简单的往栈1里面push元素就好

出队操作算法流程：
1. 把栈1里面的元素挪到栈2里面（负负得正）
2. 把栈2顶端的数据出栈即可
3. 将栈2里面的数据挪到栈1里面（还原数据（恢复）：方便我们做后续的入队操作和出队操作）

```js
let stack1=[];//入队操作
let stack2=[];//出队操作

//队列的入队操作
function push(node){
    //只需要非常简单的往栈1里面push元素就好
    stack1.push(node);
}

//队列的出队操作
function pop() {
  //1、把栈1里面的元素挪到栈2里面（负负得正）
  while(stack1.length){
    stack2.push(stack1.pop());
  }
  //2、把栈2顶端的数据出栈即可
  let popVal=stack2.pop();
  //3、将栈2里面的数据挪到栈1里面（还原数据（恢复）：方便我们做后续的入队操作和出队操作）
  while(stack2.length){
    stack1.push(stack2.pop());
  }
  return popVal;
}
```

### 反转链表
1. 遍历链表，把链表里的每个节点值都取出push到数组
2. 再次遍历列表，将数组里的值pop到每个节点就实现了链表翻转
```js
function reverseList(head){
  //1、遍历链表，把链表里面的每个节点的值都拿下来，存在数组里面
  //（在这里我们存的节点的值，而不是存的整个节点，这样是可以节约内存的）
  let arr = [];//arr用于存储链表的节点的值
  let p = head;//p用于遍历链表
  while (p) {
    arr.push(p.val);
    p = p.next;
  }

  //2、再次遍历链表，将数组里面的值倒序的赋值给每一个节点的val域就实现了链表的反转
  //（我们没有考虑新建一个链表，而是用了原来的链表，可以节约创建新链表的时间和内存）
  p = head;
  while(p){
    p.val = arr.pop();
    p = p.next;
  }
  return head;
}
```
### 创建二叉树
### 遍历二叉树
### 字典树
* 定义:一个节点保存一个字符。为了表示一个单词是否出现，可以给最后的字符加上标记。根节点为空。
* 作用:统计排序保存字符串。

步骤
1. 将单词插入字典树
2. 在字典树查找单词
```js
// 定义一个节点
function TrieNode(val) {
  this.val = val;
  this.children = [];
  this.count = 0;
}
function insert(root, str) {
  if (str[0] !== undefined) {
    // 第一个字符的逻辑
    if (root.children[str[0]] === undefined) {
      // 没有该节点则创建
      root.children[str[0]] = new TrieNode();
    } else {}
    insert(root.children[str[0]], str.slice(1))
  } else {
    // 单词完成插入，打标记
    root.count++;
  }
}

let root = new TrieNode('');
['and', 'about', 'as', 'boy', 'by', 'because', 'as'].forEach(str => insert(root, str))
console.log(root)
```

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
  // 经典递归算法，首先确定边界
  if (n === 1) return 1;
  if (n === 2) return 2;
  // 爬到n阶楼梯的方案数等于爬到n-1和爬到n-2阶方案数之和
  return climbStairs(n - 1) + climbStairs(n - 2)
};
```
### 变态爬楼梯
```js
// f(1) = 1
// f(2) = f(1) + 1
// f(3) = f(2) + f(1) + 1
// f(4) = f(3) + f(2) + f(1) + 1
// f(5) = f(4) + f(3) + f(2) + f(1) + 1
/**
 * @param {number} n
 * @return {number}
 */
let cache = [0, 1, 2]
var crazyClimbStairs = function(n) {
  cache[n] = 1 // 初始值总是为1
  for (let i = n - 1; i >= 1; i--) {
    cache[n] += crazyClimbStairs(i)
  }
  return cache[n]
};
console.log(crazyClimbStairs(10));
console.log(cache);
```
