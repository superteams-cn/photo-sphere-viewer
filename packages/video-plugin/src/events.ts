import { TypedEvent } from '@photo-sphere-viewer/core';
import type { VideoPlugin } from './VideoPlugin';

/**
 * @event 视频开始播放或暂停时触发
 */
export class PlayPauseEvent extends TypedEvent<VideoPlugin> {
  static override readonly type = 'play-pause';
  override type: 'play-pause';

  /** @internal */
  constructor(public readonly playing: boolean) {
    super(PlayPauseEvent.type);
  }
}

/**
 * @event 视频音量变化时触发
 */
export class VolumeChangeEvent extends TypedEvent<VideoPlugin> {
  static override readonly type = 'volume-change';
  override type: 'volume-change';

  /** @internal */
  constructor(public readonly volume: number) {
    super(VolumeChangeEvent.type);
  }
}

/**
 * @event 视频播放进度变化时触发
 */
export class ProgressEvent extends TypedEvent<VideoPlugin> {
  static override readonly type = 'progress';
  override type: 'progress';

  /** @internal */
  constructor(
    public readonly time: number,
    public readonly duration: number,
    public readonly progress: number,
  ) {
    super(ProgressEvent.type);
  }
}

/**
 * @event 视频缓冲进度变化时触发
 */
export class BufferEvent extends TypedEvent<VideoPlugin> {
  static override readonly type = 'buffer';
  override type: 'buffer';

  /** @internal */
  constructor(public readonly maxBuffer: number) {
    super(BufferEvent.type);
  }
}

export type VideoPluginEvents = PlayPauseEvent | VolumeChangeEvent | ProgressEvent | BufferEvent;
