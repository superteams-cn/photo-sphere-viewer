# 立方体贴图适配器

`@photo-sphere-viewer/cubemap-adapter` 让全景图查看器可以加载立方体贴图全景图，适合由六个面组成的全景素材。

## 安装

```bash
pnpm add @photo-sphere-viewer/cubemap-adapter
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter';

const viewer = new Viewer({
  container: 'viewer',
  adapter: CubemapAdapter,
  panorama: {
    left: 'left.jpg',
    front: 'front.jpg',
    right: 'right.jpg',
    back: 'back.jpg',
    top: 'top.jpg',
    bottom: 'bottom.jpg',
  },
});
```

## 文档

详见[立方体贴图适配器文档](https://photo-sphere-viewer.js.org/guide/adapters/cubemap.html)。

## 许可证

MIT
