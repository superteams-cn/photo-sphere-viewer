# 配置

::: tip 角度定义
全景图查看器的配置中会大量使用角度，其中大多数既可以用普通数字表示弧度（`3.5`），也可以用 `"deg"` 后缀表示角度（`'55deg'`）。
:::

## 标准选项

#### `container` (必填)

- 类型：`HTMLElement | string`

用于容纳全景图的 HTML 元素，或该元素的标识符。

```js
container: document.querySelector('.viewer');
container: '.viewer'; // 定位到 [class="viewer"]
container: 'viewer'; // 定位到 [id="viewer"]
```

#### `panorama` (必填)

- 类型：`*`

全景图路径。对于默认的等距柱状适配器，必须是单个 URL；其他适配器支持其他类型的值。

#### `adapter`

- 默认值：`equirectangular`

用于加载全景图的[适配器](./adapters/)。

#### `plugins`

- 类型：`array`

已启用的[插件](../plugins/)列表。

#### `caption`

- 类型：`string`

显示在导航栏中的文本。如果禁用了导航栏，说明文字将不可见。

_**注意：** 内容会按 HTML 渲染。如果内容可能包含不可信输入，请先清理后再传入 `caption`。_

#### `description`

- 类型：`string`

用户点击“i”按钮时显示在侧边面板中的文本。允许使用 HTML。

_**注意：** 内容会按 HTML 渲染。如果内容可能包含不可信输入，请先清理后再传入 `description`。_

#### `downloadUrl`

- 类型：`string`
- 默认值：等距柱状全景图为 `=panorama`

定义通过 `download` 按钮下载的文件。对于使用多个文件的适配器（如 CubemapAdapter 或 EquirectangularTilesAdapter），这尤其有用。

#### `downloadName`

- 类型：`string`
- 默认值：`=downloadUrl` 文件名

覆盖下载全景图时使用的文件名。当全景图以 base64 提供时，这通常很有用。

#### `size`

- 类型：`{ width: integer, height: integer }`

全景图容器的最终尺寸。默认使用 `container` 的尺寸，并在其尺寸变化时随之更新。

#### `navbar`

[导航栏](./navbar.md)配置。

#### `minFov`

- 类型：`integer`
- 默认值：`30`

最小视场角（最大缩放），取值介于 1 和 `maxFov` 之间。

#### `maxFov`

- 类型：`integer`
- 默认值：`90`

最大视场角（最小缩放），取值介于 `minFov` 和 180 之间。

#### `defaultZoomLvl`

- 类型：`integer`
- 默认值：`50`

初始缩放级别，取值介于 0（对应 `maxFov`）和 100（对应 `minfov`）之间。

#### `fisheye`

- 类型：`boolean | double`
- 默认值：`false`

设为 `true` 可启用鱼眼效果，也可以指定效果强度（`true` = `1.0`）。

<DemoButton href="/demos/basic/fisheye.html"/>

::: warning 注意
此模式可能会对标记渲染和部分适配器产生副作用。
:::

#### `defaultYaw`

- 类型：`double | string`
- 默认值：`0`

初始水平角度，取值介于 0 和 2π 之间。

#### `defaultPitch`

- 类型：`double | string`
- 默认值：`0`

初始垂直角度，取值介于 -π/2 和 π/2 之间。

#### `lang`

- 类型：`object`
- 默认值：

```js:line-numbers
lang: {
  zoom: '缩放',
  zoomOut: '缩小',
  zoomIn: '放大',
  moveUp: '向上移动',
  moveDown: '向下移动',
  moveLeft: '向左移动',
  moveRight: '向右移动',
  description: '说明',
  download: '下载',
  fullscreen: '全屏',
  loading: '加载中...',
  menu: '菜单',
  close: '关闭',
  twoFingers: '请使用双指浏览',
  ctrlZoom: '请按住 Ctrl 并滚动来缩放图片',
  loadError: '全景图加载失败',
  webglError: '当前浏览器似乎不支持 WebGL',
}
```

