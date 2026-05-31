# VisibleRangePlugin

<Badges module="visible-range-plugin"/>

::: module
<ApiButton page="modules/VisibleRangePlugin.html"/>
锁定全景图的可见区域。

这个插件由 [@photo-sphere-viewer/visible-range-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/visible-range-plugin) 包提供。
:::

## 用法

插件允许通过 `horizontalRange` 与 `verticalRange` 定义可见范围，从而锁定可视区域。它会影响手动移动和自动旋转。

```js:line-numbers
import { VisibleRangePlugin } from '@photo-sphere-viewer/visible-range-plugin';

const viewer = new Viewer({
    plugins: [
        VisibleRangePlugin.withConfig({
            horizontalRange: [-Math.PI / 2, Math.PI / 2],
            verticalRange: [-Math.PI / 3, Math.PI / 3],
        }),
    ],
});

const visibleRangePlugin = viewer.getPlugin(VisibleRangePlugin);

visibleRangePlugin.setHorizontalRange(['0deg', '180deg']);
visibleRangePlugin.setVerticalRange(null);
```

另外，如果将 `usePanoData` 设为 `true`，可见范围会受传入 viewer 的[裁剪全景图数据](../guide/adapters/equirectangular.md#cropped-panorama)限制。

## 示例

### 自定义范围

此示例将水平轴锁定在 -90° 到 90° 之间，将垂直轴锁定在 -60° 到 60° 之间。

::: code-demo

```yaml
title: 全景图查看器可视范围示例
packages:
  - name: visible-range-plugin
```

<<< ./demos-src/visible-range.js{js:line-numbers}

:::

### 来自 `panoData`

此示例使用裁剪全景图的实际尺寸来定义可见范围。

::: code-demo

```yaml
title: 全景图查看器可视范围示例
packages:
  - name: visible-range-plugin
```

<<< ./demos-src/visible-range-panodata.js{js:line-numbers}

:::

## 配置

#### `horizontalRange`

- 类型：`double[]|string[]`
- 默认：`null`
- 可更新：否，请使用 `setHorizontalRange()` 插件

可见水平范围，由两个角度表示。

#### `verticalRange`

- 类型：`double[]|string[]`
- 默认：`null`
- 可更新：否，请使用 `setVerticalRange()` 插件

可见垂直范围，由两个角度表示。

#### `usePanoData`

- 类型：`boolean`
- 默认：`false`
- 可更新：是

加载后立即使用裁剪全景图数据作为可见范围。

## 方法

#### `setHorizontalRange(range)` | `setVerticalRange(range)`

修改或移除范围。

#### `setRangesFromPanoData()`

使用裁剪全景图数据作为可见范围。
