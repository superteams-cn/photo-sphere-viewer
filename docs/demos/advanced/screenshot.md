# 截图下载

添加一个按钮，用于下载当前可见全景区域的截图。

::: code-demo

```yaml
autoload: true
title: PSV 截图示例
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
    navbar: [
        {
            content: '截图',
            onClick(viewer) {
                viewer.addEventListener('render', () => {
                    const link = document.createElement('a');
                    link.download = 'screenshot.png';
                    link.href = viewer.renderer.renderer.domElement.toDataURL();
                    link.click();
                }, { once: true });
                viewer.needsUpdate();
            },
        },
    ],
});
```

:::

::: warning
这个示例使用了 Photo Sphere Viewer 的内部 API。TypeScript 用户需要添加 `// @ts-ignore`。
:::
