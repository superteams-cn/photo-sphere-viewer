# MarkersPlugin <Badge text="样式"/>

<Badges module="markers-plugin"/>

::: module
<ApiButton page="modules/MarkersPlugin.html"/>
在 viewer 上显示各种形状、图片和文字。

这个插件由 [@photo-sphere-viewer/markers-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/markers-plugin) 包提供。
:::

## 用法

插件提供了强大的标记系统，可在全景图上定义兴趣点，并可选配提示框与说明内容。标记支持动态添加和移除，也可以响应用户的点击或轻触。

标记共有五种类型：

- **HTML**：通过 `html`、`element` 或 `elementLayer` 属性定义
- **图片**：通过 `image` 或 `imageLayer` 属性定义
- **视频**：通过 `videoLayer` 属性定义
- **SVG**：通过 `square`、`rect`、`circle`、`ellipse` 或 `path` 属性定义
- **动态多边形与折线**：通过 `polygon`、`polygonPixels`、`polyline` 或 `polylinePixels` 属性定义

可以通过 `markers` 选项在启动时添加标记，也可以在加载后通过各类方法动态添加。

```js:line-numbers
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const viewer = new Viewer({
    plugins: [
        MarkersPlugin.withConfig({
            markers: [
                {
                    id: 'new-marker',
                    position: { yaw: '45deg', pitch: '0deg' },
                    image: 'assets/pin-red.png',
                    size: { width: 32, height: 32 },
                },
            ],
        }),
    ],
});

const markersPlugin = viewer.getPlugin(MarkersPlugin);

markersPlugin.addEventListener('select-marker', ({ marker }) => {
    markersPlugin.updateMarker({
        id: marker.id,
        image: 'assets/pin-blue.png',
    });
});
```

## 示例

下面的示例包含大多数标记类型。在全景图任意位置单击可添加红色标记，右键可改变颜色，双击可删除。

:::: code-demo

```yaml
title: PSV Markers Demo
packages:
  - name: markers-plugin
    style: true
```

::: code-group

<<< ./demos-src/markers.js{js:line-numbers}
<<< ./demos-src/markers.html [template.html]

:::

::::

## 标记

### 定义

每个标记必须且只能使用以下选项中的一个。

#### `image`

- 类型：`string`

图片文件路径。需要定义 `size`。

```js:line-numbers{3}
{
    id: 'marker-1',
    image: 'pin-red.png',
    position: { yaw: 0, pitch: 0 },
    size: { width: 32, height: 32 },
}
```

#### `imageLayer`

- 类型：`string`

图片文件路径。

::: tip "Layers" 定位
`imageLayer` 与 `videoLayer` 标记有两种定位方式：

- `position`（单个值）+ `size` + `anchor`（可选）+ `rotation`（可选）
- `position` 使用四个值定义图片/视频的四个角

（`elementLayer` 只能通过 `position` + `rotation` 定位）

<DemoButton href="/demos/markers/layers.html"/>
:::

```js:line-numbers{3}
{
    id: 'marker-1',
    imageLayer: 'pin-red.png',
    position: { yaw: 0, pitch: 0 },
    size: { width: 32, height: 32 },
}

{
    id: 'marker-2',
    imageLayer: 'pin-red.png',
    position: [
        { yaw: -0.2, pitch: 0.2 },
        { yaw: 0.2, pitch: 0.2 },
        { yaw: 0.2, pitch: -0.2 },
        { yaw: -0.2, pitch: -0.2 },
    ],
}
```

::: tip “image”和“imageLayer”有什么区别？
`image` 与 `imageLayer` 都能显示图片，区别在于渲染方式。
`image` 标记会以平面形式绘制在 viewer 上方，而 `imageLayer` 会渲染在全景图内部，因此移动和缩放效果更自然。
:::

#### `videoLayer`

- 类型：`string`

