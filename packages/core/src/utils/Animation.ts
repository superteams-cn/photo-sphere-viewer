import { type EASING, EASINGS } from '../data/constants';

/**
 * {@link Animation} 的选项
 */
export type AnimationOptions<T> = {
  /**
   * 需要插值的属性
   */
  properties: Partial<Record<keyof T, { start: number; end: number }>>;
  /**
   * 动画时长
   */
  duration: number;
  /**
   * 开始前的延迟
   * @default 0
   */
  delay?: number;
  /**
   * 插值函数，参见 {@link EASINGS}
   * @default 'linear'
   */
  easing?: EASING | ((t: number) => number);
  /**
   * 每一帧调用的函数
   */
  onTick: (properties: Record<keyof T, number>, progress: number) => void;
};

type PropertyValues = AnimationOptions<any>['properties']['k'];

/**
 * 动画插值辅助工具
 *
 * 实现 Promise API，并额外提供 "cancel" 方法。
 * 动画完成时 promise 解析为 `true`；动画取消时解析为 `false`。
 * @template T 插值属性类型
 *
 * @example
 * ```ts
 * const anim = new Animation({
 *     properties: {
 *         width: {start: 100, end: 200}
 *     },
 *     duration: 5000,
 *     onTick: (properties) => element.style.width = `${properties.width}px`;
 * });
 *
 * anim.then((completed) => ...);
 *
 * anim.cancel();
 * ```
 */
export class Animation<T = any> implements PromiseLike<boolean> {
  private options: AnimationOptions<T>;
  private easing: (t: number) => number = EASINGS['linear'];
  private callbacks: Array<(complete: boolean) => void> = [];
  private start?: number;
  private delayTimeout: ReturnType<typeof setTimeout>;
  private animationFrame: ReturnType<typeof requestAnimationFrame>;

  resolved = false;
  cancelled = false;

  constructor(options: AnimationOptions<T>) {
    this.options = options;

    if (options) {
      if (options.easing) {
        this.easing =
          typeof options.easing === 'function' ? options.easing : EASINGS[options.easing] || EASINGS['linear'];
      }

      this.delayTimeout = setTimeout(() => {
        this.delayTimeout = undefined;
        this.animationFrame = window.requestAnimationFrame((t) => this.__run(t));
      }, options.delay || 0);
    } else {
      this.resolved = true;
    }
  }

  private __run(timestamp: number) {
    if (this.cancelled) {
      return;
    }

    // 第一次迭代
    if (!this.start) {
      this.start = timestamp;
    }

    // 计算进度
    const progress = (timestamp - this.start) / this.options.duration;
    const current = {} as Record<keyof T, number>;

    if (progress < 1.0) {
      // 插值属性
      for (const [name, prop] of Object.entries(this.options.properties) as Array<[string, PropertyValues]>) {
        if (prop) {
          const value = prop.start + (prop.end - prop.start) * this.easing(progress);
          // @ts-ignore
          current[name] = value;
        }
      }
      this.options.onTick(current, progress);

      this.animationFrame = window.requestAnimationFrame((t) => this.__run(t));
    } else {
      // 使用最终值最后调用一次 onTick
      for (const [name, prop] of Object.entries(this.options.properties) as Array<[string, PropertyValues]>) {
        if (prop) {
          // @ts-ignore
          current[name] = prop.end;
        }
      }
      this.options.onTick(current, 1.0);

      this.__resolve(true);
      this.animationFrame = undefined;
    }
  }

  private __resolve(value: boolean) {
    if (value) {
      this.resolved = true;
    } else {
      this.cancelled = true;
    }
    this.callbacks.forEach((cb) => cb(value));
    this.callbacks.length = 0;
  }

  /**
   * Promise 链式调用
   * @param [onFulfilled] - 动画完成（true）或取消（false）时调用
   */
  then<U>(onFulfilled: (complete: boolean) => PromiseLike<U> | U): Promise<U> {
    if (this.resolved || this.cancelled) {
      return Promise.resolve(this.resolved).then(onFulfilled);
    }

    return new Promise((resolve: (complete: boolean) => void) => {
      this.callbacks.push(resolve);
    }).then(onFulfilled);
  }

  /**
   * 取消动画
   */
  cancel() {
    if (!this.cancelled && !this.resolved) {
      this.__resolve(false);

      if (this.delayTimeout) {
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = undefined;
      }
      if (this.animationFrame) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = undefined;
      }
    }
  }
}
