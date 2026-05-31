# 键盘操作

通过 [`keyboardActions`](../../guide/config.md#keyboardactions) 为键盘按键添加自定义操作。

:::: code-demo

```yaml
autoload: true
title: 全景图查看器键盘操作示例
```

::: code-group

```js:line-numbers [viewer.js]
import { Viewer, DEFAULTS } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',

    keyboard: 'always',
    keyboardActions: {
        ...DEFAULTS.keyboardActions,
        'h': (viewer, evt) => {
            if (viewer.panel.isVisible('help')) {
                viewer.panel.hide();
            } else {
                viewer.panel.show({
                    id: 'help',
                    content: document.querySelector('#help-content').innerText,
                });
            }
        },
        'f': (viewer, evt) => {
            if (!evt.ctrlKey && !evt.altKey) {
                viewer.toggleFullscreen();
            }
        },
    },
});

viewer.notification.show(`按 H 显示帮助面板，按 F 切换全屏`);

// 仅为示例 iframe 内可用而添加，真实项目中可以移除
window.parent.addEventListener('keydown', e => viewer.eventsHandler.handleEvent(e));
window.parent.addEventListener('keyup', e => viewer.eventsHandler.handleEvent(e));
```

```html [template.html]
<script type="text/template" id="help-content">
  <p><strong>这是一段中文说明内容</strong>，用于展示面板中的富文本、链接、代码和中文排版效果。你可以把它替换成景点介绍、设备状态、巡检记录或任何业务信息。</p>
</script>
```

:::

::::
