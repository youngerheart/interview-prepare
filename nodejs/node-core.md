# Node.js 模块加载原理
在node.js中用require载入一个模块，运行时会依次枚举后缀名进行寻径。
一个编译好的c++模块后缀名是`.node`，是系统的动态链接库（其十六进制内容有动态链接库标识）。相当于win下的`.dll`，linux下的`.so`和macos下的`.dylib`。

> 代码基于NODE_MODULE_VERSION 95(17.0.0-pre)

## Node.js入口文件
```c
// src/node_main.cc
int main() {
    ...
    return node::Start()
}
// Start函数中
InitializeOncePerProcess() // -> InitializeNodeWithArgs -> binding::RegisterBuiltinModules(); // 注册内部模块
result.exit_code = main_instance.Run(env_info);
// Run函数中
DeleteFnPtr<Environment, FreeEnvironment> env =
      CreateMainEnvironment(&exit_code, env_info);
// CreateMainEnvironment函数中执行Environment实例化后
env->RunBootstrapping().IsEmpty()
// Environment::RunBootstrapping函数中
if (BootstrapInternalLoaders().IsEmpty()) {
  return MaybeLocal<Value>();
}
Local<Value> result;
  if (!BootstrapNode().ToLocal(&result)) {
    return MaybeLocal<Value>();
  }
// BootstrapNode函数中
std::vector<Local<String>> node_params = {
      process_string(),
      require_string(),
      internal_binding_string(),
      primordials_string()};
std::vector<Local<Value>> node_args = {
      process_object(), // 宏定义模块参数
      native_module_require(),
      internal_binding_loader(),
      primordials()};
MaybeLocal<Value> result = ExecuteBootstrapper(
      this, "internal/bootstrap/node", &node_params, &node_args);
// ExecuteBootstrapper函数中
MaybeLocal<Function> maybe_fn =
      NativeModuleEnv::LookupAndCompile(env->context(), id, parameters, env);
Local<Function> fn;
if (!maybe_fn.ToLocal(&fn)) {
  return MaybeLocal<Value>();
}
// node_args->arguments
MaybeLocal<Value> result = fn->Call(env->context(),
                                      Undefined(env->isolate()),
                                      arguments->size(),
                                      arguments->data());
```

## process对象
在process_object这个参数对应`internal/bootstrap/node.js`文件process对象

env.cc中
```c
// Environment::Environment
InitializeMainContext(context, env_info);
Local<Object> process_object =
      node::CreateProcessObject(this).FromMaybe(Local<Object>()); // node_process_object.cc中有定义，创建一个对象并规定一些属性/方法
  set_process_object(process_object);
```

env.h中
```c
#define ENVIRONMENT_STRONG_PERSISTENT_VALUES(V)
  V(process_object, v8::Object)

// 这里定义了process_object函数/set_process_object函数，对ENVIRONMENT_STRONG_PERSISTENT_VALUES列表内生效
#define V(PropertyName, TypeName)                                             \
  inline v8::Local<TypeName> PropertyName() const;                            \
  inline void set_ ## PropertyName(v8::Local<TypeName> value);
  ENVIRONMENT_STRONG_PERSISTENT_VALUES(V)
#undef V

// 定义了process_object_变量，对ENVIRONMENT_STRONG_PERSISTENT_VALUES列表内生效
#define V(PropertyName, TypeName) v8::Global<TypeName> PropertyName ## _;
  ENVIRONMENT_STRONG_PERSISTENT_VALUES(V)
#undef V

// 声明了Environment::process_object()返回process_object_的内容
// Environment::set_process_object(value)为重置process_object_的值
// 对ENVIRONMENT_STRONG_PERSISTENT_VALUES列表内生效
#define V(PropertyName, TypeName)                                             \
  inline v8::Local<TypeName> Environment::PropertyName() const {              \
    return PersistentToLocal::Strong(PropertyName ## _);                      \
  }                                                                           \
  inline void Environment::set_ ## PropertyName(v8::Local<TypeName> value) {  \
    PropertyName ## _.Reset(isolate(), value);                                \
  }
  ENVIRONMENT_STRONG_PERSISTENT_VALUES(V)
#undef V
```

