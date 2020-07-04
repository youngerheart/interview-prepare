<!-- TOC -->

- [有哪些浏览器本地储存](#有哪些浏览器本地储存)
  - [web storage与cookie的区别](#web-storage与cookie的区别)

<!-- /TOC -->

## 有哪些浏览器本地储存

* `localStorage` 永不过期（同源页面传值，可用storage监听）
* `sessionStorage` 关闭页面或浏览器后被清除（仅该页面有值，无事件）
* `cookie`

### web storage与cookie的区别
* 若只为本地存储，cookie大小受限，浪费带宽，但可以与后端交互，是HTTP规范的一部分
* 对于前端web storage操作已封装方便使用

