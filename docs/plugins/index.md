# 插件介绍

插件用于为 Photo Sphere Viewer 添加新功能。它们可以访问 viewer 的内部 API，也可以访问 Three.js 渲染器，从而扩展更多能力。

## 导入官方插件

官方插件（左侧菜单列出的项目）分别发布在不同的 `@photo-sphere-viewer/***-plugin` 包中。部分插件还会附带额外的 CSS 文件。

**Markers 插件示例：**

::::: tabs

:::: tab 从 CDN 导入

```html:line-numbers
<head>
    <!-- PSV 核心样式 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin/index.min.css" />
</head>

<script type="importmap">
    {
        "imports": {
            // 导入 PSV 核心和 three
            "@photo-sphere-viewer/markers-plugin": "https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin/index.module.js"
        }
    }
</script>

<script type="module">
    import { Viewer } from '@photo-sphere-viewer/core';
    import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

    const viewer = new Viewer({
        plugins: [
            MarkersPlugin,
        ],
    });
</script>
```

::::

:::: tab 使用 NPM 和构建工具安装

```js:line-numbers
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const viewer = new Viewer({
    plugins: [
        MarkersPlugin,
    ],
});
```

::: tip 样式表
请根据你的工具链，用推荐方式导入 `@photo-sphere-viewer/markers-plugin/index.css`。
:::

::::

:::::

## 使用插件

所有插件都由一个 JavaScript 类组成，并且必须传入 `plugins` 数组。部分插件还支持通过静态方法 `withConfig` 传入配置对象。

```js:line-numbers
const viewer = new Viewer({
    plugins: [
        PluginA,
        PluginB.withConfig({
            option1: 'foo',
            option2: 'bar',
        }),
    ],
});
```

### 方法和事件

初始化后，可以通过 `getPlugin` 方法获取插件实例，从而调用插件方法并订阅事件。

```js:line-numbers
const markersPlugin = viewer.getPlugin(MarkersPlugin);

markersPlugin.addMarker(/* ... */);

markersPlugin.addEventListener('select-marker', () => {
    /* ... */
});
```

### 更新选项

部分插件允许在初始化后通过 `setOption()` 和 `setOptions()` 方法修改配置。每个插件页面都会列出支持动态更新的配置属性。

```js:line-numbers
markersPlugin.setOption('gotoMarkerSpeed', '3rpm');

markersPlugin.setOptions({
    gotoMarkerSpeed: '3rpm',
    clickEventOnMarker: true,
});
```
