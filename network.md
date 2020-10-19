<!-- TOC -->

- [常用HTTP Code](#常用http-code)
- [从输入URL到页面加载完成都发生了什么](#从输入url到页面加载完成都发生了什么)
  - [缓存相关](#缓存相关)
  - [网络相关](#网络相关)
  - [浏览器相关](#浏览器相关)
- [DNS中为何域名解析用UDP，区域复制用TCP](#dns中为何域名解析用udp区域复制用tcp)
- [计算机网络体系](#计算机网络体系)
- [CDN原理](#cdn原理)
- [cookie的优缺点](#cookie的优缺点)
  - [窃取Cookie等信息的方法](#窃取cookie等信息的方法)
- [HTML与XHTML的区别](#html与xhtml的区别)
- [网站文件资源优化](#网站文件资源优化)
- [浏览器缓存](#浏览器缓存)
  - [强缓存：浏览器在规定时间内强制使用缓存而不请求服务器](#强缓存浏览器在规定时间内强制使用缓存而不请求服务器)
  - [协商缓存：询问服务器是否需要使用浏览器缓存](#协商缓存询问服务器是否需要使用浏览器缓存)
- [CSP(Content-Security-Policy)内容安全策略](#cspcontent-security-policy内容安全策略)
  - [介绍](#介绍)
  - [用法](#用法)
  - [限制项](#限制项)
- [解决跨域的方法](#解决跨域的方法)
  - [Cookie](#cookie)
  - [iframe](#iframe)
  - [window.postMessage](#windowpostmessage)
  - [AJAX](#ajax)
- [GET与POST区别](#get与post区别)
- [CORS](#cors)
  - [两种请求](#两种请求)
  - [简单请求](#简单请求)
  - [非简单请求](#非简单请求)
  - [CORS与JSONP](#cors与jsonp)
- [XSS与CSRF](#xss与csrf)
  - [XSS](#xss)
  - [CSRF](#csrf)
- [sql注入方法](#sql注入方法)
  - [类型](#类型)
  - [风险点](#风险点)
- [OAuth2与JWT](#oauth2与jwt)
  - [授权码式授权](#授权码式授权)
  - [隐藏式授权](#隐藏式授权)
  - [密码式授权](#密码式授权)
  - [凭证式授权](#凭证式授权)
  - [JWT](#jwt)
- [中间人攻击](#中间人攻击)
- [header与body是怎么做分隔的](#header与body是怎么做分隔的)
- [POST方法常用的content-type](#post方法常用的content-type)
- [TCP和UDP的区别](#tcp和udp的区别)
  - [TCP](#tcp)
  - [UDP](#udp)
- [TCP报文/握挥手](#tcp报文握挥手)
  - [握手](#握手)
  - [挥手](#挥手)
  - [为何握手三次，挥手四次](#为何握手三次挥手四次)
  - [为何客户端在TIME-WAIT阶段要等2MSL](#为何客户端在time-wait阶段要等2msl)
- [TCP重传机制](#tcp重传机制)
  - [超时重传](#超时重传)
  - [快速重传](#快速重传)
  - [SACK](#sack)
  - [Duplicate SACK](#duplicate-sack)
- [TCP滑动窗口](#tcp滑动窗口)
  - [发送方](#发送方)
  - [接收方](#接收方)
  - [接收窗口和发送窗口的大小是相等的吗？](#接收窗口和发送窗口的大小是相等的吗)
- [http1.0/http1.1/http2.0/https](#http10http11http20https)
  - [http2.0](#http20)
  - [http2.0下的前端优化](#http20下的前端优化)
  - [https](#https)
- [webp](#webp)
  - [原理](#原理)
  - [兼容性](#兼容性)
  - [应用](#应用)
- [PWA(Progressive Web Apps)渐进式增强web应用](#pwaprogressive-web-apps渐进式增强web应用)
  - [兼容性](#兼容性-1)
  - [使用](#使用)
- [RTMP](#rtmp)
- [webrtc](#webrtc)

<!-- /TOC -->

## 常用HTTP Code
* `100 Continue` 使用curl发送超过1k的post请求时，首先发送头信息包含`Expect:100-continue`的请求，服务器回复100，收到响应后发送post数据。
* `200 OK`/`201 Created`/`202 Accepted`已接受但未处理完成/`204 No Content`
* `301 Moved Permanently`永久移动/`302 Found`临时移动, 响应头中的Location字段来跳转/`304 Not Modified`浏览器会访问缓存资源
* `400 Bad Request`请求语法错误，服务器无法理解/`401	Unauthorized`/`403 Forbidden`/`404 Not Found`/`405 Method Not Allowed`
* `500 Internal Server Error`内部错误/`502 Bad Gateway` 网关请求相关服务器时收到无效响应/`503	Service Unavailable` 由于超载或系统维护，暂时无法处理请求/`504 Gateway Timeout`

## 从输入URL到页面加载完成都发生了什么
**结合浏览器performance.timing可以了解到详细过程**
### 缓存相关
1. 卸载原有页面: 以释放内存
2. 重定向: 如果有本地缓存则直接使用，否则向服务器进行请求
3. 应用缓存(app cache):
后端配置识别manifest.appcache文件，前端添加`<html lang="en" manifest="manifest.appcache">`以及配置清单文件
当第一次打开带有manifest属性的网页时，浏览器就会把离线文件下载下来，之后直接去缓存拿。
对应js API: `window.applicationCache`

### 网络相关
4. DNS(Domain Name System): 通过域名查询IP(使用UDP)
浏览器调用系统库的gethostbyname函数，系统通过网卡给DNS发送UDP请求。
如果主机查询的本地域名服务器不知道被查询的域名IP
递归查询>迭代查询
递归查询：向根域名服务器继续发出查询请求，根域名请求顶级域名，顶级请求权限域名...直到返回该域名IP
迭代查询：向根域名服务器继续发出查询请求，根域名返回顶级域名IP，主机请求顶级传回权限域名ip...直到返回该域名IP
5. TCP(Transmission Control Protocol/传输控制协议): HTTP的下层协议，连接握手断开挥手。
6. HTTP: 1.x版本中如果想并行请求必须使用多个TCP连接，浏览器对资源并发请求个数有限制。2.x版本可以将HTTP消息分解为不依赖的二进制帧，复用TCP来传输，在另一端组装。

### 浏览器相关
7. 文档解析与DOM加载
  1. 浏览器解析html源码，创建一个DOM树（完全和html标签对应）。并行请求css/images/js。
  2. 浏览器按优先级解析css代码，计算出样式数据，构建CSSOM树，忽略掉语法错误的部分。
  3. DOM Tree + CSSOM => rendering tree，这棵树会忽略掉不需要渲染的元素，如header, display:none的元素。每个节点都储存了css属性。
  4. 创建好rendering tree后绘制页面。DOM或CSSOM被修改都会导致上述步骤被重复执行。

## DNS中为何域名解析用UDP，区域复制用TCP
* UDP快，只需要请求和应答，但UDP传输内容不能超过512字节，符合DNS的应用场景。
* 辅助DNS服务器从主服务器复制大量DNS数据，超过512字节，且要求传输可靠性。

## 计算机网络体系
OSI体系分为七层，TCP/IP为五层协议
应用/表示/回话->应用(FTP/SMTP)
运输->运输(TCP/UDP)
网络->网络(IP)
数据链路层
物理层

## CDN原理
资源上传CDN后，访问时会经过以下步骤：
1. 经过本地的DNS解析，请求cname指向那台CDN的专用DNS服务器
2. DNS服务器返回全局负载均衡服务器IP
3. 用户请求全局负载均衡服务器，根据用户IP选择距离近且负载合适的缓存服务器IP给用户。没有对应内容时，该服务器会去上一级缓存服务器找并缓存于自身。

## cookie的优缺点
* 实现跨页面（非跨端口、域名、协议-跨域）全局变量
* 可以设置有效期限（"expires=" + new Date().toGMTString()）
* 储存在客户端，发送后由服务器读取(节省服务器资源)

* 可生成的cookie可能有条数/大小限制，会被清理/禁用
* 以明文储存在客户端，可能被窃取/篡改(使用HttpOnly防止js获取)

### 窃取Cookie等信息的方法
* 在被攻击页面XSS注入脚本，带上cookie跳转到攻击者的链接
* 中间人攻击

## HTML与XHTML的区别
`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">`
* XHTML标签必须被正确嵌套/关闭，不可大写
* XHTML文档必须拥有html根元素

## 网站文件资源优化
* 使用webpack-uglify对代码文件进行合并压缩混淆
* 使用CDN托管
* 使用多个域名提供缓存：浏览器针对同一域名的请求有6个左右的并发限制，将静态资源放在多个域名下就能实现与其他资源的并发请求。
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

## 浏览器缓存
### 强缓存：浏览器在规定时间内强制使用缓存而不请求服务器
**`Expire(GMTString)/Cache-Control(max-age)`**
### 协商缓存：询问服务器是否需要使用浏览器缓存
**`Last-Modified/If-Modified-Since`**

两者都是GMT格式时间字符串，具体过程：
浏览器第一次请求资源，服务器返回资源同时在响应头加上Last-Modified的header标识最后修改时间。浏览器再次请求时会在请求头加上If-Modified-Since的header，即上次Last-Modified的值。服务器判断如果资源没有变化则返回304。

**ETag/If-None-Match**

## CSP(Content-Security-Policy)内容安全策略
### 介绍
前端有著名的“同源策略”：一个页面资源只能从与之同源的服务器获取，不允许跨域获取。这样可以避免页面被注入恶意代码，影响安全。但也限制了前端灵活性。
通过csp的实质是白名单只读，开发者明确告诉客户端，哪些外部资源可以加载和执行。实现和执行全部由浏览器完成，开发者只需提供配置。大大增强了网页安全性，攻击者即使发现了漏洞，也没法注入脚本，除非还控制了一台可信主机。

### 用法
1. 通过HTTP头信息的`Content-Security-Policy`字段。
```
Content-Security-Policy: script-src 'self'; object-src 'none';
style-src cdn.example.org third-party.org; child-src https:
```
2. 通过网页的`<meta>`标签
```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org third-party.org; child-src https:">
```
### 限制项
**资源加载限制**
* `script-src` 外部脚本
* `style-src` 样式表
* `img-src` 图像
* `media-src` 媒体文件（音视频）
* `child-src` 框架
* `object-src` 插件（如flash）
**全局限制**
* `default-src` 用来设置上面各个选项的默认值，优先级较低
**URL限制**
* `frame-ancestors`：限制嵌入框架的网页
* `base-uri`：限制base#href(为所有相对url规定基准url)
* `form-action`：限制form#action（表单请求的url）
**其他限制**
* `block-all-mixed-content`：HTTPS 网页不得加载 HTTP 资源（浏览器已经默认开启）
* `upgrade-insecure-requests`：自动将网页上所有加载外部资源的 HTTP 链接换成 HTTPS 协议
* `plugin-types` 限制可以使用的插件格式
**report-uri**
可以告诉浏览器，应该把注入行为报告给哪个网址
* `report-uri /my_amazing_csp_report_parser`
浏览器会使用POST方法，发送一个JSON对象
```js
{
  "csp-report": {
    "document-uri": "http://example.org/page.html",
    "referrer": "http://evil.example.com/",
    "blocked-uri": "http://evil.example.com/evil.js",
    "violated-directive": "script-src 'self' https://apis.google.com",
    "original-policy": "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
  }
}
```
**选项值**
每个限制选项可以设置以下值，这些值构成了白名单
* 主机名 protrol://domain:port
* 路径名 example.org/resources/js/
* 通配符 *://*.example.com:*
* 协议名
* 关键词 self: 当前域名，none: 禁止加载任何外部资源。

## 解决跨域的方法
不同源的两个页面有三种限制
* Cookie/LocalStorage/indexDB无法读取
* DOM无法取得
* AJAX请求不能发送

### Cookie
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
在浏览器js的[实现多个标签页的通信](./js-browser.md#实现多个标签页的通信)章节。

### AJAX
同源政策规定，AJAX请求只能发给同源的网址，否则就报错。
* JSONP
* WebSocket
该协议头信息中有一个Origin，服务器可以根据这个字段判断是否许可本次通信。
* CORS

## GET与POST区别
* 都可以通过url与body传参，早期浏览器会有url长度限制（IE 2k,Chrome 8K）
* 增删改查通常映射为POST/DELETE/**PATCH(局部更新)**/**PUT(完整替换)**/GET，直接通过url参数增删改会造成CSRF攻击。安全性无区别。

## CORS
是一个W3C标准，全称`Cross-origin resource sharing`跨域资源共享，克服了Ajax只能同源使用的限制
### 两种请求
浏览器将CORS请求分为两类：
简单请求:
1. 请求方法是以下三种之一`HEAD/GET/POST`（HEAD类似于GET但只请求HTTP头部分）
2. http头信息不超出以下几种字段
* Accept
* Accept-Language
* Content-Language
* Content-Type `只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain`
这是为了兼容表单，因为表单一直可以发送跨域请求，会刷新页面不会把结果返回给js，相对安全。
不能满足上面两个条件的就属于非简单请求。

### 简单请求
对于简单请求，浏览器会在头信息中加一个Origin字段后，直接发起请求。
如果Origin指定的源不在许可范围，服务器会返回一个正常（为非跨域接口准备）的回应。
浏览器发现返回头中没有`Access-Control-Allow-Origin`字段，就知道出错，在xhr对象的onerror中返回该错误。
如果Origin指定的域名在许可范围，则返回头应该多出：
```js
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true // 资格、资历.允许客户端携带验证信息，例如 cookie
Access-Control-Expose-Headers: 'Custom-Header' // 客户端可以访问的额外首部
```
CORS请求时，xhr对象的getResponseHeader方法只能拿到六个字段
`Cache-Control/Content-Language/Content-Type/Expires(到期)/Last-Modified/Pragma(注释用于控制缓存的老字段,值: no-cache)`

**`xhr.withCredentials`**
如果要发送Cookie到服务器，一方面服务器端要指定`Access-Control-Allow-Credentials`为true，还要打开xhr对象的开关
```js
let xhr = new XMLHttpRequest;
xhr.widhCredentials = true; // 不需要cookie则不需要设置
```
### 非简单请求
非简单请求时非表单类有特殊要求的请求，比如方法是`PUT/DELETE`,Content-Type是`application/json`等。

**发送预检请求**
服务器发现一个非简单请求，就自动发出一个预检请求，要求服务器确认可以这样请求。
* 请求方式是`OPTIONS`，头信息里有`Origin: http://foo.example`以及两个特殊字段
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

## XSS与CSRF
### XSS
XSS(Cross Site Scripting)跨站脚本攻击
攻击原理：不需要登录验证，通过表单等输入项界面注入脚本。
可能的结果: 盗用Cookie/破坏页面解构/植入恶意广告。
攻击方式:
* 反射型: XSS代码出现在url中，服务器解析后返回，浏览器执行恶意代码。
* 储存型: 提交的代码储存在服务器端，下次请求无需提交XSS代码。
**防范措施**
1. 编码: 对用户输入的数据进行HTML Entity编码
*innerText会将所有文本转义*
```js
let dom = document.createElement('div');
let strToEntity = (str) => {
  dom.innerText = str;
  return dom.innerHTML;
}
```
2. 过滤: 对用户输入的富文本，过滤掉style/script/iframe标签
3. 校正: 不要直接对Entity字符串进行解码，先使用真实dom转换一遍，校正不配对的标签，再做一遍标签过滤。

### CSRF
CSRF(Cross-site request forgery) 跨站请求伪造
攻击者借助受害者的Cookie以受害者的名义伪造请求发送给受攻击服务器，执行操作。
例子:
一个BBS站点
http://www.c.com
当用户登录之后，会设置如下 cookie：
res.setHeader('Set-Cookie', ['user=2333; expires=Sat, 21 Jul 2020 00:00:00 GMT;'])当登录后的用户发起如下 GET 请求时，会删除 ID 指定的帖子：
http://www.c.com:8002/content/delete/:id
攻击者准备页面:
```html
<img src="http://www.c.com:8002/content/delete/87343">
```
则当用户访问攻击者的网站时，会向www.c.com发起一个删除帖子请求，若用户再到www.c.com刷新，会发现该帖子已经被删除。

假如博客园还是有个加关注的接口，不过已经限制了只获取POST请求的数据。这个时候就做一个第三方的页面，但里面包含form提交代码，然后通过QQ、邮箱等社交工具传播，诱惑用户去打开，那打开过博客园的用户就中招了。嵌入frame中更可以增加隐蔽性。

**防范措施**
* 验证码：强制用户与应用进行交互，但并不能所有操作都加上验证码。
* Referer验证：Referer得到的是完整的URL，可以验证请求源是否合法。
* token验证：在请求中以参数/http头字段的形式添加一个随机token（由后端经过验证而产生）如果某个请求不包含该token或不正确则拒绝请求。token需要被保存/有有效期/刷新机制等
  1. 用户访问某个表单页面。
  2. 服务端生成一个Token，放在用户的Session中，或者浏览器的Cookie中。
  3. 在页面表单附带上Token参数。
  4. 用户提交请求后， 服务端验证表单中的Token是否与用户Session（或Cookies）中的Token一致，一致为合法请求，不是则非法请求。
这个Token的值必须是随机的，不可预测的。由于Token的存在，攻击者无法再构造一个带有合法Token的请求实施CSRF攻击。另外使用Token时应注意Token的保密性，尽量把敏感操作由GET改为POST，以form或AJAX形式提交，避免Token泄露。

## sql注入方法
假设服务器未开启`magic_quote_gpc`
### 类型
* 数字型
在url中发现`HTTP://www.aaa.com/test.php?id=1`猜测sql语句为`where id = 1`

* 字符型
登录表单，猜测有如下sql: `SELECT * FROM table WHERE username = 'admin'`
在用户名输入框输入`' or 1=1#`密码随便输入，则sql变为
`select * from users where username='' or 1=1#' and password=md5('')` // #后面的被注释了
### 风险点
* 通过报错消息提取表结构
```js
// Select指定的每一列都应该出现在Group By子句中，除非对这一列使用了聚合函数
SELECT * FROM user WHERE username = 'root' AND password = 'root' HAVING 1 = 1 --
// 报错：user.id无效，需要在聚合函数或者groupby中
// having语句需要配合group by使用。递归后可以获取表名与所有字段名
SELECT * FROM user WHERE username = 'abc' AND password = 'abc' AND 1 > (SELECT TOP 1 username FROM users)
// 报错：第一个用户名root转换为int类型时失败
```

## OAuth2与JWT
OAuth 就是一种授权机制。数据的所有者告诉系统，同意授权第三方应用进入系统，获取这些数据。系统从而产生一个短期的进入令牌（token），用来代替密码，供第三方应用使用。OAuth 2.0 的标准是 RFC 6749。

### 授权码式授权
第三方应用先申请一个授权码，再用该码从后端申请令牌，所有与资源服务器的通信都在后端完成，避免令牌泄漏。
1. A网站提供链接跳转到B网站:
```
https://b.com/oauth/authorize?
  response_type=code& // 要求返回授权码
  client_id=CLIENT_ID& // CLIENT_ID在请求
  redirect_uri=CALLBACK_URL& // 结果得出后跳转页面
  scope=read // 授权范围
```
2. B站要求登录后跳转回A:
```
https://a.com/callback?code=AUTHORIZATION_CODE
```
`AUTHORIZATION_CODE`即授权码
3. A在拿到授权码后可以在后端向B请求令牌
```
https://b.com/oauth/token?
 client_id=CLIENT_ID& // 确认身份
 client_secret=CLIENT_SECRET& // 后端保密参数，验证身份
 grant_type=authorization_code& // 授权方式
 code=AUTHORIZATION_CODE& // 上一步的授权码
 redirect_uri=CALLBACK_URL // 回调地址
```
4. B收到请求后颁发令牌，向CALLBACK_URL发送一段JSON数据
```
{    
  "access_token":"ACCESS_TOKEN",
  "token_type":"bearer",
  "expires_in":2592000,
  "refresh_token":"REFRESH_TOKEN",
  "scope":"read",
  "uid":100101,
  "info":{...}
}
```

### 隐藏式授权
对于纯前端应用，必须将令牌储存在前端。
1. A跳转到B站授权
```
https://b.com/oauth/authorize?
  response_type=token& // 要求直接返回令牌
  client_id=CLIENT_ID&
  redirect_uri=CALLBACK_URL&
  scope=read
```
2. 授权后B会跳回redirect_uri指定的网址，把令牌作为hash参数（浏览器跳转时hash不会发送到服务器，减少”中间人攻击“泄漏令牌风险）
```
https://a.com/callback#token=ACCESS_TOKEN
```
该方式很不安全，令牌时间必须非常短（如一个session期间有效）

### 密码式授权
使用用户名和密码申请令牌
1. A网站要求用户提供B网站的用户名和密码，之后向B请求令牌
```js
https://oauth.b.com/token?
  grant_type=password& // 请求使用密码式授权
  username=USERNAME&
  password=PASSWORD&
  client_id=CLIENT_ID
```
2. B网站验证身份通过后，直接给出令牌。这时不需要跳转，直接通过HTTP响应返回JSON数据。

该方式风险很大，只适用于其他授权方式无法采用的情况，必须是用户高度信任的应用。

### 凭证式授权
适用于没有前端的命令行应用。
1. A应用在命令行向B发出请求
```js
https://oauth.b.com/token?
  grant_type=client_credentials& // 请求使用凭证式授权
  client_id=CLIENT_ID&
  client_secret=CLIENT_SECRET
```

2. B验证通过后，直接返回令牌。

这种令牌是针对第三方应用而不是某个用户的，可能多用户共享。

JWT(JSON Web Token) 是一个开放标准(RFC 7519)，通过数字签名将JSON对象加密，安全传输信息。
### JWT
目前最流行的跨域认证解决方案
* 服务器认证后，生成一个JSON对象，返回给用户，之后用户与服务器通信都要发回这个JSON对象，服务器只靠改对象认定用户身份。
* 为了防止用户篡改数据，服务器会加上签名，服务器不保留任何数据。
* 数据结构
*Header.PayLoad.Signature*
1. Header
```js
{
  "alg": 'HS256', // 加密算法
  "typ": 'JWT' // token类型
}
```
2. PayLoad(claims)
载荷(声明)
```js
{
  "sub":"1234567890",
  "name":"John Doe",
  "admin":true,
  "exp": '' // 失效时间
}
```
3. Signature
签名，使用一个私钥（private key）通过特定算法对Header和Claims进行混淆产生签名信息。
私钥可以认证token的有效性，不要将私钥放在客户端。

* 使用方式
客户端收到JWT，可以储存在LocalStorage，客户端发送请求时将jwt放在头信息的Authorization中。
* jwt可以减少数据库查询，最大缺点是服务器不保存session状态，无法在使用过程更改/废除token，除非服务器有额外逻辑。
* 应该设置短的有效期，并使用https协议传输。

## 中间人攻击
* 指攻击者与通讯的两端分别创建独立的联系，并交换其所收到的数据，使通讯的两端认为他们正在通过一个私密的连接与对方直接对话，但事实上整个会话都被攻击者完全控制。
**防范**
1. 客户端不要轻易相信证书：因为这些证书极有可能是中间人。
2. App 可以提前预埋证书在本地：意思是我们本地提前有一些证书，这样其他证书就不能再起作用了。

## header与body是怎么做分隔的
\r\n\r\n即两个换行->一个空行作为分隔

## POST方法常用的content-type
**四种常见的 POST 提交数据方式对应的content-type取值**
* `application/x-www-form-urlencoded;charset=utf-8` POST表单常规的提交方式，数据按照`key1=val1&key2...`进行url编码
* `multipart/form-data` (多段文件)当使用表单上传文件时需要让form标签的`enctyped`属性为该值。http body每部分都是以 --boundary 开始，紧接着内容描述信息，然后是回车，最后是字段具体内容（文本或二进制）。如果传输的是文件，还要包含文件名和文件类型信息。消息主体最后以 --boundary-- 标示结束
* `application/json` 可以方便的提交复杂的结构化数据，特别适合 RESTful 的接口。
* `text/xml(html/plain)` 解析为xml，html或文本

## TCP和UDP的区别
* TCP面向连接，提供可靠服务，UDP无连接，不保证可靠交付
* UDP没有堵塞控制，不会降低传输速率。
* TCP支持点到点，UDP支持多端交互。
* TCP是全双工可靠信道，UDP是不可靠信道。

### TCP
* 优点：可靠稳定，在数据传输前握手建立连接，在数据传递时有确认/窗口/重传/堵塞控制机制，传输后可以断开连接解决资源。
* 缺点：慢，效率低，占用资源该，易被攻击。每个连接都要占用资源。TCP机制被人利用实现DDOS攻击
* 应用场景：整个数据要精确无误的传递给对方-HTTP/FTP/SMTP

### UDP
* 优点：无状态传输，很快。漏洞少。
* 缺点：不可靠，不稳定，网络不好容易丢包
* 应用场景：语音/视频/游戏

## TCP报文/握挥手
TCP header中包含有
* 序号(Seq/sequence number)用来标识从TCP源端向目的地端发送的字节流，发起方发送数据时标记。
* 确认号(Ack/acknowledgement number)只有Ack为1时，序号字段才有效，Ack = Seq + 1。
* 标志位(Flags)包括URG(标志紧急指针有效)/ACK(确认序号有效)/PSH(接收方应该尽快将报文交给应用层)/RST(重置连接)/SYN(发起新连接)/FIN(释放连接)

### 握手
客户端主动结束CLOSED阶段，服务端被动结束CLOSED阶段进入LISTEN阶段
1. 客户端向服务器发送报文：
Flags为SYN，表示“创建新链接”
Seq为X(X一般为1)，之后客户端进入SYN-SEND阶段
2. 服务器端收到请求后，结束LISTEN阶段并返回报文：
Flags为SYN和ACK，表示“创建新链接/确定客户端Seq序号有效，可以正常接收数据同意创建连接”
Seq为Y，ACK为X+1，表示收到客户端序号，将其+1作为自己的确认号，之后服务器进入SYN-RCVD阶段
3. 客户端收到响应后，明确了数据传输正常，结束SYN-SENT阶段并返回报文：
Flag为ACK，表示“响应有效”
Seq为X+1，表示收到服务器端的确认号，将其作为自己的序号
Ack为Y+1，表示收到服务器端序号，将其+1作为自己的确认号。
随后客户端进入ESTABLISHED阶段，服务端接收到报文后也进入ESTABLISHED阶段。

### 挥手
两端都在ESTABLISHED阶段
1. 客户端向服务器端发送报文：
Flags为FIN，表示“请求释放链接”
Seq为A，之后客户端进入FIN-WAIT-1(半关闭/停止发送普通数据)阶段。
2. 服务器收到请求后，结束ESTABLISHED阶段并返回报文：
Flags为ACK，表示“接收到服务端的释放连接请求”
Seq为B，Ack为A+1，表示收到客户端序号并+1作为自己的确认号。
随后服务端进入CLOSE-WAIT阶段，准备释放与该客户端的连接
客户端收到响应后结束FIN-WAIT-1阶段进入FIN-WAIT-2阶段
3. 服务器做好了释放连接准备，结束CLOSE-WAIT阶段，再次向客户端发出TCP报文：
Flags为FIN，ACK，表示已经知晓客户端请求，并做好释放连接准备
Seq为C，Ack为A+1，表示不同的序号，但确认号相同
随后服务端进入LAST-ACK阶段，停止向客户端发送任何收据但可以接收数据
4. 客户端收到服务端的报文，结束FIN-WAIT-2阶段，并向服务端发送报文
Flags为ACK，表示“接收到服务器准备好释放链接的信号”
Seq为A+1，表示收到服务器的确认号并作为自己的序号
Ack为C+1，表示收到服务器端序号并+1作为自己的确认号
随后客户端进入TIME-WAIT阶段开始等待2MSL，之后进入CLOSED阶段

### 为何握手三次，挥手四次
建立连接时，被动方服务器端结束CLOSED阶段不需要准备，可以直接返回SYN（创建连接）与ACK（确认序号有效）
释放连接时，被动方服务器突然收到请求时不能立即释放连接，因为还有必要的数据要处理，所以先返回ACK确认序号有效，经过CLOSE-WAIT准备好后返回FIN、ACK释放连接报文。

### 为何客户端在TIME-WAIT阶段要等2MSL
MSL(Maximum Segment Lifetime)指一段TCP报文在传输过程中的最大生命周期，2MSL即服务端发出FIN和客户端发出ACK所能保持的最大时长
如果在2MSL中又接收到服务器的FIN，说明服务器端由于网络原因没收到客户端的ACK，客户端再次发送ACK重新开始等待2MSL。

## TCP重传机制
### 超时重传
设置一个定时器，当超过指定时间（超时重传时间 RTO 的值应该略大于报文往返 RTT 的值），没有收到对方的ACK确认应答报文（数据包丢失/确认应答丢失），就会重发该数据。
* 问题：增加延迟，在等待时之后的报文被接收但无法被确认，发送端会认为也丢失了，从而引起不必要的重传。
### 快速重传
不以时间为驱动，而是以数据驱动重传。如果一次发送10字节，发送方的seq=11丢失，接收方的ack会总是11来迫使发送方重传，连续收到三个ack为11后发送方重新发送。
* 问题：是重传之前的一个，还是重传所有（第一次丢失之后的数据也有可能丢失），根据TCP的不同实现，以上两种都有可能。
### SACK
每次请求重传的ack携带上之前丢失的`ACK200`和缓存标识`SACK300-400`，让发送方知道哪些数据没接收到，即可只重传丢失的数据。
### Duplicate SACK
接收方成功收到数据，但是应答报文丢失，发送方超时重发后接收端返回最后丢失应答包报文的`ACK400`与已经收到的`SACK200-300`告诉发送端只是应答报文丢了

## TCP滑动窗口
TCP需要每个数据包发送有应答，再发送下一个，则往返时间越长通信效率越差。TCP引入了窗口的概念，指无需确认应答，可以继续发送数据的最大值
* 累积确认：滑动窗口方式中只要最后一个应答报文接收到，意味着之前所有数据都收到了
* window：窗口大小，接收端告诉发送端自己还有多少缓冲区可以接收数据
### 发送方
* 缓存数据包括：已发送并收到ack确认的数据/已发送未收到ack确认的数据/未发送但大小在接收方处理范围内(可用窗口)/未发送但大小超过接收方处理范围。发送中+可用为发送窗口。收到应答后发送窗口缩小，可用窗口扩大，可继续使用。
* 使用三个指针跟踪滑动窗口：SND.WND：表示发送窗口的大小。SND.UNA：指向已发送但未收到确认的第一个字节的序列号。SND.NXT：指向未发送但可发送范围的第一个字节的序列号。
### 接收方
* 缓存数据包括：已成功接收并确认的数据/未收到但可以接收的空间(RCV.WND)/未收到数据但不可以接收的空间
* 使用两个指针跟踪滑动窗口：RCV.WND：表示接收窗口的大小，它会通告给发送方。RCV.NXT：指向未收到数据但可以接收的空间的第一个字节。

### 接收窗口和发送窗口的大小是相等的吗？
并不是完全相等，接收窗口的大小是约等于发送窗口的大小的。因为滑动窗口并不是一成不变的。比如，当接收方的应用进程读取数据的速度非常快的话，这样的话接收窗口可以很快的就空缺出来。那么新的接收窗口大小，是通过 TCP 报文中的 Windows 字段来告诉发送方。那么这个传输过程是存在时延的，所以接收窗口和发送窗口是约等于的关系。



## http1.0/http1.1/http2.0/https
* 1.0: 每次连接无法复用，一个请求因为服务器正忙导致后面的请求被阻塞
* 1.1: 默认增加connection: Keep-Alive头保证TCP的长连接可复用。增加了请求头与响应头的分别，更多的缓存头: cache-control/ETag~If-Not-Match/Last-Modified~If-Modified-Since

### http2.0
* 多路复用: 将通信单位缩小为二进制帧，在双端拆分/拼装文件，可以通过单连接发起多重请求/响应。
* 首部压缩: 共同维护一份静态字典(键值对列表)，使用一个字符表示。共同维护一个动态词典，可动态添加内容。
* 服务端推送: 为了改善延迟，HTTP/2引入了server push（可通过nginx设置），它允许服务端推送资源给浏览器，在浏览器明确地请求之前。一个服务器经常知道一个页面需要很多附加资源，在它响应浏览器第一个请求的时候，可以开始推送这些资源。这允许服务端去完全充分地利用一个可能空闲的网络，改善页面加载时间。
* nginx配置:
```
./configure ...–with-http_v2_module // 安装注入编译参数

server {
  listen 443 ssl http2;
  server_name www.timehub.cc
}
```
### http2.0下的前端优化
**通用优化方法**
* 非同域名的请求与页面跳转，需要DNS，TCP，HTTP三种开销。
* 使用CDN
* 压缩传输的数据-gzip
* 客户端缓存资源
* 优化接口调用

**独有优化方法**
* HTTP/1.x中浏览器一般每个域名最多同时使用6个连接，所以采用域名分片突破连接数限制。http2中不要这样做。
* 不需要做文件合并，使用小的颗粒化资源，优化缓存政策（均可独立缓存）
* 不需要做内联资源，可以用server push替代

### https
服务器端的公钥和私钥，用来进行非对称加密
客户端生成的随机密钥，用来进行对称加密
一个HTTPS请求实际上包含了两次HTTP传输，可以细分为8步。
1. 客户端向服务器发起HTTPS请求，连接到服务器的443端口
2. 服务器端有一个密钥对，即公钥和私钥，是用来进行非对称加密使用的，服务器端保存着私钥，不能将其泄露，公钥可以发送给任何人。
3. 服务器将自己的公钥发送给客户端。
4. 客户端收到服务器端的证书之后，会对证书进行检查，验证其合法性，如果发现发现证书有问题，那么HTTPS传输就无法继续。严格的说，这里应该是验证服务器发送的数字证书的合法性。如果公钥合格，那么客户端会生成一个随机值，这个随机值就是用于进行对称加密的密钥，我们将该密钥称之为client key，即客户端密钥，这样在概念上和服务器端的密钥容易进行区分。然后用服务器的公钥对客户端密钥进行非对称加密，这样客户端密钥就变成密文了，至此，HTTPS中的第一次HTTP请求结束。
5. 客户端会发起HTTPS中的第二个HTTP请求，将加密之后的客户端密钥发送给服务器。
6. 服务器接收到客户端发来的密文之后，会用自己的私钥对其进行非对称解密，解密之后的明文就是客户端密钥，然后用客户端密钥对数据进行对称加密，这样数据就变成了密文。
7. 然后服务器将加密后的密文发送给客户端。
8. 客户端收到服务器发送来的密文，用客户端密钥对其进行对称解密，得到服务器发送的数据。这样HTTPS中的第二个HTTP请求结束，整个HTTPS传输完成。

## webp
### 原理
对图片进行分块，对待填充的宏块使用帧间隔预测技术，编码预测值和原值的差值，减少了体积，使用了更优秀的编码。
### 兼容性
最新版(2020)safari/safari mobile与绝大部分其他浏览器`80.9%`
### 应用
* 首先使用`"data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"`对img.src赋值，如果ima.onerror则不支持。
* 在Nginx的http模块开启webp(google开发的PageSpeed模块)
```
pagespeed on;
pagespeed FileCachePath "/var/cache/ngx_pagespeed/";
```
* 在主机配置增加代码
```
pagespeed EnableFilters convert_png_to_jpeg,convert_jpeg_to_webp;
```
则nginx会帮助更改源码，在Chrome下返回转换后的webp

## PWA(Progressive Web Apps)渐进式增强web应用
谷歌以Service Worker API为核心实现的web应用。
### 兼容性
* 除老版safari和IE的94%的浏览器
### 使用
* 使用HTTPS访问，SSL设置正确
* 注册：在网站页面上注册实现ServerWorker功能逻辑的脚本
* 不要给/sw/sw.js设置缓存（为了强刷缓存，浏览器会比较新旧文件，有更新就install）！不要设置版本号（旧版本把index.html存起来就傻了）！
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw/sw.js', {scope: '/'}) // 通过scope设置作用域范围
    .then(registration => console.log('ServiceWorker 注册成功！作用域为: ', registration.scope))
    .catch(err => console.log('ServiceWorker 注册失败: ', err));
}
```
* 安装：在`sw.js`中实现
```js
// 用于标注创建的缓存，也可以根据它来建立版本规范
const CACHE_NAME = 'younger_cache_v1.0.0';
// 列举要默认缓存的静态资源，一般用于离线使用
const urlsToCache = [
  'https://www.a.com/offline.html',
  'https://www.a.com/offline.png'
];
 
// this 为当前 scope 内的上下文
this.addEventListener('install', event => {
  // event.waitUtil 用于在安装成功之前执行一些预装逻辑
  // 但是建议只做一些轻量级和非常重要资源的缓存，减少安装失败的概率
  // 失败后会变为redundant状态
  // 安装成功后 ServiceWorker 状态会从 installing 变为 installed
  event.waitUntil(
    // 使用 cache API 打开指定的 cache 文件
    caches.open(CACHE_NAME).then(cache => {
      console.log(cache);
      // 添加要缓存的资源列表
      this.skipWaiting(); // 强制刷新
      return cache.addAll(urlsToCache);
    })
  );
});
navigator.serviceWorker.addEventListener('controllerchange', () => {
  window.location.reload(); // 强制更新后刷新页面
})
```
* 如果希望强制更新ServiceWorker，可以在install中使用this.skipWaiting方法，直接进入active阶段，再通过全局的clients.claim()更新。
* 当浏览器发起请求时，会触发fetch事件，拦截到当前作用域所有的http/https请求，给出自己的响应。
```js
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(hit => {
      // 返回缓存中命中的文件
      if (hit) {
        return hit;
      }

      const fetchRequest = event.request.clone();

      if (navigator.online) {
        // 如果为联网状态
        return onlineRequest(fetchRequest);
      } else {
        // 如果为离线状态
        return offlineRequest(fetchRequest);
      }
    })
  );
});
```
* SW 的生命周期 (install -> waiting(等待老版本退出) -> activate -> fetch)

## RTMP
1. 在TCP/IP协议之上的应用层协议，有多个变种(rtmpx)默认为使用1935端口的明文协议。
2. RTMP的数据单元被称为消息(Message)。传输数据时，消息被拆成消息块。
3. 

## webrtc
web层主要接口：
* MediaStream: 采集音视频
* RTCPeerConnection: 传输音视频
* RTCDataChannel: 传输自定义数据

webrtc使用的udp，但不是普通的udp，在udp上做了很多优化
