# VideoPlugin <Badge text="样式"/>

<Badges module="video-plugin"/>

::: module
<ApiButton page="modules/VideoPlugin.html"/>
为视频[适配器](../guide/adapters/)添加播放控制。

这个插件由 [@photo-sphere-viewer/video-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/video-plugin) 包提供。
:::

## 用法

使用此插件时，还必须加载一个视频适配器：[等距柱状视频](../guide/adapters/equirectangular-video.md)或[立方体视频](../guide/adapters/cubemap-video.md)。

启用后，它会向查看器添加多个元素：

- 播放/暂停按钮
- 音量按钮
- 导航栏中的时间指示器
- 导航栏上方的进度条
- viewer 中央的播放按钮

它还支持带时间点 `keypoints` 的高级自动旋转。

```js:line-numbers
import { VideoPlugin } from '@photo-sphere-viewer/video-plugin';

const viewer = new Viewer({
    adapter: EquirectangularVideoAdapter,
    panorama: {
        source: 'path/video.mp4',
    },
    plugins: [
        VideoPlugin,
    ],
});
```

## 示例

::: code-demo

```yaml
title: PSV Video Demo
packages:
  - name: equirectangular-video-adapter
  - name: video-plugin
    imports: VideoPlugin
    style: true
  - name: autorotate-plugin
  - name: settings-plugin
    style: true
  - name: resolution-plugin
```

<<< ./demos-src/video.js{js:line-numbers}

:::

## 配置

#### `keypoints`

- 类型：`Array<{ position, time }>`
- 可更新：否，请使用 `setKeypoints()` 方法

定义带时间点的关键点，供自动旋转按钮使用。

```js:line-numbers
keypoints: [
    { time: 0, position: { yaw: 0, pitch: 0 } },
    { time: 5.5, position: { yaw: 0.25, pitch: 0 } },
    { time: 12.8, position: { yaw: 0.3, pitch: -12 } },
];
```

::: warning 注意
使用关键点需要加载 [Autorotate 插件](./autorotate.md)。
:::

#### `progressbar`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

在导航栏上方显示进度条。

#### `bigbutton`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

在 viewer 中央显示一个大的“播放”按钮。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
  videoPlay: '播放/暂停',
  videoVolume: '音量',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

### 多分辨率

你可以通过 [ResolutionPlugin](./resolution.md) 为视频提供多个分辨率。

```js:line-numbers
const viewer = new Viewer({
    adapter: EquirectangularVideoAdapter,
    plugins: [
        VideoPlugin,
        SettingsPlugin,
        [ResolutionPlugin, {
            defaultResolution: 'FHD',
            resolutions: [
                {
                    id: 'UHD',
                    label: '超高清',
                    panorama: { source: 'path/video-uhd.mp4' },
                },
                {
                    id: 'FHD',
                    label: '高清',
                    panorama: { source: 'path/video-fhd.mp4' },
                },
                {
                    id: 'HD',
                    label: '标准',
                    panorama: { source: 'path/video-hd.mp4' },
                },
            ],
        }],
    ],
});
```

## 方法

#### `setKeypoints(keypoints)`

修改关键点。

## 事件

#### `play-pause(playing)`

视频开始播放或暂停时触发。

#### `volume-change(volume)`

视频音量变化时触发。

#### `progress(time, duration, progress)`

视频播放进度变化时触发。

## 按钮

此插件会向默认导航栏添加按钮：

- `videoPlay` 用于播放/暂停视频
- `videoVolume` 用于调节音量或静音
- `videoTime` 显示视频当前时间和总时长（并非真正的按钮）

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。

## SCSS 变量

| 变量                        | 默认值                               | 说明                             |
| --------------------------- | ------------------------------------ | -------------------------------- |
| $progressbar-height         | 3px                                  | 进度条高度                       |
| $progressbar-height-active  | 5px                                  | 鼠标悬停时的进度条高度           |
| $progressbar-progress-color | core.$buttons-color                  | 已播放进度条颜色                 |
| $progressbar-buffer-color   | core.$buttons-active-background      | 缓冲进度条颜色                   |
| $progressbar-handle-size    | 9px                                  | 拖动手柄尺寸                     |
| $progressbar-handle-color   | white                                | 拖动手柄颜色                     |
| $volume-height              | 80px                                 | 音量控件高度                     |
| $volume-width               | $progressbar-height-active           | 音量控件宽度                     |
| $volume-bar-color           | $progressbar-progress-color          | 音量控件颜色                     |
| $volume-track-color         | $progressbar-buffer-color            | 音量控件背景色                   |
| $volume-handle-size         | $progressbar-handle-size             | 音量手柄尺寸                     |
| $volume-handle-color        | $progressbar-handle-color            | 音量手柄颜色                     |
| $bigbutton-color            | core.$buttons-color                  | 中央播放按钮颜色                 |
| $bigbutton-size             | (portrait: 20vw,<br>landscape: 10vw) | 中央播放按钮尺寸，取决于屏幕方向 |
