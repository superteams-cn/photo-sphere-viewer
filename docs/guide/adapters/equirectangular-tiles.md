# 等距柱状瓦片

<Badges module="equirectangular-tiles-adapter"/>

::: module
通过把大型等距柱状全景图切分为许多更小的瓦片，减少初始加载时间和带宽占用。

此适配器由 [@photo-sphere-viewer/equirectangular-tiles-adapter](https://www.npmjs.com/package/@photo-sphere-viewer/equirectangular-tiles-adapter) 包提供。
:::

```js:line-numbers
import { EquirectangularTilesAdapter } from '@photo-sphere-viewer/equirectangular-tiles-adapter';

const viewer = new Viewer({
    adapter: EquirectangularTilesAdapter,
    panorama: {
        width: 12000,
        cols: 16,
        rows: 8,
        baseUrl: 'panorama_low.jpg',
        tileUrl: (col, row) => {
            return `panorama_${col}_${row}.jpg`;
        },
    },
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器等距柱状瓦片示例
packages:
  - name: equirectangular-tiles-adapter
```

<<< ./demos-src/equirectangular-tiles.js{js:line-numbers}

:::

::: tip 位置定义
使用此适配器时，像素位置基于全景图的完整尺寸（使用多级瓦片时，指第一级尺寸）。
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

#### `resolution`

见[等距柱状适配器配置](./equirectangular.md#resolution)。

## 全景图选项

使用此适配器时，`panorama` 选项和 `setPanorama()` 方法接受一个用于配置瓦片的对象。

可以提供单个瓦片配置，也可以提供多个会在不同缩放级别应用的配置。这样可以按当前缩放级别提供合适文件，在不过度占用带宽的情况下实现很高的分辨率。

:::: tabs

::: tab 单级

#### `width` (必填)

- 类型：`number`

全景图总宽度，高度始终为宽度的一半。

#### `cols` (必填)

- 类型：`number`

列数，必须是 2 的幂（4、8、16、32、64），最大值为 64。

#### `rows` (必填)

- 类型：`number`

行数，必须是 2 的幂（2、4、8、16、32），最大值为 32。

#### `tileUrl` (必填)

- 类型：`function: (col, row) => string`

用于构建瓦片 URL 的函数。
如果函数返回 `null`，对应瓦片将不会加载。

#### `baseUrl` (建议)

- 类型：`string`

低分辨率完整全景图的 URL，用于在瓦片加载期间显示。

#### `basePanoData`

- 类型：`object | function<Image, object>`

与低分辨率首图关联的全景图配置，格式与 [`panoData` 配置对象](../config.md#panodata)相同。

:::

::: tab 多级

#### `levels` (必填)

- 类型：`array`

可用瓦片配置数组。每个元素都是包含 `width`、`cols` 和 `rows` 的对象（见“单级”）。系统会根据当前缩放级别和查看器尺寸选择最合适的尺寸。

```js:line-numbers
levels: [
    {
        width: 6144,
        cols: 16,
        rows: 8,
    },
    {
        width: 12288,
        cols: 32,
        rows: 16,
    },
    {
        width: 24576,
        cols: 64,
        rows: 32,
    },
]
```

#### `tileUrl` (必填)

- 类型：`function: (col, row, level) => string`

用于构建瓦片 URL 的函数。
如果函数返回 `null`，对应瓦片将不会加载。

#### `baseUrl` (建议)

- 类型：`string`

低分辨率完整全景图的 URL，用于在瓦片加载期间显示。

#### `basePanoData`

- 类型：`object | function<Image, object>`

与低分辨率首图关联的全景图配置，格式与 [`panoData` 配置对象](../config.md#panodata)相同。

:::

::::

## 准备全景图

可以使用 [ImageMagick](https://imagemagick.org) 工具轻松生成瓦片。

假设你有一张 12,000×6,000 像素的全景图，并希望将其切分为 16 列、8 行，可以使用以下命令：

```
magick.exe panorama.jpg \
  -crop 750x750 -quality 95 \
  -set filename:tile "%[fx:page.x/750]_%[fx:page.y/750]" \
  -set filename:orig %t \
  %[filename:orig]_%[filename:tile].jpg
```

也可以使用这个[在线工具](https://pinetools.com/split-image)。

::: tip 性能
建议瓦片尺寸不要超过 1024×1024 像素，因此最大全景尺寸限制为 65,536×32,768 像素（2 十亿像素）。
:::
