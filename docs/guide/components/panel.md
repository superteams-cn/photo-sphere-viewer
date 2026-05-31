# 面板

::: module
<ApiButton page="classes/Core.Panel.html"/>
在 viewer 右侧边栏显示 HTML 内容。
:::

## 示例

此示例添加一个自定义按钮，用于切换面板。

:::: code-demo

```yaml
title: 全景图查看器面板示例
```

::: code-group

<<< ./demos-src/panel.js{js:line-numbers}
<<< ./demos-src/panel.html [template.html]

:::

::::

## 方法

### `show(config)`

打开侧边面板。

| 选项                           | 类型                    |                                                                                                                                |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                           | `string`                | 面板的唯一标识符；仅当内容尚未被其他内容替换时，才会用它来 `hide` 对应面板。使用调整大小手柄时，它也会用于保存用户定义的宽度。 |
| `content` (必填)               | `string`                | 面板的 HTML 内容。                                                                                                             |
| `noMargin` (默认&nbsp;`false`) | `boolean`               | 移除面板内部的默认外边距。                                                                                                     |
| `width` (默认&nbsp;`400px`)    | `string`                | 面板初始宽度（例如：`100%`、`600px`）。                                                                                        |
| `clickHandler(target)`         | `function<HTMLElement>` | 用户在面板内点击，或某个元素获得焦点时按下 Enter 键后调用的函数。                                                              |

::: tip 内容焦点
打开后，第一个可聚焦元素（`a`、`button` 或任何带 `tabindex` 的元素）会获得焦点，用户可用 Tab 键导航，并用 `Enter` 键触发 `clickHandler`。
:::

_**注意：** 内容会按 HTML 渲染。如果内容可能包含不可信输入，请先清理后再传入 `content`。_

### `hide([id])`

隐藏面板。如果未提供 `id`，则无条件隐藏；如果提供了 `id`，则仅当上一次 `show` 使用了相同 `id` 时才隐藏。

### `isVisible([id]): boolean`

检查面板是否已打开。

## 事件

### `show-panel(id)`

面板显示时触发。

### `hide-panel(id)`

面板隐藏时触发。
