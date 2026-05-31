# 局部覆盖层

在覆盖层上使用 [`panoData`](../../plugins/overlays.md#panodata) 可以把较小的图片显示在全景图上方。数据定义逻辑与[裁剪全景图](../../guide/adapters/equirectangular.md#cropped-panorama)一致。

::: code-demo

```yaml
autoload: true
title: 全景图查看器局部覆盖层示例
packages:
  - name: overlays-plugin
```

```js:line-numbers{17-21}
import { Viewer } from '@photo-sphere-viewer/core';
import { OverlaysPlugin } from '@photo-sphere-viewer/overlays-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',

    plugins: [
        OverlaysPlugin.withConfig({
            overlays: [
                {
                    id: 'paper',
                    path: baseUrl + 'sphere-paper-overlay.png',
                    panoData: {
                        fullWidth: 3000,
                        croppedX: 1250,
                        croppedY: 500,
                    },
                },
            ],
        }),
    ],
});
```

:::
