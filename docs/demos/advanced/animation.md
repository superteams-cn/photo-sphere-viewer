# 入场动画

使用 `Animation` 辅助工具和[自动旋转插件](../../plugins/autorotate.md)创建入场动画。

::: code-demo

```yaml
autoload: true
title: 全景图查看器入场动画示例
packages:
  - name: autorotate-plugin
```

```js:line-numbers
import { Viewer, utils } from '@photo-sphere-viewer/core';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const animatedValues = {
    pitch: { start: -Math.PI / 2, end: 0 },
    yaw: { start: Math.PI / 2, end: 0 },
    zoom: { start: 0, end: 50 },
    maxFov: { start: 130, end: 90 },
    fisheye: { start: 2, end: 0 },
};

const viewer = new Viewer({
    container: 'viewer',
    panorama: baseUrl + 'sphere.jpg',
    caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
    defaultPitch: animatedValues.pitch.start,
    defaultYaw: animatedValues.yaw.start,
    defaultZoomLvl: animatedValues.zoom.start,
    maxFov: animatedValues.maxFov.start,
    fisheye: animatedValues.fisheye.start,
    mousemove: false,
    mousewheel: false,
    navbar: [
        'autorotate',
        'zoom',
        {
            title: '重新播放动画',
            content: '🔄',
            onClick: reset,
        },
        'caption',
        'fullscreen',
    ],
    plugins: [
        AutorotatePlugin.withConfig({
            autostartDelay: null,
            autostartOnIdle: false,
            autorotatePitch: 0,
        }),
    ],
});

const autorotate = viewer.getPlugin(AutorotatePlugin);

let isInit = true;

// 设置启动后自动播放动画的计时器
viewer.addEventListener('ready', () => {
    viewer.navbar.hide();

    setTimeout(() => {
        if (isInit) {
            intro(animatedValues.pitch.end, animatedValues.pitch.end);
        }
    }, 5000);
}, { once: true });

// 播放动画到点击位置
viewer.addEventListener('click', ({ data }) => {
    if (isInit) {
        intro(data.pitch, data.yaw);
    }
});

// 执行入场动画
function intro(pitch, yaw) {
    isInit = false;
    autorotate.stop();
    viewer.navbar.hide();

    new utils.Animation({
        properties: {
            ...animatedValues,
            pitch: { start: animatedValues.pitch.start, end: pitch },
            yaw: { start: animatedValues.yaw.start, end: yaw },
        },
        duration: 2500,
        easing: 'inOutQuad',
        onTick: (properties) => {
            viewer.setOptions({
                fisheye: properties.fisheye,
                maxFov: properties.maxFov,
            });
            viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
            viewer.zoom(properties.zoom);
        },
    }).then(() => {
        autorotate.start();
        viewer.navbar.show();
        viewer.setOptions({
            mousemove: true,
            mousewheel: true,
        });
    });
}

// 执行反向动画
function reset() {
    isInit = true;
    autorotate.stop();
    viewer.navbar.hide();
    viewer.setOptions({
        mousemove: false,
        mousewheel: false,
    });

    new utils.Animation({
        properties: {
            pitch: { start: viewer.getPosition().pitch, end: animatedValues.pitch.start },
            yaw: { start: viewer.getPosition().yaw, end: animatedValues.yaw.start },
            zoom: { start: viewer.getZoomLevel(), end: animatedValues.zoom.start },
            maxFov: { start: animatedValues.maxFov.end, end: animatedValues.maxFov.start },
            fisheye: { start: animatedValues.fisheye.end, end: animatedValues.fisheye.start },
        },
        duration: 1500,
        easing: 'inOutQuad',
        onTick: (properties) => {
            viewer.setOptions({
                fisheye: properties.fisheye,
                maxFov: properties.maxFov,
            });
            viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
            viewer.zoom(properties.zoom);
        },
    });
}
```

:::
