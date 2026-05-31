# 立方体视频

<Badges module="cubemap-video-adapter"/>

::: module
此适配器由 [@photo-sphere-viewer/cubemap-video-adapter](https://www.npmjs.com/package/@photo-sphere-viewer/cubemap-video-adapter) 包提供。
:::

```js:line-numbers
import { CubemapVideoAdapter } from '@photo-sphere-viewer/cubemap-video-adapter';

const viewer = new Viewer({
    adapter: CubemapVideoAdapter,
    panorama: {
        source: 'path/video.mp4',
    },
    plugins: [VideoPlugin],
});
```

::: warning 注意
此适配器需要配合 [视频插件](../../plugins/video.md) 使用。
:::

## 示例

::: code-demo

```yaml
title: 全景图查看器立方体视频示例
packages:
  - name: cubemap-video-adapter
  - name: video-plugin
    style: true
  - name: settings-plugin
    style: true
  - name: resolution-plugin
```

<<< ./demos-src/cubemap-video.js{js:line-numbers}

:::

::: tip 位置定义
此适配器不支持像素位置，只支持 `yaw` + `pitch`。
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

## 全景图选项

使用此适配器时，`panorama` 选项和 `setPanorama()` 方法接受一个用于配置视频的对象。

#### `source` (必填)

- 类型：`string | MediaStream | HTMLVideoElement`

视频文件路径。视频尺寸不得大于 4096 像素，否则无法在手持设备上显示。

也可以传入已有的 `MediaStream`，例如显示 USB 360° 相机的画面；也可以传入已有的 `HTMLVideoElement`，以便更精细地控制视频播放。

#### `equiangular`

- 类型：`boolean`
- 默认值：`true`

使用等角立方体贴图（EAC）时设为 `true`，这是 YouTube 使用的格式。使用标准立方体贴图时设为 `false`。

### 视频格式

此适配器支持由立方体六个面组成网格的视频文件，例如 YouTube 使用的格式。

单帧布局必须如下：

![cubemap-video](/images/cubemap-video.png)
