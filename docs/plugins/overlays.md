# 覆盖层插件

<Badges module="overlays-plugin"/>

::: module
<ApiButton page="modules/OverlaysPlugin.html"/>
在全景图上方显示额外图片。

这个插件由 [@photo-sphere-viewer/overlays-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/overlays-plugin) 包提供。
:::

## 用法

覆盖层是“贴”在全景图上的图片。与[标记](./markers.md)不同，它们属于 3D 场景的一部分，而不是绘制在查看器上方。
同时支持等距柱状图（完整或裁剪）与立方体贴图。

```js:line-numbers
import { OverlaysPlugin } from '@photo-sphere-viewer/overlays-plugin';

const viewer = new Viewer({
    plugins: [
        OverlaysPlugin.withConfig({
            overlays: [
                {
                    id: 'overlay',
                    path: 'path/to/overlay.png',
                },
            ],
        }),
    ],
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器覆盖层示例
packages:
  - name: overlays-plugin
```

<<< ./demos-src/overlays.js{js:line-numbers}

:::

## 配置

#### `overlays`

- 类型：`OverlayConfig[]`
- 可更新：否

覆盖层列表，详见下文。也可以通过多种[方法](#methods)动态更新。

#### `autoclear`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

全景图变化时自动移除所有覆盖层。

#### `inheritSphereCorrection`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

将[全局 `sphereCorrection`](../guide/config.md#spherecorrection) 应用于每个覆盖层。也可以通过单个覆盖层的 [`sphereCorrection`](#sphereCorrection) 属性覆盖该设置。

### 覆盖层

覆盖层可以是用于球面几何体的单张图片/视频，也可以是用于立方体几何体的六张图片（不支持视频）。

#### `id`（推荐）

- 类型：`string`
- 默认：随机值

用于通过 `removeOverlay()` 方法移除覆盖层。

#### `opacity`

- 类型：`number`
- 默认：`1`

#### `zIndex`

- 类型：`number`
- 默认：`0`

#### `sphereCorrection`

- 类型：`{ pan: double | string, tilt: double | string, roll: double | string }`
- 默认：`null`

应用到此覆盖层的球面校正。如果已定义，它会覆盖全局 [`inheritSphereCorrection`](#inheritspherecorrection) 设置。

#### 球面覆盖层

#### `path`（必填）

- 类型：`string`

图片路径。

#### `panoData`

- 类型：`PanoData`

此选项与核心 [`panoData`](../guide/config.md#panodata) 的作用相同，可用于显示局部全景图。

_注意：_ 此处提供的 `fullWidth` 不一定与基础全景图相同，`croppedX/croppedY` 会按比例缩放。

<DemoButton href="/demos/overlays/partial-overlay.html"/>

#### 立方体覆盖层

#### `path`（必填）

- 类型：`CubemapPanorama`

可用语法请参阅[立方体贴图适配器页面](../guide/adapters/cubemap.md#panorama-options)。六个面都必须提供，但其中某些面可以为 `null`。

## 方法

#### `addOverlay(config)`

添加新的覆盖层。

#### `removeOverlay(id)`

移除一个覆盖层。

#### `clearOverlays()`

移除所有覆盖层。

## 事件

#### `overlay-click(overlayId)`

点击覆盖层时触发。

```js:line-numbers
overlaysPlugin.addEventListener('overlay-click', ({ overlayId }) => {
    console.log(`Clicked on overlay ${overlayId}`);
});
```
