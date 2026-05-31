# SettingsPlugin <Badge text="样式"/>

<Badges module="settings-plugin"/>

::: module
<ApiButton page="modules/SettingsPlugin.html"/>
这个插件本身不提供独立功能，但会被其他插件依赖。

这个插件由 [@photo-sphere-viewer/settings-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/settings-plugin) 包提供。
:::

## 用法

启用后，插件会添加一个新的“设置”按钮，其他插件可以向其中注入设置项。

```js:line-numbers
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';

const viewer = new Viewer({
    plugins: [
        SettingsPlugin,
    ],
});
```

## 示例

下面的示例会手动添加两个设置项。

::: code-demo

```yaml
title: 全景图查看器设置示例
packages:
  - name: settings-plugin
    style: true
```

<<< ./demos-src/settings.js{js:line-numbers}

:::

## 添加设置项

通过调用插件的 `addSetting` 方法可以注册新的设置项。目前支持两类设置。

### 开关设置

这类设置只有 `true` 和 `false` 两个值，需要提供 `active(): boolean` 与 `toggle(): void` 方法。

```js:line-numbers
let enabled = false;

settings.addSetting({
    id: 'custom-toggle-setting',
    label: '开关设置',
    type: 'toggle',
    active: () => enabled,
    toggle: () => (enabled = !enabled),
});
```

### 选项设置

这类设置包含多个可选值，需要提供 `current(): string`、`options(): Options[]` 与 `apply(option: string): void` 方法。

```js:line-numbers
let currentOption = 'A';

settings.addSetting({
    id: 'custom-options-setting',
    label: '选项设置',
    type: 'options',
    options: () => [
        { id: 'A', label: '选项 A' },
        { id: 'B', label: '选项 B' },
    ],
    current: () => currentOption,
    apply: (option) => (currentOption = option),
});
```

为了方便翻译，两个 `label` 都可以设置为主 [`lang`](../guide/config.md#lang) 对象中的键。

## 按钮徽标

设置项也可以提供 `badge` 方法，其返回值会显示为设置按钮上的徽标。**同一时间只能有一个设置项声明徽标。**

```js:line-numbers
settings.addSetting({
  ...,
  badge: () => currentOption,
});
```

## 配置

#### `persist`

- 类型：`boolean`
- 默认：`false`
- 可更新：否

是否持久化设置。持久化存储可单独配置。

#### `storage`

- 类型：

```ts:line-numbers
{
  get(settingId: string): boolean | string | Promise<boolean | string>;
  set(settingId: string, value: boolean | string);
}
```

- 默认：使用键名 `psvSettings` 的 LocalStorage
- 可更新：否

自定义存储方案，例如 LocalForage、NgRx、HTTP 服务等。

#### `lang`

- 类型：`object`
- 默认：

```js
lang: {
    settings: '设置',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## 事件

#### `setting-changed(settingId, settingValue)`

设置项变化时触发。

```js:line-numbers
settingsPlugin.addEventListener('setting-changed', ({ settingId, settingValue }) => {
    console.log(`${settingId}: ${settingValue}`);
});
```

## 按钮

此插件会向默认导航栏添加按钮：

- `settings` 用于打开设置面板

如果你使用了[自定义导航栏](../guide/navbar.md)，需要手动把这些按钮添加到列表中。

## SCSS 变量

| 变量              | 默认值                            | 说明                     |
| ----------------- | --------------------------------- | ------------------------ |
| $font             | core.$caption-font                | 设置项字体               |
| $text-color       | core.$panel-text-color            | 设置项文字颜色           |
| $background       | core.$panel-background            | 设置面板背景色           |
| $item-height      | core.$panel-menu-item-height      | 每个设置项的高度         |
| $item-padding     | core.$panel-menu-item-padding     | 每个设置项的内边距       |
| $hover-background | core.$panel-menu-hover-background | 鼠标悬停时设置项的背景色 |
| $badge-font       | 10px / .9 monospace               | 按钮上徽标的字体         |
| $badge-text-color | white                             | 徽标文字颜色             |
| $badge-background | #111                              | 徽标背景色               |
