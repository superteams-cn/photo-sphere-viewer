# 虚拟导览插件

`@photo-sphere-viewer/virtual-tour-plugin` 用于将多个全景图串联成虚拟导览，支持节点、链接、箭头、地图和平面图集成。

## 安装

```bash
pnpm add @photo-sphere-viewer/virtual-tour-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  plugins: [
    [
      VirtualTourPlugin,
      {
        nodes: [
          { id: 'room-1', panorama: 'room-1.jpg', links: [{ nodeId: 'room-2' }] },
          { id: 'room-2', panorama: 'room-2.jpg', links: [{ nodeId: 'room-1' }] },
        ],
        startNodeId: 'room-1',
      },
    ],
  ],
});
```

## 文档

详见[虚拟导览插件文档](https://photo-sphere-viewer.js.org/plugins/virtual-tour.html)。

## 许可证

MIT
