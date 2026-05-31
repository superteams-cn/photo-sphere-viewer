/**
 * {@link TypedEventTarget} 派发事件的基类
 * @template TTarget 事件目标类型
 */
export abstract class TypedEvent<TTarget extends TypedEventTarget<any>> extends Event {
  static readonly type: string;

  override target: TTarget;

  constructor(type: string, cancelable = false) {
    super(type, { cancelable });
  }
}

/**
 * EventTarget 装饰器，用于为事件和监听器提供强类型
 * @see https://rjzaworski.com/2021/06/event-target-with-typescript
 * @template TEvents union of dispatched events
 */
export class TypedEventTarget<TEvents extends TypedEvent<any>> extends EventTarget {
  override dispatchEvent(e: TEvents): boolean {
    return super.dispatchEvent(e);
  }

  /**
   * @template T 事件名称
   * @template E 事件类
   */
  override addEventListener<T extends TEvents['type'], E extends TEvents & { type: T }>(
    type: T,
    callback: ((e: E) => void) | EventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ) {
    super.addEventListener(type, callback as any, options);
  }

  /**
   * @template T 事件名称
   * @template E 事件类
   */
  override removeEventListener<T extends TEvents['type'], E extends TEvents & { type: T }>(
    type: TEvents['type'],
    callback: ((e: E) => void) | EventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) {
    super.removeEventListener(type, callback as any, options);
  }
}
