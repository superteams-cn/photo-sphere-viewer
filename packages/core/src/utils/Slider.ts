import { MathUtils } from 'three';

/**
 * {@link Slider} 的方向
 */
export enum SliderDirection {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

/**
 * 传递给 {@link Slider} 监听器的数据
 */
export type SliderUpdateData = {
  /**
   * 0 到 1 之间的滑块进度
   */
  readonly value: number;

  /**
   * 用户点击了滑块
   */
  readonly click: boolean;

  /**
   * 用户未点击，仅在滑块上方移动指针
   */
  readonly mouseover: boolean;

  /**
   * 用户按住点击并在滑块上方移动指针
   */
  readonly mousedown: boolean;

  /**
   * 指针在页面上的位置
   */
  readonly cursor: { clientX: number; clientY: number };
};

/**
 * 用于创建滑块元素的辅助工具
 */
export class Slider {
  private mousedown = false;
  private mouseover = false;

  get isVertical() {
    return this.direction === SliderDirection.VERTICAL;
  }

  get isHorizontal() {
    return this.direction === SliderDirection.HORIZONTAL;
  }

  constructor(
    /** 滑动元素的主容器 */
    private readonly container: HTMLElement,
    /** 滑块方向 */
    private readonly direction: SliderDirection,
    /** 用户与滑块交互时触发的回调 */
    private readonly listener: (data: SliderUpdateData) => void,
  ) {
    this.container.addEventListener('click', this);
    this.container.addEventListener('mousedown', this);
    this.container.addEventListener('mouseenter', this);
    this.container.addEventListener('mouseleave', this);
    this.container.addEventListener('touchstart', this);
    this.container.addEventListener('mousemove', this, true);
    this.container.addEventListener('touchmove', this, true);
    window.addEventListener('mouseup', this);
    window.addEventListener('touchend', this);
  }

  destroy() {
    window.removeEventListener('mouseup', this);
    window.removeEventListener('touchend', this);
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        e.stopPropagation();
        break;
      case 'mousedown':
        this.__onMouseDown(e as MouseEvent);
        break;
      case 'mouseenter':
        this.__onMouseEnter(e as MouseEvent);
        break;
      case 'mouseleave':
        this.__onMouseLeave(e as MouseEvent);
        break;
      case 'touchstart':
        this.__onTouchStart(e as TouchEvent);
        break;
      case 'mousemove':
        this.__onMouseMove(e as MouseEvent);
        break;
      case 'touchmove':
        this.__onTouchMove(e as TouchEvent);
        break;
      case 'mouseup':
        this.__onMouseUp(e as MouseEvent);
        break;
      case 'touchend':
        this.__onTouchEnd(e as TouchEvent);
        break;
    }
  }

  private __onMouseDown(evt: MouseEvent) {
    this.mousedown = true;
    this.__update(evt.clientX, evt.clientY, true);
  }

  private __onMouseEnter(evt: MouseEvent) {
    this.mouseover = true;
    this.__update(evt.clientX, evt.clientY, true);
  }

  private __onTouchStart(evt: TouchEvent) {
    this.mouseover = true;
    this.mousedown = true;
    const touch = evt.changedTouches[0];
    this.__update(touch.clientX, touch.clientY, true);
  }

  private __onMouseMove(evt: MouseEvent) {
    if (this.mousedown || this.mouseover) {
      evt.stopPropagation();
      this.__update(evt.clientX, evt.clientY, true);
    }
  }

  private __onTouchMove(evt: TouchEvent) {
    if (this.mousedown || this.mouseover) {
      evt.stopPropagation();
      const touch = evt.changedTouches[0];
      this.__update(touch.clientX, touch.clientY, true);
    }
  }

  private __onMouseUp(evt: MouseEvent) {
    if (this.mousedown) {
      this.mousedown = false;
      this.__update(evt.clientX, evt.clientY, false);
    }
  }

  private __onMouseLeave(evt: MouseEvent) {
    if (this.mouseover) {
      this.mouseover = false;
      this.__update(evt.clientX, evt.clientY, true);
    }
  }

  private __onTouchEnd(evt: TouchEvent) {
    if (this.mousedown) {
      this.mouseover = false;
      this.mousedown = false;
      const touch = evt.changedTouches[0];
      this.__update(touch.clientX, touch.clientY, false);
    }
  }

  private __update(clientX: number, clientY: number, moving: boolean) {
    const boundingClientRect = this.container.getBoundingClientRect();

    let val: number;
    if (this.isVertical) {
      val = MathUtils.clamp((boundingClientRect.bottom - clientY) / boundingClientRect.height, 0, 1);
    } else {
      val = MathUtils.clamp((clientX - boundingClientRect.left) / boundingClientRect.width, 0, 1);
    }

    this.listener({
      value: val,
      click: !moving,
      mousedown: this.mousedown,
      mouseover: this.mouseover,
      cursor: { clientX, clientY },
    });
  }
}
