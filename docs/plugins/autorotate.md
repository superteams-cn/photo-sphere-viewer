# 自动旋转插件

<Badges module="autorotate-plugin"/>

::: module
<ApiButton page="modules/AutorotatePlugin.html"/>
为全景图添加自动旋转功能，可在用户空闲时自动启动，也可通过按钮启动。旋转过程还可以配置为依次访问指定位置。

这个插件由 [@photo-sphere-viewer/autorotate-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/autorotate-plugin) 包提供。
:::

## 用法

:::: tabs

::: tab 标准用法

在标准模式下，全景图会持续旋转；你可以配置 `autorotatePitch` 与 `autorotateZoomLvl`。

```js:line-numbers
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

const viewer = new Viewer({
    plugins: [
        AutorotatePlugin.withConfig({
            autorotatePitch: '5deg',
        }),
    ],
});
```

:::

::: tab 关键点

在关键点模式下，插件通过 `keypoints` 列表配置。列表项可以是位置对象（`yaw`/`pitch` 或 `textureX`/`textureY`），也可以是现有[标记](./markers.md)的标识符。

还可以为每个关键点配置停留时间和提示框。

```js:line-numbers
const viewer = new Viewer({
    plugins: [
        AutorotatePlugin.withConfig({
            keypoints: [
                'existing-marker-id',

                { yaw: Math.PI / 2, pitch: 0 },

                {
                    position: { yaw: Math.PI, pitch: Math.PI / 6 },
                    pause: 5000,
                    tooltip: '这里值得一看',
                },

                {
                    markerId: 'another-marker', // 如果标记有提示框，将复用该提示框
                    pause: 2500,
                },
            ],
        }),
    ],
});
```

:::

::::

## 示例

### 标准用法

::: code-demo

```yaml
title: 全景图查看器自动旋转示例
packages:
  - name: autorotate-plugin
```

<<< ./demos-src/autorotate.js{js:line-numbers}

:::

### 关键点

::: code-demo

```yaml
title: 全景图查看器自动旋转关键点示例
packages:
  - name: autorotate-plugin
    imports: AutorotatePlugin
  - name: markers-plugin
    imports: MarkersPlugin
    style: true
```

<<< ./demos-src/autorotate-keypoints.js{js:line-numbers}

:::

## 配置

#### `autostartDelay`

- 类型：`integer`
- 默认：`2000`
- 可更新：是

自动旋转开始前的延迟，单位为毫秒。

#### `autostartOnIdle`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

如果用户空闲达到 `autostartDelay`，则重新启动自动旋转。

**注意：** 如果用户明确点击过导航栏按钮，旋转不会自动重新启动。

#### `autorotateSpeed`

- 类型：`string`
- 默认：`2rpm`
- 可更新：是

自动旋转速度。可以使用负值反转旋转方向。

#### `autorotatePitch`

- 类型：`double | string`
- 默认：`defaultPitch`
- 可更新：是

执行自动旋转时使用的垂直角度。如果为 `null`，则保留当前俯仰角。

#### `autorotateZoomLvl`

- 类型：`number`
- 默认：`null`
- 可更新：是

执行自动旋转时使用的缩放级别。如果为 `null`，则保留当前缩放级别。

#### `keypoints`

- 类型：`AutorotateKeypoint[]`
- 可更新：否，请使用 `setKeypoints()` 方法

初始关键点。效果等同于初始化后立即调用 `setKeypoints()`。

::: dialog "查看详情" "关键点配置"

关键点可通过 `position` 或 `markerId` 定义（后者需要[标记插件](./markers.md)）。

```ts:line-numbers
{
    position?: ExtendedPosition;
    /**
     * 使用标记的位置和提示框
     */
    markerId?: string;
    /**
     * 到达此关键点时暂停动画；如果有提示框，也会一并显示
     */
    pause?: number;
    /**
     * 可选提示框
     */
    tooltip?: string | { content: string; position?: string };
}
```

:::

#### `startFromClosest`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

从最近的关键点开始，而不是从数组中的第一个关键点开始。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    autorotate: '自动旋转',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## 方法

#### `setKeypoints(keypoints)`

修改或移除关键点。

#### `start()` / `stop()` / `toggle()`

按方法名所示启动、停止或切换自动旋转。

## 事件

#### `autorotate(autorotateEnabled)`

自动旋转启用或禁用时触发。

## 按钮

此插件会向默认导航栏添加按钮：

- `autorotate` 用于开启或关闭自动旋转

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。
