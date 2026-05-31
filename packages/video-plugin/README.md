# 视频插件

`@photo-sphere-viewer/video-plugin` 为视频全景图添加播放、暂停、音量、进度条和关键点控制。它需要配合视频适配器使用。

## 安装

```bash
pnpm add @photo-sphere-viewer/video-plugin
```

## 基本用法

```js
import { Viewer } from '@photo-sphere-viewer/core';
import { EquirectangularVideoAdapter } from '@photo-sphere-viewer/equirectangular-video-adapter';
import { VideoPlugin } from '@photo-sphere-viewer/video-plugin';
import '@photo-sphere-viewer/video-plugin/index.css';

const viewer = new Viewer({
  container: 'viewer',
  adapter: EquirectangularVideoAdapter,
  panorama: { source: 'video.mp4' },
  plugins: [VideoPlugin],
});
```

## 文档

详见[视频插件文档](https://photo-sphere-viewer.js.org/plugins/video.html)。

## 许可证

MIT
