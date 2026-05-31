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

    // do your initialisation logic here
    // 通常会需要拿到插件实例
    this.plugin = this.viewer.getPlugin('custom-plugin');
  }

  override destroy() {
    // do your cleanup logic here
    super.destroy();
  }

  override isSupported() {
    return !!this.plugin;
  }

  onClick() {
    this.plugin.doSomething();
  }
}