> 小结
process_object/native_module_require等在Environment被宏声明
初始化之后在CreateMainEnvironment被赋值并保存在env的变量中，在执行`internal/bootstrap/node`时作为参数传入
通过v8的vm运行js代码，其中会包含如process/require这样的全局变量/函数

## 几种模块的加载过程
### c++核心模块
采用c++编写，未经过任何js代码封装过的原生模块。与c++拓展的区别是前者编译进Node.js可执行文件，后者以动态链接库形式存在。

**process.binding函数**
node.cc
```c
// BootstrapInternalLoaders函数
// Create binding loaders
std::vector<Local<String>> loaders_params = {
    process_string(),
    FIXED_ONE_BYTE_STRING(isolate_, "getLinkedBinding"),
    FIXED_ONE_BYTE_STRING(isolate_, "getInternalBinding"),
    primordials_string()};
std::vector<Local<Value>> loaders_args = {
    process_object(),
    NewFunctionTemplate(binding::GetLinkedBinding)
        ->GetFunction(context())
        .ToLocalChecked(),
    NewFunctionTemplate(binding::GetInternalBinding)
        ->GetFunction(context())
        .ToLocalChecked(),
    primordials()};

// Bootstrap internal loaders
Local<Value> loader_exports;
if (!ExecuteBootstrapper(
          this, "internal/bootstrap/loaders", &loaders_params, &loaders_args)
          .ToLocal(&loader_exports)) {
  return MaybeLocal<Value>();
}

CHECK(loader_exports->IsObject());
Local<Object> loader_exports_obj = loader_exports.As<Object>();
Local<Value> internal_binding_loader =
    loader_exports_obj->Get(context(), internal_binding_string())
        .ToLocalChecked();
CHECK(internal_binding_loader->IsFunction());
set_internal_binding_loader(internal_binding_loader.As<Function>());
Local<Value> require =
    loader_exports_obj->Get(context(), require_string()).ToLocalChecked();
CHECK(require->IsFunction());
set_native_module_require(require.As<Function>());
```

