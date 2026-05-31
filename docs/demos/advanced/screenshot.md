# 截图下载

添加一个按钮，用于下载当前可见全景区域的截图。

::: code-demo

```yaml
autoload: true
title: 全景图查看器截图示例
```

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
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

::: warning 注意
该示例使用了全景图查看器的内部 API。TypeScript 用户需要添加 `// @ts-ignore`。
:::
