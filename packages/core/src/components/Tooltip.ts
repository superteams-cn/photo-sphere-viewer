import { PSVError } from '../PSVError';
import type { Viewer } from '../Viewer';
import { HideTooltipEvent, ShowTooltipEvent } from '../events';
import { addClasses, cleanCssPosition, cssPositionIsOrdered, getStyleProperty } from '../utils';
import { AbstractComponent } from './AbstractComponent';

/**
 * 工具提示位置定义
 */
export type TooltipPosition = {
  /**
   * 提示框箭头尖端的位置，单位为像素
   */
  top: number;
  /**
   * 提示框箭头尖端的位置，单位为像素
   */
  left: number;
  /**
   * 提示框相对箭头尖端的位置。
   * 可取值为 `top`、`center`、`bottom` 与 `left`、`center`、`right` 的组合。
   */
  position?: string | [string, string];
  /**
   * @internal
   */
  box?: { width: number; height: number };
};

/**
 * {@link Viewer.createTooltip} 的配置
 */
export type TooltipConfig = TooltipPosition & {
  /**
   * 提示框的 HTML 内容
   */
  content: string;
  /**
   * 添加到提示框上的额外 CSS 类
   */
  className?: string;
  /**
   * 添加到提示框上的 CSS 属性
   */
  style?: Record<string, string>;
  /**
   * 与提示框关联的用户数据
   */
  data?: any;
};

type TooltipStyle = {
  posClass: [string, string];
  width: number;
  height: number;
  top: number;
  left: number;
  arrowTop: number;
  arrowLeft: number;
};

const enum TooltipState {
  NONE,
  SHOWING,
  HIDING,
  READY,
}

/**
 * 提示框组件
 * 不要直接实例化提示框，请使用 {@link Viewer#createTooltip}
 */
export class Tooltip extends AbstractComponent {
  /**
   * @internal
   */
  protected override readonly state = {
    visible: true,
    arrow: 0,
    border: 0,
    state: TooltipState.NONE,
    width: 0,
    height: 0,
    pos: '',
    config: null as TooltipPosition,
    data: null as any,
    hideTimeout: null as ReturnType<typeof setTimeout>,
  };

  private readonly content: HTMLElement;
  private readonly arrow: HTMLElement;

  /**
   * @internal
   */
  constructor(viewer: Viewer, config: TooltipConfig) {
    super(viewer, {
      className: 'psv-tooltip',
    });

    this.content = document.createElement('div');
    this.content.className = 'psv-tooltip-content';
    this.container.appendChild(this.content);

    this.arrow = document.createElement('div');
    this.arrow.className = 'psv-tooltip-arrow';
    this.container.appendChild(this.arrow);

    this.container.addEventListener('transitionend', this);

    // 允许与静态提示框交互
    this.container.addEventListener('touchdown', (e) => e.stopPropagation());
    this.container.addEventListener('mousedown', (e) => e.stopPropagation());

    this.container.style.top = '-1000px';
    this.container.style.left = '-1000px';

    this.show(config);
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    if (e.type === 'transitionend') {
      this.__onTransitionEnd(e as TransitionEvent);
    }
  }

  /**
   * @internal
   */
  override destroy() {
    clearTimeout(this.state.hideTimeout);
    delete this.state.data;
    super.destroy();
  }

  /**
   * @throws {@link PSVError} 始终抛出
   * @internal
   */
  override toggle() {
    throw new PSVError('提示框不能切换显示状态。');
  }

  /**
   * 在查看器上显示提示框
   * @internal
   */
  override show(config: TooltipConfig) {
    if (this.state.state !== TooltipState.NONE) {
      throw new PSVError('已初始化的提示框不能再次初始化。');
    }

    if (config.className) {
      addClasses(this.container, config.className);
    }
    if (config.style) {
      Object.assign(this.container.style, config.style);
    }

    this.state.state = TooltipState.READY;

    this.update(config.content, config);

    this.state.data = config.data;
    this.state.state = TooltipState.SHOWING;

    this.viewer.dispatchEvent(new ShowTooltipEvent(this, this.state.data));

    this.__waitImages();
  }

  /**
   * 更新提示框内容，并可同时更新位置
   * @throws {@link PSVError} 配置无效时抛出
   */
  update(content: string, config?: TooltipPosition) {
    this.content.innerHTML = content;

    const rect = this.container.getBoundingClientRect();
    this.state.width = rect.right - rect.left;
    this.state.height = rect.bottom - rect.top;
    this.state.arrow = parseInt(getStyleProperty(this.arrow, 'border-top-width'), 10);
    this.state.border = parseInt(getStyleProperty(this.container, 'border-top-left-radius'), 10);

    this.move(config ?? this.state.config);
    this.__waitImages();
  }

