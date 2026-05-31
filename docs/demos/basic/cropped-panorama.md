# 裁剪全景图

通过读取 XMP 元数据或动态计算位置来展示[裁剪全景图](../../guide/adapters/equirectangular.md#cropped-panorama)。

::: code-demo

```yaml
autoload: true
title: 全景图查看器裁剪示例
```

```js:line-numbers{9}
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere-cropped.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
    canvasBackground: '#77addb',
    defaultZoomLvl: 0,
});
```

:::
