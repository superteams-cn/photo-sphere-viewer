# 指南针插件

`@photo-sphere-viewer/compass-plugin` 用于展示当前视野在球面中的方向和范围，也可标注热点，帮助用户理解自己正在观看全景图的哪一部分。

## 安装

```bash
pnpm add @photo-sphere-viewer/compass-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import '@photo-sphere-viewer/compass-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [CompassPlugin],
});
```

## 文档

详见[指南针插件文档](https://photo-sphere-viewer.js.org/plugins/compass.html)。

## 许可证

MIT
