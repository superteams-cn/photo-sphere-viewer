import { Mesh } from 'three';
import { Tooltip, TooltipConfig } from './components/Tooltip';
import { TypedEvent } from './lib/TypedEventTarget';
import { ClickData, Point, Position, Size, TextureData, ViewerConfig } from './model';
import type { Viewer } from './Viewer';
import { keyPressMatch } from './utils';

/**
 * {@link Viewer} 派发的所有事件的基类
 */
export abstract class ViewerEvent extends TypedEvent<Viewer> {}

/**
 * @event 动画开始前触发，可取消
 */
export class BeforeAnimateEvent extends ViewerEvent {
  static override readonly type = 'before-animate';
  override type: 'before-animate';

  /** @internal */
  constructor(
    /** 目标位置，可修改 */
    public position: Position | undefined,
    /** 目标缩放级别，可修改 */
    public zoomLevel: number | undefined,
  ) {
    super(BeforeAnimateEvent.type, true);
  }
}

/**
 * @event 渲染前触发
 */
export class BeforeRenderEvent extends ViewerEvent {
  static override readonly type = 'before-render';
  override type: 'before-render';

  /** @internal */
  constructor(
    /** requestAnimationFrame 提供的时间戳 */
    public readonly timestamp: number,
    /** 距上一帧经过的时间 */
    public readonly elapsed: number,
  ) {
    super(BeforeRenderEvent.type);
  }
}

/**
 * @event 旋转前触发，可取消
 */
export class BeforeRotateEvent extends ViewerEvent {
  static override readonly type = 'before-rotate';
  override type: 'before-rotate';

  /** @internal */
  constructor(
    /** 目标位置，可修改 */
    public position: Position,
  ) {
    super(BeforeRotateEvent.type, true);
  }
}

/**
 * @event 用户点击查看器时触发（导航栏和侧边面板除外）
 */
export class ClickEvent extends ViewerEvent {
  static override readonly type = 'click';
  override type: 'click';

  /** @internal */
  constructor(public readonly data: ClickData) {
    super(ClickEvent.type);
  }
}

/**
 * @event 配置项发生变化时触发
 */
export class ConfigChangedEvent extends ViewerEvent {
  static override readonly type = 'config-changed';
  override type: 'config-changed';

  /** @internal */
  constructor(public readonly options: Array<keyof ViewerConfig>) {
    super(ConfigChangedEvent.type);
  }

  /**
   * 检查指定配置项中是否至少有一项发生变化
   */
  containsOptions(...options: Array<keyof ViewerConfig>): boolean {
    return options.some((option) => this.options.includes(option));
  }
}

/**
 * @event 用户双击查看器时触发。`dblclick` 触发前总会先触发一次普通的 `click`。
 */
export class DoubleClickEvent extends ViewerEvent {
  static override readonly type = 'dblclick';
  override type: 'dblclick';

  /** @internal */
  constructor(public readonly data: ClickData) {
    super(DoubleClickEvent.type);
  }
}

/**
 * @event 全屏状态开启或关闭时触发
 */
export class FullscreenEvent extends ViewerEvent {
  static override readonly type = 'fullscreen';
  override type: 'fullscreen';

  /** @internal */
  constructor(public readonly fullscreenEnabled: boolean) {
    super(FullscreenEvent.type);
  }
}

/**
 * @event 通知隐藏时触发
 */
export class HideNotificationEvent extends ViewerEvent {
  static override readonly type = 'hide-notification';
  override type: 'hide-notification';

  /** @internal */
  constructor(public readonly notificationId?: string) {
    super(HideNotificationEvent.type);
  }
}

/**
 * @event 覆盖层隐藏时触发
 */
export class HideOverlayEvent extends ViewerEvent {
  static override readonly type = 'hide-overlay';
  override type: 'hide-overlay';

  /** @internal */
  constructor(public readonly overlayId?: string) {
    super(HideOverlayEvent.type);
  }
}

/**
 * @event 面板隐藏时触发
 */
export class HidePanelEvent extends ViewerEvent {
  static override readonly type = 'hide-panel';
  override type: 'hide-panel';

  /** @internal */
  constructor(public readonly panelId?: string) {
    super(HidePanelEvent.type);
  }
}

/**
 * @event 提示框隐藏时触发
 */
export class HideTooltipEvent extends ViewerEvent {
  static override readonly type = 'hide-tooltip';
  override type: 'hide-tooltip';

