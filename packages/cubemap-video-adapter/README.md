# 立方体视频适配器

`@photo-sphere-viewer/cubemap-video-adapter` 用于播放立方体贴图格式的全景视频。它需要配合视频插件使用，以提供播放、暂停、音量和进度控制。

## 安装

```bash
pnpm add @photo-sphere-viewer/cubemap-video-adapter @photo-sphere-viewer/video-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { CubemapVideoAdapter } from '@photo-sphere-viewer/cubemap-video-adapter';
import { VideoPlugin } from '@photo-sphere-viewer/video-plugin';
import '@photo-sphere-viewer/video-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  adapter: CubemapVideoAdapter,
  panorama: { source: 'video.mp4' },
  plugins: [VideoPlugin],
});
```

## 文档

详见[立方体视频适配器文档](https://photo-sphere-viewer.js.org/guide/adapters/cubemap-video.html)。

## 许可证

MIT
