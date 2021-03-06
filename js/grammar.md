<!-- TOC -->

- [js数据类型](#js数据类型)
  - [原始数据类型(值类型)](#原始数据类型值类型)
  - [对象数据类型(引用类型)](#对象数据类型引用类型)
  - [包装引用类型](#包装引用类型)
  - [js数据在内存中的存储位置](#js数据在内存中的存储位置)
- [创建对象四种方式](#创建对象四种方式)
- [异步编程的四种方法](#异步编程的四种方法)
- [常见的设计模式](#常见的设计模式)
- [原型与原型链](#原型与原型链)
- [继承的六种方法](#继承的六种方法)
- [生成器/迭代器实现](#生成器迭代器实现)
  - [生成器](#生成器)
  - [迭代器](#迭代器)
  - [Generator实现fibonacci数列](#generator实现fibonacci数列)
- [async/await 的实现](#asyncawait-的实现)
  - [Generator(生成器)](#generator生成器)
  - [next方法可以带一个参数，该参数就会被当作上一个yield表达式的返回值](#next方法可以带一个参数该参数就会被当作上一个yield表达式的返回值)
  - [基于Thunk函数的自动化](#基于thunk函数的自动化)
  - [基于 Thunk 函数的 Generator 执行器](#基于-thunk-函数的-generator-执行器)
  - [执行方法](#执行方法)
- [箭头函数和普通函数的区别](#箭头函数和普通函数的区别)
- [class 的实现](#class-的实现)
- [let 的变量提升](#let-的变量提升)
- [null 与 undefined](#null-与-undefined)
  - [null表示没有该对象](#null表示没有该对象)
  - [undefined表示缺少值](#undefined表示缺少值)
- [for...in 与 for...of](#forin-与-forof)
- [es6数组方法](#es6数组方法)
- [JS隐式类型转换](#js隐式类型转换)
- [js位运算](#js位运算)
- [new操作符具体做了什么](#new操作符具体做了什么)
- [Map/Set对象用法](#mapset对象用法)
  - [Map](#map)
  - [map.keys()](#mapkeys)
  - [Set](#set)
- [什么操作会导致内存泄漏](#什么操作会导致内存泄漏)
  - [意外的全局变量](#意外的全局变量)
  - [console.log](#consolelog)
  - [几种闭包](#几种闭包)
  - [DOM泄漏](#dom泄漏)
  - [timers](#timers)
- [判断浏览器还是NodeJS环境？](#判断浏览器还是nodejs环境)
- [NodeJS优缺点](#nodejs优缺点)
- [event loop，Nodejs与浏览器区别](#event-loopnodejs与浏览器区别)
  - [宏任务/微任务](#宏任务微任务)
- [requestAnimationFrame](#requestanimationframe)
- [垃圾回收机制](#垃圾回收机制)
  - [WeakMap](#weakmap)
- [NodeJS多核HTTP应用](#nodejs多核http应用)
- [try...catch能捕哪些异常](#trycatch能捕哪些异常)
- [大数相加](#大数相加)
- [proxy与object.defineproperty](#proxy与objectdefineproperty)
- [call/apply/bind](#callapplybind)
- [js对象的深度克隆](#js对象的深度克隆)
  - [call函数的实现](#call函数的实现)
- [commonjs 与 esm 的区别](#commonjs-与-esm-的区别)

<!-- /TOC -->

## js数据类型
### 原始数据类型(值类型)
* null 空，代表一个空指针，转换为数字为0
* undefined 未定义，变量声明了但未赋值。转换为数字为NaN
* boolean 布尔类型，用于判断
* string 字符串
* number 数值
* symbol(ES6)

### 对象数据类型(引用类型)
Object/Array/Date/Function/RegExp

### 包装引用类型
本身是基本类型，但在代码的执行过程中，调用了属性和方法，JS引擎会自动对其进行包装，对其包装引用类型的变量调用属性或方法。

### js数据在内存中的存储位置
**栈：保存原始数据类型**
* 储存的值大小固定，空间较小（由系统分配），运行效率高。
```js
var name = 'aa';
name += 'bb';　//重新分配了一块空间存储aabb，并将name指向新值。（并没有改变原来name空间的值）
```
**堆：储存引用类型数据**
* 大小可动态调整，空间较大(通过代码分配)，无法直接操作，使用引用地址读取。

## 创建对象四种方式
1. 构造函数/自定义构造函数: `var obj = new Obj()`
2. 字面量: `obj = {}`
3. 工厂函数: `function Obj(...args) {...;return obj}`
4. Object.create(__proto__, ?[propertiesObject])

## 异步编程的四种方法
1. 回调函数
2. 事件监听on/trigger
3. 发布订阅subscribe/publish（比起事件监听可以查看消息中心了解信号状态，监控程序运行）
4. promise

## 常见的设计模式
* 单例模式：核心结构中包含一个称为单例的特殊类，一个类只有**一个**对象实例。
* 工厂模式：利用工厂方法代替new操作
* 模块模式：为单体模式添加私有变量和私有方法减少全局变量的使用
* 构造函数模式
* 发布/订阅模式
* 代理模式（保护/虚拟）：代理对象代替本体被实例化，将本体实例化推迟到真正需要的时候。例子：图片预加载（setRealImage(只负责加载图片)/proxyImage(接收参数，通过setRealImage先加载loading再加载原图)）
* 职责链模式：将发送者的请求按顺序传递给接受者，接受者处理或传给下个接受者，没有接受者处理，请求会离开链。
例子：中500元/200元/免费抽奖的逻辑处理。

## 原型与原型链
* 原型对象是普通的对象，是每个对象会自带的`__proto__`属性。如果一个原型对象不为null，则该对象链可以称为原型链。
* `__proto__`可以理解为“构造器的原型”: `__proto__ === constructor.prototype`(适用于new操作符创建的对象)

## 继承的六种方法
1. 原型链：能通过instanceof和isPropertyOf的检测，但所有原型属性共有，无法传递参数
2. 构造函数：可传递参数，但无法通过原型检测
3. 前两种组合
```js
function Person(name) {
  this.skills = [ 'php', 'javascript' ];
  this.userName = name;
}
Person.prototype.showUserName = function(){
  return this.userName;
}
function Teacher (name) {
  Person.call(this, name ); // 第二次调用
}
Teacher.prototype = new Person(); // 第一次调用父类构造函数

var oT1 = new Teacher( 'ghostwu' );
oT1.skills.push( 'linux' );
var oT2 = new Teacher( 'ghostwu' );
console.log( oT2.skills ); //php,javascript
console.log( oT2.showUserName() ); //ghostwu
```
4. 寄生式继承：类似于工厂函数，对传进的父对象加工后返回。
5. 寄生组合式继承：由于组合继承会调用两次父类构造函数，考虑在不实例化父类的情况下获取其属性，需要拿到的原型仅仅是父类原型的一个副本
```js
function Person( uName ){
  this.skills = [ 'php', 'javascript' ];
  this.userName = uName;
}
Person.prototype.showUserName = function(){
  return this.userName;
}
function Teacher ( uName ){
  Person.call( this, uName );
}

function inheritPrototype( subObj, superObj ){
  var proObj = Object.create(superObj.prototype); //复制父类superObj的原型对象
  proObj.constructor = subObj; //constructor指向子类构造函数
  subObj.prototype = proObj; //再把这个对象给子类的原型对象
}

inheritPrototype( Teacher, Person );

var oT1 = new Teacher( 'ghostwu' );
oT1.skills.push( 'linux' );
var oT2 = new Teacher( 'ghostwu' );
console.log( oT2.skills ); //php,javascript
console.log( oT2.showUserName() ); //ghostwu
```

## 生成器/迭代器实现

### 生成器
它允许你定义一个包含自有迭代算法的函数， 同时它可以自动维护自己的状态。 生成器函数使用function*语法编写。 最初调用时，生成器函数不执行任何代码，而是返回一种称为Generator的迭代器。 通过调用生成器的下一个方法消耗值时，Generator函数将执行，直到遇到yield关键字。

### 迭代器

* 迭代器协议定义了一种标准的方式来产生一个有限或无限序列的值
* 迭代器对象有一个next函数，返回一个对象{done, value}
* done: 如果迭代器已经经过了整个被迭代的序列时为true，否则为false
* value: done为false时返回值，true时可忽略
```js
function createIterator(items) {
  var i = 0
  return {
    next() {
      var done = (i >= items.length)
      var value = !done ? items[i++] : undefined
      return {
        done,
        value
      }
    }
  }
}
```

### Generator实现fibonacci数列
```js
function* fibonacci() {
  let index = 0
  let val1 = 0
  let val2 = 1
  while (true) {
    index++
    let current = val1 + val2
    val1 = val2
    val2 = current
    let reset = yield current
    if (reset) {
      val1 = 0
      val2 = 1
    }
  }
}
```

## async/await 的实现

### Generator(生成器)
```js
function* Generator() {
  yield 'step 1'; // 出产(作物); 产生(收益、效益等); 
  yield 'step 2';
  return 'step 3';
}
let func = Generator();
let a = func.next();
let b = func.next();
let c = func.next();
let d = func.next();
console.log(a, b, c, d);
// {value: "step 1", done: false} {value: "step 2", done: false} {value: "step 3", done: true} {value: undefined, done: true}
```
Generator函数是分段执行的，yield表达式是暂停执行的标记，next方法可以恢复执行。
### next方法可以带一个参数，该参数就会被当作上一个yield表达式的返回值

```js
function* foo(x) {
    let a = yield x + 0;
    let b = yield a + 2;
    yield x;
    yield a 
    yield b
}

const result = foo(0)
result.next() //  {value: 0, done: false} x=0, a=0
result.next(2) // {value: 4, done: false} a=2, b=4
result.next(3) // {value: 0, done: false} b=3
result.next(4) // {value: 2, done: false}

function* gen(a, b) {
  console.log(a, b);
  var c = yield 'c';
  console.log("c====", c);
  var d = yield "d";
  console.log("d====", d)
  return 6;
}
var g = gen("a", "b");
var e = g.next("e1", "e2"); // 之前没有yield,无效, e='c'
var f = g.next("f1", "f2"); c='f1', f='d'
console.log("e====", e);
console.log("f====", f);
```
* yield 委托
```js
function* foo1() {
    yield 1;
    yield 2;
    return "foo1 end";
}
 
function* foo2() {
    yield 3;
    yield 4;
}
 
function* foo() {
    yield* foo1();
    yield* foo2();
    yield 5;
}
 
const result = foo();
 
console.log(iterator.next());// "{ value: 1, done: false }"
console.log(iterator.next());// "{ value: 2, done: false }"
console.log(iterator.next());// "{ value: 3, done: false }"
console.log(iterator.next());// "{ value: 4, done: false }"
console.log(iterator.next());// "{ value: 5, done: false }"
console.log(iterator.next());// "{ value: undefined, done: true }"
// foo1指定了done后的value但是没有被foo捕获
```
### 基于Thunk函数的自动化
JavaScript 语言中，Thunk 函数替换的不是表达式，而是多参数函数，将其替换成单参数的版本，且只接受回调函数作为参数
```js
var Thunk = function(fn){
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};
var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```
### 基于 Thunk 函数的 Generator 执行器
```js
function run(fn) {
  var gen = fn();
  // 定义回调函数
  function next(err, data) {
    // data即文件读取的值(第一次无效)
    if (err) throw err;
    var result = gen.next(data); // 改变了上一个yield的返回值
    if (result.done) return;
    // generator函数的yield返回了函数
    // value === callback
    result.value(next); // 这里传入回调，正式开始求值
  }

  next();
}

run(gen);
```
### 执行方法
```js
var gen = function* () {
  // readFile已经被转换为 Thunk 函数
  var f1 = yield readFileThunk('xx.avi');
  var f2 = yield readFileThunk('xx.mp4');
  // ...
}
run(gen);
```
这里已经和 async/await 非常像了。async/await即上述实现的一种语法糖。

## 箭头函数和普通函数的区别
1. 箭头函数是匿名函数，不能作为构造函数，不能使用new
2. 箭头函数不能绑定arguments，使用析构解决
3. 箭头函数没有原型属性
4. 箭头函数无上下文，无法绑定上下文，会使用外围的上下文

## class 的实现

```js
// class
class Hello {
    constructor(x) {
        this.x = x;
    }
    static greet() {
      console.log("Hello, world")
    }
}
 
class Hi extends Hello {
    constructor(x, y) {
        super(x)
        this.y = y
    }
}

// es5实现
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf // 支持es6这里就通过了
        || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) // 对象原型是数组，则为数组类型
        || function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b); // 修改了d的原型，用于继承静态方法
      function __() { this.constructor = d; } // 将构造函数赋值为子类构造函数
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __()); // 子类原型根据父类赋值为null，或含父类原型的实例化构造函数。
    };
})();
var Hello = (function () {
    function Hello(x) {
      this.x = x;
    }
    Hello.greet = function () {
      console.log("Hello, world");
    };
    return Hello;
}());
var Hi = (function (_super) {
    // 先执行声明，再执行调用：赋值成员变量
    __extends(Hi, _super);
    function Hi(x, y) {
      this.x = x
      this.y = y
      return _super.call(this, x) || this; // bug: 父元素的成员变量存在于子类对象，而并不是其__proto__对象中
    }
    return Hi;
}(Hello));
```

## let 的变量提升
* 一般事实
let 声明的变量的作用域是块级的；
let 不能重复声明已存在的变量；
let 有暂时死区(声明之前不可用)，不会被提升。
```js
Uncaught ReferenceError: Cannot access 'a' before initialization
```
* 深层原理
let 的「创建」过程被提升了，但是初始化没有提升。(这时不能使用，暂时性死区)
var 的「创建」和「初始化」都被提升了。
function 的「创建」「初始化」和「赋值」都被提升了。

## null 与 undefined
* `null`是一个表示无的对象，转为数值为0
*`false`/`[]`/`""`转为数值时也为0*
* undefined是一个表示无的原始类型，转为数值时为NaN

### null表示没有该对象
* 原型链的终点

### undefined表示缺少值
* 变量被声明而没有赋值时
* 函数运行时调用未被传入的参数
* 函数没有注明返回值的默认返回值
* 对象没有被赋值的属性

## for...in 与 for...of
* for...in总是得到对象的key或数组，字符串的下标
* for...of与forEach一样，直接得到值，但是**不能在对象使用**，可以遍历set,map,只要部署了Iterator的数据结构都可以使用 for ··· of ··· 完成遍历操作。

## es6数组方法
* reduce(缩小): 传参为函数(prev, current) => {} prev第一次为首个元素，之后为返回值，current从第二个元素开始传入
* flat(水平，平坦): 打平多维数组`[[[[1]]]].flat(Infinity)`
* reverse(颠倒): 反转数组
* forEach/map/filter/some/every

## JS隐式类型转换
如果运算符两边数据不统一就无法运算，编译器会将两边转换为一致的数据类型再计算
* 转为string: `+`字符串连接符
* 转为number: `++|--`自增减运算符, `+|-|*|/`算数运算符,`>/</==/!=等`关系运算符
* 转为boolean: `!`逻辑非运算符
```js
1 + 'true' // string: 1true
1 + true // number: 2
1 + undefined // 1 + Number(undefined) = 1 + NaN = NaN
1 + null // 1 + Number(null) = 1 + 0 = 1

'2' > '10' // 比较unicode编码 '2'.charCodeAt() > '10'.charCodeAt() => 50 > 49 => true
'abc' > 'b' // 逐个字符比较，第一个为小于则直接返回false

// 特殊情况
undefined === undefined // true
undefined == true // true
null === null // true
NaN == NaN // false NaN和任何数据不等
'test' + NaN // 'testNaN'
'test' * NaN // NaN
```

## js位运算
将十进制先转二进制
5=>101
* &-与
两位同时为1，结果才为1，否则为0
5 & 1 = 1
* |-或
其中一个为1，结果为1，否则为0
5 | 1 = 5
* ~-非
按位取反，将除去符号位外其他取反，末位加1取补码
  1. 0000 0101
  2. 1111 1010
  3. 1000 0101
  4. 1000 0110 //-6

## new操作符具体做了什么
* 创建一个新对象，将构造函数的作用域赋值给新对象
`obj.__proto__ = Func.prototype`
* 执行构造函数中的代码（**会覆盖原型链中的同名属性**）
`Func.call(obj)`
* 返回该对象

## Map/Set对象用法
### Map
Map是一中键值对的结构，类似于:
`[[key1, value1], [key2, value2], [key3, value3]]`
初始化Map可以传入上述的二维数组，或直接初始化空Map。
实例化map有以下方法
**map可以用复杂数据类型做key**
```js
map.set(key, value)
map.has(key) // true/false
map.get(key) // value
```
由于一个key只能对应一个value，当多次对一个key`set`value时新值覆盖老值。

### map.keys()
返回了一个iterator，可以用`keys.next().value`来获取到第一个值，或者转为数组:
* Array.from(keys); // 将类数组(这里是有Iterator接口的对象)转为数组(Array.prototype.slice.call不可用！
* [...keys];

### Set
是一组key的集合，但不储存value。在一个set中key不能重复
* 有`add`和`delete`方法
* 可以用for...of遍历
* 可以用解构赋值为数组来给数组去重: [...new Set(array)]

## 什么操作会导致内存泄漏
应用程序分配某段内存后，由于设计错误，导致释放该内存之前就失去了对该内存的控制，导致内存浪费。
### 意外的全局变量
* js对未声明的变量会在全局最高对象上创建对它的引用，该变量缓存大量数据，则只会在页面刷新或被关闭时释放内存。
* 直接调用一个全局函数，其this的指向也是全局对象。
### console.log
代码运行后需要在开发工具查看对象信息，所以console.log的对象也不能被垃圾回收。
### 几种闭包
* 普通用法
```js
function Sum() {
  var i = 99;
  function tool() {
    return ++i
  }
  return tool;
}

var sum = Sum();
test(); // 100
```
这里的tool函数无法被回收，因为被全局对象sum引用。想要释放内存可以设置tool = null。

* 结合this实现
```js
let Circle = {}
Circle.PI = 3.1415926
Circle.Area = function(r) {
  return (this.PI * r * r).toFixed(2)
}
```

### DOM泄漏
如果某个变量保存了对DOM的引用，该元素在页面上被删除后对它的引用依然在变量中，造成内存泄漏，需要将其设置为null

### timers
setIntervals与setTimeout在使用过后如果没有手动clear就会一直占用内存。

## 判断浏览器还是NodeJS环境？
查看Global对象为global还是windows。

## NodeJS优缺点
基本常识:
* CPU运算远远快于I/O操作
* Web服务是典型的并发连接场景
* NodeJS有一个主线程与多个底层工作线程
运行机制
```
* V8引擎解析JavaScript脚本
* 解析后的代码，调用NodeAPI
* libuv库负责NodeAPI的执行。将不同任务分配带不同的线程，形成EventLoop，以异步的方式将结果返回给V8引擎
* V8再将结果返回给用户
```
**优势**
相对于多线程占用资源切换成本高，单线程占用内存少，不需要切换线程CPU开销降低，编写简单上手容易，线程安全性高。
**劣势**
CPU运算密集型会造成阻塞，无法利用多核，单线程异常会使得程序停止。

## event loop，Nodejs与浏览器区别

1.所有同步任务都在主线程执行，形成一个执行栈
（函数被调用时会压栈该函数，执行完毕该函数上下文出栈继续执行上一个上下文）
2.主线程之外还有一个“消息队列”。只要异步任务（mouse click/network events/IO）有了运行结果，就在队列中放置事件
3.执行栈中所有同步任务执行完毕，系统会读取任务队列，对应的异步任务结束等待，进入执行栈，开始执行。
4.主线程不断重复第三步。
消息队列中存放着一个个任务（task），分为
宏任务（macrotask）setImmediate > MessageChannel > setTimeout / setInterval
  浏览器: DOM event>network IO>UI render
微任务（microtask）process.nextTick > Promise = MutationObserver

### 宏任务/微任务
```js

async function async1() {
	console.log('async1 start'); // 同步执行
	await async2();
	console.log('asnyc1 end');
}
async function async2() {
	console.log('async2');
}
console.log('script start');
setTimeout(() => {
	console.log('setTimeOut');
}, 0);
async1();
new Promise(function (reslove) {
	console.log('promise1'); // 同步执行
	reslove();
}).then(function () {
	console.log('promise2');
})

console.log('script end');

/*
script start
async1 start
async2
promise1
script end
asnyc1 end
promise2
setTimeOut
*/
```

**在node11版本中，node下的event loop已经与浏览器趋于相同**

## requestAnimationFrame
* 由系统决定回调函数的执行时机。60Hz的刷新频率，那么每次刷新的间隔中会执行一次回调函数，不会引起丢帧，不会卡顿。
* 优势：在息屏与visibilitychange等状态暂停调用，减少cpu调用。对间隔进行基于帧率的节流。
* setTimeout作为宏任务，在当前执行栈执行完才调用，实际时间总是比设定时间晚，其间隔不一定与屏幕刷新事件相同，会引起丢帧。
## 垃圾回收机制
语言引擎有一张引用表，保存了所有资源的引用次数，如果次数为0，表示这个值不在用到，可以释放。
```js
const arr = [1,2,3,4] // arr是对数组的引用，引用次数为1，则持续占用内存
// do something
arr = null; // 解除了引用，引用次数为0，可以释放内存
```
**可以通过Chome开发者工具以及NodeJS的Process.memoryUsage来查看内存使用**

### WeakMap
用这种数据结构新建引用时不会被记入垃圾回收机制，消除了对该节点的引用，它占用的内存就会被释放，weakmap保存的键值对也会消失。
```js
// node env
global.gc(); //手动触发垃圾回收
process.memoryUsage(); // {heapUsed, heapTotal}
let wm = new WeakMap();
let b = {};
wm.set(b, new Array(5*1024*1024));
process.memoryUsage(); // heapUsed上涨
wm.get(b) // [empty × xxxx]
// 这时直接调用b是没有值的，还是原来的空对象
wm.get(b) // undefined
process.memoryUsage(); // 恢复正常
```

## NodeJS多核HTTP应用

```js
import express from 'express'
import os from 'os'
import cluster from 'cluster'
const PORT = process.env.PORT || 5000
const clusterWorkerSize = os.cpus().length
if (clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for (let i=0; i < clusterWorkerSize; i++) {
      cluster.fork()
    }
    cluster.on('exit', function(worker) {
      console.log('Worker', worker.id, ' has exitted.')
    })
  } else {
    const app = express()
    app.listen(PORT, function () {
      console.log(`Express server listening on port ${PORT} and worker ${process.pid}`)
    })
  }
} else {
  const app = express()
  app.listen(PORT, function () {
    console.log(`Express server listening on port ${PORT} with the single worker ${process.pid}`)
  })
}
```

## try...catch能捕哪些异常
**在报错的时候，线程的执行已经进入了try...catch代码块，且处在try...catch中才可以被捕获到**
* 代码语法异常，在代码解释阶段就报错了，还未进入代码块，捕获不到异常。
```js
try {
  a(
} catch (e) {
  console.log('error', e)
}
// Uncaught SyntaxError: Unexpected token }
```
* 函数声明在try...catch中，在外界执行，由于try...catch已经执行完毕，无法捕捉异常
* 函数声明在try...catch外，在内部执行，可以捕捉异常
* try内部执行promise，无法捕捉到异常，因为promise的异常是由reject和catch函数来捕获的。

## 大数相加
* js的Number是标准64-bits双精度数值
```
符号位(1)指数位(11)数字位(52)
```
在2^53 - 1内精确否则出现精度丢失
* 需要使用字符串逐位计算

## proxy与object.defineproperty

object.defineproperty(obj, key, descriptor)
* 不能监听数组的变化，对于数组方法无法触发set
* 必须深层遍历对象的每个属性

proxy(obj, descriptor)
针对对象：针对整个对象，不是某个属性，所有key都可以走进set
支持数组：不需要对方法重载
嵌套：get中递归调用Proxy并返回
可以配合Reflect.get 和 Reflect.set使用。

## call/apply/bind
**哭了，居然遇到这个，还紧张的答不上来？**
主体均为function，前两者分别传入上下文和逐个参数/参数数组，后者只接受上下文对象并返回新函数

## js对象的深度克隆
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

### call函数的实现
```js
Function.prototype.$call = function(ctx, ...args) {
  let that = this
  return function() {
    // 直接这样来改变上下文！！！我醉了
    if (typeof ctx === 'undefined') ctx = that || window || global
    ctx.fn = this
    ctx.fn(...args)
    delete ctx.fn
  }
}
function getInfo(age) {
  return `my name is ${this.name || ''}, i'm ${age} years old`
}
getInfo.call({name: 'younger'}, 27)
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

## commonjs 与 esm 的区别
* exports 对象是模块内外的唯一关联， commonjs 输出的内容，就是 exports 对象的属性（拷贝），模块运行结束，属性就确定了
```js
// a.js
let a = 1;
let b = { num: 1 }
setTimeout(() => {
    a = 2;
    b = { num: 2 };
}, 200);
module.exports = {
    a,
    b,
};

// main.js
// node main.js
let {a, b} = require('./a');
console.log(a);  // 1
console.log(b);  // { num: 1 }
setTimeout(() => {
    console.log(a);  // 1
    console.log(b);  // { num: 1 }
}, 500)
```
* 模块内部引用的变化，会反应在外部，这是 esm 的规范。
```js

// a.mjs
let a = 1;
let b = { num: 1 }
setTimeout(() => {
  a = 2;
  b = { num: 2 };
}, 200);
export {
  a,
  b,
};
 
// main.mjs
// node --experimental-modules main.mjs
import {a, b} from './a';
console.log(a);  // 1
console.log(b);  // { num: 1 }
setTimeout(() => {
    console.log(a);  // 2
    console.log(b);  // { num: 2 }
}, 500);
```
* esm 的 import read-only 特性，该属性是只读的，不能赋值，在script[type]="module"/webpack做tree-shaking时有用（静态分析）
* esm 存在 export/import 提升，在编译阶段完成
* 对于循环依赖，CommonJS的做法是，只输出已经执行的部分，还未执行的部分不会输出

```js
// a.js
exports.done = false;
let b = require('./b');
console.log('a.js: b.done = %j', b.done);  // true
exports.done = true;
console.log('a.js执行完毕');
 
// b.js
exports.done = false;
let a = require('./a');
console.log('b.js: a.done = %j', a.done);  // false
exports.done = true;
console.log('b.js执行完毕');
 
// main.js
let a = require('./a');
let b = require('./b');
console.log('main.js: a.done = %j, b.done = %j', a.done, b.done);  // true true
 
// 输出结果
// node main.js
b.js: a.done = false
b.js执行完毕
a.js: b.done = true
a.js执行完毕
main.js: a.done = true, b.done = true
```
* ES6根本不会关心是否发生了"循环加载"，只是生成一个指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值
```js
// a.mjs
export let a_done = false;
import { b_done } from './b';
console.log('a.js: b.done = %j', b_done);
console.log('a.js执行完毕');
 
// b.mjs
import { a_done } from './a';
console.log('b.js: a.done = %j', a_done);
export let b_done = true;
console.log('b.js执行完毕');
 
// main.mjs
import { a_done } from './a';
import { b_done } from './b';
console.log('main.js: a.done = %j, b.done = %j', a_done, b_done);
 
// 输出结果
// node --experimental-modules main.mjs
ReferenceError: a_done is not defined
// a.mjs 中的export a_done被提升到顶部，执行到import './b'时，执行权限移交到 b.mjs，此时a_done只是一个指定导出的接口，但是未定义，所以出现引用报错。
```
* babel 是使用commonjs模拟实现esm，提升的变量为export对象的属性，为undifined，无法出现is not defined报错。
