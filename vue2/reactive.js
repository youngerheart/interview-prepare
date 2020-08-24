/*
流程（以data为例）:
new Vue (Observer/Deps初始化)
在Vue函数中执行_init方法，在其中执行initState方法，在其中执行initData方法
将options中的data对象取出[fn.call(vm)]，赋值到vm的$data与_data，并代理到vm的属性上，接着执行observe(data) (观察)
如果待观察变量不为对象则无需观察，否则利用该变量实例化Observer
在该类的构造函数中实例化一个依赖属性dep，将实例作为传入变量的__ob__属性。
如果传入变量为数组，则重写数组方法，方法被调用时将变化元素转化为响应式（在getter中调用__ob__.dep.notify。然后对数组每一项执行observe方法）
如果是其他类型执行walk方法，为对象每一项执行defineReactive(obj, key, val)方法
在定义响应式对象之前递归调用确保所有子对象可变为响应式。
在该函数第一行即初始化了依赖实例，如果getter函数触发，调用dep.depend，为静态属性Watcher添加一个依赖

component.$mount (触发依赖收集)
在该方法中会实例化渲染watcher，其构造函数最后调用get方法
在其中pushTarget，将自身压栈到targetStack数组，再将自身作为Dep的静态属性target
随后触发自身getter函数，即传入的updateComponen函数
该函数调用vm.update(vm._render())触发render函数，生成渲染vnode并访问数据，触发getter
getter中调用到dep.depend()方法，即Dep.target.addDep(this)
在该函数中调用了dep.addSub(this)，将该dep推进watcher实例的deps数组，在作为响应式变量属性的dep的subs数组添加了当前watcher实例。

dep.notify(派发更新)
当触发响应式变量setter时调用该函数，对在该dep的subs中的watcher触发update函数，再进入queueWatcher函数。
将watcher按照id从小到大排进队列中，执行nextTick(flushSchedulerQueue)方法
在flushSchedulerQueue中对队列从小到大排列，确保
1.组件更新先父后子
2.用户自定义watcher先于渲染watcher执行（自定义watcher先于渲染watcher创建）
3.组件在父组件watcher执行时被销毁，其watcher执行可以被跳过
对队列中的watcher全部调用run方法：通过this.get获取新值，如果和旧值不等，则执行watcher的回调函数
最后调用resetSchedulerState方法：清空队列和用到的临时数据

nextTick
JS运行机制（事件循环）
1.所有同步任务都在主线程执行，形成一个执行栈
（函数被调用时会压栈该函数，执行完毕该函数上下文出栈继续执行上一个上下文）
2.主线程之外还有一个“消息队列”。只要异步任务（mouse click/network events）有了运行结果，就在队列中防止事件
3.执行栈中所有同步任务执行完毕，系统会读取任务队列，对应的异步任务结束等待，进入执行栈，开始执行。
4.主线程不断重复第三步。
消息队列中存放着一个个任务（task），分为
宏任务（macrotask）setImmediate > MessageChannel > setTimeout / setInterval
  浏览器: DOM event>network IO>UI render
微任务（microtask）process.nextTick > Promise = MutationObserver
*/

function Vue(options) {
  this._init(options)
}
initMixin(Vue)

function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    const vm = this;
    vm.$options = options;
    vm.$set = set;
    // ...
    initState(vm)
  }
  Vue.prototype.$mount = function(el) {
    const vm = this;
    console.log('el:', el)
    // ...
    // 实例化渲染Watcher
    const updateComponent = () => {
      console.log('vm._update(vm._render())');
      console.log('render方法生成渲染VNode并访问数据。模拟访问一下，触发getter，做依赖收集');
      // vm.update(vm._render())
      console.log(vm.message, vm.obj.key);
      if (!vm._isCreated) {
        vm.$options.created.call(vm)
        vm._isCreated = true;
      }
    }
    // watcher会自带触发getter的函数
    new Watcher(vm, updateComponent/* getter for watcher */, {
      before() {
        if (vm._isMounted) callHook(vm, 'beforeUpdate')
      }
    }, true /* isRenderWatcher */)
  }
}

function initState(vm) {
  vm._watchers = [];
  const options = vm.$options;
  if (options.data) initData(vm);
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = vm.$data = typeof data === 'function' ? data.call(vm) : data
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  observe(data)
}

function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newVal) {
      vm[source][key] = newVal;
    }
  })
}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function observe(value) {
  if (!isObject(value)) return;
  return new Observer(value);
}

Vue.set = set

function set(target, key, value) {
  if (Array.isArray(target)) {
    target.splice(key, 1, value)
    return value
  }
  if (key in target) {
    target[key] = value
    return value
  }
  let ob = target.__ob__
  // 如果target不是响应式对象
  if (!ob) {
    target[key] = value
    return value
  }
  defineReactive(ob.value, key, value)
  ob.dep.notify()
  return value;
}

class Observer {
  // 收集处理对象数据的依赖
  constructor(value) {
    this.value = value;
    // 重要！添加dep属性
    this.dep = new Dep();
    // 添加实例对象到__ob__属性，需要防止属性被枚举
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      // .. deal with array methods
      // value.__ob__.dep.notify()
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      this.convert(keys[i], obj[keys[i]])
    }
  }
  convert(key, value) {
    defineReactive(this.value, key, value)
  }
  observeArray(items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false,
    get() {
      return value
    },
    set(newVal) {
      value = newVal;
    }
  });
}

