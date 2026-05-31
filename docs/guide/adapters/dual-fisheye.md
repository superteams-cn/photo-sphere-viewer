# 双鱼眼

::: module
“Dual fisheye” 是许多 360 相机品牌使用的原始文件格式。

此适配器由主 `@photo-sphere-viewer/core` 包提供。
:::

```js
import { DualFisheyeAdapter } from '@photo-sphere-viewer/core';

const viewer = new Viewer({
  adapter: DualFisheyeAdapter,
  panorama: 'path/panorama.jpg',
});
```

## 示例

::: code-demo

```yaml
title: 全景图查看器双鱼眼示例
packages:
  - name: core
```

<<< ./demos-src/dual-fisheye.js{js:line-numbers}

:::

::: warning 注意
此适配器目前只针对 Ricoh Theta Z1 的原始文件测试过。若未来需要支持其他相机并引入更多配置，它可能会继续演进。欢迎提交 issue，并附上一些示例文件。
:::

## 配置

#### `resolution`

- 类型：`number`
- 默认值：`64`

用于显示全景图的球体几何体面数。数值越高，越能减少直线变形，但会牺牲性能。

_注意：实际面数为 `resolution² / 2`。_
