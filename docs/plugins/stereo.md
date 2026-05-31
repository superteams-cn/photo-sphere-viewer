# StereoPlugin

<Badges module="stereo-plugin"/>

::: module
<ApiButton page="modules/StereoPlugin.html"/>
Adds stereo view on mobile devices. **Requires the [Gyroscope plugin](./gyroscope.md).**

这个插件由 [@photo-sphere-viewer/stereo-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/stereo-plugin) 包提供。
:::

## Usage

启用后，插件会添加一个“立体视图”按钮；只有陀螺仪 API 可用时该按钮才会显示。它会使用 WakeLock API 防止屏幕变暗或关闭。

```js:line-numbers
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { StereoPlugin } from '@photo-sphere-viewer/stereo-plugin';

const viewer = new Viewer({
    plugins: [
        GyroscopePlugin,
        StereoPlugin,
    ],
});
```

## Example

[Open in a new tab](/demos/plugin-stereo.html){target=\_blank}

## Configuration

#### `lang`

- type: `object`
- default:

```js
lang: {
    stereo: '立体视图',
    stereoNotification: '点击任意位置退出立体视图。',
    pleaseRotate: '请旋转你的设备',
    tapToContinue: '（或点击继续）',
}
```

_Note: this option is not part of the plugin but is merged with the main [`lang`](../guide/config.md#lang) object._

## Buttons

This plugin adds buttons to the default navbar:

- `stereo` allows to start the stereo view

If you use a [custom navbar](../guide/navbar.md) you will need to manually add the buttons to the list.
