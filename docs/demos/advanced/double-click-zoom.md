# 双击缩放

双击后缩放到鼠标所在位置。

::: code-demo

```yaml
autoload: true
title: PSV 双击缩放示例
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
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
