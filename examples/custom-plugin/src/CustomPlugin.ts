import type { Viewer } from '@photo-sphere-viewer/core';
import { AbstractPlugin } from '@photo-sphere-viewer/core';
import { CustomPluginEvent, CustomPluginEvents } from './events';
import { CustomPluginConfig } from './model';

export class CustomPlugin extends AbstractPlugin<CustomPluginEvents> {
  static override readonly id = 'custom-plugin';

  constructor(
    viewer: Viewer,
    private config: CustomPluginConfig,
  ) {
    super(viewer);
  }

  override init() {
    // 在这里编写初始化逻辑
    console.log(this.config.foo);
  }

  override destroy() {
    // 在这里编写清理逻辑
    super.destroy();
  }

  doSomething() {
    this.dispatchEvent(new CustomPluginEvent(true));
  }
}
