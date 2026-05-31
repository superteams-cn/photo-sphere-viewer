# 编写插件

::: tip 完整功能示例
你可以在项目的 [examples](https://github.com/mistic100/Photo-Sphere-Viewer/tree/main/examples/custom-plugin) 文件夹中找到一个完整的插件实现示例。
:::

## 语法

推荐将自定义插件创建为一个 ES6 类，并继承 `@photo-sphere-viewer/core` 包提供的 `AbstractPlugin`。

**要求：**

- 插件类的第一个参数**必须**是 `Viewer` 对象，并将其传给 `super` 构造函数。
- 它**必须**包含 `static id` 属性。
- 它**必须**实现 `init` 方法，用于执行初始化，例如订阅事件。
- 它**必须**实现 `destroy` 方法，用于在 viewer 卸载时清理插件。
- 构造函数**可以**接收 `config` 对象作为第二个参数。

在插件中可以访问 `this.viewer`，它是 viewer 实例。更多信息请查看 [API 参考](/api/classes/Core.Viewer.html){target=\_blank}。

插件本身也是一个 `EventTarget`，包含 `addEventListener`、`removeEventListener` 和 `dispatchEvent` 方法。

```js:line-numbers
import { AbstractPlugin } from '@photo-sphere-viewer/core';

export class CustomPlugin extends AbstractPlugin {
    static id = 'custom-plugin';

    static withConfig(config) {
        return [CustomPlugin, config];
    }

    constructor(viewer, config) {
        super(viewer);
    }

    init() {
        // do your initialisation logic here
    }

    destroy() {
        // do your cleanup logic here
        super.destroy();
    }
}
```

除了这个主类之外，你可以使用任意数量的 ES 模块来拆分代码。

### 类型化事件

使用 TypeScript 开发时，为每个发出的事件提供强类型会很方便。因此，`AbstractPlugin` 接收一个可选模板类型，用来表示可派发事件列表。所有事件都必须继承 `TypedEvent`；它同样是模板类，以便为 `target` 属性提供类型。

```ts:line-numbers
/**
 * 声明事件类
 */
export class CustomPluginEvent extends TypedEvent<CustomPlugin> {
    static override readonly type = 'custom-event'; // 推荐用于常量访问
    override type: 'custom-event'; // 类型声明需要

    constructor(public readonly value: boolean) {
        super(CustomPluginEvent.type);
    }
}

/**
 * 声明所有事件的联合类型
 */
export type CustomPluginEvents = CustomPluginEvent;

/**
 * Provide the events type
 */
export class CustomPlugin extends AbstractPlugin<CustomPluginEvents> {
    /**
     * Dispatch
     */
    method() {
        this.dispatch(new CustomPluginEvent(true));
    }
}

/**
 * Listen
 */
viewer.getPlugin(CustomPlugin)
    .addEventListener(CustomPluginEvent.type, ({ value, target }) => {
        // value is typed boolean
        // target is typed CustomPlugin
    });
```

## 打包

打包插件最简单的方式是使用 [rollup.js](https://rollupjs.org)，配置如下：

```js:line-numbers
export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/index.cjs',
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: 'dist/index.module.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    external: [
        'three',
        '@photo-sphere-viewer/core',
    ],
};
```

### 样式表

如果插件需要自定义 CSS，请在主 Javascript 文件中直接导入样式表，并将这个 rollup 插件加入配置（这里使用 SASS 加载器）：

```js
require('rollup-plugin-postcss')({
  extract: true,
  sourceMap: true,
  use: ['sass'],
});
```

## 按钮

你的插件可能需要在导航栏中添加新按钮。本节说明如何创建并注册按钮。

### 创建按钮

全景图查看器按钮**必须**继承 `AbstractButton`。更多信息请查看 [API 参考](/api/classes/Core.AbstractButton.html){target=\_blank}。

**要求：**

- 按钮类的第一个参数**必须**是 `Navbar` 对象，并将其传给 `super` 构造函数。
- 它**必须**包含 `static id` 属性。
- 它**必须**实现 `destroy` 方法，用于在 viewer 卸载时清理按钮。
- 它**必须**实现 `onClick` 方法来执行操作。
- 它**可以**实现 `isSupported` 方法，用于根据环境告知 viewer 该操作是否可用。
- 它**必须**向 `super` 提供按钮配置：
  - `className`：应用到按钮上的 CSS 类名
  - `icon`：图标 SVG
  - `iconActive`：按钮激活时的图标 SVG（默认为 `icon`）
  - `collapsable`：表示按钮是否可在小屏幕上折叠到菜单中（默认为 `false`）
  - `tabbable`：表示按钮是否可通过键盘激活（默认为 `true`）

```js:line-numbers
import { AbstractButton } from '@photo-sphere-viewer/core';

export class CustomButton extends AbstractButton {
    static id = 'custom-button';

    constructor(navbar) {
        super(navbar, {
            className: 'custom-button-class',
            icon: '<svg>...</svg>',
            collapsable: true,
            tabbable: true,
        });

        // do your initialisation logic here
        // you will probably need the instance of your plugin
        this.plugin = this.viewer.getPlugin('custom-plugin');
    }

    destroy() {
        // do your cleanup logic here
        super.destroy();
    }

    isSupported() {
        return !!this.plugin;
    }

    onClick() {
        this.plugin.doSomething();
    }
}
```

### 注册按钮

在插件主文件中调用 `registerButton`。这只会让按钮变为可用，但默认不会显示；用户仍需要在自己的 `navbar` 配置中声明它。

```js
import { registerButton } from '@photo-sphere-viewer/core';
import { CustomButton } from './CustomButton';

registerButton(CustomButton);
```

### 管理图标

如果按钮使用图标，建议使用外部 SVG，并将它与代码一起打包。可通过以下 rollup 插件实现：

```js
require('rollup-plugin-string').string({
  include: ['**/*.svg'],
});
```

这样就可以通过 `import` 将 SVG 文件作为字符串获取。

```js
import iconContent from './icon.svg';
```

::: tip 图标颜色
为了在导航栏中正确显示，图标必须使用 `fill="currentColor"` 和/或 `stroke="currentColor"`。
:::

## 命名和发布

如果你打算将插件发布到 npmjs.org，请遵循以下命名方式：

- 类名：`[[Name]]Plugin`
- NPM 包名：`photo-sphere-viewer-[[name]]-plugin`

必须正确配置 `package.json`，以便应用构建工具获取正确文件；同时必须将 `@photo-sphere-viewer/core` 声明为依赖。

```json:line-numbers
{
    "name": "photo-sphere-viewer-custom-plugin",
    "version": "1.0.0",
    "main": "index.cjs",
    "module": "index.module.js",
    "style": "index.css",
    "dependencies": {
        "@photo-sphere-viewer/core": "^5.0.0"
    }
}
```

现在可以发起 PR，将它添加到[第三方插件](./third-party.md)列表中。
