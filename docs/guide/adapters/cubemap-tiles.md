# 立方体瓦片

<Badges module="cubemap-tiles-adapter"/>

::: module
通过把大型立方体全景图切分为许多小瓦片，减少初始加载时间和带宽占用。

此适配器由 [@photo-sphere-viewer/cubemap-tiles-adapter](https://www.npmjs.com/package/@photo-sphere-viewer/cubemap-tiles-adapter) 包提供。
:::

```js:line-numbers
import { CubemapTilesAdapter } from '@photo-sphere-viewer/cubemap-tiles-adapter';

const viewer = new Viewer({
    adapter: CubemapTilesAdapter,
    panorama: {
        faceSize: 6000,
        nbTiles: 8,
        baseUrl: {
            left: 'left_low.jpg',
            front: 'front_low.jpg',
            right: 'right_low.jpg',
            back: 'back_low.jpg',
            top: 'top_low.jpg',
            bottom: 'bottom_low.jpg',
        },
        tileUrl: (face, col, row) => {
            return `${face}_${col}_${row}.jpg`;
        },
    },
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器立方体瓦片示例
packages:
  - name: cubemap-adapter
  - name: cubemap-tiles-adapter
```

<<< ./demos-src/cubemap-tiles.js{js:line-numbers}

:::

::: tip 位置定义
使用此适配器时，像素位置需要额外提供 `textureFace` 属性（例如：`{ textureFace: 'front', textureX: 200, textureY: 800 }`）。该位置基于单个面的完整尺寸（使用多级瓦片时，指第一级尺寸）。
:::

## 配置

#### `baseBlur`

- 类型：`boolean`
- 默认值：`true`

对基础图片（`baseUrl` 选项）应用模糊滤镜。

#### `showErrorTile`

- 类型：`boolean`
- 默认值：`true`

在无法加载的瓦片上显示警告标志。

#### `antialias`

- 类型：`boolean`
- 默认值：`true`

对高分辨率瓦片应用抗锯齿。

## 全景图选项

使用此适配器时，`panorama` 选项和 `setPanorama()` 方法接受一个用于配置瓦片的对象。

你可以提供单个瓦片配置，也可以提供多个会在不同缩放级别应用的配置。这样可以按当前缩放级别提供合适文件，在不过度占用带宽的情况下实现很高的分辨率。

:::: tabs

::: tab 单级

#### `faceSize` (必填)

- 类型：`number`

立方体单个面的像素尺寸。

#### `nbTiles` (必填)

- 类型：`number`

单个面上的列数和行数。每个瓦片都必须是正方形。该值必须是 2 的幂（2、4、8、16），最大值为 16。

#### `tileUrl` (必填)

- 类型：`function: (face, col, row) => string`

用于构建瓦片 URL 的函数。`face` 会是 `'left'|'front'|'right'|'back'|'top'|'bottom'` 之一。
如果函数返回 `null`，对应瓦片将不会加载。

#### `flipTopBottom`

见[立方体贴图适配器配置](./cubemap.md#panorama-options)。

#### `baseUrl` (建议)

- 类型：`any`

低分辨率完整全景图的 URL，用于在瓦片加载期间显示。它接受与标准[立方体贴图适配器](./cubemap.md#panorama-options)相同的格式。

:::

::: tab 多级

#### `levels` (必填)

- 类型：`array`

可用瓦片配置数组。每个元素都是包含 `faceSize` 和 `nbTiles` 的对象（见“单级”）。系统会根据当前缩放级别和查看器尺寸选择最合适的尺寸。

```js:line-numbers
levels: [
    {
        faceSize: 3000,
        nbTiles: 4,
    },
    {
        faceSize: 6000,
        nbTiles: 8,
    },
    {
        faceSize: 12000,
        nbTiles: 16,
    },
]
```

#### `tileUrl` (必填)

- 类型：`function: (face, col, row, level) => string`

用于构建瓦片 URL 的函数。`face` 会是 `'left'|'front'|'right'|'back'|'top'|'bottom'` 之一。
如果函数返回 `null`，对应瓦片将不会加载。

#### `flipTopBottom`

见[立方体贴图适配器配置](./cubemap.md#panorama-options)。

#### `baseUrl` (建议)

- 类型：`any`

低分辨率完整全景图的 URL，用于在瓦片加载期间显示。它接受与标准[立方体贴图适配器](./cubemap.md#panorama-options)相同的格式。

:::

::::

## 准备全景图

可以使用 [ImageMagick](https://imagemagick.org) 工具轻松生成瓦片。

假设你有一个每个面为 6,000×6,000 像素的立方体贴图，并希望将每个面切分为 8×8 个瓦片，可以对每个面使用以下命令：

```
magick.exe front.jpg \
  -crop 750x750 -quality 95 \
  -set filename:tile "%[fx:page.x/750]_%[fx:page.y/750]" \
  -set filename:orig %t \
  %[filename:orig]_%[filename:tile].jpg
```

也可以使用这个[在线工具](https://pinetools.com/split-image)。

::: tip 性能
建议瓦片尺寸不要超过 1024×1024 像素，因此每个面的最大全景尺寸限制为 16,384×16,384 像素（总计 1.6 十亿像素）。
:::
