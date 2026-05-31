import { TypedEvent } from '@photo-sphere-viewer/core';
import type { AutorotatePlugin } from './AutorotatePlugin';

/**
 * @event 自动旋转开启或关闭时触发
 */
export class AutorotateEvent extends TypedEvent<AutorotatePlugin> {
  static override readonly type = 'autorotate';
  override type: 'autorotate';

  /** @internal */
  constructor(public readonly autorotateEnabled: boolean) {
    super(AutorotateEvent.type);
  }
}

export type AutorotatePluginEvents = AutorotateEvent;
