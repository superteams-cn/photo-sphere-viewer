# 方法

## 介绍

可以在应用中调用多种方法来控制查看器。完整方法列表见 [API 参考](/api/classes/Core.Viewer.html){target=\_blank}。

::: tip 模块化架构
全景图查看器内部拆分为多个组件，因此不同方法会分布在不同对象上。例如，控制导航栏的方法位于 `navbar` 对象中。

更多信息见[可复用组件](./components/)。
:::

最佳实践是在调用任何方法前等待 `ready` 事件。

```js:line-numbers
viewer.addEventListener('ready', () => {
    viewer.rotate({
        textureX: 1500,
        textureY: 1000,
    });
}, { once: true });
```

## 主要方法

本节介绍最常用的方法。

::: tip 位置定义
部分方法接受位置参数：可以是 `yaw` 与 `pitch` 的组合（弧度或角度），也可以是 `textureX` 与 `textureY` 属性，对应源全景图文件中的像素位置。

使用[立方体贴图](./adapters/cubemap.md)时，还需要提供 `textureFace`。
:::

### `animate(options): Animation`

- options: [`AnimateOptions`](/api/types/Core.AnimateOptions.html){target=\_blank}

通过平滑动画旋转并缩放视图。可以修改位置（`yaw`、`pitch` 或 `textureX`、`textureY`）和缩放级别（`zoom`）。

`speed` 选项可以是以毫秒为单位的持续时间，也可以是包含每分钟转数的字符串（`2rpm`）。

该方法返回一个 `Animation` 对象，它是标准 Promise，并额外提供 `cancel` 方法。

```js:line-numbers
viewer.animate({
    yaw: Math.PI / 2,
    pitch: '20deg',
    zoom: 50,
    speed: '2rpm',
})
    .then(() => /* 动画完成 */);
```

### `destroy()`

从页面中移除查看器，并释放 Three.js 占用的内存。

### `getPlugin(pluginId): PluginInstance`

返回插件实例，更多信息见[插件专页](../plugins/)。

### `getPosition(): Position`

返回当前视图位置。

### `getZoomLevel(): number`

返回当前缩放级别，范围为 0 到 100。

### `rotate(position)`

立即旋转视图，不使用动画。

```js:line-numbers
// 也可以使用 yaw 和 pitch
viewer.rotate({
    textureX: 1500,
    textureY: 600,
});
```

### `setOption(option, value)`

更新查看器的某个选项。部分选项不可更改：`panorama`、`panoData`、`container`、`adapter` 和 `plugins`。

```js:line-numbers
viewer.setOption('fisheye', true);
```

### `setOptions(options)`

一次更新多个选项。

```js:line-numbers
viewer.setOptions({
    fisheye: true,
});
```

### `setPanorama(panorama[, options]): Promise`

- options: [`PanoramaOptions`](/api/types/Core.PanoramaOptions.html){target=\_blank}

更换全景图，并可选择使用过渡动画（默认启用）。

该方法返回一个 Promise，会在新全景图加载完成后 resolve。

```js:line-numbers
viewer.setPanorama('image.jpg')
  .then(() => /* 更新完成 */);

viewer.setPanorama('image.jpg', { transition: false });

viewer.setPanorama('image.jpg', {
    caption: '新的标题',
    position: { yaw: 0, pitch: 0 },
    transition: {
        rotation: false,
        effect: 'black',
    },
    // 更多选项请参阅 API 文档
});
```

### `zoom(level)` | `zoomIn([step = 1])` | `zoomOut([step = 1])`

更改缩放级别，不使用动画。
