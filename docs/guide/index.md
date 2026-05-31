# 快速开始

<Badges module="core"/>

::: tip 调试台
可以在 [调试台](../playground.md) 中使用自己的全景图测试全景图查看器。
:::

## 安装全景图查看器

#### 使用包管理器

```bash
pnpm add @photo-sphere-viewer/core
```

#### 通过 CDN

你也可以通过 [jsDelivr](https://www.jsdelivr.com/?query=@photo-sphere-viewer) 使用全景图查看器。

#### 手动下载

你也可以 [下载最新发布版本](https://github.com/mistic100/Photo-Sphere-Viewer/releases)。

## 依赖

- [Three.js](https://threejs.org)

## 第一个全景查看器

在页面中手动引入 JS/CSS，或使用你熟悉的构建工具，然后初始化查看器。

::::: tabs

:::: tab 从 CDN 导入

通过 CDN 或静态文件导入时，需要使用 [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)，并将脚本标签声明为 `type="module"`。

```html:line-numbers
<head>
    <!-- 为高 DPI 设备提供更好的显示效果 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.min.css" />
</head>

<!-- 查看器容器必须有明确尺寸 -->
<div id="viewer" style="width: 100vw; height: 100vh;"></div>

<script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three/build/three.module.js",
            "@photo-sphere-viewer/core": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core/index.module.js"
        }
    }
</script>

<script type="module">
    import { Viewer } from '@photo-sphere-viewer/core';

    const viewer = new Viewer({
        container: document.querySelector('#viewer'),
        panorama: 'path/to/panorama.jpg',
    });
</script>
```

::::

:::: tab 使用包管理器和构建工具

不同构建工具的配置方式差异较大，这里只展示核心结构。

```html:line-numbers
<head>
    <!-- 为高 DPI 设备提供更好的显示效果 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<!-- 查看器容器必须有明确尺寸 -->
<div id="viewer" style="width: 100vw; height: 100vh;"></div>
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const viewer = new Viewer({
    container: document.querySelector('#viewer'),
    panorama: 'path/to/panorama.jpg',
});
```

::: tip 样式文件
请根据你的构建工具，以合适的方式导入 `@photo-sphere-viewer/core/index.css`。
:::

::::

:::::

<br>

::: code-demo

```yaml
autoload: true
title: 全景图查看器基础示例
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
});
```

:::

`panorama` 必须是照片的 [等距柱状投影](https://en.wikipedia.org/wiki/Equirectangular_projection)。其他模式可以通过 [适配器](./adapters/) 支持。

::: tip 裁剪全景图
如果图片没有覆盖完整的 360°×180° 球面，显示时会发生变形。可以通过提供 [裁剪数据](./adapters/equirectangular.md#cropped-panorama) 修正。
:::
