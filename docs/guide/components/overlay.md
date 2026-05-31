# 覆盖层

::: module
<ApiButton page="classes/Core.Overlay.html"/>
在查看器上方显示一条带插图的消息。
:::

## 示例

此示例会在启动时显示一个覆盖层。

::: code-demo

```yaml
title: 全景图查看器覆盖层示例
```

<<< ./demos-src/overlay.js{js:line-numbers}

:::

## 方法

### `show(config)`

显示覆盖层。

| 选项           | 类型      |                                                                                  |
| -------------- | --------- | -------------------------------------------------------------------------------- |
| `id`           | `string`  | 覆盖层的唯一标识符；仅当内容尚未被其他内容替换时，才会用它来 `hide` 对应覆盖层。 |
| `title` (必填) | `string`  | 覆盖层的主消息。                                                                 |
| `text`         | `string`  | 覆盖层的次要消息。                                                               |
| `image`        | `string`  | 显示在文本上方的 SVG 图标或图片。                                                |
| `dismissible`  | `boolean` | 覆盖层是否可以通过点击或 Escape 键隐藏（默认值：`true`）。                       |

_**注意：** 内容会以 HTML 渲染。如果内容可能包含不受信任的输入，请先清理后再传入 `title`、`text` 或 `image`。_

### `hide([id])`

隐藏覆盖层。如果未提供 `id`，则无条件隐藏；如果提供了 `id`，则仅当上一次 `show` 使用了相同 `id` 时才隐藏。

### `isVisible([id]): boolean`

检查覆盖层是否可见。

## 事件

### `show-overlay(id)`

覆盖层显示时触发。

### `hide-overlay(id)`

覆盖层隐藏时触发。
