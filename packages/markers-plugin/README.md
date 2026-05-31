# 标记插件

`@photo-sphere-viewer/markers-plugin` 用于在全景图中添加标记、热点、图层、折线、多边形和自定义 HTML 元素，并支持列表、提示框与点击交互。

## 安装

```bash
pnpm add @photo-sphere-viewer/markers-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/markers-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [
    [
      MarkersPlugin,
      {
        markers: [
          {
            id: 'marker-1',
            position: { yaw: 0, pitch: 0 },
            image: 'pin.png',
            size: { width: 32, height: 32 },
            tooltip: '标记',
          },
        ],
      },
    ],
  ],
});
```

## 文档

详见[标记插件文档](https://photo-sphere-viewer.js.org/plugins/markers.html)。

## 许可证

MIT
