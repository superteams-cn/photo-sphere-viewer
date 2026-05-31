# 地图插件

`@photo-sphere-viewer/map-plugin` 为查看器添加小地图，用于展示全景图位置、方向和热点，适合室内导览、景区漫游等场景。

## 安装

```bash
pnpm add @photo-sphere-viewer/map-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { MapPlugin } from '@photo-sphere-viewer/map-plugin';
import '@photo-sphere-viewer/map-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [
    [
      MapPlugin,
      {
        imageUrl: 'map.png',
        center: { x: 500, y: 300 },
      },
    ],
  ],
});
```

## 文档

详见[地图插件文档](https://photo-sphere-viewer.js.org/plugins/map.html)。

## 许可证

MIT