node_binding.cc
```c
// GetLinkedBinding函数中...
while (mod == nullptr && cur_env != nullptr) {
  Mutex::ScopedLock lock(cur_env->extra_linked_bindings_mutex());
  mod = FindModule(cur_env->extra_linked_bindings_head(), name, NM_F_LINKED);
  cur_env = cur_env->worker_parent_env();
}
...
Local<Object> exports = Object::New(env->isolate());
Local<String> exports_prop =
    String::NewFromUtf8Literal(env->isolate(), "exports");
module->Set(env->context(), exports_prop, exports).Check();

if (mod->nm_context_register_func != nullptr) {
  mod->nm_context_register_func(
      exports, module, env->context(), mod->nm_priv);
} else if (mod->nm_register_func != nullptr) {
  mod->nm_register_func(exports, module, mod->nm_priv);
} else {
  return THROW_ERR_INVALID_MODULE(
      env,
      "Linked moduled has no declared entry point.");
}

auto effective_exports =
    module->Get(env->context(), exports_prop).ToLocalChecked();
args.GetReturnValue().Set(effective_exports);
```
GetInternalBinding函数
```c
Local<String> module = args[0].As<String>();
node::Utf8Value module_v(env->isolate(), module);
node_module* mod = FindModule(modlist_internal, *module_v, NM_F_INTERNAL);
if (mod != nullptr) {
  // 从内部链表找到，执行mod->nm_context_register_func(exports, unused, env->context(), mod->nm_priv);
  // node::addon_context_register_func nm_context_register_func;
  exports = InitModule(env, mod, module);
  env->internal_bindings.insert(mod);
} else if (!strcmp(*module_v, "constants")) {
  // 如果要找的是“constants”模块
  exports = Object::New(env->isolate());
  CHECK(
      exports->SetPrototype(env->context(), Null(env->isolate())).FromJust());
  DefineConstants(env->isolate(), exports);
} else if (!strcmp(*module_v, "natives")) {
  exports = native_module::NativeModuleEnv::GetSourceObject(env->context());
  // Legacy feature: process.binding('natives').config contains stringified
  // config.gypi
  CHECK(exports
            ->Set(env->context(),
                  env->config_string(),
                  native_module::NativeModuleEnv::GetConfigString(
                      env->isolate()))
            .FromJust());
} else {
  char errmsg[1024];
  snprintf(errmsg, sizeof(errmsg), "No such module: %s", *module_v);
  return THROW_ERR_INVALID_MODULE(env, errmsg);
}

args.GetReturnValue().Set(exports);
```
FindModule函数
```c
inline struct node_module* FindModule(struct node_module* list,
                                      const char* name,
                                      int flag) {
  struct node_module* mp;

  for (mp = list; mp != nullptr; mp = mp->nm_link) {
    if (strcmp(mp->nm_modname, name) == 0) break;
  }

  CHECK(mp == nullptr || (mp->nm_flags & flag) != 0);
  return mp;
}
```
node_module_register函数
```c
extern "C" void node_module_register(void* m) {
  struct node_module* mp = reinterpret_cast<struct node_module*>(m);

  if (mp->nm_flags & NM_F_INTERNAL) {
    mp->nm_link = modlist_internal;
    modlist_internal = mp;
  } else if (!node_is_initialized) {
    // "Linked" modules are included as part of the node project.
    // Like builtins they are registered *before* node::Init runs.
    mp->nm_flags = NM_F_LINKED;
    mp->nm_link = modlist_linked;
    modlist_linked = mp;
  } else {
    thread_local_modpending = mp;
  }
}
```
node_file.cc
```c
NODE_MODULE_CONTEXT_AWARE_INTERNAL(fs, node::fs::Initialize)
```

宏定义

```c
#define NODE_MODULE_CONTEXT_AWARE_INTERNAL(modname, regfunc)                   \
  NODE_MODULE_CONTEXT_AWARE_CPP(modname, regfunc, nullptr, NM_F_INTERNAL)

#define NODE_MODULE_CONTEXT_AWARE_CPP(modname, regfunc, priv, flags)           \
  static node::node_module _module = {                                         \
      NODE_MODULE_VERSION,                                                     \
      flags,                                                                   \
      nullptr,                                                                 \
      __FILE__,                                                                \
      nullptr,                                                                 \
      (node::addon_context_register_func)(regfunc),                            \
      NODE_STRINGIFY(modname),                                                 \
      priv,                                                                    \
      nullptr};                                                                \
  void _register_##modname() { node_module_register(&_module); }

// node_binding.cc
#define NODE_BUILTIN_STANDARD_MODULES(V)                                       \
  V(fs)

#define NODE_BUILTIN_MODULES(V)                                                \
  NODE_BUILTIN_STANDARD_MODULES(V)                                             \
  NODE_BUILTIN_OPENSSL_MODULES(V)                                              \
  NODE_BUILTIN_ICU_MODULES(V)                                                  \
  NODE_BUILTIN_PROFILER_MODULES(V)                                             \
  NODE_BUILTIN_DTRACE_MODULES(V)
#define V(modname) void _register_##modname();
NODE_BUILTIN_MODULES(V)
#undef V

void NodeBindings::RegisterBuiltinModules() {
#define V(modname) _register_##modname();
  ELECTRON_BUILTIN_MODULES(V)
#undef V
}
```

> 小结
* 在编译过程中会在node_binding.cc通过宏生成每个模块注册的声明与定义
* 在node程序启动后
  * 依次调用定义过的模块注册方法，执行`node_module_register(&_module);`按照是否为内部模块放入两个链表
