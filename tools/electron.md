<!-- TOC -->

- [electron](#electron)
  - [渲染进程与主进程通信原理](#渲染进程与主进程通信原理)

<!-- /TOC -->


## electron

主进程负责创建页面窗口、协调进程间通信、事件分发。为了安全考虑，原生 GUI 相关的 API 是无法在渲染进程直接访问的，它们必须通过 IPC 调用主进程。这种主从进程模型缺点也非常明显，即主进程单点故障。主进程崩溃或者阻塞，会影响整个应用的响应。比如主进程跑长时间的 CPU 任务，将阻塞渲染进程的用户交互事件。

* 主进程：进程间通信，窗口管理，下载，快捷键，托盘，session，可以使用Node
* 渲染进程：负责页面渲染，具体页面的业务处理。
* ServiceWorker(PWA)静态资源缓存，保证稳定加载

### 渲染进程与主进程通信原理
使用node的net模块实现，在windows下通过管道，mac下通过服务
