# 双击缩放

双击后缩放到鼠标所在位置。

::: code-demo

```yaml
autoload: true
title: 全景图查看器双击缩放示例
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
});

viewer.addEventListener('dblclick', ({ data }) => {
    viewer.animate({
        yaw: data.yaw,
        pitch: data.pitch,
        zoom: 100,
        speed: 1000,
    });
});
```

:::
