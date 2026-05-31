# 陀螺仪插件

`@photo-sphere-viewer/gyroscope-plugin` 让移动端用户可以通过设备方向控制视角，适合沉浸式浏览全景内容。

## 安装

```bash
pnpm add @photo-sphere-viewer/gyroscope-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [GyroscopePlugin],
});
```

## 文档

详见[陀螺仪插件文档](https://photo-sphere-viewer.js.org/plugins/gyroscope.html)。

## 许可证

MIT
