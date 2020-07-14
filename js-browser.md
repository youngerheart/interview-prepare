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
`window.addEventListener('message', ({key, oldValue, newValue}))`
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
performance.measure('measure', 'mark1', 'mark2');
// 获取所有mark类型的entries
var mark = window.performance.getEntriesByType('mark');
// 返回 [...{duration: 0,name, startTime}]
// 获取所有measure类型的entries
var measure = window.performance.getEntriesByType('measure');
// 返回 [...{duration: 0.1, name, startTime}]
// 通过名字获取
performance.getEntriesByName('measure'); 
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
