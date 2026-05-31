---
layout: home

hero:
  name: Photo Sphere Viewer
  text: 用于展示 360° 全景图的 JavaScript 库
  actions:
    - theme: brand
      text: 快速开始 →
      link: /guide/
    - theme: alt
      text: 示例
      link: /demos/
    - theme: alt
      text: API 参考
      link: /api/
      target: _blank

features:
  - title: 支持球面与立方体贴图
    details: 可以展示标准等距柱状全景图，也支持立方体贴图。
  - title: 高度可配置
    details: 丰富的配置项、方法和事件，方便深度集成到网站或应用中。
  - title: 插件化扩展
    details: 通过插件添加新能力，保持核心库轻量。
  - title: 触屏、陀螺仪与更多交互
    details: 为不同设备提供友好的浏览体验。
  - title: 标记系统
    details: 在全景图上展示文本、图片、视频等内容。
  - title: 视频支持
    details: 支持等距柱状和立方体格式的 360° 视频。
---

::: tip 致谢 Jéremy Heleine
本项目 fork 自 [Jérémy Heleine](http://jeremyheleine.me) 创建的 Photo Sphere Viewer，并在此基础上提供更好的代码架构和更多功能。
:::

## 赞助者

<script setup>
import Sponsors from '@components/Sponsors.vue';

const data = [{"name":"Seweryn Pietrucha","avatar":"https://avatars.githubusercontent.com/u/115240595?s=200&v=4","links":[{"icon":"github","link":"https://github.com/seweryn1502"},{"icon":"googlehome","link":"https://3dtrip.pl/en"}]},{"name":"Katapult","avatar":"https://avatars.githubusercontent.com/u/8026440?s=200&v=4","links":[{"icon":"github","link":"https://github.com/KatapultDevelopment"},{"icon":"googlehome","link":"https://www.katapultengineering.com/"}]},{"name":"JaniPonkko","avatar":"https://avatars.githubusercontent.com/u/171242208?s=200&u=d3e415c37a7bbafd43603c5d0a7aa860da73f0bc&v=4","links":[{"icon":"github","link":"https://github.com/JaniPonkko"}]},{"name":"ntrwansui","avatar":"https://avatars.githubusercontent.com/u/17426654?s=200&u=5301d827e8402b531ef41b187fad64e860fe989d&v=4","links":[{"icon":"github","link":"https://github.com/ntrwansuiBC"}]},{"name":"roaz82","avatar":"https://avatars.githubusercontent.com/u/115947370?s=200&v=4","links":[{"icon":"github","link":"https://github.com/roaz82"}]},{"name":"Rai-Rai","avatar":"https://avatars.githubusercontent.com/u/2023869?s=200&u=13470d584ade7da01a3cefbfc0c2f18c0fb7a2ad&v=4","links":[{"icon":"github","link":"https://github.com/Rai-Rai"}]},{"name":"Jeffrey Warren","avatar":"https://avatars.githubusercontent.com/u/24359?s=200&u=5b24289f87bbe7d9254ec56049d1c63bf7f34869&v=4","links":[{"icon":"github","link":"https://github.com/jywarren"},{"icon":"googlehome","link":"https://unterbahn.com"}]}];
</script>

<Sponsors :data="data"/>

<div class="sponsors">

[![Deploys by Netlify](https://www.netlify.com/v3/img/components/netlify-color-accent.svg)](https://www.netlify.com)
[![js.org](/images/js.org.svg)](https://js.org)

</div>
