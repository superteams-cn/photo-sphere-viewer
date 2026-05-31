# 分辨率插件

<Badges module="resolution-plugin"/>

::: module
<ApiButton page="modules/ResolutionPlugin.html"/>
添加一个按钮，用于在多个全景图分辨率之间切换。**需要配合 [Settings 插件](./settings.md) 使用。**

这个插件由 [@photo-sphere-viewer/resolution-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/resolution-plugin) 包提供。
:::

::: warning 注意
分辨率插件与图库插件不兼容。
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
title: 全景图查看器画质示例
packages:
  - name: settings-plugin
    style: true
  - name: resolution-plugin
```

<<< ./demos-src/resolution.js{js:line-numbers}

:::

## 配置

#### `resolutions`

- 类型：`object[]`
- 可更新：否，请使用 `setResolutions()` 方法

可用分辨率列表。每个分辨率都是一个对象，包含 `id`、`label`、`panorama` 以及可选的 `panoData` 属性。

#### `defaultResolution`

- 类型：`string`
- 可更新：否

默认加载的分辨率 id。未提供时会使用第一个分辨率。

::: warning 注意
如果查看器初始配置了 `panorama`，此设置会被忽略。
:::

#### `showBadge`

- 类型：`boolean`
- 默认：`true`
- 可更新：否

在设置按钮上以徽标形式显示分辨率 id。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    resolution: '画质',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## 方法

#### `setResolutions(resolutions, defaultResolution?)`

修改可用分辨率。

## 事件

#### `resolution-changed(id)`

分辨率变化时触发。

```js:line-numbers
resolutionPlugin.addEventListener('resolution-changed', ({ resolutionId }) => {
    console.log(`Current resolution: ${resolutionId}`);
});
```
