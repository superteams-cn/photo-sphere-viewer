import { TypedEvent } from '@photo-sphere-viewer/core';
import type { CustomPlugin } from './CustomPlugin';

/**
 * @event 自定义事件发生时触发
 */
export class CustomPluginEvent extends TypedEvent<CustomPlugin> {
  static override readonly type = 'custom-event';
  override type: 'custom-event';

  constructor(public readonly value: boolean) {
    super(CustomPluginEvent.type);
  }
}

export type CustomPluginEvents = CustomPluginEvent;
