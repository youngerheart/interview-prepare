/*
流程（以data为例）:
在Vue函数中执行_init方法，在其中执行initState方法，在其中执行initData方法
将options中的data对象取出[fn.call(vm)]，赋值到vm的$data与_data，并代理到vm的属性上，接着执行observe(data) (观察)
如果待观察变量不为对象则无需观察，否则利用该变量实例化Observer
在该类的构造函数中实例化一个依赖属性dep，将实例作为传入变量的__ob__属性。
如果传入变量为数组，则重写数组方法，方法被调用时将变化元素转化为响应式，调用__ob__.dep.notify。然后对数组每一项执行observe方法
如果是其他类型执行walk方法，为对象每一项执行defineReactive(obj, key, val)方法
在定义响应式对象之前递归调用确保所有子对象可变为响应式。
在该函数第一行即初始化了依赖实例，在getter函数中调用dep.depend，为静态属性Watcher添加一个依赖
*/

function Vue(options) {
  this._init(options)
}
initMixin(Vue)

function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    const vm = this;
    vm.$options = options;
    // ...
    initState(vm)
  }
  Vue.prototype.mount = function(el) {
    const vm = this;
    console.log('el:', el)
    // ...
    // 实例化渲染Watcher
    const updateComponent = () => {
      console.log('vm.update(vm._render())');
      console.log('render方法生成渲染VNode并访问数据，触发getter');
      // vm.update(vm._render())
      vm.$options.created.call(vm)
      console.log(vm.message);
    }
    new Watcher(vm, updateComponent, {
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
class Dep {
  static target = null; // Watcher类型
  constructor() {
    // this.id = uid++
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

class Watcher {
  constructor(vm, fn, options, isRenderWatcher) {
    this.vm = vm
    if (isRenderWatcher) vm._watcher = this;
    vm._watchers.push(this)
    this.getter = fn
    if (options) {
      this.before = options.before
    }
    this.deps = []
    this.newDeps = []
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.get();
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
      if (!this.newDeps.has(dep.id)) dep.removeSub(this)
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
}

function pushTarget (target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = target
}

new Vue({
  data() {
    return {
      message: 'Hello'
    };
  },
  created() {
    this.message = 'Hello vue'
  }
}).mount('#app')
