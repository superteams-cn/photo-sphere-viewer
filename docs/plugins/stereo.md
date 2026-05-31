# 立体视图插件

<Badges module="stereo-plugin"/>

::: module
<ApiButton page="modules/StereoPlugin.html"/>
在移动设备上启用立体视图。**需要配合 [Gyroscope 插件](./gyroscope.md) 使用。**

这个插件由 [@photo-sphere-viewer/stereo-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/stereo-plugin) 包提供。
:::

## 用法

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

## 示例

[在新标签页打开](/demos/plugin-stereo.html){target=\_blank}

## 配置

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    stereo: '立体视图',
    stereoNotification: '点击任意位置退出立体视图。',
    pleaseRotate: '请旋转你的设备',
    tapToContinue: '（或点击继续）',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## 按钮

此插件会向默认导航栏添加按钮：

- `stereo` 用于启动立体视图

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。
