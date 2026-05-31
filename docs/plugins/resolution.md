# ResolutionPlugin

<Badges module="resolution-plugin"/>

::: module
<ApiButton page="modules/ResolutionPlugin.html"/>
Adds a button to choose between multiple resolutions of the panorama. **Requires the [Settings plugin](./settings.md).**

这个插件由 [@photo-sphere-viewer/resolution-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/resolution-plugin) 包提供。
:::

::: warning
ResolutionPlugin is not compatible with GalleryPlugin.
:::

## 用法

启用后，插件会添加一个新的设置项，用户可以用它切换全景图分辨率。

```js:line-numbers
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';
import { ResolutionPlugin } from '@photo-sphere-viewer/resolution-plugin';

const viewer = new Viewer({
    plugins: [
        SettingsPlugin,
        ResolutionPlugin.withConfig({
            defaultResolution: 'SD',
            resolutions: [
                {
                    id: 'SD',
                    label: '小图',
                    panorama: 'sphere_small.jpg',
                },
                {
                    id: 'HD',
                    label: '普通',
                    panorama: 'sphere.jpg',
                },
            ],
        }),
    ],
});
```

## 示例

下面的示例为全景图提供两个分辨率，默认加载“小图”。

::: code-demo

```yaml
title: PSV Resolution Demo
packages:
  - name: settings-plugin
    style: true
  - name: resolution-plugin
```

<<< ./demos-src/resolution.js{js:line-numbers}

:::

## Configuration

#### `resolutions`

- type: `object[]`
- updatable: no, use `setResolutions()` method

List of available resolutions. Each resolution consists of an object with the properties `id`, `label`, `panorama` and `panoData` (optional).

#### `defaultResolution`

- type: `string`
- updatable: no

The id of the default resolution to load. If not provided the first resolution will be used.

::: warning
If a `panorama` is initially configured on the viewer, this setting is ignored.
:::

#### `showBadge`

- type: `boolean`
- default: `true`
- updatable: no

Show the resolution id as a badge on the settings button.

#### `lang`

- type: `object`
- default:

```js
lang: {
    resolution: '画质',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## Methods

#### `setResolutions(resolutions, defaultResolution?)`

Changes the available resolutions.

## Events

#### `resolution-changed(id)`

Triggered when the resolution is changed.

```js:line-numbers
resolutionPlugin.addEventListener('resolution-changed', ({ resolutionId }) => {
    console.log(`Current resolution: ${resolutionId}`);
});
```
