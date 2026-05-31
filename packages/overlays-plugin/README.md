# 覆盖层插件

`@photo-sphere-viewer/overlays-plugin` 用于在全景图上叠加图片、路径或局部区域，可用于增强标注、展示分区、叠加设计方案等场景。

## 安装

```bash
pnpm add @photo-sphere-viewer/overlays-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { OverlaysPlugin } from '@photo-sphere-viewer/overlays-plugin';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [
    [
      OverlaysPlugin,
      {
        overlays: [
          {
            id: 'overlay-1',
            path: 'overlay.png',
          },
        ],
      },
    ],
  ],
});
```

## 文档

详见[覆盖层插件文档](https://photo-sphere-viewer.js.org/plugins/overlays.html)。

## 许可证

MIT
