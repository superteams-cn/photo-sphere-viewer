# SettingsPlugin <Badge text="Styles"/>

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
title: PSV 设置示例
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

## Configuration

#### `persist`

- type: `boolean`
- default: `false`
- updatable: no

Should the settings be persisted. The persistence storage can be configured.

#### `storage`

- type:

```ts:line-numbers
{
  get(settingId: string): boolean | string | Promise<boolean | string>;
  set(settingId: string, value: boolean | string);
}
```

- default: LocalStorage with key `psvSettings`
- updatable: no

Custom storage solution, for example LocalForage, NgRx, HTTP service, etc.

#### `lang`

- type: `object`
- default:

```js
lang: {
    settings: '设置',
}
```

_注意：这个选项不属于插件自身配置，而是会合并到主 [`lang`](../guide/config.md#lang) 对象中。_

## Events

#### `setting-changed(settingId, settingValue)`

Triggered when the resolution is changed.

```js:line-numbers
settingsPlugin.addEventListener('setting-changed', ({ settingId, settingValue }) => {
    console.log(`${settingId}: ${settingValue}`);
});
```

## Buttons

This plugin adds buttons to the default navbar:

- `settings` allows to open the settings panel

If you use a [custom navbar](../guide/navbar.md) you will need to manually add the buttons to the list.

## SCSS variables

| variable          | default                           | description                               |
| ----------------- | --------------------------------- | ----------------------------------------- |
| $font             | core.$caption-font                | Font of settings                          |
| $text-color       | core.$panel-text-color            | Text color of settings                    |
| $background       | core.$panel-background            | Background color of settings              |
| $item-height      | core.$panel-menu-item-height      | Height of each settings item              |
| $item-padding     | core.$panel-menu-item-padding     | Padding of each settings item             |
| $hover-background | core.$panel-menu-hover-background | Background color of items on mouse hover  |
| $badge-font       | 10px / .9 monospace               | Font of the badge displayed on the button |
| $badge-text-color | white                             | Text color if the badge                   |
| $badge-background | #111                              | Background color of the badge             |
