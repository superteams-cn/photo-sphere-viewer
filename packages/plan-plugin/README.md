# 平面图插件

`@photo-sphere-viewer/plan-plugin` 基于 Leaflet 提供平面图，用于标注全景图位置、热点和当前朝向。

## 安装

```bash
pnpm add @photo-sphere-viewer/plan-plugin leaflet
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import '@photo-sphere-viewer/plan-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [
    [
      PlanPlugin,
      {
        coordinates: [48.8584, 2.2945],
      },
    ],
  ],
});
```

## 文档

详见[平面图插件文档](https://photo-sphere-viewer.js.org/plugins/plan.html)。

## 许可证

MIT