function defineReactive(obj, key, val) {
  // 如果在getter中使用变量属性值将造成getter鬼畜调用
  // 先取到原有getter与setter保存到闭包，方便取值
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj);
  const getter = property && property.get;
  const setter = property && property.set;
  var childOb = observe(val); // 循环调用
  Object.defineProperty(obj, key, {
    get() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) childOb.dep.depend();
      }
      if (Array.isArray(value)) {
        for (var e, i = 0, l = value.length; i < l; i++) {
          e = value[i]
          e && e.__ob__ && e.__ob__.dep.depend();
        }
      }
      return value;
    },
    set(newVal) {
      var value = getter ? getter.call(obj) : val
      if (value === newVal) return;
      if (setter) setter.call(obj, newVal);
      else val = newVal;
      childOb = observe(newVal); // 循环调用
      dep.notify();
    }
  })
}
// JS基于单线程，同一时刻只会有一个观察者函数执行，Watcher实例会赋值给Dep.target。
let depId = 0;
class Dep {
  static target = null; // Watcher类型
  constructor() {
    this.id = depId++
    this.subs = []; // Watcher数组
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  removeSub(sub) {
    this.subs.splice(this.subs.indexOf(sub))
  }
  depend() {
    Dep.target.addDep(this)
  }
  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

let watcherId = 0;
class Watcher {
  constructor(vm, fn, options, isRenderWatcher) {
    this.vm = vm
    if (isRenderWatcher) vm._watcher = this;
    vm._watchers.push(this)
    this.getter = fn
    this.cb = function(newVal, oldVal) {
      console.log('watch callback', newVal, oldVal);
    }
    if (options) {
      this.before = options.before
    }
    this.id = ++watcherId;
    this.deps = []
    this.newDeps = []
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.value = this.get();
  }
  get() {
    // 在mount触发一开始就给Dep.target赋值
    const vm = this.vm;
    pushTarget(this);
    let value = this.getter.call(vm, vm);
    this.cleanupDeps();
    return value;
  }
  addDep(dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) dep.addSub(this)
    }
  }
  cleanupDeps() {
    let i = this.deps.length
    // 移除deps中对该watcher不需要的订阅
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) dep.removeSub(this)
    }
    // 交换depIds与newDepIds，清空newDepIds
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    // 交换deps与newDeps，清空newDeps
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
  update() {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      // 一般都会走到这里
      queueWatcher(this)
    }
  }
  run() {
    const value = this.get()
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value;
      this.cb.call(this.vm, value, oldValue)
    }
  }
}

let has = {}
let queue = [] // 一个watcher队列
let flushing = false;
let index = 0;
let waiting = false;
function queueWatcher(watcher) {
  const id = watcher.id
  // 保证watcher的id唯一
  if (has[id] == null) {
    has[id] = true
    if (!flushing) queue.push(watcher)
    else {
      // 每次重新获取队列长度，因为可能发生变化
      let i = queue.length - 1
      // 找到该watcher id的位置
      // queue: [{id: 3}, {id: 5}, {id: 7}] watcher: {id: 6}
      // i = 1，在index = 2的位置插入
      while (i > index && queue[i].id > watcher.id) i--;
      queue.splice(i + 1, 0, watcher)
    }
  }
  if (!waiting) {
    waiting = true
    // 刷新日程队列
    nextTick(flushSchedulerQueue)
  }
}

function flushSchedulerQueue () {
  flushing = true
  let watcher, id
  // 从小到大排列
  queue.sort((a, b) => a.id - b.id)
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) watcher.before()
    id = watcher.id
    has[id] = null
    watcher.run()
  }
  resetSchedulerState()
}

// 重置日程状态
function resetSchedulerState() {
  index = queue.length = 0
  has = {}
  waiting = flushing = false
}

const targetStack = []

function pushTarget (target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = target
}

const callbacks = []
let pending = false

let macroTimerFunc;
let microTimerFunc;
let useMacroTask = false;

function nextTick (cb, ctx) {
  let _resolve;
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        console.log(e);
      }
    } else if (_resolve) _resolve(ctx)
  })
  if (!pending) {
    pending = true
    if (useMacroTask) macroTimerFunc()
    else microTimerFunc()
  }
  // 允许nextTick().then(() => {})用法
  if (!cb && typeof Promise !== undefined) {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}

let isNative = fn => fn.toString().indexOf('[native code]') !== -1
// 对于一些 DOM 交互事件，如 v-on 绑定的事件回调函数的处理，会强制走 macro task
function withMacroTask (fn) {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
  })
}

// 定义宏任务最快执行的macroTask（非标准），在chrome没有，node有
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && isNative(MessageChannel)) {
  const channel = new MessageChannel()
  const port = channer.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1) // 随便发送数据以触发onmessage
  }
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// 定义微任务
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
  }
} else microTimerFunc = macroTimerFunc

// 刷新回调
function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0;i < copies.length; i++) copies[i]()
}

new Vue({
  data() {
    return {
      message: 'Hello',
      obj: {}
    };
  },
  created() {
    console.log('created');
    this.message = 'Hello vue'
    console.log('set obj-key-value');
    this.$set(this.obj, 'key', 'value')
  }
}).$mount('#app')
