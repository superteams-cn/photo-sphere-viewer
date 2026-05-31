import { TypedEvent } from '@photo-sphere-viewer/core';
import type { Marker } from './markers/Marker';
import type { MarkersPlugin } from './MarkersPlugin';

/**
 * {@link MarkersPlugin} 派发的事件基类
 */
export abstract class MarkersPluginEvent extends TypedEvent<MarkersPlugin> {}

/**
 * @event 标记可见性变化时触发
 */
export class MarkerVisibilityEvent extends MarkersPluginEvent {
  static override readonly type = 'marker-visibility';
  override type: 'marker-visibility';

  /** @internal */
  constructor(
    public readonly marker: Marker,
    public readonly visible: boolean,
  ) {
    super(MarkerVisibilityEvent.type);
  }
}

/**
 * @event 跳转到标记的动画完成时触发
 */
export class GotoMarkerDoneEvent extends MarkersPluginEvent {
  static override readonly type = 'goto-marker-done';
  override type: 'goto-marker-done';

  /** @internal */
  constructor(public readonly marker: Marker) {
    super(GotoMarkerDoneEvent.type);
  }
}

/**
 * @event 指针离开标记时触发
 */
export class LeaveMarkerEvent extends MarkersPluginEvent {
  static override readonly type = 'leave-marker';
  override type: 'leave-marker';

  /** @internal */
  constructor(public readonly marker: Marker) {
    super(LeaveMarkerEvent.type);
  }
}

/**
 * @event 指针移入标记时触发
 */
export class EnterMarkerEvent extends MarkersPluginEvent {
  static override readonly type = 'enter-marker';
  override type: 'enter-marker';

  /** @internal */
  constructor(public readonly marker: Marker) {
    super(EnterMarkerEvent.type);
  }
}

/**
 * @event 用户点击标记时触发
 */
export class SelectMarkerEvent extends MarkersPluginEvent {
  static override readonly type = 'select-marker';
  override type: 'select-marker';

  /** @internal */
  constructor(
    public readonly marker: Marker,
    public readonly doubleClick: boolean,
    public readonly rightClick: boolean,
  ) {
    super(SelectMarkerEvent.type);
  }
}

/**
 * @event 用户在侧边面板中选择标记时触发
 */
export class SelectMarkerListEvent extends MarkersPluginEvent {
  static override readonly type = 'select-marker-list';
  override type: 'select-marker-list';

  /** @internal */
  constructor(public readonly marker: Marker) {
    super(SelectMarkerListEvent.type);
  }
}

/**
 * @event 已选中标记后，用户点击其他位置时触发
 */
export class UnselectMarkerEvent extends MarkersPluginEvent {
  static override readonly type = 'unselect-marker';
  override type: 'unselect-marker';

  /** @internal */
  constructor(public readonly marker: Marker) {
    super(UnselectMarkerEvent.type);
  }
}

/**
 * @event 标记隐藏时触发
 */
export class HideMarkersEvent extends MarkersPluginEvent {
  static override readonly type = 'hide-markers';
  override type: 'hide-markers';

  /** @internal */
  constructor() {
    super(HideMarkersEvent.type);
  }
}

/**
 * @event 标记集合变化时触发
 */
export class SetMarkersEvent extends MarkersPluginEvent {
  static override readonly type = 'set-markers';
  override type: 'set-markers';

  /** @internal */
  constructor(public readonly markers: Marker[]) {
    super(SetMarkersEvent.type);
  }
}

/**
 * @event 标记显示时触发
 */
export class ShowMarkersEvent extends MarkersPluginEvent {
  static override readonly type = 'show-markers';
  override type: 'show-markers';

  /** @internal */
  constructor() {
    super(ShowMarkersEvent.type);
  }
}

/**
 * @event 用于调整侧边面板中显示的标记列表
 */
export class RenderMarkersListEvent extends MarkersPluginEvent {
  static override readonly type = 'render-markers-list';
  override type: 'render-markers-list';

  /** @internal */
  constructor(
    /** 待显示的标记列表，可修改 */
    public markers: Marker[],
  ) {
    super(RenderMarkersListEvent.type);
  }
}

export type MarkersPluginEvents =
  | MarkerVisibilityEvent
  | GotoMarkerDoneEvent
  | LeaveMarkerEvent
  | EnterMarkerEvent
  | SelectMarkerEvent
  | SelectMarkerListEvent
  | UnselectMarkerEvent
  | HideMarkersEvent
  | SetMarkersEvent
  | ShowMarkersEvent
  | RenderMarkersListEvent;
