# 裁剪全景图

通过读取 XMP 元数据或动态计算位置来展示[裁剪全景图](../../guide/adapters/equirectangular.md#cropped-panorama)。

::: code-demo

```yaml
autoload: true
title: PSV 裁剪示例
```

```js:line-numbers{9}
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere-cropped.jpg',
    caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
    canvasBackground: '#77addb',
    defaultZoomLvl: 0,
});
```

:::
