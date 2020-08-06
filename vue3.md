<!-- TOC -->

- [数据响应式概念](#数据响应式概念)
  - [响应式革新: vue2 vs vue3](#响应式革新-vue2-vs-vue3)
  - [手写实现](#手写实现)
  - [vue3响应式模块源码剖析](#vue3响应式模块源码剖析)
- [vue3编译器原理](#vue3编译器原理)
  - [vue3编译过程](#vue3编译过程)
- [vue3编译优化](#vue3编译优化)
  - [静态节点提升](#静态节点提升)
  - [补丁标记和动态属性记录](#补丁标记和动态属性记录)
  - [缓存事件处理程序](#缓存事件处理程序)
  - [块 block](#块-block)
- [vite](#vite)
  - [手写实现](#手写实现-1)

<!-- /TOC -->

## 数据响应式概念
数据变化可监测，和数据相关的内容可更新

### 响应式革新: vue2 vs vue3
* vue2使用Objec.defineProperty遍历对象所有key，通过deps/watcher建立依赖关系，非常消耗性能，会影响初始化速度。
* vue2对于数组要做特殊处理，修改数据时不能使用索引方式
```js
const arrayProto = Object.create(Array.prototype)
['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'].forEach(method => {
  arrayProto[method].apply(this, arguments)
  // 改变数组的同时通知更新
  dep.notify()
})
```
* vue2中动态添加或者删除对象属性需要额外使用API: Vue.set/delete
* vue3 composition-api使得无须再使用this，所有数据可以直接拿到。可以做js类型推论。

Reflect对象将能够实现反射机制的方法都归结于一个地方并且做了简化，保持JS的简单。于是我们再也不需要调用Object对象，然后写上很多的代码。

```js
// 原有方法
var s = Symbol('foo');
var k = 'bar';
var o = { [s]: 1, [k]: 1 };
// getOwnPropertyNames获取到String类型的key，getOwnPropertySymbols获取到Symbol类型的key
var keys = Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));
// 试用Reflect
Reflect.ownKeys(o)
```

### 手写实现

* effect(cb) -> effackStack effect返回值在stack中储存。
* cb函数运行时getter被触发，target, key与cb的映射关系通过track跟踪函数被储存下来。
```js
// Weakmap
{
  [target]:
  // map
  {
    key:
    // set
    [cb1, ...]
  }
}
```

### vue3响应式模块源码剖析

1. 在vue-loader提前编译出render函数的runtime版本
2. 在运行时编译出render函数的runtime-with-compiler版本（可编译字符串类型template）

## vue3编译器原理
template(dom树) -(解析)-> ast(js抽象语法树) -(生成)-> render函数

* `compiler-dom` 浏览器/小程序中的数据绑定等逻辑需要不同方法
* `compiler-core` 核心逻辑

**Vue3 Template Explorer**

```html
<div id="app">
  <h1>{{foo}}</h1>
</div>
```

```js
import {...} from vue

const _hoisted_1 = {id: 'app'} // 静态节点提升相关
export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock('div', _hoisted_1, [_createVNode('h1', null, _toDisplayString(_ctx.foo), 1)]))
}
```

### vue3编译过程
app.mount // index.ts
mount // apiCreateApp.ts
render // renderer.ts
patch // renderer.ts 处理根组件，拿出根组件内容作为模板
processComponent // renderer.ts
mountComponent // renderer.ts 挂载
setupComponent // component.ts 安装
setupStatefulComponent // component.ts 安装状态组件
finishComponentSetup // component.ts 结束时尝试编译
compileToFunction as compile // index.ts

* 如果没有render函数则编译一个
* 在`src/index.ts`根文件指定一个compileToFunction函数
```js
const {code} = compile(template, options)
const render = __GLOBAL__ ? new Function(code)() : new Function('Vue', code)(runtionDom)
```
* 最终来到`compiler-core/src/compile.ts`
```js
// 解析: template -> ast
const ast = isString(template) ? baseParse(template, options) : template
// 根据平台不同拓展ast
transform(ast, options)
// 生成render函数
return generate(ast, options) // 返回render函数的字符串"code"
```

## vue3编译优化
### 静态节点提升

```html
<div id="app">
  <h1>hello</h1>
</div>
```

```js
import {...} from vue

const _hoisted_1 = {id: 'app'} // 静态节点提升相关
const _hoisted_2 = _createVNode('h1', null, 'hello', -1) /* HOISTED */
export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock('div', _hoisted_1, [_hoisted_2]))
}
```
### 补丁标记和动态属性记录
```html
<div id="app">
  <h1 :title="foo">hello</h1>
</div>
```

```js
import {...} from vue

const _hoisted_1 = {id: 'app'} // 静态节点提升相关
export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock('div', _hoisted_1, [
    // 这里的8(二进制数值)标记有动态props需要重新比对
    // 如果是9则为与操作，标记有动态props和文本需要重新比对
    _createVNode('h1', { title: _ctx.foo }, 'hello', 8, ['title'])
  ]))
}
```
### 缓存事件处理程序
```html
<div id="app">
  <h1 @click="onclick('tom')">hello</h1>
</div>
```

```js
import {...} from vue

const _hoisted_1 = {id: 'app'} // 静态节点提升相关
export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock('div', _hoisted_1, [
    
    _createVNode('h1', {
      title: _ctx.foo,
      // render每次执行都重新生成函数会导致组件不必要的更新，所以可以缓存起来
      onClick: _cache[1] || (_cache[1] = $event => (_ctx.onclick('tom')))
    }, 'hello', 8, ['title', 'onClick'])
  ]))
}
```
### 块 block
将模板的一部分（如一个div及其内容）标记为一个块，在render执行时只对其中的动态部分做比对

```html
<div id="app">
  <h1></h1>
  <h1></h1>
  <h1>{{msg}}</h1>
  <h1></h1>
</div>
```

```js
const _hoisted_1 = {id: 'app'} // 静态节点提升相关
const _hoisted_2 = _createVNode('h1', null, 'hello', -1) /* HOISTED */
const _hoisted_3 = _createVNode('h1', null, 'hello', -1) /* HOISTED */
const _hoisted_4 = _createVNode('h1', null, 'hello', -1) /* HOISTED */
export function render(_ctx, _cache) {
  return (_openBlock(), _createBlock('div', _hoisted_1, [ // 将div保存为块
    _hoisted_2,
    _hoisted_3,
    _createVNode('div', null, _toDisplayString(_ctx.msg), 1) /* TEXT */
    _hoisted_4
  ]
}
```

## vite
* 新一代开发/构建工具
* 利用浏览器native ES module imports
* 开发时按需解析，跳过打包过程
* 不论项目多复杂，都能做到秒开

```
npm init vite-app vue3-demo && cd vue3-demo
npm i && npm run dev
```

* 每次更新后，自动重新在服务端渲染一次
* 浏览器会自动请求加载需要的模块（如.vue文件已经在服务端渲染加工为js）

### 手写实现
