import { TypedEvent } from '@photo-sphere-viewer/core';
import type { GyroscopePlugin } from './GyroscopePlugin';

/**
 * @event 陀螺仪控制开启或关闭时触发
 */
export class GyroscopeUpdatedEvent extends TypedEvent<GyroscopePlugin> {
  static override readonly type = 'gyroscope-updated';
  override type: 'gyroscope-updated';

  /** @internal */
  constructor(public readonly gyroscopeEnabled: boolean) {
    super(GyroscopeUpdatedEvent.type);
  }
}

export type GyroscopePluginEvents = GyroscopeUpdatedEvent;
