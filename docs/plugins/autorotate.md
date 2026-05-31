# AutorotatePlugin

<Badges module="autorotate-plugin"/>

::: module
<ApiButton page="modules/AutorotatePlugin.html"/>
Adds an automatic rotation of the panorama, which starts automatically on idle or with a click on a button. The rotation can also be configured to visit specific points.

这个插件由 [@photo-sphere-viewer/autorotate-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/autorotate-plugin) 包提供。
:::

## 用法

:::: tabs

::: tab 标准用法

在标准模式下，全景图会持续旋转；你可以配置 `autorotatePitch` 与 `autorotateZoomLvl`。

```js:line-numbers
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

const viewer = new Viewer({
    plugins: [
        AutorotatePlugin.withConfig({
            autorotatePitch: '5deg',
        }),
    ],
});
```

:::

::: tab Keypoints

In keypoints mode the plugin is configured with a list of `keypoints` which can be either a position object (either `yaw`/`pitch` or `textureX`/`textureY`) or the identifier of an existing [marker](./markers.md).

It is also possible to configure each keypoint with a pause time and a tooltip.

```js:line-numbers
const viewer = new Viewer({
    plugins: [
        AutorotatePlugin.withConfig({
            keypoints: [
                'existing-marker-id',

                { yaw: Math.PI / 2, pitch: 0 },

                {
                    position: { yaw: Math.PI, pitch: Math.PI / 6 },
                    pause: 5000,
                    tooltip: 'This is interesting',
                },

                {
                    markerId: 'another-marker', // will use the marker tooltip if any
                    pause: 2500,
                },
            ],
        }),
    ],
});
```

:::

::::

## 示例

### 标准用法

::: code-demo

```yaml
title: PSV Autorotate Demo
packages:
  - name: autorotate-plugin
```

<<< ./demos-src/autorotate.js{js:line-numbers}

:::

### Keypoints

::: code-demo

```yaml
title: PSV Autorotate Keypoints Demo
packages:
  - name: autorotate-plugin
    imports: AutorotatePlugin
  - name: markers-plugin
    imports: MarkersPlugin
    style: true
```

<<< ./demos-src/autorotate-keypoints.js{js:line-numbers}

:::

## Configuration

#### `autostartDelay`

- type: `integer`
- default: `2000`
- updatable: yes

Delay after which the automatic rotation will begin, in milliseconds.

#### `autostartOnIdle`

- type: `boolean`
- default: `true`
- updatable: yes

Restarts the automatic rotation if the user is idle for `autostartDelay`.

**Note:** the rotation won't restart of the user explicitly clicks on the navbar button.

#### `autorotateSpeed`

- type: `string`
- default: `2rpm`
- updatable: yes

Speed of the automatic rotation. Can be a negative value to reverse the rotation.

#### `autorotatePitch`

- type: `double | string`
- default: `defaultPitch`
- updatable: yes

Vertical angle at which the automatic rotation is performed. If `null` the current pitch is kept.

#### `autorotateZoomLvl`

- type: `number`
- default: `null`
- updatable: yes

Zoom level at which the automatic rotation is performed. If `null` the current zoom is kept.

#### `keypoints`

- type: `AutorotateKeypoint[]`
- updatable: no, use `setKeypoints()` method

Initial keypoints, does the same thing as calling `setKeypoints()` just after initialisation.

::: dialog "See details" "Keypoints configuration"

Keypoints are defined either by a `position` or a `markerId` (requires the [markers plugin](./markers.md)).

```ts:line-numbers
{
    position?: ExtendedPosition;
    /**
     * use the position and tooltip of a marker
     */
    markerId?: string;
    /**
     * pause the animation when reaching this point, will display the tooltip if available
     */
    pause?: number;
    /**
     * optional tooltip
     */
    tooltip?: string | { content: string; position?: string };
}
```

:::

#### `startFromClosest`

- type: `boolean`
- default: `true`
- updatable: yes

Start from the closest keypoint instead of the first keypoint of the array.

#### `lang`

- type: `object`
- default:

```js
lang: {
    autorotate: '自动旋转',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## Methods

#### `setKeypoints(keypoints)`

Changes or remove the keypoints.

#### `start()` / `stop()` / `toggle()`

As it says.

## Events

#### `autorotate(autorotateEnabled)`

Triggered when the automatic rotation is enabled/disabled.

## Buttons

This plugin adds buttons to the default navbar:

- `autorotate` allows to toggle the rotation on and off

If you use a [custom navbar](../guide/navbar.md) you will need to manually add the buttons to the list.