  /**
   * 将提示框移动到新位置
   * @throws {@link PSVError} 配置无效时抛出
   */
  move(config: TooltipPosition) {
    if (this.state.state !== TooltipState.SHOWING && this.state.state !== TooltipState.READY) {
      throw new PSVError('未初始化的提示框不能移动。');
    }

    config.box = config.box ?? this.state.config?.box ?? { width: 0, height: 0 };
    this.state.config = config;

    const t = this.container;
    const a = this.arrow;

    // compute size
    const style: TooltipStyle = {
      posClass: cleanCssPosition(config.position, { allowCenter: false, cssOrder: false }) || ['top', 'center'],
      width: this.state.width,
      height: this.state.height,
      top: 0,
      left: 0,
      arrowTop: 0,
      arrowLeft: 0,
    };

    // set initial position
    this.__computeTooltipPosition(style, config);

    // 溢出时修正位置
    let swapY = null;
    let swapX = null;
    if (style.top < 0) {
      swapY = 'bottom';
    } else if (style.top + style.height > this.viewer.state.size.height) {
      swapY = 'top';
    }
    if (style.left < 0) {
      swapX = 'right';
    } else if (style.left + style.width > this.viewer.state.size.width) {
      swapX = 'left';
    }
    if (swapX || swapY) {
      const ordered = cssPositionIsOrdered(style.posClass);
      if (swapY) {
        style.posClass[ordered ? 0 : 1] = swapY;
      }
      if (swapX) {
        style.posClass[ordered ? 1 : 0] = swapX;
      }
      this.__computeTooltipPosition(style, config);
    }

    // 应用位置
    t.style.top = style.top + 'px';
    t.style.left = style.left + 'px';

    a.style.top = style.arrowTop + 'px';
    a.style.left = style.arrowLeft + 'px';

    const newPos = style.posClass.join('-');
    if (newPos !== this.state.pos) {
      t.classList.remove(`psv-tooltip--${this.state.pos}`);

      this.state.pos = newPos;
      t.classList.add(`psv-tooltip--${this.state.pos}`);
    }
  }

  /**
   * 隐藏提示框
   */
  override hide() {
    this.container.classList.remove('psv-tooltip--visible');
    this.state.state = TooltipState.HIDING;

    this.viewer.dispatchEvent(new HideTooltipEvent(this.state.data));

    // 看门狗：防止没有收到 "transitionend" 事件
    const duration = parseFloat(getStyleProperty(this.container, 'transition-duration'));
    this.state.hideTimeout = setTimeout(() => {
      this.destroy();
    }, duration * 2);
  }

  /**
   * 完成过渡
   */
  private __onTransitionEnd(e: TransitionEvent) {
    if (e.propertyName === 'transform') {
      switch (this.state.state) {
        case TooltipState.SHOWING:
          this.container.classList.add('psv-tooltip--visible');
          this.state.state = TooltipState.READY;
          break;

        case TooltipState.HIDING:
          this.state.state = TooltipState.NONE;
          this.destroy();
          break;

        default:
        // 无需处理
      }
    }
  }

  /**
   * 计算提示框及其箭头的位置
   */
  private __computeTooltipPosition(style: TooltipStyle, config: TooltipPosition) {
    const arrow = this.state.arrow;
    const top = config.top;
    const height = style.height;
    const left = config.left;
    const width = style.width;
    const offsetSide = arrow + this.state.border;
    const offsetX = config.box.width / 2 + arrow * 2;
    const offsetY = config.box.height / 2 + arrow * 2;

    switch (style.posClass.join('-')) {
      case 'top-left':
        style.top = top - offsetY - height;
        style.left = left + offsetSide - width;
        style.arrowTop = height;
        style.arrowLeft = width - offsetSide - arrow;
        break;
      case 'top-center':
        style.top = top - offsetY - height;
        style.left = left - width / 2;
        style.arrowTop = height;
        style.arrowLeft = width / 2 - arrow;
        break;
      case 'top-right':
        style.top = top - offsetY - height;
        style.left = left - offsetSide;
        style.arrowTop = height;
        style.arrowLeft = arrow;
        break;
      case 'bottom-left':
        style.top = top + offsetY;
        style.left = left + offsetSide - width;
        style.arrowTop = -arrow * 2;
        style.arrowLeft = width - offsetSide - arrow;
        break;
      case 'bottom-center':
        style.top = top + offsetY;
        style.left = left - width / 2;
        style.arrowTop = -arrow * 2;
        style.arrowLeft = width / 2 - arrow;
        break;
      case 'bottom-right':
        style.top = top + offsetY;
        style.left = left - offsetSide;
        style.arrowTop = -arrow * 2;
        style.arrowLeft = arrow;
        break;
      case 'left-top':
        style.top = top + offsetSide - height;
        style.left = left - offsetX - width;
        style.arrowTop = height - offsetSide - arrow;
        style.arrowLeft = width;
        break;
      case 'center-left':
        style.top = top - height / 2;
        style.left = left - offsetX - width;
        style.arrowTop = height / 2 - arrow;
        style.arrowLeft = width;
        break;
      case 'left-bottom':
        style.top = top - offsetSide;
        style.left = left - offsetX - width;
        style.arrowTop = arrow;
        style.arrowLeft = width;
        break;
      case 'right-top':
        style.top = top + offsetSide - height;
        style.left = left + offsetX;
        style.arrowTop = height - offsetSide - arrow;
        style.arrowLeft = -arrow * 2;
        break;
      case 'center-right':
        style.top = top - height / 2;
        style.left = left + offsetX;
        style.arrowTop = height / 2 - arrow;
        style.arrowLeft = -arrow * 2;
        break;
      case 'right-bottom':
        style.top = top - offsetSide;
        style.left = left + offsetX;
        style.arrowTop = arrow;
        style.arrowLeft = -arrow * 2;
        break;

      // no default
    }
  }

  /**
   * 如果提示框包含图片，则在图片加载完成后重新计算尺寸
   */
  private __waitImages() {
    const images = this.content.querySelectorAll('img') as NodeListOf<HTMLImageElement>;

    if (images.length > 0) {
      const promises: Array<Promise<any>> = [];

      images.forEach((image) => {
        if (!image.complete) {
          promises.push(
            new Promise((resolve) => {
              image.onload = resolve;
              image.onerror = resolve;
            }),
          );
        }
      });

      if (promises.length) {
        Promise.all(promises).then(() => {
          if (this.state.state === TooltipState.SHOWING || this.state.state === TooltipState.READY) {
            const rect = this.container.getBoundingClientRect();
            this.state.width = rect.right - rect.left;
            this.state.height = rect.bottom - rect.top;
            this.move(this.state.config);
          }
        });
      }
    }
  }
}
