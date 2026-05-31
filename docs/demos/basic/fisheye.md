# 鱼眼效果

用[鱼眼效果](../../guide/config.md#fisheye)展示全景图。

::: code-demo

```yaml
autoload: true
title: PSV 鱼眼示例
```

```js:line-numbers{11}
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
    defaultPitch: 0.6,
    defaultZoomLvl: 20,
    fisheye: true,
});
```

:::
