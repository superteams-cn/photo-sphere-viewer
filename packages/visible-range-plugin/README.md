# 可视范围插件

`@photo-sphere-viewer/visible-range-plugin` 用于限制用户可见的角度范围，可用于裁剪全景图、固定展示区域或避免用户转向无内容区域。

## 安装

```bash
pnpm add @photo-sphere-viewer/visible-range-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { VisibleRangePlugin } from '@photo-sphere-viewer/visible-range-plugin';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [
    [
      VisibleRangePlugin,
      {
        horizontalRange: ['-90deg', '90deg'],
        verticalRange: ['-45deg', '45deg'],
      },
    ],
  ],
});
```

## 文档

详见[可视范围插件文档](https://photo-sphere-viewer.js.org/plugins/visible-range.html)。

## 许可证

MIT
