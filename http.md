<!-- TOC -->

- [cookie的优缺点](#cookie的优缺点)
- [HTML与XHTML的区别](#html与xhtml的区别)
- [网站文件资源优化](#网站文件资源优化)
- [解决跨域的方法](#解决跨域的方法)
  - [Cookie/iframe](#cookieiframe)
  - [iframe](#iframe)
  - [window.postMessage](#windowpostmessage)
  - [LocalStorage](#localstorage)
  - [AJAX](#ajax)
- [CORS](#cors)
  - [两种请求](#两种请求)
  - [简单请求](#简单请求)
  - [非简单请求](#非简单请求)
  - [CORS与JSONP](#cors与jsonp)

<!-- /TOC -->

## cookie的优缺点

* 实现跨页面（非跨端口、域名、协议-跨域）全局变量
* 可以设置有效期限（"expires=" + new Date().toGMTString()）
* 储存在客户端，发送后由服务器读取(节省服务器资源)

* 可生成的cookie可能有条数/大小限制，会被清理/禁用
* 以明文储存在客户端，可能被窃取/篡改(使用HttpOnly防止js获取)

## HTML与XHTML的区别
`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">`
* XHTML标签必须被正确嵌套/关闭，不可大写
* XHTML文档必须拥有html根元素

## 网站文件资源优化
* 使用webpack-uglify对代码文件进行合并压缩混淆
* 使用CDN托管
* 使用多个域名提供缓存：针对同一域名的请求有6个左右的并发限制，将静态资源放在多个域名下就能实现与其他资源的并发请求。
* 使用Expire/Cache-Control/ETag头
```
Cache-Control: max-age=30 // 保存30秒
// Expries 是之前用来控制缓存的http头，Cache-Control是新版
Expries: Wed, 08 Jul 2020 14:57:25 GMT
```
* 使用ETag头
在服务器端响应时，计算出文件的MD5值，使用`ETag`字段返回给浏览器。
则下次请求该文件时浏览器会带上一个`If-None-Match`字段来返回给后端。
如果为同一MD5值，则返回304即可，否则返回文件内容

*使用`Cache-Control`在缓存未过期之前不会发起请求，`ETag`还是会发起*

## 解决跨域的方法
不同源的两个页面有三种限制
* Cookie/LocalStorage/indexDB无法读取
* DOM无法取得
* AJAX请求不能发送

### Cookie/iframe
* 同一个一级域名的网页支持通过设置一样的`document.domain`共享cookie
* 服务器可以在设置Cookie的时候指定其所属域名为一级域名，则前端不用做操作:
`Set-Cookie: key=value; domain=.example.com; path=/`
### iframe
如果iframe不是同源，就会报错
```js
// 一级域名相同可以设置document.domain
document.getElementById("myIFrame").contentWindow.document // 在父窗口
window.parent.document.body // 在子窗口
// Uncaught DOMException: Blocked a frame from accessing a cross-origin frame.
```

* hash识别符
只是改变url的hash部分，页面不会刷新，父子之间都可以改变，监听hashchange事件可以得到通知


### window.postMessage
### LocalStorage
在浏览器js的[实现多个标签页的通信](./js-browser.md#实现多个标签页的通信)章节。

### AJAX
同源政策规定，AJAX请求只能发给同源的网址，否则就报错。
* JSONP
* WebSocket
该协议头信息中有一个Origin，服务器可以根据这个字段判断是否许可本次通信。
* CORS

## CORS
是一个W3C标准，全称`Cross-origin resource sharing` 跨域资源共享，克服了Ajax只能同源使用的限制
### 两种请求
浏览器将CORS请求分为两类：
简单请求:
1. 请求方法是以下三种之一`HEAD/GET/POST`
2. http头信息不超出以下几种字段
* Accept
* Accept-Language
* Content-Language
* Content-Type `只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain`
这是为了兼容表单，因为表单一直可以发送跨域请求。
不能满足上面两个条件的就属于非简单请求。

### 简单请求
对于简单请求，浏览器会在头信息中加一个Origin字段后，直接发起请求。
如果Origin指定的源不在许可范围，服务器会返回一个正常（为非跨域接口准备）的回应。
浏览器发现返回头中没有`Access-Control-Allow-Origin`字段，就知道出错，在xhr对象的onerror中返回该错误。
如果Origin指定的域名在许可范围，则返回头应该多出：
```js
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true // 资格、资历
Access-Control-Expose-Headers: 'Custom-Header'
```
CORS请求时，xhr对象的getResponseHeader方法只能拿到六个字段
`Cache-Control/Content-Language/Content-Type/Expires(到期)/Last-Modified/Pragma(注释用于控制缓存的老字段,值: no-cache)`

**`xhr.widthCredentials`**
如果要发送Cookie到服务器，一方面服务器端要指定`Access-Control-Allow-Credentials`为true，还要打开xhr对象的开关
```js
let xhr = new XMLHttpRequest;
xhr.widhCredentials = true;
```
### 非简单请求
非简单请求时非表单类有特殊要求的请求，比如方法是`PUT/DELETE`,Content-Type是`application/json`等。

**发送预检请求**
服务器发现一个非简单请求，就自动发出一个预检请求，要求服务器确认可以这样请求。
* 请求方式是`OPTIONS`，头信息里有`Origin`以及两个特殊字段
* `Access-Control-Request-Method` 列出该CORS请求会用到哪些HTTP方法
* `Access-Control-Request-Headers` 指定该CORS请求会额外发送的头信息

**响应**
服务器端检查了上述字段没问题后，返回下述字段
* `Access-Control-Allow-Origin`
* `Access-Control-Allow-Methods`
* `Access-Control-Allow-Headers`
* `Access-Control-Allow-Credentials`
* `Access-Control-Max-Age`
如果服务器否定预检要求会返回一个正常的无任何CORS头信息的响应，会触发xhr.onerror。

**预检后的请求与响应**
每次请求都会被浏览器加上Origin字段，每次响应都需要加上Access-Control-Allow-Origin字段。

### CORS与JSONP
JSONP只支持GET请求，CORS支持所有类型。JSONP对于老浏览器支持好，可以向不支持CORS的网站请求数据。
