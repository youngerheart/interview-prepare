<!-- TOC -->

- [有哪些浏览器本地储存](#有哪些浏览器本地储存)
  - [web storage与cookie的区别](#web-storage与cookie的区别)
- [DOM操作](#dom操作)
- [html5特性](#html5特性)
  - [移除元素](#移除元素)
- [iframe优缺点](#iframe优缺点)
- [实现多个标签页的通信](#实现多个标签页的通信)
  - [postMessage](#postmessage)
  - [storage](#storage)
- [performance](#performance)
  - [timing](#timing)
  - [navigation](#navigation)
  - [getEntries()](#getentries)
  - [mark()与measure()](#mark与measure)
  - [now()](#now)
- [切换标签页时改变该页title](#切换标签页时改变该页title)
- [document.write 与 innerHTML](#documentwrite-与-innerhtml)
- [优雅降级与渐进增强](#优雅降级与渐进增强)
- [Ajax写法](#ajax写法)
- [js异步与延迟加载](#js异步与延迟加载)
- [移动端触摸事件](#移动端触摸事件)
  - [四种touch事件](#四种touch事件)
  - [event对象参数](#event对象参数)
  - [注意](#注意)
- [移动端点击延迟](#移动端点击延迟)
  - [解决方案](#解决方案)
- [各种前端异常的捕获方式](#各种前端异常的捕获方式)

<!-- /TOC -->

## 有哪些浏览器本地储存

* `localStorage` 永不过期（同源页面传值，可用storage监听）
* `sessionStorage` 关闭页面或浏览器后被清除（仅该页面有值，无事件）
* `cookie`

### web storage与cookie的区别
* 若只为本地存储，cookie大小受限，浪费带宽，但可以与后端交互，是HTTP规范的一部分
* 对于前端web storage操作已封装方便使用

## DOM操作
* 创建
```js
createElement(tagName); // 创建一个具体元素 
createTextNode(textContent); // 创建一个文本节点
```
* 在文档中增删改查
```js
appendChild
removeChild
replaceChild
insertBefore // 在已有子节点前插入一个新的子节点
```
* 查找
```js
getElementById/TagName/Name
querySelector(All)
```

## html5特性
* 拖拽API
* 语义化标签 `header`/`nav`/`footer`/`aside`等
* 多媒体标签 `audio`/`video`
* 画布(canvas)API
* 地理(Geolocation)
```js
navigator.geolocation.getCurrentPosition(showPosition, showError);
function showPosition(position)
{
    x.innerHTML="纬度: " + position.coords.latitude + 
    "<br>经度: " + position.coords.longitude;    
}
function showError(error)
{
    switch(error.code) 
    {
        case error.PERMISSION_DENIED:
            x.innerHTML="用户拒绝对获取地理位置的请求。"
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML="位置信息是不可用的。"
            break;
        case error.TIMEOUT:
            x.innerHTML="请求用户地理位置超时。"
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML="未知错误。"
            break;
    }
}

```
* 本地存储 localStorage/sessionStorage
* 表单控件：input的`calendar`/`date`/`time`/`email`/ `url`/`search`，`progress`等
### 移除元素
纯表现型元素: `center`/`big`/`font`
对表现有影响的元素: `frameset`
*frame不能脱离framset单独使用的，不能放在body里面，放在body里面不生效*

## iframe优缺点
* 刷新页面只需要刷新一个框架页，减少数据加快速度。
* 并行加载，可用于加载读取缓慢的第三方内容，如广告。

* 会阻塞主界面的onload事件
* 会产生很多页面，不方便管理，代码复杂，无法被一些爬虫抓取。

## 实现多个标签页的通信
### postMessage
*只能由同一个window对象(window.opener或window.frames[0]来追溯)来发送与监听*
`window.postMessage(data, origin);`
* 部分浏览器只支持`data`为String，所以最好用JSON.stringify转一下
* origin为字符串，目标窗口的protocol://hostname:port，如果传递给任意窗口则设置为*，如果目标窗口与当前窗口同源，则设置为/
`window.addEventListener('message', ({data}))`

### storage
*同域下不同标签页的传值*
```
`window.addEventListener('storage', ({key, oldValue, newValue}))`
localStorage.setItem('key', 'value');
```

## performance
在页面onload之后才能拿到该对象
### timing
```js
// test
navigationStart: 1594265084893
domainLookupStart: 1594265084906
domainLookupEnd: 1594265084916
connectStart: 1594265084916
connectEnd: 1594265084989
responseEnd: 1594265085097
domComplete: 1594265089089
loadEventEnd: 1594265089090
```
**页面加载时间**
* `navigationStart` 一个浏览器中前一个网页unload的时间戳
* `loadEventEnd` 当前页onload执行完成的时间戳
**渲染时间**
* `domComplete` DOM树解析完成且资源准备就绪，document.readyState变为`complete`
* `responseEnd` http相应全部接受完成的时间，包括从本地读取缓存。
**DNS解析时间**
* `domainLookupEnd`, `domainLookupStart`
**TCP建立连接完成握手时间**
* `connectEnd`, `connectStart`

### navigation
返回导航信息
**type**
* 0 普通进入
* 1 通过刷新进入按钮, 快捷键刷新，location.reload
* 2 通过操作历史记录进入，包括前进后退快捷键，history操作
* 255 非以上途径进入

**redirectCount**
到达最终页前同源重定向次数

### getEntries()
返回所有http请求的`performance.timing`对象(无dom相关属性)，按照`startTime`排序

### mark()与measure()
用于性能标记/测量
```js
performance.mark('mark1')
// 进行某耗时操作
performance.mark('mark2')
// 保存测量
performance.measure('measure1', 'mark1', 'mark2');
// 获取所有mark类型的entries
var mark = window.performance.getEntriesByType('mark'); // 当前mark时间点的数据
// 返回 [...{duration: 0,name, startTime}]
// 获取所有measure类型的entries
var measure = window.performance.getEntriesByType('measure');
// 返回 [...{duration: 0.1, name, startTime}]
// getEntriesByType用的最多的是resource类型
// 通过名字获取
performance.getEntriesByName('measure1'); 
// 清除标记/测量
clearMarks(name)/clearMeasure(name)
```

### now()
返回当前相对于performance.timing.navigationStart的时间。

## 切换标签页时改变该页title
```js
document.addEventListener('visibilitychange', () => {
    document.title = document.visibilityState == 'hidden' ? '我傻了' : '我回来了'
})
```

## document.write 与 innerHTML
在onload之前执行write则与innerHTML相似(写到当前文档流)，之后则是直接重绘整个页面
innerHTML 是重绘页面的一部分。

## 优雅降级与渐进增强
* 在所有新式浏览器都能正常工作，如果是老式浏览器，逐步实现兼容或降级的体验。
* 被所有浏览器支持的基本功能开始，主播添加只有新式浏览器支持的功能以实现新特性。

## Ajax写法

```js
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) doSomething(xhr.responseText)
}
xhr.open('POST', 'URL', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(null)
```

## js异步与延迟加载
script标签中设置`defer="defer"`属性，只对外部文件有效，表明脚本不影响页面结构，即立即下载，延迟执行
script标签中设置`async`，只对外部文件有效，告诉浏览器立即下载文件，但不再保证他们的顺序

IntersectionObserver
resizeobserver

## 移动端触摸事件
### 四种touch事件
* touchstart // 手指放到屏幕上触发
* touchmove // 手指在屏幕上滑动时触发
* touchend // 手指离开屏幕时触发
* touchcancel // 系统取消touch事件时触发

### event对象参数
* touches // 屏幕上所有手指的列表
* targetTouches // 当前dom元素上手指的列表
* changedTouches // 涉及当前事件的手指列表
touches中包含如下信息：
* clientX/clientY // 触摸点相对于浏览器窗口的位置
* pageX/pageY // 触摸点相对于页面的位置
* screenX/screenY // 触摸点相对于屏幕位置
* target // 当前DOM元素

### 注意
手指在滑动整个屏幕时，会影响浏览器的行为，在调用touch事件时，要禁止缩放和滚动。
**2016年之后的浏览器基本设置过viewport就不会有300ms问题**
1. 禁止缩放
```
<meta name="viewport" content="user-scalable=no">
```
2. 禁止滚动
```
event.preventDefault();
```

## 移动端点击延迟
由于`双击缩放方案`移动端对于点击事件(click回调)会有300ms的延迟

### 解决方案
* 禁止缩放：大部分移动端可以解决延迟问题，但部分苹果手机不行。
* 自己封装函数：计算触摸开始到结束的时间,如果小于150ms,就执行回调函数,反之,如果大于150ms,或者期间移动了屏幕,就表示不是点击事件,就不必执行回调函数
```js
```
* fastclick.js： 
```js
FastClick.attach(document.body);
```
在检测到touchend事件时，立即触发一个模拟click，并将300ms后真正的click阻止掉，。
* 指针事件（pointer event）

## 各种前端异常的捕获方式
* js执行错误
```js
aler("hello") // alert 被写成了 aler
```
使用`window.onerror`来捕获。
**跨域脚本，为了防止信息泄露，不会展示语法错误具体信息，只会展示 Script error.**
可以先解决跨域：
* 客户端script标签添加 crossorigin="anonymous"
* 服务端响应header添加 Access-Control-Allow-Origin: *

对于setTimeout/setInterval，用新函数的try/catch包裹，有错误直接抛出
可捕获message/url/line/colume/other{stack/name}信息

* 资源加载错误
```js
<img src="test.jpg"> // 并不存在该图片，返回了404
```
使用`window.addEventListener('error')`捕获，在回调中对event.target进行筛选：
```js
// 筛选出js/css/image资源加载失败
let isElementTarget = target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement;
if (!isElementTarget) return false;
```
可捕获tagName/src/href信息
* http请求错误
```js
// 登陆账户时密码错误，因此会报403错误。
var xhr = new XMLHttpRequest()
xhr.open('POST', 'https://api.domain.com/login')
xhr.setRequestHeader('Content-Type', 'application/json')
xhr.send(JSON.stringify({
    email: 'help@domain.com',
    password: 'akhakfnak'
}))
```
对于xhr对象`xhr.addEventListener('error')`
可捕获error.target._requestUrl/status信息
* 未处理的promise
```js
Promise.reject("hello") // 该 reject 未被 catch。
```
通过`window.addEventListener('unhandledrejection')`来捕获。
可以得到error.reason信息。
