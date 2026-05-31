# CompassPlugin <Badge text="样式"/>

<Badges module="compass-plugin"/>

::: module
<ApiButton page="modules/CompassPlugin.html"/>
在 viewer 上添加指南针，用于表示当前可见的球面区域。

这个插件由 [@photo-sphere-viewer/compass-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/compass-plugin) 包提供。
:::

## 用法

插件可以配置一组 `hotspots`，它们会以小点显示在指南针上；也可以显示标记的位置。

```js:line-numbers
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';

const viewer = new Viewer({
    plugins: [
        CompassPlugin.withConfig({
            hotspots: [
                { yaw: '45deg' },
                { yaw: '60deg', color: 'red' },
            ],
        }),
    ],
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器指南针示例
packages:
  - name: compass-plugin
    style: true
```

<<< ./demos-src/compass.js{js:line-numbers}

:::

::: tip 提示
北方始终位于 yaw=0。如果需要调整北方方向，可以使用 `panoData.poseHeading` 或 `sphereCorrection.pan` 选项。
:::

## 配置

#### `size`

- 类型：`string`
- 默认：`'120px'`
- 可更新：是

组件尺寸，可以使用 `px`、`rem`、`vh` 等单位。

#### `position`

- 类型：`string`
- 默认：`'top left'`
- 可更新：是

组件位置，可由 `top`、`center`、`bottom` 与 `left`、`center`、`right` 组合而成。

#### `navigation`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

允许点击指南针来旋转 viewer。

#### `resetPitch`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

使用指南针导航时，将查看器的俯仰角重置为 `defaultPitch`。

#### `hotspots`

- 类型：`CompassHotspot[]`
- 默认：`null`
- 可更新：是

指南针上可见的小点。每个点包含一个位置（`yaw`/`pitch` 或 `textureX`/`textureY`）以及可选的 `color`，它会覆盖全局 `hotspotColor`。

::: tip 提示
通过定义标记的 `compass` 数据，可以在指南针上显示 [Markers](./markers.md)。该值可以是 `true` 或指定颜色。

<DemoButton href="/demos/compass/markers.html"/>
:::

#### `backgroundSvg`

- 类型：`string`
- 默认：插件提供的 SVG
- 可更新：是

指南针背景使用的 SVG（必须为正方形）。

#### `coneColor`

- 类型：`string`
- 默认：`'rgba(255, 255, 255, 0.2)'`
- 可更新：是

指南针视锥的颜色。

#### `navigationColor`

- 类型：`string`
- 默认：`'rgba(255, 0, 0, 0.2)'`
- 可更新：是

导航视锥的颜色。

#### `hotspotColor`

- 类型：`string`
- 默认：`'rgba(0, 0, 0, 0.5)'`
- 可更新：是

热点的默认颜色。

#### `className`

- 类型：`string`
- 可更新：是

添加到指南针元素上的 CSS 类。

## 方法

#### `setHotspots(hotspots)`

修改热点。

```js
compassPlugin.setHotspots([{ yaw: '0deg' }, { yaw: '10deg', color: 'red' }]);
```

#### `clearHotspots()`

移除所有热点。
