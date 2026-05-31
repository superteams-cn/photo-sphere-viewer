# 立方体贴图

<Badges module="cubemap-adapter"/>

::: module
[立方体贴图](https://en.wikipedia.org/wiki/Cube_mapping)是一种投影方式，会把环境映射到围绕查看器的立方体六个面上。

此适配器由 [@photo-sphere-viewer/cubemap-adapter](https://www.npmjs.com/package/@photo-sphere-viewer/cubemap-adapter) 包提供。
:::

```js:line-numbers
import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter';

const viewer = new Viewer({
    adapter: CubemapAdapter,
    panorama: {
        left: 'path/to/left.jpg',
        front: 'path/to/front.jpg',
        right: 'path/to/right.jpg',
        back: 'path/to/back.jpg',
        top: 'path/to/top.jpg',
        bottom: 'path/to/bottom.jpg',
    },
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器立方体贴图示例
packages:
  - name: cubemap-adapter
```

<<< ./demos-src/cubemap.js{js:line-numbers}

:::

::: tip 位置定义
使用此适配器时，像素位置需要额外提供 `textureFace` 属性（例如：`{ textureFace: 'front', textureX: 200, textureY: 800 }`）。
:::

## 全景图选项 {#panorama-options}

使用此适配器时，`panorama` 选项和 `setPanorama()` 方法接受三种类型的立方体贴图。

### 分离文件

每个面位于独立文件中；显示全景图前会先加载所有文件。

::: code-group

```js:line-numbers [array]
// 顺序很重要
panorama: [
  'path/to/left.jpg',
  'path/to/front.jpg',
  'path/to/right.jpg',
  'path/to/back.jpg',
  'path/to/top.jpg',
  'path/to/bottom.jpg',
]
```

```js:line-numbers [object]
panorama: {
  left:   'path/to/left.jpg',
  front:  'path/to/front.jpg',
  right:  'path/to/right.jpg',
  back:   'path/to/back.jpg',
  top:    'path/to/top.jpg',
  bottom: 'path/to/bottom.jpg',
}
```

```js:line-numbers [object (alt)]
panorama: {
  type: 'separate',
  paths: /* array or object */,
  // 可选：如果顶部和底部面方向不正确，可设为 `true`
  flipTopBottom: false,
}
```

:::

::: tip 局部立方体贴图
可以为一个或多个面提供 `null` URL，从而跳过对应面的加载。
:::

### 条带

所有面都位于同一个文件中，并按水平条带排列。默认条带顺序为 `left, front, right, back, top, bottom`，也可以通过 `order` 字段修改。

![](/images/cubemap-stripe.png)

```js:line-numbers
panorama: {
  type: 'stripe',
  path: 'path/to/panorama.jpg',
  // 可选：如果顶部和底部面方向不正确，可设为 `true`
  flipTopBottom: false,
  // 可选：调整条带中各面的顺序
  order: ['left', 'right', 'top', 'bottom', 'back', 'front'],
}
```

### 多面体展开图

所有面都位于同一个文件中，并按水平“T”形立方体展开图排列。

![](/images/cubemap-net.png)

```js:line-numbers
panorama: {
  type: 'net',
  path: 'path/to/panorama.jpg',
}
```
