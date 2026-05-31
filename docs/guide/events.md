# 事件

## 介绍

Photo Sphere Viewer 对象（`Viewer` 和插件）都实现了 [EventTarget API](https://developer.mozilla.org/docs/Web/API/EventTarget) 用于派发事件，同时也提供自定义 TypeScript 接口，让事件具备强类型。

事件监听器会收到一个带额外属性的 `Event` 子类。主要属性包括：

- `type`：事件名称
- `target`：viewer（或插件）自身的引用

```js:line-numbers
import { events } from '@photo-sphere-viewer/core';

// use a constant (prefered)
viewer.addEventListener(events.PositionUpdateEvent.type, (e) => {
    // e.type === 'position-updated'
    // e.target === viewer
    // e.position
});

// or a magic value
viewer.addEventListener('position-updated', ({ position }) => ());
```

完整事件列表见 [API 参考](/api/modules/Core.events.html){target=\_blank}。

## 主要事件

本节介绍最常用的事件。

### `click(data)` | `dblclick(data)`

- data: [`ClickData`](/api/types/Core.ClickData.html){target=\_blank}

用户点击 viewer 时触发（不含导航栏和侧边面板）。事件中包含点击位置的详细信息；如果启用了 `clickEventOnMarker` 选项，还会包含对应的[标记](../plugins/markers.md)。

```js:line-numbers
viewer.addEventListener('click', ({ data }) => {
    console.log(`${data.rightclick ? 'right ' : ''}clicked at yaw: ${data.yaw} pitch: ${data.pitch}`);
});
```

`click` 事件一定会先于 `dblclick` 触发。

### `position-updated(position)`

视图的 yaw 或 pitch 发生变化时触发。

```js:line-numbers
viewer.addEventListener('position-updated', ({ position }) => {
    console.log(`new position is yaw: ${position.yaw} pitch: ${position.pitch}`);
});
```

### `ready`

全景图加载完成且 viewer 准备好进行首次渲染时触发一次。

```js:line-numbers
viewer.addEventListener('ready', () => {
    console.log(`viewer is ready`);
}, { once: true });
```

### `zoom-updated(zoomLevel)`

缩放级别变化时触发。

```js:line-numbers
viewer.addEventListener('zoom-updated', ({ zoomLevel }) => {
    console.log(`new zoom level is ${zoomLevel}`);
});
```
