# 鱼眼效果

用[鱼眼效果](../../guide/config.md#fisheye)展示全景图。

::: code-demo

```yaml
autoload: true
title: 全景图查看器鱼眼示例
```

```js:line-numbers{11}
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
    defaultPitch: 0.6,
    defaultZoomLvl: 20,
    fisheye: true,
});
```

:::
