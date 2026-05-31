import { TypedEvent } from '@photo-sphere-viewer/core';
import type { StereoPlugin } from './StereoPlugin';

/**
 * @event 立体视图开启或关闭时触发
 */
export class StereoUpdatedEvent extends TypedEvent<StereoPlugin> {
  static override readonly type = 'stereo-updated';
  override type: 'stereo-updated';

  /** @internal */
  constructor(public readonly stereoEnabled: boolean) {
    super(StereoUpdatedEvent.type);
  }
}

export type StereoPluginEvents = StereoUpdatedEvent;