  /** @internal */
  constructor(
    /** 与提示框关联的用户数据 */
    public readonly tooltipData: TooltipConfig['data'],
  ) {
    super(HideTooltipEvent.type);
  }
}

/**
 * @event 按下键盘按键时触发，可取消
 */
export class KeypressEvent extends ViewerEvent {
  static override readonly type = 'key-press';
  override type: 'key-press';

  /** @internal */
  constructor(
    public readonly key: string,
    public readonly originalEvent: KeyboardEvent,
  ) {
    super(KeypressEvent.type, true);
  }

  /**
   * 检查按键事件是否匹配给定模式
   */
  matches(pattern: string): boolean {
    return keyPressMatch(this.originalEvent, pattern);
  }
}

/**
 * @event 加载进度变化时触发
 */
export class LoadProgressEvent extends ViewerEvent {
  static override readonly type = 'load-progress';
  override type: 'load-progress';

  /** @internal */
  constructor(public readonly progress: number) {
    super(LoadProgressEvent.type);
  }
}

/**
 * @event 全景图开始加载时触发
 */
export class PanoramaLoadEvent extends ViewerEvent {
  static override readonly type = 'panorama-load';
  override type: 'panorama-load';

  /** @internal */
  constructor(public readonly panorama: any) {
    super(PanoramaLoadEvent.type);
  }
}

/**
 * @event 全景图加载完成时触发
 */
export class PanoramaLoadedEvent extends ViewerEvent {
  static override readonly type = 'panorama-loaded';
  override type: 'panorama-loaded';

  /** @internal */
  constructor(public readonly data: TextureData) {
    super(PanoramaLoadedEvent.type);
  }
}

/**
 * @event 全景图加载出错时触发
 */
export class PanoramaErrorEvent extends ViewerEvent {
  static override readonly type = 'panorama-error';
  override type: 'panorama-error';

  /** @internal */
  constructor(
    public readonly panorama: any,
    public readonly error: Error,
  ) {
    super(PanoramaErrorEvent.type);
  }
}

/**
 * @event 切换到新全景图的过渡结束时触发（无论是否完整完成）
 */
export class TransitionDoneEvent extends ViewerEvent {
  static override readonly type = 'transition-done';
  override type: 'transition-done';

  /** @internal */
  constructor(public readonly completed: boolean) {
    super(TransitionDoneEvent.type);
  }
}

/**
 * @event 视角变化时触发
 */
export class PositionUpdatedEvent extends ViewerEvent {
  static override readonly type = 'position-updated';
  override type: 'position-updated';

  /** @internal */
  constructor(public readonly position: Position) {
    super(PositionUpdatedEvent.type);
  }
}

/**
 * @event 相机翻滚角变化时触发
 */
export class RollUpdatedEvent extends ViewerEvent {
  static override readonly type = 'roll-updated';
  override type: 'roll-updated';

  /** @internal */
  constructor(public readonly roll: number) {
    super(RollUpdatedEvent.type);
  }
}

/**
 * @event 全景图加载完成且查看器准备好进行首次渲染时触发
 */
export class ReadyEvent extends ViewerEvent {
  static override readonly type = 'ready';
  override type: 'ready';

  /** @internal */
  constructor() {
    super(ReadyEvent.type);
  }
}

/**
 * @event 查看器每次渲染时触发
 */
export class RenderEvent extends ViewerEvent {
  static override readonly type = 'render';
  override type: 'render';

  /** @internal */
  constructor() {
    super(RenderEvent.type);
  }
}

/**
 * @event 通知显示时触发
 */
export class ShowNotificationEvent extends ViewerEvent {
  static override readonly type = 'show-notification';
  override type: 'show-notification';

  /** @internal */
  constructor(public readonly notificationId?: string) {
    super(ShowNotificationEvent.type);
  }
}

/**
 * @event 覆盖层显示时触发
 */
export class ShowOverlayEvent extends ViewerEvent {
  static override readonly type = 'show-overlay';
  override type: 'show-overlay';

  /** @internal */
  constructor(public readonly overlayId?: string) {
    super(ShowOverlayEvent.type);
  }
}

/**
 * @event 面板显示时触发
 */
export class ShowPanelEvent extends ViewerEvent {
  static override readonly type = 'show-panel';
  override type: 'show-panel';

  /** @internal */
  constructor(public readonly panelId?: string) {
    super(ShowPanelEvent.type);
  }
}

