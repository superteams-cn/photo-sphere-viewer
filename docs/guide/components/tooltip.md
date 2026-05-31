# 工具提示

::: module
<ApiButton page="classes/Core.Tooltip.html"/>
在查看器上方添加自定义提示框。
:::

要添加工具提示，必须调用 `viewer.createTooltip()`。它会返回一个工具提示实例，实例提供 `move()`、`update()` 和 `hide()` 方法，因此可以同时显示多个工具提示。

## 示例

此示例添加一个跟随光标的持久工具提示。

::: code-demo

```yaml
title: 全景图查看器工具提示示例
```

<<< ./demos-src/tooltip.js{js:line-numbers}

:::

## 方法

### `viewer.createTooltip(config)`

创建工具提示。

| 选项                               | 类型     |                                                                                                              |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `content` (必填)                   | `string` | 工具提示的 HTML 内容。                                                                                       |
| `top` & `left` (必填)              | `number` | 工具提示相对于查看器左上角的像素坐标。                                                                       |
| `position`（默认值：`top center`） | `string` | 工具提示相对于箭头尖端的位置。可接受的值由 `top`、`center`、`bottom` 和 `left`、`center`、`right` 组合而成。 |
| `className`                        | `string` | 添加到工具提示上的额外 CSS 类。                                                                              |
| `data`                             | `any`    | 与工具提示关联的用户数据（常用于事件）。                                                                     |

_**注意：** 内容会以 HTML 渲染。如果内容可能包含不受信任的输入，请先清理后再传入 `content`。_

### `tooltip.move(config)`

更新工具提示的位置，参数与上文的 `top`、`left` 和 `position` 相同。

### `tooltip.update(content)`

更新工具提示内容。

### `tooltip.hide()`

隐藏并销毁工具提示。

## 事件

### `show-tooltip(data)`

工具提示显示时触发。

### `hide-tooltip(data)`

工具提示隐藏时触发。
