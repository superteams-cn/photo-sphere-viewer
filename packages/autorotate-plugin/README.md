# 自动旋转插件

`@photo-sphere-viewer/autorotate-plugin` 为全景图查看器添加自动旋转能力，可按设定速度巡视全景图，也可以通过关键点控制视角路径。

## 安装

```bash
pnpm add @photo-sphere-viewer/autorotate-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [AutorotatePlugin],
});
```

## 文档

详见[自动旋转插件文档](https://photo-sphere-viewer.js.org/plugins/autorotate.html)。

## 许可证

MIT
