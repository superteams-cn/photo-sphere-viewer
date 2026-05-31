import type { Viewer } from '../Viewer';

/**
 * UI 组件基类
 */
export abstract class AbstractComponent {
  /**
   * Reference to main controller
   */
  protected readonly viewer: Viewer;

  /**
   * All child components
   * @internal
   */
  readonly children: AbstractComponent[] = [];

  /**
   * Container element
   */
  readonly container: HTMLElement;

  /**
   * Internal properties
   * @internal
   */
  protected readonly state = {
    visible: true,
  };

  constructor(
    protected readonly parent: Viewer | AbstractComponent,
    config: { className?: string; tagName?: string },
  ) {
    this.viewer = parent instanceof AbstractComponent ? parent.viewer : parent;

    this.container = document.createElement(config.tagName ?? 'div');
    this.container.className = config.className || '';

    this.parent.children.push(this);
    this.parent.container.appendChild(this.container);
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.parent.container.removeChild(this.container);

    const childIdx = this.parent.children.indexOf(this);
    if (childIdx !== -1) {
      this.parent.children.splice(childIdx, 1);
    }

    this.children.slice().forEach((child) => child.destroy());
    this.children.length = 0;
  }

  /**
   * 显示或隐藏组件
   */
  toggle(visible = !this.isVisible()) {
    if (!visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 隐藏组件
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hide(options?: any) {
    this.container.style.display = 'none';
    this.state.visible = false;
  }

  /**
   * 显示组件
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  show(options?: any) {
    this.container.style.display = '';
    this.state.visible = true;
  }

  /**
   * 检查组件是否可见
   */
  isVisible(): boolean {
    return this.state.visible;
  }
}
