# 图库插件 <Badge text="样式"/>

<Badges module="gallery-plugin"/>

::: module
<ApiButton page="modules/GalleryPlugin.html"/>
在查看器底部添加图库，用于在多个全景图之间导航。

这个插件由 [@photo-sphere-viewer/gallery-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/gallery-plugin) 包提供。
:::

::: warning 注意
图库插件与分辨率插件不兼容。
:::

## 用法

插件维护一个 `items` 列表，每个项目配置对应的全景图、名称和缩略图。

```js:line-numbers
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';

const viewer = new Viewer({
    plugins: [
        GalleryPlugin.withConfig({
            items: [
                {
                    id: 'pano-1',
                    name: '全景图 1',
                    panorama: 'path/to/pano-1.jpg',
                    thumbnail: 'path/to/pano-1-thumb.jpg',
                },
                {
                    id: 'pano-2',
                    name: '全景图 2',
                    panorama: 'path/to/pano-2.jpg',
                    thumbnail: 'path/to/pano-2-thumb.jpg',
                },
            ],
        }),
    ],
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器图库示例
packages:
  - name: gallery-plugin
    style: true
```

<<< ./demos-src/gallery.js{js:line-numbers}

:::

## 配置

#### `items`

- 类型：`GalleryItem[]`
- 可更新：否，请使用 `setItems()` 方法

项目列表，详见下文。

#### `navigationArrows`

- 类型：`boolean`
- 默认：`false`
- 可更新：否

在图库两侧显示导航箭头。

#### `visibleOnLoad`

- 类型：`boolean`
- 默认：`false`
- 可更新：否

加载第一个全景图时显示图库。用户之后可以通过导航栏按钮切换图库显示状态。

#### `hideOnClick`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

用户点击项目后隐藏图库（屏幕宽度小于 500px 时强制为 `true`）。

#### `thumbnailSize`

- 类型：`{ width: number, height: number }`
- 默认：`{ width: 200, height: 100 }`
- 可更新：是

缩略图尺寸。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    gallery: '图库',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

### 项目

#### `id`（必填）

- 类型：`number|string`

项目的唯一标识符。

#### `thumbnail`（推荐）

- 类型：`string`
- 默认：`''`

缩略图 URL。

#### `name`

- 类型：`string`
- 默认：`''`

显示在缩略图上的文字。

#### `panorama`（必填）

请参考主[配置页面](../guide/config.md#panorama-required)。

#### `options`

- 类型：`PanoramaOptions`
- 默认：`null`

[setPanorama()](../guide/methods.md#setpanorama-panorama-options-promise) 方法支持的任意选项。

## 方法

#### `setItems(items)`

修改项目列表。

## 按钮

此插件会向默认导航栏添加按钮：

- `gallery` 用于切换图库面板

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。

## SCSS 变量

| 变量                | 默认值                        | 说明                             |
| ------------------- | ----------------------------- | -------------------------------- |
| $breakpoint         | 500px                         | 低于此屏幕尺寸时，图库以全高显示 |
| $padding            | 15px                          | 容器内边距                       |
| $border             | 1px solid core.$buttons-color | 图库与导航栏之间的边框           |
| $background         | core.$navbar-background       | 图库背景                         |
| $item-radius        | 5px                           | 图库项目圆角                     |
| $item-active-border | 3px solid white               | 当前图库项目边框                 |
| $title-font         | core.$caption-font            | 图库项目标题字体                 |
| $title-color        | core.$caption-text-color      | 图库项目标题颜色                 |
| $title-background   | rgba(0, 0, 0, .6)             | 图库项目标题背景                 |
| $thumb-hover-scale  | 1.2                           | 鼠标悬停时缩略图的缩放比例       |
| $arrow-color        | rgba(255, 255, 255, 0.6)      | 导航箭头颜色                     |
| $arrow-background   | rgba(0, 0, 0, 0.6)            | 导航箭头背后渐变的颜色           |
| $scrollbar-color    | $arrow-color                  | 滚动条颜色（需要浏览器支持）     |
