# 立方体瓦片适配器

`@photo-sphere-viewer/cubemap-tiles-adapter` 用于按需加载立方体贴图瓦片，适合超高清全景图和需要降低初始加载成本的场景。

## 安装

```bash
pnpm add @photo-sphere-viewer/cubemap-tiles-adapter
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { CubemapTilesAdapter } from '@photo-sphere-viewer/cubemap-tiles-adapter';

const viewer = new Viewer({
  container: 'viewer',
  adapter: CubemapTilesAdapter,
  panorama: {
    faceSize: 6000,
    nbTiles: 16,
    tileUrl: (face, col, row) => `tiles/${face}/${col}_${row}.jpg`,
  },
});
```

## 文档

详见[立方体瓦片适配器文档](https://photo-sphere-viewer.js.org/guide/adapters/cubemap-tiles.html)。

## 许可证

MIT
