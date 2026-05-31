# 等距柱状图

::: module
[等距柱状投影](https://en.wikipedia.org/wiki/Equirectangular_projection)是创建球体纹理最简单的方式之一，也是大多数 360° 相机使用的默认投影方式。
:::

::: tip 提示
等距柱状适配器是默认适配器，除非需要修改其配置，否则无需显式声明。
:::

```js:line-numbers
import { EquirectangularAdapter } from '@photo-sphere-viewer/core';

const viewer = new Viewer({
    adapter: EquirectangularAdapter,
    panorama: 'path/panorama.jpg',
});
```

## 配置

#### `useXmpData`

- 类型：`boolean`
- 默认值：`true`

从 XMP 数据读取真实图片尺寸。如果全景图在拍摄后经过裁剪，必须保持为 `true`。此选项用于[裁剪全景图](#cropped-panorama)。

#### `resolution`

- 类型：`number`
- 默认值：`64`

用于显示全景图的球体几何体面数。数值越高，越能减少直线变形，但会牺牲性能。

_注意：实际面数为 `resolution² / 2`。_

## 裁剪全景图 {#cropped-panorama}

只要提供合适的配置，**全景图查看器** 就支持裁剪全景图。裁剪全景图并不会覆盖完整的 360°×180° 球面区域，而只覆盖其中一部分。例如，你可能有一张水平覆盖 360°、垂直只覆盖 90° 的图片，或一张半球图片（180°×180°）。

全景图查看器 通过两种方式处理这些不完整全景图：

- 通过 `useXmpData` 选项直接从文件读取 XMP 元数据（默认方式）
- 提供 `panoData` 配置对象或函数

可以使用本页底部的[调试台](#playground)为你的全景图寻找最佳数值。

### 原理

两种方式的数据都包含六个重要值：

- 完整全景图宽度
- 完整全景图高度
- 裁剪区域宽度
- 裁剪区域高度
- 裁剪区域左侧位置
- 裁剪区域右侧位置

`完整全景图宽度` / `完整全景图高度` 的比例必须始终为 2:1。`裁剪区域宽度` 和 `裁剪区域高度` 是图片的实际尺寸。`裁剪区域左侧位置` 和 `裁剪区域右侧位置` 用于定义裁剪区域的位置。

数据也可以包含角度值：

- 姿态航向角
- 姿态俯仰角
- 姿态翻滚角
- 初始视图航向角
- 初始视图俯仰角
- 初始水平视场角

![XMP_pano_pixels](/images/XMP_pano_pixels.png)

更多信息见 [Google 文档](https://developers.google.com/streetview/spherical-metadata)。

### 提供裁剪数据

#### 使用 XMP

如果你使用手机或专用 360° 相机创建全景图，文件中通常已经包含正确的 XMP 数据。否则，也可以使用 [exiftool](https://sno.phy.queensu.ca/~phil/exiftool/) 等工具自行注入。

XMP 载荷如下：

```xml:line-numbers
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">
      <GPano:ProjectionType>equirectangular</GPano:ProjectionType>
      <!-- 裁剪信息 -->
      <GPano:FullPanoWidthPixels>6000</GPano:FullPanoWidthPixels>
      <GPano:FullPanoHeightPixels>3000</GPano:FullPanoHeightPixels>
      <GPano:CroppedAreaImageWidthPixels>4000</GPano:CroppedAreaImageWidthPixels>
      <GPano:CroppedAreaImageHeightPixels>2000</GPano:CroppedAreaImageHeightPixels>
      <GPano:CroppedAreaLeftPixels>1000</GPano:CroppedAreaLeftPixels>
      <GPano:CroppedAreaTopPixels>500</GPano:CroppedAreaTopPixels>
      <!-- 姿态信息 -->
      <GPano:PoseHeadingDegrees>0</GPano:PoseHeadingDegrees>
      <GPano:PosePitchDegrees>0</GPano:PosePitchDegrees>
      <GPano:PoseRollDegrees>0</GPano:PoseRollDegrees>
      <!-- 初始视角信息 -->
      <GPano:InitialViewHeadingDegrees>0</GPano:InitialViewHeadingDegrees>
      <GPano:InitialViewPitchDegrees>0</GPano:InitialViewPitchDegrees>
      <GPano:InitialHorizontalFOVDegrees>60</GPano:InitialHorizontalFOVDegrees>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="r"?>
```

要把 XMP 数据写入图片文件，请先将其粘贴到文本文件中，然后使用以下命令：

```bash
exiftool -tagsfromfile data.xmp -all:all panorama.jpg
```

#### 手动提供

也可以通过 `panoData` 参数直接把这些值传给 全景图查看器。

```js:line-numbers
const viewer = new Viewer({
    container: 'viewer',
    panorama: 'path/to/panorama.jpg',

    // 裁剪信息
    panoData: {
        fullWidth: 6000,
        fullHeight: 3000, // optional
        croppedWidth: 4000, // optional
        croppedHeight: 2000, // optional
        croppedX: 1000,
        croppedY: 500,
    },

    // 姿态信息
    // sphereCorrection: {
    //   pan: '0deg',
    //   tilt: '0deg',
    //   roll: '0deg',
    // },

    // 初始视角信息
    // defaultYaw: '0deg',
    // defaultPitch: '0deg',
    // defaultZoomLvl: 50,
});
```

#### 默认参数 {#default-parameters}

如果图片不是 2:1 比例，且没有找到 XMP 数据，也未提供 `panoData`，系统会尽量以无畸变方式显示图片。具体算法如下：

```js:line-numbers
const fullWidth = Math.max(img.width, img.height * 2);
const fullHeight = Math.round(fullWidth / 2);
const croppedX = Math.round((fullWidth - img.width) / 2);
const croppedY = Math.round((fullHeight - img.height) / 2);

panoData = {
    fullWidth: fullWidth,
    fullHeight: fullHeight,
    croppedWidth: img.width,
    croppedHeight: img.height,
    croppedX: croppedX,
    croppedY: croppedY,
};
```

### 调试台 {#playground}

使用此演示为你的图片寻找最佳数值。

<script setup>
import CropPlayground from '@components/CropPlayground.vue';
</script>

<ClientOnly>
  <CropPlayground/>
</ClientOnly>
