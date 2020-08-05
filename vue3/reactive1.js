// vue 2: Object.defineProperty
function defineVue2Reactive(obj, key, val) {
  // val作为函数内部变量，通过函数暴露给外界访问，形成闭包
  Object.defineProperty(obj, key, {
    get() {
      return val
    },
    set(v) {
      val = v
      update()
    }
  })
}

function defineVue3Reactive(obj) {
  // val作为函数内部变量，通过函数暴露给外界访问，形成闭包
  return new Proxy(obj, {
    get(target, key) {
      return target[key]
    },
    set(target, key, val) {
      target[key] = val
      update()
    }
  })
}

function update() {
  console.log(obj.key)
}

const isObject = v => typeof v === 'object' && v !== null

function reactive(obj) {
  // 对传入参数进行处理
  if (!isObject(obj)) return obj

  return new Proxy(obj, {
    get(target, key) {
      // Reflect
      const res = Reflect.get(target, key)
      console.log('get', key, res)
      // 如果是对象，需要再次代理
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, val) {
      const res = Reflect.set(target, key, val) // boolean
      console.log('set', key, res)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key) // boolean
      console.log('delete', key, res)
      return res
    }
  });
}

const obj = {key2: {n: 1}, key3: [1,2,3]}
// defineVue2Reactive(obj, 'key', 'foo')
// const observed = defineVue3Reactive(obj)
const observed = reactive(obj)
// observed.key = 'foooo'
// observed.key
// delete observed.key
observed.key2.n++
observed.key2.n
observed.key3.push(4)
delete observed.key3[3]
observed.key3

// vue 3: Proxy

