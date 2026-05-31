# 在平面图上显示标记

配置[标记](../../plugins/markers.md)，让它们显示在[平面图](../../plugins/plan.md)上。

::: code-demo

```yaml
autoload: true
title: 全景图查看器平面图标记示例
packages:
  - name: plan-plugin
    style: true
  - name: markers-plugin
    style: true
  - name: leaflet
    external: true
    version: 1
    style: true
    js: dist/leaflet-src.esm.js
    css: dist/leaflet.css
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';
import { PlanPlugin } from '@photo-sphere-viewer/plan-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',

    plugins: [
        PlanPlugin.withConfig({
            defaultZoom: 14,
            coordinates: [6.78677, 44.58241],
            bearing: '120deg',
            size: { width: '300px', height: '300px' },
        }),
        MarkersPlugin.withConfig({
            markers: [
                {
                    id: 'mountain',
                    tooltip: 'A mountain',
                    position: { yaw: 0.11, pitch: 0.32 },
                    image: baseUrl + 'pictos/pin-blue.png',
                    size: { width: 32, height: 32 },
                    anchor: 'bottom center',
                    data: {
                        plan: {
                            coordinates: [6.79077, 44.58041],
                            size: 25,
                            image: baseUrl + 'pictos/pin-blue.png',
                        },
                    },
                },
            ],
        }),
    ],
});
```

:::
