# 通知

::: module
<ApiButton page="classes/Core.Notification.html"/>
在导航栏上方显示一条简短消息。
:::

## 示例

此示例会持续显示新的通知。

::: code-demo

```yaml
title: 全景图查看器通知示例
```

<<< ./demos-src/notification.js{js:line-numbers}

:::

## 方法

### `show(config)`

显示通知。

| 选项             | 类型     |                                                                              |
| ---------------- | -------- | ---------------------------------------------------------------------------- |
| `id`             | `string` | 通知的唯一标识符；仅当内容尚未被其他内容替换时，才会用它来 `hide` 对应通知。 |
| `content` (必填) | `string` | 通知的 HTML 内容。                                                           |
| `timeout`        | `number` | 自动隐藏延迟，单位为毫秒。                                                   |

### `hide([id])`

隐藏通知。如果未提供 `id`，则无条件隐藏；如果提供了 `id`，则仅当上一次 `show` 使用了相同 `id` 时才隐藏。

### `isVisible([id]): boolean`

检查通知是否可见。

## 事件

### `show-notification(id)`

通知显示时触发。

### `hide-notification(id)`

通知隐藏时触发。
