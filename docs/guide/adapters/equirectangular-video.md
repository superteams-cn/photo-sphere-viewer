# 等距柱状视频

<Badges module="equirectangular-video-adapter"/>

::: module
此适配器由 [@photo-sphere-viewer/equirectangular-video-adapter](https://www.npmjs.com/package/@photo-sphere-viewer/equirectangular-video-adapter) 包提供。
:::

```js:line-numbers
import { EquirectangularVideoAdapter } from '@photo-sphere-viewer/equirectangular-video-adapter';

const viewer = new Viewer({
    adapter: EquirectangularVideoAdapter,
    panorama: {
        source: 'path/video.mp4',
    },
    plugins: [VideoPlugin],
});
```

::: warning 注意
此适配器需要配合 [VideoPlugin](../../plugins/video.md) 使用。
:::

## 示例

::: code-demo

```yaml
title: 全景图查看器等距柱状视频示例
packages:
  - name: equirectangular-video-adapter
  - name: video-plugin
    style: true
  - name: settings-plugin
    style: true
  - name: resolution-plugin
```

<<< ./demos-src/equirectangular-video.js{js:line-numbers}

:::

## 配置

#### `autoplay`

- 类型：`boolean`
- 默认值：`false`

加载后自动开始播放视频。

#### `muted`

- 类型：`boolean`
- 默认值：`false`

默认将视频静音。

#### `resolution`

见[等距柱状适配器配置](./equirectangular.md#resolution)。

## 全景图选项

使用此适配器时，`panorama` 选项和 `setPanorama()` 方法接受一个用于配置视频的对象。

#### `source` (必填)

- 类型：`string | MediaStream | HTMLVideoElement`

视频文件路径。视频尺寸不得大于 4096 像素，否则无法在手持设备上显示。

也可以传入已有的 `MediaStream`，例如显示 USB 360° 相机的画面；也可以传入已有的 `HTMLVideoElement`，以便更精细地控制视频播放。

```js:line-numbers
const stream = await navigator.mediaDevices.getUserMedia({ video: true });

const viewer = new Viewer({
    container: 'photosphere',
    adapter: EquirectangularVideoAdapter.withConfig({
        autoplay: true,
        muted: true,
    }),
    panorama: {
        source: stream,
    },
});
```

#### `data`

- 类型：`object | function<Video, PanoData>`

如果视频没有覆盖完整球面，可用此项定义裁剪信息。

```js:line-numbers
panorama: {
    source: 'path/video.mp4',
    data: {
        fullWidth: 6000,
        // "fullHeight" optional, always "fullWidth / 2"
        croppedX: 1000,
        croppedY: 500,
    },
}
```
