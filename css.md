<!-- TOC -->

- [link与@import的区别](#link与import的区别)
- [position: absolute 与 fixed 的共同/不同点](#position-absolute-与-fixed-的共同不同点)
- [介绍一下盒子模型](#介绍一下盒子模型)
  - [`box-sizing`](#box-sizing)
- [选择符/可继承属性/优先计算法/伪类](#选择符可继承属性优先计算法伪类)
  - [选择符](#选择符)
  - [可继承的样式](#可继承的样式)
  - [不可继承属性](#不可继承属性)
- [共有属性值](#共有属性值)
- [flex布局](#flex布局)
  - [flex-basis](#flex-basis)
  - [flex-grow(扩展，增加)](#flex-grow扩展增加)
  - [flex-shrink(收缩)](#flex-shrink收缩)
  - [flex-wrap(换行)](#flex-wrap换行)
  - [justify-content (排列-内容)](#justify-content-排列-内容)
  - [align-items (对其/校准-项)](#align-items-对其校准-项)
  - [align-content](#align-content)
  - [flex-direction](#flex-direction)
- [grid布局](#grid布局)
  - [grid-template](#grid-template)
  - [grid-row-gap、grid-column-gap、grid-gap](#grid-row-gapgrid-column-gapgrid-gap)
  - [grid-auto-flow](#grid-auto-flow)
  - [justify-items、align-item、place-items](#justify-itemsalign-itemplace-items)
  - [justify-content、align-content、place-content](#justify-contentalign-contentplace-content)
  - [grid-column-start、grid-column-end、grid-column-start、grid-column-end](#grid-column-startgrid-column-endgrid-column-startgrid-column-end)
- [vertical-align (垂直-对其)](#vertical-align-垂直-对其)
- [display 与 position](#display-与-position)
  - [display](#display)
  - [position](#position)
- [CSS3新特性](#css3新特性)
  - [新选择器](#新选择器)
  - [@font-face](#font-face)
  - [各种效果](#各种效果)
- [BFC的概念](#bfc的概念)
- [CSS Sprites](#css-sprites)
- [对语义化的理解？](#对语义化的理解)
- [清除浮动](#清除浮动)

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
* 内容(content)/填充(padding)/边框(border)/边界(margin)
### `box-sizing` 
* `content-box` 标准盒模型，只包括content的大小
* `border-box` 包括内容、填充及边框的大小（原先IE的盒模型）

## 选择符/可继承属性/优先计算法/伪类
### 选择符
1. id选择器
2. class选择器
3. 标签选择器
4. 相邻选择器 (h1 + p)
5. 子选择器
6. 后代选择器
7. 通配符选择器
8. 属性选择器 a[rel="external"]
9. 伪类选择器 a:hover

### 可继承的样式
1. font: family, weight, size, style
2. text: text-align, line-height, color
3. 元素可见性
4. 表格布局属性
5. 列表布局属性

### 不可继承属性
1. display
2. text: vertical-align, text-decoration
3. 盒子模型: width, height, margin, border, padding
4. 背景: background-xx
5. 定位属性: float, left, z-index, ...

## 共有属性值
* `initial` (初始的)设置该属性为它的默认值
* `inherit` (继承) 从父元素继承该属性

## flex布局
* flex: 屈伸，活动
* 语法: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]

### flex-basis
如果有值则占用空间为该值，如果没有或设为auto,子项空间为width/height的值

### flex-grow(扩展，增加)
瓜分basis逻辑后父元素的剩余空间（按照比例）。

### flex-shrink(收缩)
吸收basis逻辑后子元素超出父元素的空间

### flex-wrap(换行)
* `wrap` 必要时换行
* `no-wrap` 默认不换行

### justify-content (排列-内容)
在主轴上的排列方式, 各项周围留有的空白
* `flex-start` (默认)从开头排列
* `flex-end`
* `center`  居中无间隙
* `space-between` (常用)顶格充满，两元素之前等间距
* `space-around` 充满，元素两边等间距，项目之间的间隔比项目与容器边框的间隔大一倍。
* `space-evenly` 充满，项目之间与容器边框间隔相等。

### align-items (对其/校准-项)
在侧轴上的排列方式
* `stretch` (默认)元素被拉伸以适应容器
* `center` 在侧轴上居中放置
* `flex-start`
* `flex-end`
* `baseline` 基线对其

### align-content
只适用于多行flex容器，将每行作为一项进行对其

*reduce: 缩小 reverse: 相反*
### flex-direction
排列方向
* `row` (默认) 左->右
* `row-reverse` 右->左
* `column` 上->下
* `column-reverse` 下->上

## grid布局
* grid: 网格

**使用于容器的属性**

### grid-template
后缀 `rows` 与 `columns` 分别表示每一行/列的行高/列宽

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
}
```
也可以使用repeat函数
```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 33.33%);
  grid-template-rows: repeat(3, 33.33%);
}
```

* `auto-fill` 关键字
单元格确定，容器大小不定，希望容纳尽可能多的单元格:
```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px)
}
```

* `fr` 关键字
* `minmax` 函数

`fr`是fraction的缩写，意为“片段” (作用与flex-shrink类似)。
`minmax()`函数产生一个长度范围，表示长度就在这个范围之中。它接受两个参数，分别为最小值和最大值。
```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr minmax(100px, 1fr);
}
```

### grid-row-gap、grid-column-gap、grid-gap
行间距/列间距/合并简写

### grid-auto-flow
自动放置顺序，类似于flex-direction
* `row`、`column` 按照行，列放置
* `row dense`、`column dense` 先行后列与先列后行，尽可能紧密排列

### justify-items、align-item、place-items
水平方向位置/垂直方向/两个方向单元格中内容的位置
* `start`/`end`/`center`
* `stretch` 充满单元格

### justify-content、align-content、place-content
水平方向位置/垂直方向/两个方向容器中整个内容区域的位置
* `start`/`end`/`center`
* `stretch` 充满单元格
* `space-around`、 `space-between`、`space-evenly` 和flex相似

**使用于单元格的属性**

### grid-column-start、grid-column-end、grid-column-start、grid-column-end

## vertical-align (垂直-对其)
* `baseline` (默认) 元素放置在父元素的基线上，表现为子元素的img标签下方会留白（给baseline下方留的空位-“幽灵空白节点”）再加个带背景的英文span则会明白
* 为了消除影响，可以使用 `bottom`, `middle`, `top` 等值，或设置字体大小为0

```html
.dib-baseline {
  display: inline-block; width: 150px; height: 150px;
  border: 1px solid #cad5eb; background-color: #f0f3f9;
}

<span class="dib-baseline"></span>
<span class="dib-baseline">x-baseline</span>
```
第一个元素中没有内联元素，则baseline为margin下边缘，第二个是文字基线。
若将行高改为0，则字符占据的高度为0，高度起始位置变为字符垂直中线，文字一半位于容器上边缘外。

## display 与 position
### display
* `block` 块元素: 默认一行一元素，可设置所有盒子属性
* `inline` 行内元素: 默认联排，可以设置 padding, 左右方向的 margin, border
* `inline-block` 像块元素一样显示，像行内元素一样排列
* `list-item` 像块元素一样显示，添加列表样式标记
* `flex` 将内部设置为弹性布局
* `grid` 将内部设置为网格布局
* `none` 完全不显示该内容，由下一个元素替换位置

### position
* `static` 默认，元素在正常文档流中，忽略定位声明。
* `absolute`/`fixed`/`relative`/`inherit`

## CSS3新特性
### 新选择器
* `first-child`/`last-child`/`nth-child(n)`/`nth-last-child(n)`

### @font-face
指定与加载远端字体样式
```
@font-face {
  font-family: myFirstFont;
  src: url('Sansation_Light.ttf'),
    url('Sansation_Light.eot'); /* IE9 */
}
```

### 各种效果
* 圆角: border-radius
* 阴影: text-shadow: h-shadow v-shadow blur color horizontal/vertical
* 背景图渐变: background-image: linear-gradient(red, yellow, blue);
* 过渡: transition: property duration timing-function delay;
* 变换: transform: translate(水平移动)、rotate(旋转)、scale(伸缩)、skew(倾斜)
* 动画:
```css
animation: ani 2s ease 0s;
@keyframes ani {
    0%{
        left: 10px;
        opacity: 1;
    }
    50%,70%{
        left: 50%;
        opacity: .7;
        margin-left:-150px;
    }
    100%{
        left: 100%;
        opacity: 0;
        margin-left:-300px;
    }
}
```
## BFC的概念
Block Formatting Context 是布局过程中生成块级盒子的区域。
BFC是一个独立的布局环境，BFC中的元素布局不受外部影响。浮动元素会创建BFC，所以两个浮动元素的布局互相不影响。

## CSS Sprites
将一些背景图片整合到一张图片文件中，再利用CSS的`background-image/repeat/position`进行定位，减少图片文件开销。

## 对语义化的理解？
* 通过html标签的合理使用与合理布局，使得无样式时页面也有清晰的结构
* 充分应用a标签的title与img标签的alt等属性，方便盲人阅读器/屏幕阅读器的解析
* 有利于SEO，提高易读性，方便代码维护。

## 清除浮动
`float` 的浮动元素仍然占据父元素中空间，没有脱离当前文档流。该元素会变为`inline-block`的模式。
* 使用空标签/:after `clear:both` 清除浮动
* 给父元素设置overflow: auto/hidden
