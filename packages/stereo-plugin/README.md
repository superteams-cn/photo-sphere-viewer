# 立体视图插件

`@photo-sphere-viewer/stereo-plugin` 用于在移动端启用立体视图，适合配合陀螺仪插件提供更沉浸的观看体验。

## 安装

```bash
pnpm add @photo-sphere-viewer/stereo-plugin @photo-sphere-viewer/gyroscope-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { StereoPlugin } from '@photo-sphere-viewer/stereo-plugin';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [GyroscopePlugin, StereoPlugin],
});
```

## 文档

详见[立体视图插件文档](https://photo-sphere-viewer.js.org/plugins/stereo.html)。

## 许可证

MIT