* node继续执行，在执行internal/bootstrap/node前将process_object作为参数传入


### Node.js内置模块
基本等同于官方文档中存在的模块，大多在源码lib目录下有同名js代码形式的实现，这些js文件会被编译进可执行文件。
lib/internal/bootstrap/node.js
```js
// Node.js内置模块处理类
const nativeModule = internalBinding('native_module');
```
lib/internal/bootstrap/loader.js
```js
const loaderId = 'internal/bootstrap/loaders';
const {
  moduleIds,
  CompileFunction
} = internalBinding('native_module');
class NativeModule {
  // 这个map用来储存内置模块
  static map = new SafeMap(
    ArrayPrototypeMap(moduleIds, (id) => [id, new NativeModule(id)])
  );
}
// 这个函数返回require的返回值
function nativeModuleRequire(id) {
  if (id === loaderId) {
    return loaderExports;
  }

  const mod = NativeModule.map.get(id);
  return mod.compileForInternalLoader();
}

const bindingObj = ObjectCreate(null);

process.binding = function binding(module) {
  module = String(module);
  // Deprecated specific process.binding() modules, but not all, allow
  // selective fallback to internalBinding for the deprecated ones.
  if (internalBindingAllowlist.has(module)) {
    if (runtimeDeprecatedList.has(module)) {
      runtimeDeprecatedList.delete(module);
      process.emitWarning(
        `Access to process.binding('${module}') is deprecated.`,
        'DeprecationWarning',
        'DEP0111');
    }
    if (legacyWrapperList.has(module)) {
      return nativeModuleRequire('internal/legacy/processbinding')[module]();
    }
    return internalBinding(module);
  }
  // eslint-disable-next-line no-restricted-syntax
  throw new Error(`No such module: ${module}`);
};
// 等下electron会用到的函数
process._linkedBinding = function _linkedBinding(module) {
  module = String(module);
  let mod = bindingObj[module];
  if (typeof mod !== 'object')
    mod = bindingObj[module] = getLinkedBinding(module);
  return mod;
};
let internalBinding;
{
  const bindingObj = ObjectCreate(null);
  // eslint-disable-next-line no-global-assign
  internalBinding = function internalBinding(module) {
    let mod = bindingObj[module];
    if (typeof mod !== 'object') {
      mod = bindingObj[module] = getInternalBinding(module);
      ArrayPrototypePush(moduleLoadList, `Internal Binding ${module}`);
    }
    return mod;
  };
}
const loaderExports = {
  internalBinding,
  NativeModule,
  require: nativeModuleRequire
};

return loaderExports;
```
getInternalBinding定义...上方已定义
moduleIds定义
```c
NativeModuleEnv::Initialize(Local<Object> target, Local<Value> unused, Local<Context> context, void* priv) {
  target
      ->SetAccessor(env->context(),
                    FIXED_ONE_BYTE_STRING(env->isolate(), "moduleIds"),
                    ModuleIdsGetter,
                    nullptr,
                    MaybeLocal<Value>(),
                    DEFAULT,
                    None,
                    SideEffectType::kHasNoSideEffect)
      .Check();
}

void NativeModuleEnv::ModuleIdsGetter(Local<Name> property,
                                      const PropertyCallbackInfo<Value>& info) {
  Isolate* isolate = info.GetIsolate();

  std::vector<std::string> ids =
      NativeModuleLoader::GetInstance()->GetModuleIds();
  info.GetReturnValue().Set(
      ToV8Value(isolate->GetCurrentContext(), ids).ToLocalChecked());
}

std::vector<std::string> NativeModuleLoader::GetModuleIds() {
  std::vector<std::string> ids;
  ids.reserve(source_.size());
  for (auto const& x : source_) {
    ids.emplace_back(x.first);
  }
  return ids;
}

void LoadJavaScriptSource();  // Loads data into source_
```
js2c.py
```py
INITIALIZER = 'source_.emplace("{0}", UnionBytes{{{1}, {2}}});'
TEMPLATE = """
#include "env-inl.h"
#include "node_native_module.h"
#include "node_internals.h"

namespace node {{

namespace native_module {{

{0}

void NativeModuleLoader::LoadJavaScriptSource() {{
  {1}
}}

UnionBytes NativeModuleLoader::GetConfig() {{
  return UnionBytes(config_raw, {2});  // config.gypi
}}

}}  // namespace native_module

}}  // namespace node
"""
for filename in source_files['.js']:
    AddModule(filename, definitions, initializers)
initializer = INITIALIZER.format(name, var, size)
initializers.append(initializer)
out = TEMPLATE.format(definitions, initializers, config_size)
write_if_chaged(out, target)
```
最终生成 `node_javascript.cc`文件

