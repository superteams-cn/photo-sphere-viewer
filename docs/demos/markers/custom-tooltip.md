# 自定义提示框

为标记[提示框](../../plugins/markers.md#tooltip)添加高级样式。

:::: code-demo

```yaml
autoload: true
title: 全景图查看器自定义标记提示框示例
packages:
  - name: markers-plugin
    style: true
```

::: code-group

```js:line-numbers{15-20} [viewer.js]
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',

    plugins: [
        MarkersPlugin.withConfig({
            markers: [{
                id: 'custom-tooltip',
                tooltip: {
                    content: document.querySelector('#tooltip-content').innerText,
                    className: 'custom-tooltip',
                    position: 'top',
                    trigger: 'click',
                },
                position: { pitch: 0.11, yaw: -0.35 },
                image: baseUrl + 'pictos/pin-blue.png',
                size: { width: 32, height: 32 },
                anchor: 'bottom center',
            }],
        }),
    ],
});

const markersPlugin = viewer.getPlugin(MarkersPlugin);

viewer.addEventListener('ready', () => {
    viewer
        .animate({
            yaw: 0,
            pitch: 0.5,
            speed: 1000,
        })
        .then(() => {
            markersPlugin.showMarkerTooltip('custom-tooltip');
        });
}, { once: true });
```

```css:line-numbers [style.css]
.custom-tooltip {
    max-width: none;
    width: 300px;
    box-shadow: 0 0 0 3px white;
}

.custom-tooltip .psv-tooltip-content {
    padding: 0;
}

.custom-tooltip img {
    width: 100%;
    border-radius: 4px 4px 0 0;
}

.custom-tooltip h2,
.custom-tooltip p {
    margin: 1rem;
    text-align: justify;
}
```

```html [template.html]
<script type="text/template" id="tooltip-content">
  <img src="https://photo-sphere-viewer-data.netlify.app/assets/sphere-small.jpg">
  <article>
    <h2>中文提示框</h2>
    <p>
      这里展示自定义提示框的正文内容。你可以在提示框中放入图片、说明文字和任意业务信息。
    </p>
  </article>
</script>
```

:::

::::
