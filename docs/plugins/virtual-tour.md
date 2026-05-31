# VirtualTourPlugin <Badge text="样式"/>

<Badges module="virtual-tour-plugin"/>

::: module
<ApiButton page="modules/VirtualTourPlugin.html"/>
通过连接多个全景图创建虚拟导览。

这个插件由 [@photo-sphere-viewer/virtual-tour-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/virtual-tour-plugin) 包提供。
:::

## 用法

```js:line-numbers
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';

const viewer = new Viewer({
    plugins: [
        VirtualTourPlugin.withConfig({
            nodes: [...],
            // or
            getNode: async (id) => { ... },
            startNodeId: ...,
        }),
    ],
});
```

插件使用一组节点；每个节点包含一个 `panorama`、一个或多个指向其他节点的 `links`，以及额外选项。

节点既可以一次性全部提供，也可以随着用户导航异步加载。

:::: tabs

::: tab 客户端模式
客户端模式下必须一次性提供所有 `nodes`，也可以通过 `setNodes` 方法替换节点。

```js:line-numbers
nodes: [
    { id: 'node-1', panorama: '001.jpg', links: [{ nodeId: 'node-2', position: { textureX: 1500, textureY: 780 } }] },
    { id: 'node-2', panorama: '002.jpg', links: [{ nodeId: 'node-1', position: { textureX: 3000, textureY: 780 } }] },
],
```

:::

::: tab 服务端模式
服务端模式下需要提供 `getNode` 函数，它返回一个 Promise，用于加载节点数据。

```js:line-numbers
startNodeId: 'node-1',
getNode: async (nodeId) => {
    const res = await fetch(`/api/nodes/${nodeId}`);
    return await res.json();
},
```

:::

::::

链接位置有两种定义方式：手动模式和 GPS 模式。

:::: tabs

::: tab 手动模式
在手动模式下，每个链接都必须包含 `yaw`/`pitch` 或 `textureX`/`textureY` 坐标，才能放置到全景图的正确位置。这与标记的放置方式完全相同。

```js:line-numbers
const node = {
    id: 'node-1',
    panorama: '001.jpg',
    links: [
        {
            nodeId: 'node-2',
            position: { textureX: 1500, textureY: 780 },
        },
    ],
};
```

:::

::: tab GPS 模式
在 GPS 模式下，每个节点都有定位坐标，链接会自动放置。

```js:line-numbers
const node = {
    id: 'node-1',
    panorama: '001.jpg',
    gps: [-80.156479, 25.666725], // 第三个值可选填高度
    links: [
        {
            nodeId: 'node-2',
            gps: [-80.156168, 25.666623], // 服务端模式下必须在这里提供目标节点的位置
        },
    ],
};
```

:::

::::

::: tip 提示
[图库插件](./gallery.md)、[地图插件](./map.md)、[平面图插件](./plan.md)和[指南针插件](./compass.md)都可以轻松集成到虚拟导览中。
:::

## 示例

::: code-demo

```yaml
title: 全景图查看器虚拟导览示例
packages:
  - name: virtual-tour-plugin
    style: true
  - name: gallery-plugin
    style: true
  - name: markers-plugin
    style: true
```

<<< ./demos-src/virtual-tour.js{js:line-numbers}

:::

## 节点

### 定义

#### `id`（必填）

- 类型：`string`

节点的唯一标识符。

#### `panorama`（必填）

