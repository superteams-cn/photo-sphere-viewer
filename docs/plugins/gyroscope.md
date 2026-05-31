# 陀螺仪插件

<Badges module="gyroscope-plugin"/>

::: module
<ApiButton page="modules/GyroscopePlugin.html"/>
在移动设备上启用陀螺仪控制。

这个插件由 [@photo-sphere-viewer/gyroscope-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/gyroscope-plugin) 包提供。
:::

## 用法

启用后，插件会添加一个新的“陀螺仪”按钮；只有在陀螺仪 API 可用时才会显示。

```js:line-numbers
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';

const viewer = new Viewer({
    plugins: [
        GyroscopePlugin,
    ],
});
```

::: tip 提示
陀螺仪 API 只能在 HTTPS 域名下使用。
:::

::: warning 注意
不同设备返回的方向数据存在已知差异。如果全景图没有按预期方向显示，通常不是插件本身的问题。
:::

## 示例

[在新标签页打开](/demos/plugin-gyroscope.html){target=\_blank}

## 配置

#### `touchmove`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

启用陀螺仪时，允许水平平移相机（需要全局 `mousemove=true`）。

#### `roll`

- 类型：`boolean`
- 默认：`true`
- 可更新：是

应用相机横滚（绕 Z 轴旋转）。

#### `absolutePosition`

- 类型：`boolean`
- 默认：`false`
- 可更新：否

默认情况下，启用陀螺仪后相机会保留当前水平位置。将此选项设为 `true` 后，会启用绝对定位，只使用设备方向。

#### `moveMode`

- 类型：`smooth` | `fast`
- 默认：`smooth`
- 可更新：是

控制陀螺仪数据如何驱动全景图旋转。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    gyroscope: '陀螺仪',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## 按钮

此插件会向默认导航栏添加按钮：

- `gyroscope` 用于开关陀螺仪控制

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。
