<!-- TOC -->

- [常用HTTP Code](#常用http-code)
- [从输入URL到页面加载完成都发生了什么](#从输入url到页面加载完成都发生了什么)
  - [缓存相关](#缓存相关)
  - [网络相关](#网络相关)
  - [浏览器相关](#浏览器相关)
- [DNS中为何域名解析用UDP，区域复制用TCP](#dns中为何域名解析用udp区域复制用tcp)
- [计算机网络体系](#计算机网络体系)
- [TCP报文/握挥手](#tcp报文握挥手)
  - [握手](#握手)
  - [挥手](#挥手)
  - [为何握手三次，挥手四次](#为何握手三次挥手四次)
  - [为何客户端在TIME-WAIT阶段要等2MSL](#为何客户端在time-wait阶段要等2msl)
- [cookie的优缺点](#cookie的优缺点)
  - [窃取Cookie等信息的方法](#窃取cookie等信息的方法)
- [HTML与XHTML的区别](#html与xhtml的区别)
- [网站文件资源优化](#网站文件资源优化)
- [浏览器缓存](#浏览器缓存)
  - [强缓存：浏览器在规定时间内强制使用缓存而不请求服务器](#强缓存浏览器在规定时间内强制使用缓存而不请求服务器)
  - [协商缓存：询问服务器是否需要使用浏览器缓存](#协商缓存询问服务器是否需要使用浏览器缓存)
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
  - [JWT的结构](#jwt的结构)
- [中间人攻击](#中间人攻击)
- [header与body是怎么做分隔的](#header与body是怎么做分隔的)
- [TCP和UDP的区别](#tcp和udp的区别)
  - [TCP](#tcp)
  - [UDP](#udp)
- [http1.0/1.1/2.0/https](#http101120https)
- [webp](#webp)
  - [原理](#原理)
  - [兼容性](#兼容性)
  - [应用](#应用)
- [PWA(Progressive Web Apps)渐进式增强web应用](#pwaprogressive-web-apps渐进式增强web应用)
  - [兼容性](#兼容性-1)
  - [使用](#使用)

<!-- /TOC -->

## 常用HTTP Code
* `100 Continue` 使用curl发送超过1k的post请求时，首先发送头信息包含`Expect:100-continue`的请求，服务器回复100，收到响应后发送post数据。
* `200 OK`/`201 Created`/`204 No Content`
* `301 Moved Permanently`永久移动/`302 Found`临时移动, 响应头中的Location字段来跳转/`304	Not Modified`浏览器会访问缓存资源
* `400 	Bad Request`请求语法错误，服务器无法理解/`401	Unauthorized`/`403 Forbidden`/`404 Not Found`/`405 Method Not Allowed`
* `500 Internal Server Error`内部错误/`502 Bad Gateway` 网关请求相关服务器时收到无效响应/`503	Service Unavailable` 由于超载或系统维护，暂时无法处理请求/`504 Gateway Timeout`

## 从输入URL到页面加载完成都发生了什么
结合浏览器performance.timing可以了解到详细过程
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
* 增删改查通常映射为POST/DELETE/PATCH(局部更新)PUT(替换)/GET，直接通过url参数增删改会造成CSRF攻击。安全性无区别。

## CORS
是一个W3C标准，全称`Cross-origin resource sharing` 跨域资源共享，克服了Ajax只能同源使用的限制
### 两种请求
浏览器将CORS请求分为两类：
简单请求:
1. 请求方法是以下三种之一`HEAD/GET/POST`（HEAD类似于GET但只请求HTTP头部分）
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
Access-Control-Allow-Credentials: true // 资格、资历.允许客户端携带验证信息，例如 cookie
Access-Control-Expose-Headers: 'Custom-Header' // 简单请求可以暴露的首部
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

**防范措施**
* 验证码：强制用户与应用进行交互，但并不能所有操作都加上验证码。
* Referer验证：验证请求源是否合法。
* token验证：在请求中以参数/http头字段的形式添加一个随机token（由后端经过验证而产生）如果某个请求不包含该token或不正确则拒绝请求。token需要被保存/有有效期/刷新机制等

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
### JWT的结构
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
私钥可以认真token的有效性，不要将私钥放在客户端。

## 中间人攻击
* 指攻击者与通讯的两端分别创建独立的联系，并交换其所收到的数据，使通讯的两端认为他们正在通过一个私密的连接与对方直接对话，但事实上整个会话都被攻击者完全控制。
**防范**
1. 客户端不要轻易相信证书：因为这些证书极有可能是中间人。
2. App 可以提前预埋证书在本地：意思是我们本地提前有一些证书，这样其他证书就不能再起作用了。

## header与body是怎么做分隔的
\r\n\r\n即两个换行->一个空行作为分隔

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

## http1.0/1.1/2.0/https
* 1.0: 每次连接无法复用，一个请求因为服务器正忙导致后面的请求被阻塞
* 1.1: 默认增加connection: Keep-Alive头保证TCP的长连接可复用。增加了请求头与响应头的分别，更多的缓存头: cache-control/ETag~if-not-matched/Last-Modified~If-Modified-Since
* 2.0: 多路复用: 通过单连接发起多重请求/响应。将通信单位缩小为帧。首部压缩。服务端推送。

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
      this.skipWaiting();
      return cache.addAll(urlsToCache);
    })
  );
});
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