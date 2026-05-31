# 在地图上显示标记

配置[标记](../../plugins/markers.md)，让它们显示在[地图](../../plugins/map.md)上。

::: code-demo

```yaml
autoload: true
title: 全景图查看器地图标记示例
packages:
  - name: map-plugin
    style: true
  - name: markers-plugin
    style: true
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';
import { MapPlugin } from '@photo-sphere-viewer/map-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',

    plugins: [
        MapPlugin.withConfig({
            imageUrl: baseUrl + 'map.jpg',
            center: { x: 807, y: 607 },
            size: '300px',
            rotation: '135deg',
            defaultZoom: 40,
            shape: 'square',
        }),
        MarkersPlugin.withConfig({
            markers: [
                {
                    id: 'mountain',
                    tooltip: '一座山峰',
                    position: { yaw: 0.11, pitch: 0.32 },
                    image: baseUrl + 'pictos/pin-blue.png',
                    size: { width: 32, height: 32 },
                    anchor: 'bottom center',
                    data: {
                        map: {
                            distance: 220,
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
