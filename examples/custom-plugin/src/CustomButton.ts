import type { Navbar } from '@photo-sphere-viewer/core';
import { AbstractButton } from '@photo-sphere-viewer/core';
import type { CustomPlugin } from './CustomPlugin';
import icon from './icon.svg';

export class CustomButton extends AbstractButton {
  static override readonly id = 'custom-button';

  private plugin: CustomPlugin;

  constructor(navbar: Navbar) {
    super(navbar, {
      className: 'custom-plugin__button',
      icon: icon,
      collapsable: true,
      tabbable: true,
    });

    // 在这里编写初始化逻辑
    // 通常会需要拿到插件实例
    this.plugin = this.viewer.getPlugin('custom-plugin');
  }

  override destroy() {
    // 在这里编写清理逻辑
    super.destroy();
  }

  override isSupported() {
    return !!this.plugin;
  }

  onClick() {
    this.plugin.doSomething();
  }
}
