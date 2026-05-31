# 图库插件

`@photo-sphere-viewer/gallery-plugin` 用于展示多个全景图条目，让用户在同一查看器中快速切换不同场景。

## 安装

```bash
pnpm add @photo-sphere-viewer/gallery-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import '@photo-sphere-viewer/gallery-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama-1.jpg',
  plugins: [
    [
      GalleryPlugin,
      {
        items: [
          { id: 'one', panorama: 'panorama-1.jpg', name: '场景一' },
          { id: 'two', panorama: 'panorama-2.jpg', name: '场景二' },
        ],
      },
    ],
  ],
});
```

## 文档

详见[图库插件文档](https://photo-sphere-viewer.js.org/plugins/gallery.html)。

## 许可证

MIT