查看器中使用的界面文案。你可以继续通过 `lang` 覆盖任意字段，实现英文或其他语言版本。

#### `loadingImg`

- 类型：`string`

显示在加载器中央的图片路径。

#### `loadingTxt`

- 类型：`string`
- 默认值：`lang.loading`

显示在加载器中央的文本，仅在未提供 `loadingImg` 时使用。

#### `mousewheel`

- 类型：`boolean`
- 默认值：`true`

启用鼠标滚轮缩放。

#### `mousemove`

- 类型：`boolean`
- 默认值：`true`

启用通过鼠标点击并拖动，或在触摸屏上用手指滑动来旋转全景图。

#### `keyboard`

- 类型：`boolean | 'fullscreen' | 'always'`
- 默认值：`'fullscreen'`（等同于 `true`）

在全屏时或始终启用键盘控制。不同按键可通过 [`keyboardActions`](#keyboardactions) 配置。

::: warning 注意
按键会在页面全局监听，因此如果配置为 `'always'`，可能会与其他组件冲突。
:::

#### `mousewheelCtrlKey`

- 类型：`boolean`
- 默认值：`false`

要求按住 ctrl 键才能缩放全景图。这样可以在页面中滚动而不干扰 viewer。启用后，如果未按下 ctrl 键，会显示一个覆盖层，提示用户使用 ctrl + 滚动。

#### `touchmoveTwoFingers`

- 类型：`boolean`
- 默认值：`false`

要求使用双指旋转全景图。这样在包含查看器的页面中仍可使用标准触摸滚动导航。启用后，如果只检测到一根手指，会显示一个覆盖层，提示用户使用双指。

## 高级选项

#### `sphereCorrection`

- 类型：`{ pan: double | string, tilt: double | string, roll: double | string }`
- 默认值：`{ pan:0, tilt:0, roll: 0 }`

用于修正全景图方向。

**注意：** 如果 XMP 数据包含姿态 heading/pitch/roll 数据，它们会在 `sphereCorrection` 之前应用。

![pan-tilt-toll](/images/pan-tilt-roll.png)

#### `panoData`

- 类型：`PanoData | function<Image, PanoData, PanoData>`

覆盖全景图文件中找到的 XMP 数据。
所有参数都是可选的。

```js:line-numbers
panoData: {
  fullWidth: 6000,
  fullHeight: 3000, // 可选
  croppedWidth: 4000, // 可选
  croppedHeight: 2000, // 可选
  croppedX: 1000,
  croppedY: 500,
}
```

它也可以是一个函数，用于根据已加载图片动态计算裁剪配置（注意：找不到数据时，系统已经会应用一个[默认设置](./adapters/equirectangular.md#default-parameters)）。

```js:line-numbers
panoData: (image, xmpData) => ({
    fullWidth: image.width,
    fullHeight: Math.round(image.width / 2),
    croppedWidth: image.width,
    croppedHeight: image.height,
    croppedX: 0,
    croppedY: Math.round((image.width / 2 - image.height) / 2),
});
```

#### `defaultTransition`

- 类型：`TransitionOptions`
- 默认值：`{ speed: 1500, rotation: true, effect: "fade" }`

配置全景图之间的默认过渡效果。调用 `setPanorama()` 方法时可以修改所有参数。

可用的 `effect` 包括 `fade, black, white`。
`speed` 可以是以毫秒为单位的持续时间，也可以是包含每分钟转数的字符串（`2rpm`）。

<DemoButton href="/demos/basic/transition.html"></DemoButton>

#### `moveSpeed`

- 类型：`double`
- 默认值：`1`

全景图移动速度倍数。用于点击移动、触摸移动和导航栏按钮。

#### `zoomSpeed`

- 类型：`double`
- 默认值：`1`

全景图缩放速度倍数。用于鼠标滚轮、触摸捏合和导航栏按钮。

#### `moveInertia`

- 类型：`boolean | number`
- 默认值：`0.8`

对相机移动应用阻尼。数值越高，阻尼越强（`true` 表示默认阻尼系数，`false` 表示无阻尼）。

#### `requestHeaders`

- 类型：`object | function<string, object>`

加载图片文件时设置 HTTP 头。

```js
requestHeaders: {
    header: 'value',
}
```

也可以是一个函数，用于在每次请求前动态设置请求头。当需要向 Authorization 头添加临时有效的 Bearer 时，这会很有用。

```js
requestHeaders: (url) => ({
  header: 'value',
});
```

#### `withCredentials`

- 类型：`boolean | function<string, boolean>`
- 默认值：`false`

为 HTTP 请求使用凭据。

也可以是一个函数，用于在每次请求前动态改变该选项。

```js
withCredentials: (url) => !url.includes('amazonaws');
```

#### `keyboardActions`

- 类型：`object`
- 默认值：

```js:line-numbers
keyboardActions: {
  'ArrowUp': 'ROTATE_UP',
  'ArrowDown': 'ROTATE_DOWN',
  'ArrowRight': 'ROTATE_RIGHT',
  'ArrowLeft': 'ROTATE_LEFT',
  'PageUp': 'ZOOM_IN',
  'PageDown': 'ZOOM_OUT',
  '+': 'ZOOM_IN',
  '-': 'ZOOM_OUT',
}
```

配置键盘动作。它是一个定义 key code -> action 的映射。按键可以包含 `Ctrl`、`Shift`、`Alt` 或 `Meta` 等修饰键，并用 `+` 分隔。

::: tip 提示
可使用 [Key.js](https://keyjs.dev/) 网站确定按键的准确组合。

_注意：_ 当配置带修饰键的加号键时，请使用 `Plus` 而不是 `+`，例如 `Shift+Plus`。
:::

也可以为任意按键配置回调函数；回调会接收查看器实例和原始键盘事件作为参数。

```js:line-numbers
import { DEFAULTS } from '@photo-sphere-viewer/core';

keyboardActions: {
    ...DEFAULTS.keyboardActions,
    'h': (viewer, evt) => {
        // do something when H is pressed
    },
    'Ctrl+1': (viewer) => {
        // do something when Ctrl + 1 is pressed
    },
},
```

<DemoButton href="/demos/advanced/keyboard-actions.html"/>

::: warning 注意
键盘动作默认只在全屏模式下可用，可通过 [`keyboard` 选项](#keyboard)修改。
:::

#### `canvasBackground`

- 类型：`string`
- 默认值：`#000`

画布背景。在使用裁剪全景图时会显示出来。可以是任何有效的 CSS `background` 值。

#### `rendererParameters`

- 类型：[`WebGLRendererParameters`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)
- 默认值：`{ alpha: true, antialias: true }`

Three.js `WebGLRenderer` 的配置。

## 缓存

全景图查看器包含一个缓存系统，用于在多个全景图之间来回切换时节省资源。
该缓存是全局的，并在各个查看器之间共享（_注意：_ 它与 Three.js `Cache` 无关，后者不应启用）。

要获取缓存实例，请从 `@photo-sphere-viewer/core` 导入它，然后即可进行配置。

```js
import { Cache } from '@photo-sphere-viewer/core';

Cache.enabled = false;
Cache.ttl = 300;
Cache.maxItems = 3;
```

#### `enabled`

- 类型：`boolean`
- 默认值：`true`

允许完全禁用缓存。

#### `ttl`

- 类型：`number`
- 默认值：`600`

最大保留时长，单位为分钟。

#### `maxItems`

- 类型：`number`
- 默认值：`10`

缓存中存储的最大条目数。

_注意：_ 使用立方体贴图和瓦片适配器时，实际文件数量会更多。
