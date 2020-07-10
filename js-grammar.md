<!-- TOC -->

- [async/await 的实现](#asyncawait-的实现)
  - [Generator(生成器)](#generator生成器)
  - [next方法可以带一个参数，该参数就会被当作上一个yield表达式的返回值](#next方法可以带一个参数该参数就会被当作上一个yield表达式的返回值)
  - [基于Thunk函数的自动化](#基于thunk函数的自动化)
  - [基于 Thunk 函数的 Generator 执行器](#基于-thunk-函数的-generator-执行器)
  - [执行方法](#执行方法)
- [class 的实现](#class-的实现)
- [let 的变量提升](#let-的变量提升)
- [null 与 undefined](#null-与-undefined)
  - [null表示没有该对象](#null表示没有该对象)
  - [undefined表示缺少值](#undefined表示缺少值)
- [new操作符具体做了什么](#new操作符具体做了什么)
- [Map/Set对象用法](#mapset对象用法)
  - [Map](#map)
  - [map.keys()](#mapkeys)
  - [Set](#set)

<!-- /TOC -->

## async/await 的实现

### Generator(生成器)
```js
function* Generator() {
  yield 'step 1';
  yield 'step 2';
  return 'step 3';
}
let func = Generator();
let a = func.next();
let b = func.next();
let c = func.next();
let d = func.next();
console.log(a, b, c, d);
// {value: "11111111", done: false} {value: "22222222", done: false} {value: "3333333", done: true} {value: undefined, done: true}
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
result.next(4) // {value: 2, done: false} a=4

function * gene(a, b) {
  console.log(a, b);
  var c = yield 'c';
  console.log("c====", c);
  var d = yield "d";
  console.log("d====", d)
  return 6;
}
var g = gene("a", "b");
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
  return function (){
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

  function next(err, data) {
    // data即文件读取的值(第一次无效)
    if (err) throw err;
    var result = gen.next(data); // 改变了上一个yield的返回值
    if (result.done) return;
    // generator函数的yield返回的异步函数的情况下这样使用
    // value === callback
    result.value(next); // 这里才正式开始求值
  }

  next();
}

run(gen);
```
### 执行方法
```js
var gen = function* () {
  // readFile已经被转换为 Thunk 函数
  var f1 = yield readFile('xx.avi');
  var f2 = yield readFile('xx.mp4');
  // ...
}
run(gen);
```
这里已经和 async/await 非常像了。async/await即上述实现的一种语法糖。


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
let 有暂时死区，不会被提升。
* 深层原理
let 的「创建」过程被提升了，但是初始化没有提升。(这时不能使用，暂时性死区)
var 的「创建」和「初始化」都被提升了。
function 的「创建」「初始化」和「赋值」都被提升了。

## null 与 undefined
* `null`是一个表示无的对象，转为数值为0
*`false`/`[]`/`’‘`转为数值时也为0*
* undefined是一个表示无的原始类型，转为数值时为NaN

### null表示没有该对象
* 原型链的终点

### undefined表示缺少值
* 变量被声明而没有赋值时
* 函数运行时调用未被传入的参数
* 函数没有注明返回值的默认返回值
* 对象没有被赋值的属性

## new操作符具体做了什么
* 创建一个新对象，将构造函数的作用域赋值给新对象
`obj.__proto__ = Func.prototype`
* 执行构造函数中的代码（会覆盖原型链中的同名属性）
`Func.call(obj)`
* 返回该对象

## Map/Set对象用法
### Map
Map是一中键值对的结构，类似于:
`[[key1, value1], [key2, value2], [key3, value3]]`
初始化Map可以传入上述的二维数组，或直接初始化空Map。
实例化map有以下方法
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
