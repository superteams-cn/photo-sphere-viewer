# 等距柱状瓦片适配器

`@photo-sphere-viewer/equirectangular-tiles-adapter` 用于按需加载等距柱状全景图瓦片，适合超高清全景图、分级加载和移动端性能优化。

## 安装

```bash
pnpm add @photo-sphere-viewer/equirectangular-tiles-adapter
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { EquirectangularTilesAdapter } from '@photo-sphere-viewer/equirectangular-tiles-adapter';

const viewer = new Viewer({
  container: 'viewer',
  adapter: EquirectangularTilesAdapter,
  panorama: {
    width: 12000,
    cols: 16,
    rows: 8,
    tileUrl: (col, row) => `tiles/${col}_${row}.jpg`,
  },
});
```

## 文档

详见[等距柱状瓦片适配器文档](https://photo-sphere-viewer.js.org/guide/adapters/equirectangular-tiles.html)。

## 许可证

MIT
