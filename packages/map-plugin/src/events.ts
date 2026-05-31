import { TypedEvent } from '@photo-sphere-viewer/core';
import type { MapPlugin } from './MapPlugin';

/**
 * @event 用户点击热点时触发
 */
export class SelectHotspot extends TypedEvent<MapPlugin> {
  static override readonly type = 'select-hotspot';
  override type: 'select-hotspot';

  /** @internal */
  constructor(public readonly hotspotId: string) {
    super(SelectHotspot.type);
  }
}

/**
 * @event 地图尺寸变化时触发
 */
export class ViewChanged extends TypedEvent<MapPlugin> {
  static override readonly type = 'view-changed';
  override type: 'view-changed';

  /** @internal */
  constructor(public readonly view: 'closed' | 'normal' | 'maximized') {
    super(ViewChanged.type);
  }
}

export type MapPluginEvents = SelectHotspot | ViewChanged;