/**
 * @event 提示框显示时触发
 */
export class ShowTooltipEvent extends ViewerEvent {
  static override readonly type = 'show-tooltip';
  override type: 'show-tooltip';

  /** @internal */
  constructor(
    /** 提示框实例 */
    public readonly tooltip: Tooltip,
    /** 与提示框关联的用户数据 */
    public readonly tooltipData?: TooltipConfig['data'],
  ) {
    super(ShowTooltipEvent.type);
  }
}

/**
 * @event 查看器尺寸变化时触发
 */
export class SizeUpdatedEvent extends ViewerEvent {
  static override readonly type = 'size-updated';
  override type: 'size-updated';

  /** @internal */
  constructor(public readonly size: Size) {
    super(SizeUpdatedEvent.type);
  }
}

/**
 * @event 当前所有动画停止时触发
 */
export class StopAllEvent extends ViewerEvent {
  static override readonly type = 'stop-all';
  override type: 'stop-all';

  /** @internal */
  constructor() {
    super(StopAllEvent.type);
  }
}

/**
 * @event 查看器缩放级别变化时触发
 */
export class ZoomUpdatedEvent extends ViewerEvent {
  static override readonly type = 'zoom-updated';
  override type: 'zoom-updated';

  /** @internal */
  constructor(public readonly zoomLevel: number) {
    super(ZoomUpdatedEvent.type);
  }
}

/**
 * three.js 对象相关事件的基类
 *
 * 注意：必须调用 {@link Viewer#observeObjects} 才会派发这些事件
 */
export abstract class ObjectEvent extends ViewerEvent {
  /** @internal */
  constructor(
    type: string,
    public readonly originalEvent: MouseEvent,
    public readonly object: Mesh<any, any>,
    public readonly viewerPoint: Point,
    public readonly userDataKey: string,
  ) {
    super(type);
  }
}

/**
 * @event 指针进入场景中的对象时触发
 *
 * 注意：必须调用 {@link Viewer#observeObjects} 才会派发此事件
 */
export class ObjectEnterEvent extends ObjectEvent {
  static override readonly type = 'enter-object';
  override type: 'enter-object';

  /** @internal */
  constructor(originalEvent: MouseEvent, object: Mesh, viewerPoint: Point, userDataKey: string) {
    super(ObjectEnterEvent.type, originalEvent, object, viewerPoint, userDataKey);
  }
}

/**
 * @event 指针离开场景中的对象时触发
 *
 * 注意：必须调用 {@link Viewer#observeObjects} 才会派发此事件
 */
export class ObjectLeaveEvent extends ObjectEvent {
  static override readonly type = 'leave-object';
  override type: 'leave-object';

  /** @internal */
  constructor(originalEvent: MouseEvent, object: Mesh, viewerPoint: Point, userDataKey: string) {
    super(ObjectLeaveEvent.type, originalEvent, object, viewerPoint, userDataKey);
  }
}

/**
 * @event 指针在场景对象上移动时触发
 *
 * 注意：必须调用 {@link Viewer#observeObjects} 才会派发此事件
 */
export class ObjectHoverEvent extends ObjectEvent {
  static override readonly type = 'hover-object';
  override type: 'hover-object';

  /** @internal */
  constructor(originalEvent: MouseEvent, object: Mesh, viewerPoint: Point, userDataKey: string) {
    super(ObjectHoverEvent.type, originalEvent, object, viewerPoint, userDataKey);
  }
}

export type ViewerEvents =
  | BeforeAnimateEvent
  | BeforeRenderEvent
  | BeforeRotateEvent
  | ClickEvent
  | ConfigChangedEvent
  | DoubleClickEvent
  | FullscreenEvent
  | HideNotificationEvent
  | HideOverlayEvent
  | HidePanelEvent
  | HideTooltipEvent
  | KeypressEvent
  | LoadProgressEvent
  | PanoramaLoadEvent
  | PanoramaLoadedEvent
  | PanoramaErrorEvent
  | TransitionDoneEvent
  | PositionUpdatedEvent
  | RollUpdatedEvent
  | ReadyEvent
  | RenderEvent
  | ShowNotificationEvent
  | ShowOverlayEvent
  | ShowPanelEvent
  | ShowTooltipEvent
  | SizeUpdatedEvent
  | StopAllEvent
  | ZoomUpdatedEvent
  | ObjectEnterEvent
  | ObjectLeaveEvent
  | ObjectHoverEvent;
