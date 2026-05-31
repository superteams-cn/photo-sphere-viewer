# 适配器

适配器是一组小型代码模块，负责在 Three.js 场景中加载全景纹理。

当前支持的适配器包括：

- [等距柱状图](equirectangular.md)：默认适配器，用于加载完整或局部的等距柱状全景图
- [等距柱状瓦片](equirectangular-tiles.md)：用于加载瓦片化的等距柱状全景图
- [等距柱状视频](equirectangular-video.md)：用于加载等距柱状视频
- [立方体贴图](cubemap.md)：用于加载立方体投影（六张纹理）
- [立方体瓦片](cubemap-tiles.md)：用于加载瓦片化的立方体全景图
- [立方体视频](cubemap-video.md)：用于加载立方体视频
- [双鱼眼](dual-fisheye.md)：用于展示 Ricoh Theta Z1 等 360 相机的原始文件

## 导入适配器

官方适配器分别发布在不同的 `@photo-sphere-viewer/***-adapter` 包中。所有适配器都由一个 JavaScript 类组成，并且必须传入 `adapter` 选项。部分适配器还支持通过静态方法 `withConfig` 传入配置对象。

**立方体贴图适配器示例：**

:::: tabs

::: tab 从 CDN 导入

```html:line-numbers
<script type="importmap">
    {
        "imports": {
            // 导入 PSV 核心和 three
            "@photo-sphere-viewer/cubemap-adapter": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/cubemap-adapter/index.module.js"
        }
    }
</script>

<script type="module">
    import { Viewer } from '@photo-sphere-viewer/core';
    import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter';

    new Viewer({
       adapter: CubemapAdapter,
       // 或者
       adapter: CubemapAdapter.withConfig({
           // 可选的适配器配置
       }),
       panorama: // 适配器专属的全景图配置,
   });
</script>
```

:::

::: tab 使用 NPM 和构建工具安装

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';
import { CubemapAdapter } from '@photo-sphere-viewer/cubemap-adapter';

new Viewer({
    adapter: CubemapAdapter,
    panorama: // 适配器专属的全景图配置,
});
```

:::

::::