视频文件路径。定位方式与 `imageLayer` 完全相同。可配合 [`chromaKey`](#chromakey) 选项使用。

```js:line-numbers{3}
{
    id: 'marker-1',
    videoLayer: 'intro.mp4',
    position: { yaw: 0, pitch: 0 },
    size: { width: 600, height: 400 },
}
```

#### `html`

- 类型：`string`

标记的 HTML 内容。建议定义 `size`。

```js:line-numbers{3}
{
    id: 'marker-1',
    html: '<strong>点击这里</strong>',
    position: { yaw: 0, pitch: 0 },
    size: { width: 100, height: 30 },
}
```

_**注意：** 内容会以 HTML 渲染。如果内容可能包含不受信任的输入，应先清理后再传给 `html`。_

#### `element`

- 类型：`HTMLElement` & [`MarkerElement`](/api/interfaces/MarkersPlugin.MarkerElement.html){target=\_blank}

现有 DOM 元素。

```js:line-numbers{3}
{
    id: 'marker-1',
    element: document.querySelector('#my-marker'),
    position: { yaw: 0, pitch: 0 },
}
```

::: tip 自定义元素标记
`element`/`elementLayer` 标记支持 [Web Components](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements)。
如果你的组件包含 `updateMarker()` 方法，插件会在每次渲染时调用它，并传入一组属性：

- `marker`：标记对象本身的引用
- `position`：在视口中计算得到的 2D 位置
- `viewerPosition`：当前相机朝向，包含 yaw+pitch
- `zoomLevel`：当前缩放级别
- `viewerSize`：视口尺寸

<DemoButton href="/demos/markers/custom-element.html"/>
:::

#### `elementLayer`

- 类型：`HTMLElement` & [`MarkerElement`](/api/interfaces/MarkersPlugin.MarkerElement.html){target=\_blank}

现有 DOM 元素。与 `element` 不同，它会渲染在场景“内部”，移动与缩放效果更自然。

```js:line-numbers{3}
{
    id: 'marker-1',
    elementLayer: getYoutubeIframe(videoId),
    position: { yaw: 0, pitch: 0 },
    rotation: { yaw: '10deg' },
}
```

<DemoButton href="/demos/markers/youtube-element.html"/>

#### `polygon`

- 类型：`Array<number[2] | string[2] | SphericalPosition> | Array<Array<...>>`

用于以球面坐标（角度或弧度）定义多边形的点数组。
多边形可以通过嵌套数组定义一个或多个孔洞（语法[类似 GeoJSON](https://geojson.readthedocs.io/en/latest/#polygon)）。

```js:line-numbers{3,8-11}
{
    id: 'marker-1',
    polygon: [[0.2, 0.4], [0.9, 1.1], [1.5, 0.7]];
}

{
    id: 'marker-2',
    polygon: [
        [[0.2, 0.4], [0.9, 1.1], [1.5, 0.7]],
        [[0.3, 0.5], [1.4, 0.8], [0.8, 1.0]], // holes coordinates must be in reverse order
    ],
}
```

#### `polygonPixels`

- 类型：`Array<number[2] | PanoramaPosition> | Array<Array<...>>`

与 `polygon` 相同，但使用全景图图片上的像素坐标。
使用立方体贴图时，可通过对象语法定义全景图面。
同样支持孔洞（见上文）。

```js:line-numbers{3,9-11}
{
    id: 'marker-1',
    polygonPixels: [[100, 200], [150, 300], [300, 200]],
}

{
    id: 'marker-2',
    polygonPixels: [
        { textureFace: 'front', textureX: 100, textureY: 200 },
        { textureFace: 'front', textureX: 150, textureY: 300 },
        { textureFace: 'front', textureX: 300, textureY: 200 },
    ],
}
```

#### `polyline`

- 类型：`Array<number[2] | string[2] | SphericalPosition>`

与 `polygon` 相同，但生成折线。

```js:line-numbers{3}
{
    id: 'marker-1',
    polyline: [[0.2, 0.4], [0.9, 1.1]],
}
```

#### `polylinePixels`

- 类型：`Array<number[2] | PanoramaPosition>`

与 `polygonPixels` 相同，但生成折线。

```js:line-numbers{3}
{
    id: 'marker-1',
    polylinePixels: [[100, 200], [150, 300]],
}
```

#### `square`

- 类型：`integer`

正方形尺寸。

```js:line-numbers{3}
{
    id: 'marker-1',
    square: 10,
    position: { yaw: 0, pitch: 0 },
}
```

#### `rect`

- 类型：`integer[2] | { width: integer, height: integer }`

矩形尺寸。

```js:line-numbers{3,9}
{
    id: 'marker-1',
    rect: [10, 5],
    position: { yaw: 0, pitch: 0 },
}

{
    id: 'marker-2',
    rect: { width: 10, height: 5 },
    position: { yaw: 0, pitch: 0 },
}
```

#### `circle`

- 类型：`integer`

圆形半径。

```js:line-numbers{3}
{
    id: 'marker-1',
    circle: 10,
    position: { yaw: 0, pitch: 0 },
}
```

#### `ellipse`

- 类型：`integer[2] | { rx: integer, ry: integer }`;

椭圆半径。

```js:line-numbers{3,9}
{
    id: 'marker-1',
    ellipse: [10, 5],
    position: { yaw: 0, pitch: 0 },
}

{
    id: 'marker-2',
    ellipse: { rx: 10, ry: 5 },
    position: { yaw: 0, pitch: 0 },
}
```

#### `path`

- 类型：`string`

路径定义（0,0 会放置在定义的 `position` 处）。

```js:line-numbers{3}
{
    id: 'marker-1',
    path: 'M0,0 L60,60 L60,0 L0,60 L0,0',
    position: { yaw: 0, pitch: 0 },
}
```

### 选项

#### `id`（必填）

- 类型：`string`

标记的唯一标识符。

#### `position`（除多边形/折线外均必填）

- 类型：`{ yaw, pitch } | { textureX, textureY } | array`

标记在**球面坐标**（弧度/角度）或**纹理坐标**（像素）中的位置。

仅对 `imageLayer` 和 `videoLayer`，它可以定义为四个位置组成的数组（从左上角开始顺时针），用于精确放置元素的四个角。

_（多边形和折线会忽略此选项。）_

#### `size`（图片必填，html/element 推荐）

- 类型：`{ width, height }`

标记尺寸，单位为像素。

_（多边形和折线会忽略此选项。）_

#### `rotation`

- 类型：`string | number | { yaw, pitch, roll }`

应用到标记的旋转角度，可使用角度或弧度。

- 对 2D 标记（`image`、`element`、`square` 等），只有 `roll` 生效
- 对 3D 标记（`imageLayer`、`videoLayer`、`elementLayer`），所有轴都生效；但如果 `position` 是数组，则会被忽略

_（多边形和折线会忽略此选项。）_

#### `scale`

- 类型：`double[] | { zoom: double[], yaw: [] }`
- 默认：不缩放

根据缩放级别和/或水平角度偏移配置标记缩放。这样用户缩放和移动时，标记尺寸会显得更自然。

_（多边形、折线和图层会忽略此选项。）_

:::: tabs

::: tab 按缩放级别缩放
根据缩放级别缩放，数组包含 `[最小缩放级别时的缩放, 最大缩放级别时的缩放]`：

```js
scale: {
  // the marker is twice smaller on the minimum zoom level
  zoom: [0.5, 1];
}
```

:::

::: tab 按角度缩放
根据位置缩放，数组包含 `[居中时的缩放, 位于侧边时的缩放]`：

```js
scale: {
  // the marker is twice bigger when on the side of the screen
  yaw: [1, 2];
}
```

:::

::: tab 按缩放级别与角度缩放
两种配置当然可以组合使用：

```js
scale: {
  zoom: [0.5, 1],
  yaw: [1, 1.5]
}
```

:::

::::

#### `hoverScale`

- 类型：`boolean | number | { amount?: number, duration?: number, easing?: string }`
- 默认：`null`

覆盖[全局 `defaultHoverScale`](#defaulthoverscale)。它会与默认配置合并。
定义 `hoverScale: false` 可以禁用此标记的缩放。

_（多边形、折线和图层会忽略此选项。）_

<DemoButton href="/demos/markers/hover-scale.html"/>

#### `opacity`

- 类型：`number`
- 默认：`1`

标记透明度。

#### `zIndex`

- 类型：`number`
- 默认：`1`

标记排序层级。

::: warning 注意
`imageLayer` 和 `videoLayer` 总是最先渲染，其次是 `polygon` 和 `polyline`，最后是标准标记。
:::

#### `className`

- 类型：`string`

添加到标记元素上的 CSS 类。

_（`imageLayer` 与 `videoLayer` 标记会忽略此选项。）_

#### `style`

- 类型：`object`

要设置到标记上的 CSS 属性（背景、边框等）。

_（对 `imageLayer` 与 `videoLayer` 标记，只能配置 `cursor`。）_

```js:line-numbers
style: {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  cursor         : 'help'
}
```

#### `svgStyle`

- 类型：`object`

要设置到标记上的 SVG 属性（fill、stroke 等）。
_（仅适用于多边形、折线和 svg 标记。）_

```js:line-numbers
svgStyle: {
  fill       : 'rgba(0, 0, 0, 0.5)',
  stroke     : '#ff0000',
  strokeWidth: '2px'
}
```

::: tip 图片和图案背景
可以使用 pattern 定义图片等复杂 SVG 背景。

<DemoButton href="/demos/markers/polygon-pattern.html"/>
:::

#### `chromaKey`

- 类型：`object`
- 默认：`{ enabled: false }`

使图片/视频中的某种颜色透明。

_（此选项仅适用于 `imagerLayer` 和 `videoLayer`。）_

<DemoButton href="/demos/markers/chroma-key.html"/>

::: dialog "查看详情" "标记色键"

`chromaKey` 标记选项可定义一种需要透明化的颜色（绿幕/蓝幕）。

```ts:line-numbers
chromaKey: {
    /**
     * 启用该选项
     */
    enabled: true,
    /**
     * 选择需要透明化的颜色（默认是绿色）
     */
    color: 0x00ff00,
    color: { r: 0, g: 255, 0 },
    /**
     * 自定义颜色检测阈值（默认是 0.2 / 0.2）
     */
    similarity: 0.2,
    smoothness: 0.2,
}
```

:::

#### `anchor`

- 类型：`string`
- 默认：`'center center'`

定义标记相对其指定位置的锚点。任何 CSS 位置都有效，例如 `bottom center` 或 `20% 80%`。

_（多边形和折线会忽略此选项。）_

#### `zoomLvl`

- 类型：`number`
- 默认：`undefined`

调用 `gotoMarker()` 方法或点击列表中的标记时应用的缩放级别。
未提供时会保留当前缩放级别。

#### `visible`

- 类型：`boolean`
- 默认：`true`

标记的初始可见性。

#### `tooltip`

- 类型：`string | {content: string, position: string, className: string, trigger: string}`
- 默认：`{content: null, position: 'top center', className: null, trigger: 'hover'}`

可用位置由 `top`、`center`、`bottom` 与 `left`、`center`、`right` 组合而成。

可用触发方式为 `hover` 和 `click`。

```js:line-numbers
tooltip: '这是一个标记' // 使用默认位置和样式的提示框

tooltip: { // 自定义位置的提示框
  content: '这是一个标记',
  position: 'bottom left',
}

tooltip: { // 点击后显示且带自定义 class 的提示框
  content: '这是一个标记',
  className: 'custom-tooltip',
  trigger: 'click',
}
```

::: tip 高级提示框
借助 HTML 和 CSS，可以制作相当复杂的提示框。

<DemoButton href="/demos/markers/custom-tooltip.html"/>
:::

#### `content`

- 类型：`string`

点击标记时显示在侧边面板中的 HTML 内容。

#### `listContent`

- 类型：`string`

显示在标记列表中的名称。未提供时会使用提示框内容。

#### `hideList`

- 类型：`boolean`
- 默认：`false`

在标记列表中隐藏该标记。

#### `autoplay`

- 类型：`boolean`
- 默认：`true`

`videoLayer` 标记自动播放。

#### `data`

- 类型：`any`

要附加到标记上的任意自定义数据。可在各类[事件](#events)中访问这些数据。

## 配置

#### `markers`

- 类型：`MarkerConfig[]`
- 可更新：否，请使用 `setMarkers()` 方法

初始标记列表。

#### `defaultHoverScale`

- 类型：`boolean | number | { amount?: number, duration?: number, easing?: string }`
- 默认：`null`

应用于所有标记的默认鼠标悬停缩放，可被每个标记的 [`hoverScale` 参数](#hoverscale)覆盖。定义 `defaultHoverScale: true` 时，会使用默认配置：100ms 内以线性缓动放大 2 倍。

#### `gotoMarkerSpeed`

- 类型：`string|number`
- 默认：`'8rpm'`
- 可更新：是

`gotoMarker` 方法的默认动画速度。

#### `clickEventOnMarker`

- 类型：`boolean`
- 默认：`false`
- 可更新：是

是否在 `select-marker` 事件之外，同时在 viewer 上触发 `click` 事件。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
  markers: '标记',
  markersList: '标记列表',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## 方法

#### `addMarker(properties)`

向 viewer 添加新标记。

```js:line-numbers
markersPlugin.addMarker({
    id: 'new-marker',
    position: { yaw: '45deg', pitch: '0deg' },
    image: 'assets/pin-red.png',
});
```

#### `clearMarkers()`

移除所有标记。

#### `getCurrentMarker(): Marker`

返回用户最后点击的标记。

#### `gotoMarker(id, [speed]): Promise`

移动视图，使其朝向指定标记。默认速度为 `8rpm`；设为 `0` 可立即旋转。

```js:line-numbers
markersPlugin.gotoMarker('marker-1', '4rpm')
  .then(() => /* animation complete */);
```

#### `hideMarker(id)` | `showMarker(id)` | `toggleMarker(id)`

修改标记的可见性。

#### `removeMarker(id)` | `removeMarkers(ids)`

移除标记。

#### `setMarkers(properties[])`

用新标记替换所有标记。

#### `updateMarker(properties)`

使用新属性更新标记。标记类型不能更改。

```js:line-numbers
markersPlugin.updateMarker({
    id: 'existing-marker',
    image: 'assets/pin-blue.png',
});
```

#### `showMarkerTooltip(id)` | `hideMarkerTooltip(id)`

允许始终显示某个提示框。

#### `showAllTooltips()` | `hideAllTooltips()` | `toggleAllTooltips()`

允许始终显示所有提示框。

## 事件

#### `select-marker(marker, doubleClick, rightClick)`

用户点击标记时触发。

```js:line-numbers
markersPlugin.addEventListener('select-marker', ({ marker }) => {
    console.log(`Clicked on marker ${marker.id}`);
});
```

#### `unselect-marker(marker)`

某个标记已选中且用户点击其他位置时触发。

#### `marker-visibility(marker, visible)`

标记可见性变化时触发。

```js:line-numbers
markersPlugin.addEventListener('marker-visibility', ({ marker, visible }) => {
    console.log(`Marker ${marker.id} is ${visible ? 'visible' : 'not visible'}`);
});
```

#### `enter-marker(marker)` | `leave-marker(marker)`

用户将光标移入或移出标记时触发。

## 按钮

此插件会向默认导航栏添加按钮：

- `markers` 用于隐藏/显示所有标记
- `markersList` 用于在左侧面板打开所有标记的列表

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。
