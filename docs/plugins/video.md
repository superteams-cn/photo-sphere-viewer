# VideoPlugin <Badge text="Styles"/>

<Badges module="video-plugin"/>

::: module
<ApiButton page="modules/VideoPlugin.html"/>
Adds controls to the video [adapters](../guide/adapters/).

这个插件由 [@photo-sphere-viewer/video-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/video-plugin) 包提供。
:::

## 用法

To use this plugin you must also load one of the video adapters : [equirectangular](../guide/adapters/equirectangular-video.md) or [cubemap](../guide/adapters/cubemap-video.md).

启用后，它会向查看器添加多个元素：

- Play/pause button
- Volume button
- Time indicator in the navbar
- Progressbar above the navbar
- Play button in the center of the viewer

It also supports advanced autorotate with timed `keypoints`.

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

## Configuration

#### `keypoints`

- type: `Array<{ position, time }>`
- updatable: no, use `setKeypoints()` method

Defines timed keypoints that will be used by the autorotate button.

```js:line-numbers
keypoints: [
    { time: 0, position: { yaw: 0, pitch: 0 } },
    { time: 5.5, position: { yaw: 0.25, pitch: 0 } },
    { time: 12.8, position: { yaw: 0.3, pitch: -12 } },
];
```

::: warning
The usage of keypoints requires to load the [Autorotate plugin](./autorotate.md).
:::

#### `progressbar`

- type: `boolean`
- default: `true`
- updatable: no

Displays a progressbar on top of the navbar.

#### `bigbutton`

- type: `boolean`
- default: `true`
- updatable: no

Displays a big "play" button in the center of the viewer.

#### `lang`

- type: `object`
- default:

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

## Methods

#### `setKeypoints(keypoints)`

Changes the keypoints.

## Events

#### `play-pause(playing)`

Triggered when the video starts playing or is paused.

#### `volume-change(volume)`

Triggered when the video volume changes.

#### `progress(time, duration, progress)`

Triggered when the video play progression changes.

## Buttons

This plugin adds buttons to the default navbar:

- `videoPlay` allows to play/pause the video
- `videoVolume` allows to change the volume/mute the video
- `videoTime` shows the video time and duration (not a real button)

If you use a [custom navbar](../guide/navbar.md) you will need to manually add the buttons to the list.

## SCSS variables

| variable                    | default                              | description                                                      |
| --------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| $progressbar-height         | 3px                                  | Height of the progress bar                                       |
| $progressbar-height-active  | 5px                                  | Height of the progress bar on mouse hover                        |
| $progressbar-progress-color | core.$buttons-color                  | Color of the playing progress bar                                |
| $progressbar-buffer-color   | core.$buttons-active-background      | Color of the buffer progress bar                                 |
| $progressbar-handle-size    | 9px                                  | Size of the seek handle                                          |
| $progressbar-handle-color   | white                                | Color of the seek handle                                         |
| $volume-height              | 80px                                 | Height of the volume control                                     |
| $volume-width               | $progressbar-height-active           | Width of the volume control                                      |
| $volume-bar-color           | $progressbar-progress-color          | Color of the volume controle                                     |
| $volume-track-color         | $progressbar-buffer-color            | Background color of the volume control                           |
| $volume-handle-size         | $progressbar-handle-size             | Size of the volume handle                                        |
| $volume-handle-color        | $progressbar-handle-color            | Color of the volume handle                                       |
| $bigbutton-color            | core.$buttons-color                  | Color of the central play button                                 |
| $bigbutton-size             | (portrait: 20vw,<br>landscape: 10vw) | Size if the central play button, depending on screen orientation |
