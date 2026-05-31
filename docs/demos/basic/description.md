# 说明面板

&laquo; i &raquo; 按钮会在侧边面板中显示 [`description`](../../guide/config.md#description)。

::: code-demo

```yaml
autoload: true
title: 全景图查看器说明面板示例
```

::: code-group

```js:line-numbers{9} [viewer.js]
import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
    description: document.querySelector('#description').innerHTML,
    navbar: 'caption description',
});
```

```html [template.html]
<script type="text/template" id="description">
  <p><strong>这是一段中文说明内容</strong>，用于展示面板中的富文本、链接、代码和中文排版效果。可将其替换为景点介绍、设备状态、巡检记录或其他业务信息。</p>

  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54469.108394396746!2d6.9617553450295855!3d44.151844842645815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12cdaf6678af879d%3A0xcabc15aee7b89386!2sParc%20national%20du%20Mercantour!5e0!3m2!1sfr!2sfr!4v1611498421096!5m2!1sfr!2sfr"
    width="100%" height="300" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0">
  </iframe>
</script>
```

:::

:::
