# 色键视频标记

展示如何使用 [`chromaKey`](../../plugins/markers.md#chromakey) 创建透明的 `videoLayer` 标记。

::: code-demo

```yaml
autoload: true
title: PSV 标记图层示例
packages:
  - name: markers-plugin
    style: true
```

```js:line-numbers{19-23}
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',

    plugins: [
        MarkersPlugin.withConfig({
            markers: [
                {
                    id: 'video-greenscreen',
                    videoLayer: baseUrl + 'pictos/t-rex.mp4',
                    position: { yaw: -0.3, pitch: 0 },
                    size: { width: 500, height: 500 },
                    chromaKey: {
                        enabled: true,
                        color: '#009200',
                        similarity: 0.1,
                    },
                },
                {
                    id: 'video',
                    videoLayer: baseUrl + 'pictos/t-rex.mp4',
                    position: { yaw: 0.3, pitch: 0 },
                    size: { width: 500, height: 500 },
                },
            ],
        }),
    ],
});
```

:::
