<!-- TOC -->

- [基础](#基础)
  - [数组](#数组)
  - [二维数组](#二维数组)
  - [字符串](#字符串)
  - [链表](#链表)
  - [二叉树](#二叉树)
  - [栈和队列](#栈和队列)
  - [算法和数据操作](#算法和数据操作)
  - [动态规划与贪婪算法](#动态规划与贪婪算法)
  - [位运算](#位运算)
- [高质量](#高质量)
  - [解决面试题的思路](#解决面试题的思路)

<!-- /TOC -->

# 基础
## 数组
* 长度n的数组里的数字都在0~n-1范围[2, 3, 1, 0, 2, 5, 3]，找出重复数字
数组的第0项是2，和下标不相等，则与第2项交换，[1, 3, 2, 0, 2, 5, 3] -> [3, 1, 2, 0, 2, 5, 3] -> [0, 1, 2, 3, 2, 5, 3] 则在第4/6找到重复
时间`O(n)`，空间`O(1)`

* 上述题目，不修改数组找出重复文字
  1. 创建新数组，按角标赋值，时间`O(n)`，空间`O(n)`
  2. 二分法，找出中间数字n来模拟分为两部分，长度超过n的部分继续进行二分，但不能判断每个数字出现几次。时间`O(n*logn)`空间`O(1)`

## 二维数组
* 每一行按从左到右，每一列按从上到下递增，输入这样一个二维数组，判断数组中是否有该整数
```
1 2 8 9
2 4 9 12
4 7 10 13
6 8 11 15
```
选取右上数字如果大于要查找的数字，则剔除所在列，小于则剔除所在行，等于则返回，没找到返回空。空间`O(1)`时间`O(m + n)`

## 字符串
* 实现一个函数，将字符串每个空格替换为`%20`
**时间复杂度为O(n^2)会挂掉哦**
将一个字符替换为3个存在后移过程
从字符串尾开始赋值和替换。准备两个指针：P1和P2，P1指向原始字符串末尾，P2指向替换之后字符串末尾。向前移动P1，复制字符到P2指向的位置，直到碰到第一个空格后，P1向前1格，P2插入`%20`后前移3格。依次类推，P1和P2指向同一位置，表示所有空格替换完成。
所有字符只复制（移动）一次，时间效率为O(n)

## 链表
* 从尾到头打印链表
**不允许修改输入的数据**
* 后进先出，可以用栈实现。每经过一个节点，把该节点，放到一个栈，遍历完整个列表，再从栈顶输出节点的值，即可翻转`t=O(2n)`
* 每访问到一个节点，先递归输出后面的节点，再输出自身。`t=O(n)`（嵌套需要考虑调用栈溢出问题）

## 二叉树
* 输入某二叉树的前序遍历和中序遍历的结果，请重建该二叉树
首先找到根节点，即前序遍历的第一个节点，接着找到该节点值在中序遍历的位置i，可以得到左子树为前序遍历的[1, i]中序遍历的[0, i - 1]右子树为前序遍历的[i + 1, n]中序遍历的[i + 1, n]，分别对左右子树做此递归。

* 给定一颗二叉树和其中一个节点，如何找出中序遍历的下一个节点？
如果一个节点有右子树，它的中序遍历下一个节点就是右子树中的最左节点。
如果该节点是父节点的左子节点，没有右子树，下一个节点就是父节点。
如果该节点是父节点的右子节点，需要向上遍历，找到一个是父节点左子节点的节点，该节点的父节点就是下一个节点。

## 栈和队列
* 用两个栈实现队列，实现队列的两个函数appendTail和deleteHead，分别完成在队列尾部插入节点和在队列头部删除节点的功能。
使用栈1入队，出队时用栈2负负得正再出队
* 用两个队列实现一个栈
将栈元素全部放入同一队列a，出栈时先放队列头部n-1个数到队列b，再将队尾出列即出栈。

## 算法和数据操作
* 斐波那契数列
如果使用递归来求解，会发现函数依赖关系树中很多节点是重复的，且重复节点随着n的增大而急剧增加，造成重复计算
应该直接通过循环由0开始算到f(n),`O(n)`

* 旋转数组的最小数字：把一个数组最开始的若干个元素搬到数组的末尾，称之为数组的旋转。输入一个递增排序的数组的一个旋转，输出旋转数组的最小元素。
用两个指针分别指向第一个和最后一个元素，第一个应该大于等于最后一个。取中间元素，如果大于第一指针，第一指针指向中间元素，否则第二指针指向中间元素，最终两个指针指向相邻元素。
特例：第一个元素小于最后一个，代表旋转了0位，直接返回第一个元素。

* 矩阵中的路径：设计一个函数，判断在一个矩阵中是否存在一条包含字符串所有字符的路径（不能重复进入路径）。
在矩阵中任选一个格子作为路径的起点。如果路径上第i个字符是x，到相邻格子寻找第i + 1个字符，如果没有找到，在路径上回到第n-1个字符重新定位。需要定义和字符矩阵大小一样的布尔值矩阵标识是否进入过格子。

首先通过遍历找到入口，再使用递归找出字符串每个字符的路径

```js
function hasPath(matrix, str) {
  let rows = matrix.length
  let cols = matrix[0].length
  if (!matrix || rows < 1 || cols < 1 || !str) return false
  let visited = []
  let pathLenth = 0
  function hasPathCore (row, col) {
    if (!str[pathLenth]) return true // 遍历结束
    let pass = false
    if (row < 0 || row >= rows || col < 0 || col >= rows) return pass
    if (!visited[row]) visited[row] = []
    if (matrix[row][col] === str[pathLenth] && !visited[row][col]) {
      ++pathLenth
      visited[row][col] = true
      pass = hasPathCore(row, col - 1)
      || hasPathCore(row - 1, col)
      || hasPathCore(row, col + 1)
      || hasPathCore(row + 1, col)
      if (!hasPath) {
        // 回溯
        --pathLenth
        visited[row][col] = false
      }
    }
    return pass
  }
  for (let row = 0; row < rows; ++row) {
    for (let col = 0; col < cols; ++ col) {
      if (hasPathCore (row, col)) return true
    }
  }
  return false
}

let matrix = [
  ['a', 'b', 't', 'g'],
  ['c', 'f', 'c', 's'],
  ['j', 'd', 'e', 'h']
]

console.log(hasPath(matrix, 'bfce'), hasPath(matrix, 'bfceeee')); // true, false
```

* 机器人的运动范围：地上有一个m行n列的方格，机器人从坐标(0, 0)的格子开始移动，不能进入行坐标和列坐标数位之和大于k的格子，请问该机器人能够到达多少格子。

在机器人准备进入(i, j)的格子时，检查数位和，如果可以进入，再判断相邻的四个格子。同样使用bool的二维数组判断该路径是否被使用

## 动态规划与贪婪算法

分析是否能把大问题分解成小问题，同时小问题都存在最优解，即可使用动态规划来解决问题。

* 剪绳子：给定一个长度为n的绳子，剪成m段。请问子段可能的最大乘积是多少。
动态规划：f(2) = 1，f(3) = 2

```js
function maxCutting (length) {
  if (length < 2) return 0
  if (length === 2) return 1
  if (length === 3) return 2
  let products = [0, 1, 2, 3]
  let max, product
  for (let i = 4; i <= length; i++) {
    max = 0
    for (let j = 1; j <= i / 2; j++) {
      product = products[j] * products[i - j]
      if (max < product) max = product
    }
    products[i] = max
  }
  return products[length]
}
```

贪婪算法：当n >= 5时，尽可能多剪长度为3的身子，剩下绳子长度为4时，剪成长度为2的绳子(题目规定至少剪一刀)。

证明：m >= 5 时可以得到2(n - 2) = 6 <= 6 = 3(n - 3)且双方均大于n

```js
function maxCutting2 (length) {
  if (length < 2) return 0
  if (length === 2) return 1
  if (length === 3) return 2
  // 乘以3的数目
  let times = Math.floor(length / 3)
  if (length - times * 3 === 1) times--
  let timesOf2 = (length - times * 3) / 2
  let res = 1
  while (times) {
    res *= 3
    times--
  }
  while (timesOf2) {
    res *= 2
    timesOf2--
  }
  return res
}
```

## 位运算

* 实现一个函数，输入一个整数，输出该二进制表示中1的个数。
当输入负数并右移运算，最终数字会变为0*ffffffff陷入死循环。

如果一个整数不为0，其二进制至少有一位为1，将其减去1，都是将最右的1变为0，如果其右边还有0，则将所有0变为1，则可以做与运算代替右移。

1110减去1为1101，将其和1110做与运算结果为1100，继续减去1为1011，做与运算为1000。
```js
function numberOf1(n) {
  let count = 0
  while (n) {
    ++count
    n = (n - 1) & n
  }
  return count
}
```

# 高质量

* 规范性: 清晰的书写/清晰的布局/合理的命名
* 完整性: 功能测试(正常传参时的功能)/边界测试(确保传参不溢出)/负面测试(传参是不同类型)
返回错误信息: 函数使用返回值/设置全局变量/抛出异常

* 数值的整数次方
实现函数power(base, exponent), 求base的exponent次方，不需要考虑大数问题

高效解法
```js
a^n = a^(n/2) * a^(n/2) // n是奇数
    = a^((n-1)/2) * a^((n-1)/2) * a // n是偶数
```
```js
function power(base, exponent) {
  if (base == 0 && exponent < 0) return 0
  let result = unsignedPower(base, Math.abs(exponent))
  if (exponent < 0) result = 1 / result
  return result
}
function unsignedPower(base, exponent) {
  if (exponent === 0) return 1
  if (exponent === 1) return base
  let res = unsignedPower(base, exponent >> 1) // 右移代替除以2，如果是奇数则为减一后除2
  res *= res
  if (exponent & 0X1 === 1) // 判断奇偶
    res *= base
  return res
}
power(2, -2)
```

* 打印从1到最大的n位数
把数字的每一位从0到9排列一遍，就得到了所有的十进制数。
```js
// function printNumber(number) {}
function printToMax(n) {
  if (n <= 0) return
  let number = [];
  for (let i = 0; i < 10; i++) {
    // 首位的数字从0到9
    number[0] = i
    printToMaxLoop(number, n, 0)
  }
}

function printToMaxLoop(number, length, index) {
  // 递归，在处理后索引为总长度-1时输出
  if (index === length - 1) {
    let output = number.slice()
    while (!output[0] && output.length > 1) output.shift()
    console.log(output.join(''))
    return
  }
  for (let i = 0; i < 10; i++) {
    number[index + 1] = i
    printToMaxLoop(number, length, index + 1)
  }
}
```

* 删除链表的节点，在O(1)时间内删除链表节点
如果遍历链表则时间复杂度为O(n)。可以将需要删除的i节点后的j节点的内容复制到i，将i指针指向j的下一个节点，再删除j，可以达到删除原有i的效果。如果i是尾节点，还是需要遍历。如果链表只有一个节点，需要将头结点赋值为null。

```js
deleteNode(head, target) {
  if (!head || !target) return
  // 要删除的不是尾节点
  if (target.next !== null) {
    let next = target.next
    target.value = next.value
    target.next = next.next
    next = null
  } else if (head === target) {
    // target无next且为头节点
    head = null
  } else {
    //target为尾节点
    let focus = head
    while (focus.next !== target) {
      focus = focus.next
    }
    delete focus.next
  }
}
```

* 类比：删除链表的第i个节点
```js
deleteNode(head, i) {
  let index = 0
  let target = head
  while (index < i) {
    if (target.next) target = target.next
    else return
    index++
  }
  // 要删除的不是为节点，正常执行删除操作，直接将target赋值为next，再删除next
  if (target.next !== null) {
    let next = target.next
    target.value = next.value
    target.next = next.next
    next = null
  } else if (head === target) {
    // target无next且为头节点
    head = null
  } else {
    //target为尾节点
    let focus = head
    while (focus.next !== target) {
      focus = focus.next
    }
    delete focus.next
  }

}
```

* 删除链表中重复的节点
一个排序的列表中删除重复节点，如1-2-3-3-4-4-5删除后为1-2-5。从头遍历链表，如果当前节点与下一个相同，那么他们是重复的节点，可以被删除。

```js
function deleteDuplication(head) {
  if (head === null) return
  let prev = null
  let current = head
  let next = null
  let needDelete = false
  while (current !== null) {
    next = current.next
    needDelete = false
    if (next !== null && next.value === current.value) needDelete = true
    if (!needDelete) {
      prev = current
      current = next
    } else {
      let value = current.value
      let shouldDel = current
      while (shouldDel != null && shouldDel.value == value) {
        shouldDel = shouldDel.next
      }
      // 头部被删除
      if (prev === null) head = next
      else prev.next = next
      current = next
    }
  }
}
```

* 正则表达式匹配
实现一个函数用来匹配包含`.`(表示任意字符)和`*`(前面的字符可以出现任意次)的正则表达式，

```js
{
  let str, pattern
  function match(currentStr, currentPattern) {
    str = currentStr
    pattern = currentPattern
    if (typeof str !== 'string' || typeof pattern !== 'string') return false
    return matchCore()
  }
  function matchCore (strIndex = 0, patternIndex = 0) {
    if (!str[strIndex] && !pattern[patternIndex]) return true
    if (str[strIndex] && !pattern[patternIndex]) return false
    if (pattern[patternIndex + 1] === '*') {
      // 如果当前字符匹配，或者当前匹配符为任意字符
      if (pattern[patternIndex] === str[strIndex] || pattern[patternIndex] === '.' && str[strIndex]) {
        // 均匹配下一个字符
        return matchCore(strIndex + 1, patternIndex + 2)
        // 匹配下一个字符与当前匹配符
        || matchCore(strIndex + 1, patternIndex)
        // 匹配当前字符与下一个匹配符
        || matchCore(strIndex, patternIndex + 2)
      } else return matchCore(strIndex, patternIndex + 2)
    }
    if (pattern[patternIndex] === str[strIndex] || pattern[patternIndex] === '.' && str[strIndex]) return matchCore(strIndex + 1, patternIndex + 1)
    return false
  }
}
```

* 表示数值的字符串
实现一个函数用来判断字符串是否表示数值，如：`+100`/`5e2`/`-123`/`3.14159`/`-1E-16`，但`12e`/`1a3.14`/`1.2.3`/`+-5`/`12e+5.4都不是`

数值的字符串遵循`[+|-][A][.B][e|EC]`A为整数部分，B为小数部分，C跟着e或者E为数值的指数部分，在小数里可能没有数值的整数部分

```js
{
  let index = 0
  let str
  function isNumber (currentStr) {
    if (!currentStr) return false
    str = currentStr
    let isNum = scanInterger(str)
    // 出现.后为小数部分
    if (str[index] == '.') {
      index++
      // 小数可以没有整数部分，可以没有数字
      isNum = scanUnsignedInteger(str) || isNum
    }
    // 如果出现e或者E，处理指数部分
    if (str[index] == 'e' || str[index] == 'E') {
      index++
      // 小数可以没有整数部分，可以没有数字
      isNum = isNum && scanInterger(str)
    }
    let oldIndex = index
    index = 0
    return isNum && !str[oldIndex] // 已经遍历完成
  }
  function scanInterger () {
    if (str[index] === '+' || str[index] === '-') index++
    return scanUnsignedInteger()
  }
  function scanUnsignedInteger() {
    while (str[index] && str[index] >= 0 && str[index] <= 9) index++
    return true
  }
}
console.log(isNumber('123.45e+6'))
```

* 输入一个整数数组，实现一个函数来调整数字的顺序，使得奇数在前，偶数在后
使用两个指针从两端向中间，满足交换条件就进行交换
```js
function recorder(data, func) {
  if (!data || data.length === 0) return
  let start = 0
  let end = data.length - 1
  let temp
  while (start < end) {
    // 如果前端是奇数后端是偶数则略过
    while (start < end && !func(data[start])) start++
    while (start < end && func(data[end])) end--
    // 做交换
    if (start < end) {
      temp = data[start]
      data[start] = data[end]
      data[end] = temp
    }
  }
}

// 判断为偶数
function isEven(n) {
  return (n & 1) === 0
}
```

* 链表中倒数第k个节点
输入一个链表，输出该链表中倒数第k个节点（要求时间复杂度为O(n)）
定义两个指针，第一个从链表的头指针开始遍历车向前走k-1步后，第二个也开始遍历。当第一个走到头第二个刚好走到位置
同时需要处理健壮性：1. 空指针 2.链表节点总数小于k 3. 输入k为0

* 链表中环的入口节点
如果一个链表中包含环，如何找到环的入口节点？
同样设置两个指针，一个一次走一步，另一个一次走两步，走的快的指针追上了走的慢的，链表包含环。
在被追赶上的节点出发，再次回到该节点，即可得知环中节点数
再重新从头开始，第一个指针先走环节点数，两个同时开始前进，直到两个节点相同，即找到了入口。

* 翻转链表
定义一个函数，输入一个链表的头节点，翻转该链表并输出翻转后的头节点
定义三个指针，指向当前节点，前一个与后一个节点，倒置指针指向。
注意：头指针为null/整个链表只有一个节点

* 合并两个排序的链表
输入两个递增的链表，合并使新链表中的节点仍然是递增排序。
两者从头到尾比较，较小者插入新链表，递归进行
```js
  mergeList(head1, head2) {
    if (!head1) return head2
    else if (!head2) return head1
    let mergedHead = null
    if (head1.value < head2.value) {
      mergedHead = head1
      mergedHead.next = mergeList(head1->next, head2)
    } else {
      mergedHead = head2
      mergedHead.next = mergeList(head1, head2->next)
    }
    return mergedHead
  }
```

* 数的子结构
输入两颗二叉树A和B，判断B是不是A的子结构。

```js
// 遍历root1，当其节点与root2值相同，进入检查阶段
function hasSubTree(root1, root2) {
  let result = false
  if (root1 && root2) {
    if (root1.value === root2.value) result = checkSubTree(root1, root2)
    if (!result) result = hasSubTree(root1.left, root2)
    if (!result) result = hasSubTree(root1.right, root2)
  }
  return result
}

// 按b遍历，比较每个节点值
function checkSubTree(root1, root2) {
  if (!root2) return true
  if (!root1) return false
  if (root1.value !== root2.value) return false
  return checkSubTree(root1.left, root2.left) && checkSubTree(root1.right, root2.right)
}
```

## 解决面试题的思路
* 二叉树的镜像
完成一个函数，输入一颗二叉树，该函数输出它的镜像。
遍历二叉树，只要有子节点就交换左右节点
```js
mirrorTree(node) {
  if (!node || (!node->left && !node->right)) return
  let temp = node->left
  node->left = node->right
  node->right = temp
  if (node->left) mirrorTree(node->left)
  if (node->right) mirrorTree(node->right)
}
```
* 对称的二叉树
实现一个函数，用来判断一颗二叉树是不是对称的，如果一颗二叉树和它的镜像一样，那么它是对称的。
针对前序遍历定义一种对称的遍历算法：根右左，当该遍历序列（包括空指针后）与前序相等，则该树对称。
