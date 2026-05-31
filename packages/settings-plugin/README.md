# 设置插件

`@photo-sphere-viewer/settings-plugin` 为查看器添加统一的设置菜单。它本身不改变查看器行为，但可供其他插件或业务代码注册开关项和选项项。

## 安装

```bash
pnpm add @photo-sphere-viewer/settings-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';
import '@photo-sphere-viewer/settings-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
  plugins: [SettingsPlugin],
});
```

## 文档

详见[设置插件文档](https://photo-sphere-viewer.js.org/plugins/settings.html)。

## 许可证

MIT
