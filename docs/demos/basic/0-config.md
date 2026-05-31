# 零配置

用最少配置展示简单全景图。

::: code-demo

```yaml
autoload: true
title: PSV 基础示例
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
});
```

:::
