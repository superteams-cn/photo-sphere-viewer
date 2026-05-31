# MapPlugin <Badge text="样式"/>

<Badges module="map-plugin"/>

::: module
<ApiButton page="modules/MapPlugin.html"/>
在 viewer 上添加一张交互式地图，支持缩放、平移以及可选热点。

这个插件由 [@photo-sphere-viewer/map-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/map-plugin) 包提供。
:::

::: tip 提示
如果你需要地理地图（OpenStreetMap、Google 等），请改用[平面图插件](plan.md)。
:::

## 用法

此插件的最小配置包含 `imageUrl` 与 `center`（全景图在地图上的像素坐标）。地图旋转角度可通过 `rotation` 调整。

```js:line-numbers
import { MapPlugin } from '@photo-sphere-viewer/map-plugin';

const viewer = new Viewer({
    plugins: [
        MapPlugin.withConfig({
            imageUrl: 'path/to/map.jpg',
            center: { x: 785, y: 421 },
            rotation: '-12deg',
        }),
    ],
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器地图示例
packages:
  - name: map-plugin
    style: true
```

<<< ./demos-src/map.js{js:line-numbers}

:::

::: tip 提示
在应用旋转前，指南针的北方始终指向地图顶部。
:::

## 配置

#### `imageUrl`（必填）

- 类型：`string`
- 可更新：否，请使用 `setImage()` 方法

用作地图的图片 URL。

#### `center`（必填）

- 类型：`{ x: number, y: number }`
- 可更新：是

全景图在地图上的位置，单位为像素。也可以使用 `setCenter()` 方法设置。

#### `rotation`

- 类型：`number | string`
- 默认：`0`
- 可更新：是

应用到地图上的旋转角度，用于让地图与全景图方向一致。可使用弧度或角度声明（例如 `'45deg'`）。

#### `shape`

- 类型：`'round' | 'square'`
- 默认：`'round'`
- 可更新：是

组件形状。

#### `size`

- 类型：`string`
- 默认：`200px`
- 可更新：是

组件尺寸，可以使用 `px`、`rem`、`vh` 等单位。

#### `position`

- 类型：`string`
- 默认：`bottom left`
- 可更新：是

组件位置，可由 `top`、`bottom` 与 `left`、`right` 组合而成。

#### `static`

- 类型：`boolean`
- 默认：`false`
- 可更新：是

如果为 `true`，地图本身不会旋转，只有中心图钉会旋转，用于指示全景图朝向。

#### `overlayImage`

- 类型：`string`
- 默认：默认 SVG
- 可更新：是

绘制在地图上方的 SVG 或图片 URL。可设为 `null` 以禁用。

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

#### `coneColor`

- 类型：`string`
- 默认：`#1E78E6`
- 可更新：是

指南针视锥的颜色。设为 `null` 可禁用。

#### `coneSize`

- 类型：`number`
- 默认：`40`
- 可更新：是

指南针视锥尺寸。

#### `hotspots`

- 类型：`MapHotspot[]`
- 默认：`null`
- 可更新：是

地图上可见的小点，见下文。你也可以使用 `setHotspots()` 方法设置。

::: tip 提示
通过定义标记的 `map` 数据，可以在地图上显示 [Markers](./markers.md)。该数据必须是一个热点对象（无需 `yaw`，因为它可从标记位置得知）。

如果标记定义了提示框，会复用该提示框。在地图上点击标记时，查看器会转向该标记。

<DemoButton href="/demos/map/markers.html"/>
:::

#### `spotStyle`

- 类型：`object`
- 可更新：是

热点样式。

::: dialog "查看详情" "地图热点样式"

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
     * @default 'rgba(255, 255, 255, 0.6)'
     */
    hoverBorderColor?: string;
    /**
     * 热点的堆叠顺序，默认按声明顺序排列
     * @default null
     */
    zIndex?: number;
}
```

:::

#### `defaultZoom`

- 类型：`number`
- 默认：`100`
- 可更新：否

地图默认缩放级别。

#### `maxZoom`

- 类型：`number`
- 默认：`200`
- 可更新：是

地图最大缩放级别。

#### `minZoom`

- 类型：`number`
- 默认：`20`
- 可更新：是

地图最小缩放级别。

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
- 默认：`{ north: true, maximize: true, close: true, reset: true }`
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
    mapNorth: '转向北方',
    mapReset: '重置',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

### 热点

#### `id`

- 类型：`string`
- 默认：自动生成

用于通过 `select-hotspot` 事件响应点击。

#### `yaw`+`distance` 或 `x`+`y`（必填）

- 类型：`number`

配置热点在地图上的位置：可以使用角度和距离（地图图片上的像素距离），也可以使用绝对 x/y 坐标（同样以地图图片像素为单位）。

#### `style`

允许覆盖默认 `spotStyle`。

#### `tooltip`

- 类型：`string | { content: string, className: string }`
- 默认：`null`

## 方法

#### `setHotspots(hotspots)`

修改热点。

```js
mapPlugin.setHotspots([
  { id: '1', yaw: '0deg', distance: 120, tooltip: 'Hotspot one' },
  { id: '2', x: 150, y: 310, image: 'blue-dot.png' },
]);
```

#### `clearHotspots()`

移除所有热点。

#### `setImage(url, center?, rotation?)`

修改地图图片。

```js
mapPlugin.setImage('map2.jpg', { x: 500, y: 500 });
```

#### `setCenter(center, resetView=true)`

修改全景图在地图上的位置。如果 `resetView` 为 false，组件不会移动地图，只会移动中心图钉。

```js
mapPlugin.setCenter({ x: 500, y: 500 });
```

#### `close()` | `open()`

在关闭和打开模式之间切换。

#### `maximize()` | `minimize()`

在最大化和最小化视图之间切换。（如果地图已关闭，则没有效果。）

#### `setZoom(level)`

修改当前缩放级别（介于 `minZoom` 与 `maxZoom` 之间）。

## 事件

#### `select-hotspot(hotspotId)`

用户点击热点时触发。

```js
mapPlugin.addEventListener('select-hotspot', ({ hotspotId }) => {
  console.log(`Clicked on hotspot ${hotspotId}`);
});
```

#### `view-changed(view)`

地图最大化（`view=maximized`）、最小化或打开（`view=normal`）、关闭（`view=closed`）时触发。

## SCSS 变量

| 变量                | 默认值                    | 说明                             |
| ------------------- | ------------------------- | -------------------------------- |
| $radius             | 8px                       | 组件圆角（仅当 shape=square 时） |
| $shadow             | 0 0 5px rgba(0, 0, 0, .7) | 应用于组件的阴影                 |
| $background         | rgba(61, 61, 61, .7)      | 地图背景色                       |
| $button-size        | 34px                      | 按钮尺寸                         |
| $button-background  | rgba(0, 0, 0, .5)         | 按钮背景色                       |
| $button-color       | core.$buttons-color       | 按钮颜色                         |
| $toolbar-font       | 12px sans-serif           | 缩放指示器字体                   |
| $toolbar-text-color | white                     | 缩放指示器文字颜色               |
| $toolbar-background | #222                      | 缩放指示器背景色                 |
| $transition         | ease-in-out .3s           | 过渡效果                         |
