# 从 v4 迁移

本页用于帮助你从 Photo Sphere Viewer 4 迁移到 Photo Sphere Viewer 5。

## 包、ESM 和 ES6

旧版 `photo-sphere-viewer` 包已拆分为多个包。`@photo-sphere-viewer/core` 包含核心功能（主要是 `Viewer` 类），其他包则包含插件和适配器。

`@photo-sphere-viewer` 包使用现代 ES6 语法，主流浏览器均已支持。如果需要支持较旧的浏览器，则需要使用 Babel 等转译工具。

每个包都包含以下文件：

- **index.cjs**：CJS 打包文件
- **index.module.js**：ESM 打包文件
- **index.d.ts**：TypeScript 声明
- **index.css**（可选）：样式表
- **index.scss**（可选）：SASS 源码

以下是你可能需要的完整包列表：

- @photo-sphere-viewer/core
- @photo-sphere-viewer/cubemap-adapter
- @photo-sphere-viewer/cubemap-tiles-adapter
- @photo-sphere-viewer/cubemap-video-adapter
- @photo-sphere-viewer/equirectangular-tiles-adapter
- @photo-sphere-viewer/equirectangular-video-adapter
- @photo-sphere-viewer/autorotate-plugin
- @photo-sphere-viewer/compass-plugin
- @photo-sphere-viewer/gallery-plugin
- @photo-sphere-viewer/gyroscope-plugin
- @photo-sphere-viewer/markers-plugin
- @photo-sphere-viewer/resolution-plugin
- @photo-sphere-viewer/settings-plugin
- @photo-sphere-viewer/stereo-plugin
- @photo-sphere-viewer/video-plugin
- @photo-sphere-viewer/virtual-tour-plugin
- @photo-sphere-viewer/visible-range-plugin

## 选项

### 位置

Photo Sphere Viewer 使用两套坐标系：球面坐标（longitude + latitude）和源图片上的像素坐标（x + y）。为避免与 GPS 坐标系混淆，这些选项已重命名。

- `longitude` → `yaw`
- `latitude` → `pitch`
- `x` → `textureX`
- `y` → `textureY`

### 重命名的选项

- `defaultLong` → `defaultYaw`
- `defaultLat` → `defaultPitch`

### 重命名的标记

- `polygonRad` → `polygon`
- `polygonPx` → `polygonPixels`
- `polylineRad` → `polyline`
- `polylinePx` → `polylinePixels`

## 自动旋转

所有自动旋转功能都已迁移到[新插件](../plugins/autorotate.md)。`autorotateXxx` 选项已移除。

## 事件

在此版本中，Photo Sphere Viewer 移除了 uEvent 库，完全改用原生事件系统。

这意味着你需要更新所有对 `on()`、`off()` 和 `once()` 方法的用法。下面通过示例说明。

:::: tabs

::: tab On/Off 迁移前

```js
viewer.on('position-updated', (e, position) => {
  console.log(position.longitude);
});

viewer.off('position-updated');
```

:::

::: tab On/Off 迁移后

```js
const handler = ({ position }) => {
  console.log(position.yaw);
};

viewer.addEventListener('position-updated', handler);

viewer.removeEventListener('position-updated', handler);
```

:::

::: tab Once 迁移前

```js
viewer.once('ready', () => {
  console.log('viewer is ready!');
});
```

:::

::: tab Once 迁移后

```js
viewer.addEventListener(
  'ready',
  () => {
    console.log('viewer is ready');
  },
  { once: true },
);
```

:::

::::

## TypeScript

### 重命名的类型

- `ViewerOptions` → `ViewerConfig`
- `ViewerProps` → `ViewerState`
- `EquirectangularAdapterOptions` → `EquirectangularAdapterConfig`
- `EquirectangularTilesAdapterOptions` → `EquirectangularTilesAdapterConfig`
- `EquirectangularVideoAdapterOptions` → `EquirectangularVideoAdapterConfig`
- `CubemapAdapterOptions` → `CubemapAdapterConfig`
- `CubemapTilesAdapterOptions` → `CubemapTilesAdapterConfig`
- `CubemapVideoAdapterOptions` → `CubemapVideoAdapterConfig`
- `AutorotateKeypointsPluginOptions` → `AutorotatePluginConfig`
- `CompassPluginOptions` → `CompassPluginConfig`
- `GalleryPluginOptions` → `GalleryPluginConfig`
- `GyroscopePluginOptions` → `GyroscopePluginConfig`
- `MarkersPluginOptions` → `MarkersPluginConfig`
- `MarkerProperties` → `MarkerConfig`
- `ResolutionPluginOptions` → `ResolutionPluginConfig`
- `SettingsPluginOptions` → `SettingsPluginConfig`
- `VideoPluginOptions` → `VideoPluginConfig`
- `AutorotateKeypoint`（视频插件）→ `VideoKeypoint`
- `VisibleRangePluginOptions` → `VisibleRangePluginConfig`

### 删除的类型

- `TooltipRenderer`
- `CubemapArray`
