# 样式

全景图查看器 自带默认的深色主题。你可以从 SCSS 源码自行构建样式表，并覆盖部分变量来完成自定义。

源码文件使用 SASS modules；要覆盖变量，必须通过 `@use` 导入。

```scss:line-numbers
// main stylesheet
@use '@photo-sphere-viewer/core/index.scss' as psv with (
    $loader-color: rgba(0, 0, 0, .5),
    $loader-width: 100px,
);

// plugins stylesheets
@use '@photo-sphere-viewer/markers-plugin/index.scss' as psvMarkers;
@use '@photo-sphere-viewer/virtual-tour-plugin/index.scss' as psvVirtualTour;
....
```

以下小节列出了 core 可用的全部变量。插件变量会列在各自对应的插件页面中。

## 全局

| 变量                   | 默认值               | 说明                                     |
| ---------------------- | -------------------- | ---------------------------------------- |
| $main-background       | radial-gradient(...) | viewer 背景，在未设置全景图时可见        |
| $element-focus-outline | 2px solid #007cff    | 应用于可聚焦元素的轮廓（导航栏、面板等） |

## 加载器

| 变量             | 默认值                  | 说明               |
| ---------------- | ----------------------- | ------------------ |
| $loader-color    | rgba(255, 255, 255, .7) | 加载条和文字的颜色 |
| $loader-bg-color | rgba(61, 61, 61, .5)    | 加载器背景颜色     |
| $loader-width    | 150px                   | 加载器尺寸         |
| $loader-tickness | 10px                    | 加载条厚度         |
| $loader-border   | 3px                     | 加载器内边框       |
| $loader-font     | 600 16px sans-serif     | 加载文字字体       |

## 导航栏

| 变量                | 默认值                  | 说明           |
| ------------------- | ----------------------- | -------------- |
| $navbar-height      | 40px                    | 导航栏高度     |
| $navbar-background  | rgba(61, 61, 61, .5)    | 导航栏背景颜色 |
| $caption-font       | 16px sans-serif         | 说明文字字体   |
| $caption-text-color | rgba(255, 255, 255, .7) | 说明文字颜色   |

#### 按钮

| 变量                       | 默认值                  | 说明                           |
| -------------------------- | ----------------------- | ------------------------------ |
| $buttons-height            | 20px                    | 按钮内部高度                   |
| $buttons-color             | rgba(255, 255, 255, .7) | 按钮图标颜色                   |
| $buttons-background        | transparent             | 按钮背景颜色                   |
| $buttons-active-background | rgba(255, 255, 255, .2) | 按钮激活时的背景颜色           |
| $buttons-disabled-opacity  | .5                      | 禁用按钮的不透明度             |
| $buttons-hover-scale       | 1.2                     | 鼠标悬停时应用于按钮的缩放比例 |
| $buttons-hover-scale-delay | 200ms                   | 缩放动画持续时间               |

#### 缩放范围

| 变量                        | 默认值 | 说明                       |
| --------------------------- | ------ | -------------------------- |
| $zoom-range-width           | 80px   | 缩放范围控件尺寸           |
| $zoom-range-tickness        | 1px    | 缩放范围控件厚度           |
| $zoom-range-diameter        | 7px    | 缩放手柄尺寸               |
| $zoom-range-media-min-width | 600px  | 在小屏幕上隐藏缩放范围控件 |

## 工具提示

| 变量                    | 默认值               | 说明                     |
| ----------------------- | -------------------- | ------------------------ |
| $tooltip-background     | rgba(61, 61, 61, .8) | 工具提示背景             |
| $tooltip-radius         | 4px                  | 工具提示圆角             |
| $tooltip-padding        | .5em 1em             | 工具提示内容内边距       |
| $tooltip-arrow-size     | 7px                  | 工具提示箭头尺寸         |
| $tooltip-max-width      | 200px                | 工具提示内容最大宽度     |
| $tooltip-text-color     | rgb(255, 255, 255)   | 工具提示文字颜色         |
| $tooltip-font           | 14px sans-serif      | 工具提示字体             |
| $tooltip-text-shadow    | 0 1px #000           | 应用于工具提示文字的阴影 |
| $tooltip-shadow-color   | rgba(90, 90, 90, .7) | 工具提示阴影颜色         |
| $tooltip-shadow-offset  | 3px                  | 工具提示阴影尺寸         |
| $tooltip-animate-offset | 5px                  | 显示动画中的移动距离     |
| $tooltip-animate-delay  | 100ms                | 显示动画持续时间         |

## 面板

| 变量                 | 默认值               | 说明             |
| -------------------- | -------------------- | ---------------- |
| $panel-background    | rgba(10, 10, 10, .7) | 面板背景         |
| $panel-width         | 400px                | 面板默认宽度     |
| $panel-padding       | 1em                  | 面板内容内边距   |
| $panel-text-color    | rgb(220, 220, 220)   | 面板默认文字颜色 |
| $panel-font          | 16px sans-serif      | 面板默认字体     |
| $panel-animate-delay | 100ms                | 显示动画持续时间 |

#### 菜单

| 变量                         | 默认值                  | 说明                     |
| ---------------------------- | ----------------------- | ------------------------ |
| $panel-title-font            | 24px sans-serif         | 菜单标题字体             |
| $panel-title-icon-size       | 24px                    | 菜单标题图标尺寸         |
| $panel-title-margin          | 24px                    | 菜单标题外边距           |
| $panel-menu-item-height      | 1.5em                   | 菜单项最小高度           |
| $panel-menu-item-padding     | .5em 1em                | 菜单项内边距             |
| $panel-menu-odd-background   | rgba(255, 255, 255, .1) | 奇数菜单项背景颜色       |
| $panel-menu-even-background  | transparent             | 偶数菜单项背景颜色       |
| $panel-menu-hover-background | rgba(255, 255, 255, .2) | 鼠标悬停时菜单项背景颜色 |

## 通知

| 变量                        | 默认值              | 说明             |
| --------------------------- | ------------------- | ---------------- |
| $notification-position-from | -$navbar-height     | 通知隐藏时的位置 |
| $notification-position-to   | $navbar-height \* 2 | 通知可见时的位置 |
| $notification-animate-delay | 200ms               | 显示动画持续时间 |
| $notification-background    | $tooltip-background | 通知背景颜色     |
| $notification-radius        | $tooltip-radius     | 通知圆角         |
| $notification-padding       | $tooltip-padding    | 通知内容内边距   |
| $notification-font          | $tooltip-font       | 通知字体         |
| $notification-text-color    | $tooltip-text-color | 通知文字颜色     |

## 覆盖层

| 变量                 | 默认值                             | 说明                          |
| -------------------- | ---------------------------------- | ----------------------------- |
| $overlay-opacity     | .8                                 | 覆盖层不透明度                |
| $overlay-icon-color  | rgb(48, 48, 48)                    | 覆盖层图标颜色（如果是 SVG）  |
| $overlay-title-font  | 30px sans-serif                    | 覆盖层标题字体                |
| $overlay-title-color | black                              | 覆盖层标题颜色                |
| $overlay-text-font   | 20px sans-serif                    | 覆盖层文本字体                |
| $overlay-text-color  | rgba(0, 0, 0, .8)                  | 覆盖层文本颜色                |
| $overlay-image-size  | (portrait: 50%,<br>landscape: 33%) | 图片/图标尺寸，取决于屏幕方向 |
