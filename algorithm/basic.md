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

### 重建二叉树
### 两个栈实现队列
### 反转链表
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