require找到模块后逻辑
```js
compileForInternalLoader() {
    if (this.loaded || this.loading) {
      return this.exports;
    }

    const id = this.id;
    this.loading = true;

    try {
      const requireFn = StringPrototypeStartsWith(this.id, 'internal/deps/') ?
        requireWithFallbackInDeps : nativeModuleRequire;

      const fn = compileFunction(id);
      fn(this.exports, requireFn, this, process, internalBinding, primordials);

      this.loaded = true;
    } finally {
      this.loading = false;
    }

    ArrayPrototypePush(moduleLoadList, `NativeModule ${id}`);
    return this.exports;
}
```

```c
void NativeModuleEnv::CompileFunction(const FunctionCallbackInfo<Value>& args) {
  Environment* env = Environment::GetCurrent(args);
  CHECK(args[0]->IsString());
  node::Utf8Value id_v(env->isolate(), args[0].As<String>());
  const char* id = *id_v;
  NativeModuleLoader::Result result;
  MaybeLocal<Function> maybe =
      NativeModuleLoader::GetInstance()->CompileAsModule(
          env->context(), id, &result);
  RecordResult(id, result, env);
  Local<Function> fn;
  if (maybe.ToLocal(&fn)) {
    args.GetReturnValue().Set(fn);
  }
}
```

## electron中的模块

electron采用gn/ninja方式进行编译，其依赖文件中规定了对NodeJS的依赖：
DEPS
```
vars = {
  'node_version': 'v12.18.3'
}
deps = {
  'src/third_party/electron_node': {
    'url': (Var("nodejs_git")) + '/node.git@' + (Var("node_version")),
    'condition': 'checkout_node and process_deps',
  },
}

```
通过gclient sync安装依赖后，通过`script\lib\git.py`生成三方依赖的BUILD.gn文件

filenames.gni
```
lib_sources = [
  "shell/browser/api/electron_api_parfait.cc",
  "shell/browser/api/electron_api_parfait.h",
  ...
  "shell/common/api/electron_bindings.cc",
  "shell/common/api/electron_bindings.h",
]
```
BUILD.gn
```
source_set("electron_lib") {
  configs += [ "//third_party/electron_node:node_internals" ]
  deps = [
    ...
    "//third_party/electron_node:node_lib"
  ]
  sources = filenames.lib_sources
}

executable("electron_app") {
  deps = [
    ...
    ":electron_lib"
  ]
}
```

node_bindings.cc
```c
#define ELECTRON_BUILTIN_MODULES(V)      \
    V(electron_common_parfait)

#define V(modname) void _register_##modname();
ELECTRON_BUILTIN_MODULES(V)
#undef V
```
electron_api_parfait.cc
```c
NODE_LINKED_MODULE_CONTEXT_AWARE(electron_common_parfait, Initialize)
```
node_includes.h
```c
#define NODE_LINKED_MODULE_CONTEXT_AWARE(modname, regfunc) \
  NODE_MODULE_CONTEXT_AWARE_CPP(modname, regfunc, nullptr, NM_F_LINKED)
```