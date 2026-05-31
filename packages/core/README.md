# 全景图查看器核心包

`@photo-sphere-viewer/core` 是全景图查看器的核心运行库，用于在网页中展示 360° 全景图，并提供导航栏、面板、提示框、事件系统、适配器与插件扩展能力。

## 安装

```bash
pnpm add @photo-sphere-viewer/core three
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

const viewer = new Viewer({
  container: 'viewer',
  panorama: 'panorama.jpg',
});
```

## 文档

完整配置、方法和事件请阅读[中文文档](https://photo-sphere-viewer.js.org)。

## 许可证

MIT
