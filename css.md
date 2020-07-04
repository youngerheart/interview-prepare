<!-- TOC -->

- [link与@import的区别](#link与import的区别)
- [position: absolute 与 fixed 的共同/不同点](#position-absolute-与-fixed-的共同不同点)
- [介绍一下盒子模型](#介绍一下盒子模型)
- [共有属性值](#共有属性值)
- [flex布局](#flex布局)
  - [flex-basis](#flex-basis)
  - [flex-grow](#flex-grow)
  - [flex-shrink](#flex-shrink)
  - [justify-content (排列-内容)](#justify-content-排列-内容)
  - [align-items (对其/校准-项)](#align-items-对其校准-项)
  - [flex-direction](#flex-direction)
- [vertical-align (垂直-对其)](#vertical-align-垂直-对其)

<!-- /TOC -->

## link与@import的区别
* link是html标签，会和其他资源同时加载。
* @import是在css语境中使用，其文件会在页面被加载完成后加载。

## position: absolute 与 fixed 的共同/不同点
* 改变行内元素的呈现方式为`inline-block`
* 使元素脱离文档流，不占用空间
* 默认浮动于原有位置

* absolute的根元素默认为`<html>`可以设置为其祖先的relative元素
* fixed总是相对于浏览器定位的

## 介绍一下盒子模型

## 共有属性值
* `initial` (初始的)设置该属性为它的默认值
* `inherit` (继承) 从父元素继承该属性

## flex布局
* flex: 屈伸，活动
* 语法: flex-grow flex-shrink flex-basis

### flex-basis
如果有值则占用空间为该值，如果没有或设为auto,子项空间为width/height的值

### flex-grow
瓜分basis逻辑后父元素的剩余空间（按照比例）。

### flex-shrink
吸收basis逻辑后子元素超出父元素的空间

### justify-content (排列-内容)
在主轴上的排列方式, 各项周围留有的空白
* `flex-start` (默认)从开头排列
* `flex-end`
* `center`  居中无间隙
* `space-between` (常用)顶格充满，两元素之前等间距
* `space-around` 充满，元素两边等间距

### align-items (对其/校准-项)
在侧轴上的排列方式
* `stretch` (默认)元素被拉伸以适应容器
* `center` 在侧轴上居中放置
* `flex-start`
* `flex-end`
* `baseline` 基线对其

*reduce: 缩小 reverse: 相反*
### flex-direction
排列方向
* `row` (默认) 左->右
* `row-reverse` 右->左
* `column` 上->下
* `column-reverse` 下->上

## vertical-align (垂直-对其)
* `baseline` (默认) 元素放置在父元素的基线上，表现为子元素的img标签下方会留白（给baseline下方留的空位-“幽灵空白节点”）再加个带背景的英文span则会明白
* 为了消除影响，可以使用 `bottom`, `middle`, `top` 等值，或设置字体大小为0

```
.dib-baseline {
  display: inline-block; width: 150px; height: 150px;
  border: 1px solid #cad5eb; background-color: #f0f3f9;
}

<span class="dib-baseline"></span>
<span class="dib-baseline">x-baseline</span>
```
第一个元素中没有内联元素，则baseline为margin下边缘，第二个是文字基线。
若将行高改为0，则字符占据的高度为0，高度起始位置变为字符垂直中线，文字一半位于容器上边缘外。
