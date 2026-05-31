# PlanPlugin <Badge text="样式"/>

<Badges module="plan-plugin"/>

::: module
<ApiButton page="modules/PlanPlugin.html"/>
在 viewer 上添加 [Leaflet](https://leafletjs.com) 地图，用于显示全景图位置和可选热点。默认使用 OpenStreetMap。

这个插件由 [@photo-sphere-viewer/plan-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/plan-plugin) 包提供。
:::

## 用法

此插件的最小配置包含 `coordinates`（全景图的 GPS 位置）。

```js:line-numbers
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';

const viewer = new Viewer({
    plugins: [
        PlanPlugin.withConfig({
            coordinates: [6.79077, 44.58041],
        }),
    ],
});
```

::: warning 注意
不要忘记导入 Leaflet 的 JS 与 CSS 文件。
:::

## 示例

::: code-demo

```yaml
title: 全景图查看器平面图示例
packages:
  - name: plan-plugin
    style: true
  - name: leaflet
    external: true
    version: 1
    style: true
    js: dist/leaflet-src.esm.js
    css: dist/leaflet.css
```

<<< ./demos-src/plan.js{js:line-numbers}

:::

## 配置

#### `coordinates`（必填）

- 类型：`[number, number]`
- 可更新：是

全景图的 GPS 位置（经度、纬度）。也可以使用 `setCoordinates()` 方法设置。

#### `bearing`

- 类型：`number | string`
- 默认：`0`
- 可更新：是

应用到中心图钉的旋转偏移，用于让它与全景图方向一致。

#### `layers`

- 类型：`array`
- 默认：OpenStreetMap
- 可更新：否

可用底图图层列表。如果定义了多个图层，会出现一个用于切换图层的按钮。

每个元素都是一个对象，包含 `urlTemplate`（用于标准栅格瓦片）**或** `layer`（用于任意自定义 Leaflet 图层），以及 `name` 和 `attribution`。

```js:line-numbers
layers: [
    {
        name: 'OpenStreetMap',
        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap',
    },
    {
        name: 'OpenTopoMap',
        layer: new L.TileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            subdomains: ['a', 'b', 'c'],
            maxZoom: 17,
        }),
        attribution: '&copy; OpenTopoMap',
    },
]
```

_注意：如果使用了 `configureLeaflet`，此选项会被忽略。_

#### `configureLeaflet`

- 类型：`function<map>`
- 可更新：否

允许自行配置 Leaflet。这会禁用默认图层。

```js:line-numbers
configureLeaflet(map) {
    // https://leafletjs.com/reference.html
},
```

#### `size`

- 类型：`{ width: string, height: string }`
- 默认：`{ width: '300px', height: '200px' }`
- 可更新：是

组件尺寸。

#### `position`

- 类型：`string`
- 默认：`bottom left`
- 可更新：是

组件位置，可由 `top`、`bottom` 与 `left`、`right` 组合而成。

#### `pinImage`

- 类型：`string`
- 默认：默认 SVG
- 可更新：是

中心图钉使用的 SVG 或图片 URL。

#### `pinSize`

- 类型：`number`
- 默认：`35`
- 可更新：是

中心图钉尺寸。

#### `hotspots`

- 类型：`PlanHotspot[]`
- 默认：`null`
- 可更新：是

地图上可见的标记，见下文。也可以使用 `setHotspots()` 方法设置。

::: tip 提示
通过定义标记的 `plan` 数据，可以在地图上显示 [Markers](./markers.md)。该数据必须是热点对象。

如果标记定义了提示框，会复用该提示框。在地图上点击标记时，viewer 会转向该标记。

<DemoButton href="/demos/plan/markers.html"/>
:::

#### `spotStyle`

- 类型：`object`
- 可更新：是

热点样式。

::: dialog "查看详情" "Plan 热点样式"

热点默认显示为可配置尺寸和颜色的圆点，也可以显示为图片。

```ts:line-numbers
{
    /**
     * 热点尺寸
     * @default 15
     */
    size?: number;
    /**
     * 热点使用的 SVG 或图片 URL
     */
    image?: string;
    /**
     * 未提供图片时的热点颜色
     * @default 'white'
     */
    color?: string;
    /**
     * 边框尺寸
     * @default 0
     */
    borderSize?: number;
    /**
     * 边框颜色
     * @default null
     */
    borderColor?: string;
    /**
     * 鼠标悬停时的尺寸
     * @default null
     */
    hoverSize?: number;
    /**
     * 鼠标悬停时的 SVG 或图片 URL
     * @default null
     */
    hoverImage?: string;
    /**
     * 鼠标悬停时的颜色
     * @default null
     */
    hoverColor?: string;
    /**
     * 鼠标悬停时的边框尺寸
     * @default 4
     */
    hoverBorderSize?: number;
    /**
     * 鼠标悬停时的边框颜色
     * @default 'rgba(255, 255, 255, 0.8)'
     */
    hoverBorderColor?: string;
}
```

:::

#### `defaultZoom`

- 类型：`number`
- 默认：`15`
- 可更新：否

地图默认缩放级别。

#### `visibleOnLoad`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

加载第一个全景图时显示地图。

#### `minimizeOnHotspotClick`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

点击热点/标记时总是最小化地图。

#### `buttons`

- 类型：`object`
- 默认：`{ maximize: true, close: true, reset: true }`
- 可更新：否

配置地图周围显示哪些按钮。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    map: '地图',
    mapMaximize: '最大化',
    mapMinimize: '最小化',
    mapReset: '重置',
    mapLayers: '底图图层',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

### 热点

#### `id`

- 类型：`string`
- 默认：自动生成

用于通过 `select-hotspot` 事件响应点击。

#### `coordinates`（必填）

- 类型：`[number, number]`

配置热点在地图上的位置。

#### `style`

允许覆盖默认 `spotStyle`。

#### `tooltip`

- 类型：`string | { content: string, className: string }`
- 默认：`null`

_**注意：** 内容会以 HTML 渲染。如果内容可能包含不受信任的输入，应先清理后再传给 `tooltip`。_

## 方法

#### `setHotspots(hotspots)`

修改热点。

```js:line-numbers
mapPlugin.setHotspots([
    { id: '1', coordinates: [6.79077, 44.58041], tooltip: 'Hotspot one' },
    { id: '2', coordinates: [6.79077, 44.58041], image: 'blue-dot.png' },
]);
```

#### `clearHotspots()`

移除所有热点。

#### `setCoordinates(coordinates)`

修改全景图在地图上的位置。

```js:line-numbers
mapPlugin.setCoordinates([6.79077, 44.58041]);
```

#### `close()` | `open()`

在关闭和打开模式之间切换。

#### `maximize()` | `minimize()`

在最大化和最小化视图之间切换。（如果地图已关闭，则没有效果。）

#### `getLeaflet()`

返回 Leaflet 实例。

#### `setZoom(level)`

修改当前缩放级别。

## 事件

#### `select-hotspot(hotspotId)`

用户点击热点时触发。

```js:line-numbers
planPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
    console.log(`Clicked on hotspot ${hotspotId}`);
});
```

#### `view-changed(view)`

地图最大化（`view=maximized`）、最小化或打开（`view=normal`）、关闭（`view=closed`）时触发。

## SCSS 变量

| 变量               | 默认值                    | 说明             |
| ------------------ | ------------------------- | ---------------- |
| $radius            | 8px                       | 组件圆角         |
| $shadow            | 0 0 5px rgba(0, 0, 0, .7) | 应用于组件的阴影 |
| $button-size       | 34px                      | 按钮尺寸         |
| $button-background | rgba(0, 0, 0, .5)         | 按钮背景色       |
| $button-color      | white                     | 按钮图标颜色     |
| $transition        | ease-in-out .3s           | 过渡效果         |
