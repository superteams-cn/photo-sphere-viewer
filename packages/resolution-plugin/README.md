# 画质插件

`@photo-sphere-viewer/resolution-plugin` 用于在多个全景图画质档位之间切换。它依赖设置插件，并会在设置菜单中添加“画质”选项。

## 安装

```bash
pnpm add @photo-sphere-viewer/resolution-plugin @photo-sphere-viewer/settings-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { ResolutionPlugin } from '@photo-sphere-viewer/resolution-plugin';
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';
import '@photo-sphere-viewer/settings-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  plugins: [
    SettingsPlugin,
    [
      ResolutionPlugin,
      {
        resolutions: [
          { id: 'sd', label: '标准', panorama: 'panorama-sd.jpg' },
          { id: 'hd', label: '高清', panorama: 'panorama-hd.jpg' },
        ],
      },
    ],
  ],
});
```

## 文档

详见[画质插件文档](https://photo-sphere-viewer.js.org/plugins/resolution.html)。

## 许可证

MIT
