# 鼠标悬停缩放

启用全局[鼠标悬停缩放](../../plugins/markers.md#defaulthoverscale)，并为每个标记单独定制。

::: code-demo

```yaml
autoload: true
title: 全景图查看器标记悬停缩放示例
packages:
  - name: markers-plugin
    style: true
```

```js:line-numbers{13,30,39}
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',

    plugins: [
        MarkersPlugin.withConfig({
            defaultHoverScale: true,
            markers: [
                {
                    id: 'marker-1',
                    position: { pitch: 0.11, yaw: -0.35 },
                    image: baseUrl + 'pictos/pin-blue.png',
                    size: { width: 32, height: 32 },
                    anchor: 'bottom center',
                    tooltip: '默认缩放',
                },
                {
                    id: 'marker-2',
                    position: { pitch: 0.32, yaw: 0.11 },
                    image: baseUrl + 'pictos/pin-red.png',
                    size: { width: 32, height: 32 },
                    anchor: 'bottom center',
                    tooltip: '禁用缩放',
                    hoverScale: false,
                },
                {
                    id: 'marker-3',
                    position: { pitch: -0.05, yaw: 0.04 },
                    image: baseUrl + 'pictos/pin-red.png',
                    size: { width: 32, height: 32 },
                    anchor: 'bottom center',
                    tooltip: '自定义缩放',
                    hoverScale: { amount: 3, easing: 'ease-in-out', duration: 1000 },
                },
            ],
        }),
    ],
});
```

:::
