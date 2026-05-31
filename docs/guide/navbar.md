# 导航栏自定义

<DemoButton href="/demos/basic/custom-navbar.html"/>

## 核心按钮

`navbar` 选项是一个数组，可以包含以下元素：

- `zoomOut`
- `zoomRange`
- `zoomIn`
- `zoom` = `zoomOut` + `zoomRange` + `zoomIn`
- `moveLeft`
- `moveRight`
- `moveTop`
- `moveDown`
- `move` = `moveLeft` + `moveRight` + `moveTop` + `moveDown`
- `download`
- `description`
- `caption`
- `fullscreen`

## 插件按钮

部分[插件](../plugins/)会向导航栏添加新按钮；如果没有覆盖 `navbar` 选项，它们会自动显示。如果你覆盖了该选项，则需要在配置中手动加入这些按钮。各插件页面会列出对应按钮代码。

## 自定义按钮

你也可以添加任意数量的自定义按钮。自定义按钮是一个对象，支持以下选项：

#### `content` (必填)

- 类型：`string | HTMLElement` & [`NavbarButtonElement`](/api/interfaces/Core.NavbarButtonElement.html){target=\_blank}

按钮内容，建议使用正方形图片或 SVG 图标。

::: tip 自定义导航栏元素
`content` 可以是 DOM 中已有的元素，也可以是 [Web Component](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements)。
如果组件提供了 `attachViewer()` 方法，它会以 viewer 实例作为第一个参数被调用。

<DemoButton href="/demos/advanced/navbar-element.html"></DemoButton>
:::

_**注意：** 内容会按 HTML 渲染。如果内容可能包含不可信输入，请先清理后再传入 `content`。_

#### `onClick(viewer)`

- 类型：`function(Viewer)`

按钮被点击时调用的函数。

#### `id`

- 类型：`string`

按钮的唯一标识符，在使用 `navbar.getButton()` 方法时很有用。

#### `title`

- 类型：`string`

鼠标悬停在按钮上时显示的提示文本。

为了方便翻译，它可以是主 [`lang`](./config.md#lang) 对象中的键。

#### `className`

- 类型：`string`

添加到按钮上的 CSS 类。

#### `disabled`

- 类型：`boolean`
- 默认值：`false`

初始状态下禁用按钮。

#### `visible`

- 类型：`boolean`
- 默认值：`true`

初始状态下显示按钮。

API 允许随时更改按钮可见性：

```js
viewer.navbar.getButton('my-button').show();
```
