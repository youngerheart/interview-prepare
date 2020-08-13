const isObject = obj => typeof obj === 'object' && obj !== null

function reactive(data) {
  return new Proxy(data, {
    get(target, key) {
      let res = Reflect.get(target, key)
      track(target, key)
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, value) {
      let res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    },
    deleteProperty() {
      let res = Reflect.set(target, key, value)
      trigger(target, key)
      return res
    }
  })  
}

const targetMap = new WeakMap()

function track(target, key) {
  const effect = effectStack[effectStack.length - 1]
  if (!effect) return
  let depMap = targetMap.get(target)
  if (!depMap) {
    depMap = new Map()
    targetMap.set(target, depMap)
  }
  let dep = depMap.get(key)
  if (!dep) {
    deps = new Set()
    depMap.set(key, deps)
  }
  deps.add(effect)
}

function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (!depMap) return
  const deps = depMap.get(key)
  if (deps) deps.forEach(fn => fn())
}

const effectStack = []

function createReactiveEffect(fn) {
  const effect = function reactiveEffect(...args) {
    try {
      if (!effectStack.includes(fn)) {
        effectStack.push(fn)
        return fn(...args)
      }
    } catch(error) {
      console.error(error)
    } finally {
      effectStack.pop()
    }
  }
  return effect
}

function effect(fn) {
  const newFn = createReactiveEffect(fn)
  newFn()
  return newFn
}

const data = {
  key2: {
    n: 1
  }
}

const observed = reactive(data)

effect(() => {
  console.log(observed.key2.n)
})

observed.key2.n++