请参考主[配置页面](../guide/config.md#panorama-required)。

#### `caption` / `description` / `panoData` / `sphereCorrection`

请参考主[配置页面](../guide/config.md)。

#### `links`（客户端模式必填）

- 类型：`array`

此节点的链接定义。[见下文](#links)。

#### `gps`（GPS 模式必填）

- 类型：`number[]`

此节点的 GPS 坐标，由两个或三个值组成的数组表示（`[longitude, latitude, altitude?]`）。

::: warning 投影系统
仅支持 [ESPG:4326 投影](https://epsg.io/4326)。
:::

#### `name`

- 类型：`string`

此节点的短名称，用于链接提示框和 GalleryPlugin。

#### `showInGallery`

- 类型：`boolean`
- 默认：`true`

在 GalleryPlugin 中显示此节点。

#### `thumbnail`

- 类型：`string`

GalleryPlugin 节点列表中使用的缩略图。

#### `markers`

- 类型：`MarkerConfig[]`

显示在此节点上的额外标记，需要[标记插件](./markers.md)。

标记可以使用经典的 `position` 选项（yaw + pitch）定位；如果 `positionMode=gps`，也可以使用 `gps` 选项（经度 + 纬度 + 高度）定位。

#### `map`（仅客户端模式）

使用[地图插件](map.md)时的热点配置。详见[全局配置](#map-client-mode-only-1)。

设为 `false` 可在地图上隐藏该节点（注意：如果 `positionMode=manual`，这可能导致地图定位不符合预期）。

#### `plan`（仅客户端 + GPS 模式）

使用[平面图插件](plan.md)时的热点配置。节点会自动放置在地图上，但你可以自定义[热点样式](plan.md#hotspots-1)。

设为 `false` 可在 plan 中隐藏该节点。

#### `data`

- 类型：`any`

要附加到节点上的任意自定义数据。

### 链接

#### `nodeId`（必填）

- 类型：`string`

目标节点的标识符。

#### `position`（手动模式必填）

- 类型：`{ yaw, pitch } | { textureX, textureY }`

链接在**球面坐标**（弧度/角度）或**纹理坐标**（像素）中的位置。

#### `gps`（GPS + 服务端模式必填）

- 类型：`number[]`

定义目标节点的 GPS 坐标。必须提供此项，才能在不加载目标节点的情况下定位链接。

#### `linkOffset`

- 类型：`{ yaw?, pitch?, depth? }`

添加到最终链接位置的偏移量，用于移动标记/箭头，同时不影响进入下一个节点前 viewer 旋转到的位置。

`depth` 仅在 3D 渲染模式下用于处理重叠箭头。注意，重叠箭头会自动变透明（取决于 `arrowsPosition.linkOverlapAngle`）。

#### `arrowStyle`

覆盖用于显示链接的箭头全局样式。详见全局配置。

#### `data`

- 类型：`any`

要附加到链接上的任意自定义数据。

## 配置

#### `dataMode`

- 类型：`'client' | 'server'`
- 默认：`'client'`
- 可更新：否

配置节点配置的提供方式。

#### `positionMode`

- 类型：`'manual' | 'gps'`
- 默认：`'manual'`
- 可更新：否

配置节点之间链接的定位方式。

#### `renderMode`

- 类型：`'2d' | '3d'`
- 默认：`'3d'`
- 可更新：否

链接的显示方式。

#### `nodes`（仅客户端模式）

- 类型：`array`
- 可更新：否

初始节点列表。也可以稍后调用 `setNodes` 方法。

#### `getNode(nodeId)`（服务端模式必填）

- 类型：`function(nodeId: string) => Promise<Node>`
- 可更新：否

用于加载节点配置的回调。

#### `startNodeId`（服务端模式必填）

- 类型：`string`
- 可更新：否

初始加载节点的 id。留空时会显示第一个节点。也可以稍后调用 `setCurrentNode` 方法。

#### `preload`

- 类型：`boolean | function(node: Node, link: NodeLink) => boolean`
- 默认：`false`
- 可更新：否

启用链接节点的预加载。也可以是一个函数，为每个链接返回 true 或 false。

#### `transitionOptions`

- 类型：`object | function`
- 默认：`{ showLoader: true, speed: '20rpm', effect: 'fade', rotation: true }`
- 可更新：否

节点之间的过渡配置。可以是回调函数。

::: dialog "查看详情" "虚拟导览 transitionOptions"

`transitionOptions` 可以定义为静态对象，也可以定义为切换到新节点前调用的函数。

默认行为是将视图旋转到链接方向，并以淡入效果过渡到下一个节点。

**如果定义为对象，类型为：**

```ts:line-numbers
{
    /**
     * 加载新全景图时显示加载器
     * @default true
     */
    showLoader?: boolean;
    /**
     * 启用节点之间的过渡
     * @default 'fade'
     */
    effect?: 'none' | 'fade' | 'black' | 'white';
    /**
     * 节点过渡的速度或持续时间
     * @default '20rpm'
     */
    speed?: string | number;
    /**
     * 启用朝向下一个节点方向的旋转
     * @default true
     */
    rotation?: boolean;
}
```

**如果定义为函数，签名为：**

```ts:line-numbers
(toNode: Node, fromNode?: Node, fromLink?: NodeLink) => ({
    showLoader?: boolean;
    effect?: 'none' | 'fade' | 'black' | 'white';
    speed?: string | number;
    rotation?: boolean;
    /**
     * Define where to rotate the current panorama before switching to the next
     * if not defined it will use the link's position
     */
    rotateTo?: Position;
    /**
     * Define the new zoom level
     * if not defined it will keep the current zoom level
     */
    zoomTo?: number;
})
```

:::

#### `linksOnCompass`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

如果启用了[指南针插件](./compass.md)，则在指南针上显示链接。

#### `showLinkTooltip`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

是否在每个链接上显示提示框。默认提示框包含 `name` + `thumbnail` + `caption`，可通过 [getLinkTooltip](#getlinktooltipcontent-link-node) 选项自定义。

#### `getLinkTooltip(content, link, node)`

- 类型：`function(string, link, node) => string`
- 默认：`null`
- 可更新：否

用于替换/修改链接提示框的回调。第一个参数是默认提示框内容。

#### `map`（仅客户端模式）

使用[地图插件](./map.md)时的配置。

::::: dialog "查看详情" "虚拟导览地图"

使用地图插件可以在地图上显示每个节点的位置。这需要一些额外配置，尤其是在使用 GPS 坐标时。

::: warning 地图图片
地图图片必须通过虚拟导览插件配置中的 `map.imageUrl` 设置。地图插件中的 `imageUrl` 会被忽略。
:::

:::: tabs

::: tab 手动配置地图

如果 `positionMode=manual`，此配置**必填**；它也可以与 `positionMode=gps` 一起使用。

要定义节点在地图上的位置，必须在其 `map` 属性中配置 `x` 和 `y`。
还可以配置 `color`、`image`、`size` 等内容。请参考地图插件的[热点部分](map.md#hotspots-1)。

```js:line-numbers{10}
plugins: [
    VirtualTourPlugin.withConfig({
        map: {
            imageUrl: 'map.jpg',
        },
        nodes: [
            {
                id: 'node-1',
                panorama: '001.jpg',
                map: { x: 500, y: 815, color: 'red' },
            },
        ],
    }),
],
```

:::

::: tab 使用 GPS 配置地图

此配置**只能**在 `positionMode=gps` 时使用。

必须提供地图的额外元数据，自动定位才能工作：以像素为单位的 `size`，以及 `extent`（GPS 边界）。

```js:line-numbers{5-6,13}
plugins: [
    VirtualTourPlugin.withConfig({
        map: {
            imageUrl: 'map.jpg',
            size: { width: 1600, height: 1200 },
            extent: [-80.158123, 25.668050, -80.153824, 25.665308],
        },
        nodes: [
            {
                id: 'node-1',
                panorama: '001.jpg',
                gps: [-80.155487, 25.666000]
                map: { color: 'red' },
            },
        ],
    }),
],
```

每个节点仍可包含 `map` 属性，用于覆盖 `color`、`image` 和 `size`。

:::

::::

:::::

#### `arrowStyle`

- 类型：`object`
- 可更新：否

用于显示链接的箭头样式。

默认值为：

```js:line-numbers
{
  element: // a circular button with a ripple effect
  size   : { width: 80, height: 80 },
}
```

也可以使用 `image`（图片文件路径），并通过 `style` 和 `className` 添加自定义 CSS。

#### `arrowsPosition`（仅 3d 模式）

- 类型：`object`
- 可更新：否

默认值为：

```js:line-numbers
{
    /* (3D mode) Minimal vertical view angle */
    minPitch: 0.3,
    /* (3D mode) Maximal vertical view angle */
    maxPitch: Math.PI / 2,
    /* (3D mode) Make transparent links that are close to each other */
    linkOverlapAngle: Math.PI / 4,
    /* 2D + GPS 模式下应用到链接标记的垂直偏移，用于补偿查看器高度 */
    linkPitchOffset: -0.1,
}
```

## 方法

#### `setNodes(nodes, [startNodeId])`（仅客户端模式）

修改节点并显示第一个节点（或由 `startNodeId` 指定的节点）。

#### `updateNode(node)`（仅客户端模式）

更新单个节点。如果它是当前节点，查看器会同步更新。除 `id` 外，所有属性都是可选的。

```js:line-numbers
virtualTourPlugin.updateNode({
    id: 'node-1',
    caption: '新的标题',
    links: [...newLinks],
});
```

#### `setCurrentNode(nodeId, [options])`

修改当前节点。`options` 可用于覆盖默认的 `transitionOptions`。

#### `gotoLink(nodeId, [speed]): Promise`

移动视图，使其朝向指定链接。默认速度为 `8rpm`；设为 `0` 可立即旋转。

```js:line-numbers
virtualTourPlugin.gotoLink('2', '4rpm')
  .then(() => /* animation complete */);
```

#### `getCurrentNode()`

返回当前节点。

#### `getLinkPosition(nodeId): Position`

返回链接在查看器中的位置。

## 事件

#### `node-changed(node, data)`

当前节点变化时触发。

```js:line-numbers
virtualTourPlugin.addEventListener('node-changed', ({ node, data }) => {
    console.log(`Current node is ${node.id}`);
    if (data.fromNode) {
        // other data are available
        console.log(`Previous node was ${data.fromNode.id}`);
    }
});
```

#### `enter-arrow(link, node)` | `leave-arrow(link, node)`

用户将光标移入或移出箭头时触发。

## SCSS 变量

| 变量               | 默认值                                     | 说明                     |
| ------------------ | ------------------------------------------ | ------------------------ |
| $link-button-color | rgba(255, 255, 255, 0.8)                   | 默认箭头图片颜色         |
| $link-button-ring  | rgb(97, 170, 242)                          | 鼠标悬停时环形效果的颜色 |
| $link-shadow       | drop-shadow(0 10px 2px rgba(0, 0, 0, 0.7)) | 应用于所有箭头的阴影     |
