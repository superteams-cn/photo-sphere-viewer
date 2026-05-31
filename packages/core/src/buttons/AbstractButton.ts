import { AbstractComponent } from '../components/AbstractComponent';
import type { Navbar } from '../components/Navbar';
import { KEY_CODES } from '../data/constants';
import { ResolvableBoolean } from '../model';
import { addClasses, getConfigParser, resolveBoolean, toggleClass } from '../utils';

/**
 * {@link AbstractButton} 配置
 */
export type ButtonConfig = {
  id?: string;
  tagName?: string;
  className?: string;
  title?: string;
  /**
   * 按钮是否带鼠标悬停效果
   * @default false
   */
  hoverScale?: boolean;
  /**
   * 导航栏空间不足时，按钮是否可以移入菜单
   * @default false
   */
  collapsable?: boolean;
  /**
   * 按钮是否可通过键盘访问
   * @default true
   */
  tabbable?: boolean;
  /**
   * 按钮图标
   */
  icon?: string;
  /**
   * 按钮激活时使用的覆盖图标
   */
  iconActive?: string;
};

const getConfig = getConfigParser<ButtonConfig>({
  id: null,
  tagName: null,
  className: null,
  title: null,
  hoverScale: false,
  collapsable: false,
  tabbable: true,
  icon: null,
  iconActive: null,
});

/**
 * 导航栏按钮基类
 */
export abstract class AbstractButton extends AbstractComponent {
  /**
   * 按钮的唯一标识符
   */
  static readonly id: string;

  /**
   * 用于声明按钮组的标识符
   */
  static readonly groupId?: string;

  /**
   * 内部属性
   */
  protected override readonly state = {
    visible: true,
    enabled: true,
    supported: true,
    collapsed: false,
    active: false,
    width: 0,
  };

  protected readonly config: ButtonConfig;

  get id(): string {
    return this.config.id;
  }

  get title(): string {
    return this.container.title;
  }

  get content(): string {
    return this.container.innerHTML;
  }

  get width(): number {
    return this.state.width;
  }

  get collapsable(): boolean {
    return this.config.collapsable;
  }

  constructor(navbar: Navbar, config: ButtonConfig) {
    super(navbar, {
      tagName: config.tagName,
      className: `psv-button ${config.hoverScale ? 'psv-button--hover-scale' : ''} ${config.className || ''}`,
    });

    this.config = getConfig(config);
    if (!config.id) {
      this.config.id = (this.constructor as typeof AbstractButton).id;
    }

    if (config.icon) {
      this.__setIcon(config.icon);
    }

    this.state.width = this.container.offsetWidth;

    if (this.config.title) {
      this.container.title = this.viewer.config.lang[this.config.title] ?? this.config.title;
    } else if (this.id && this.id in this.viewer.config.lang) {
      this.container.title = (this.viewer.config.lang as any)[this.id];
    }

    if (config.tabbable) {
      this.container.tabIndex = 0;
    }

    this.container.addEventListener('click', (e) => {
      if (this.state.enabled) {
        this.onClick();
      }
      e.stopPropagation();
    });

    this.container.addEventListener('keydown', (e) => {
      if (e.key === KEY_CODES.Enter && this.state.enabled) {
        this.onClick();
        e.stopPropagation();
      }
    });
  }

  /**
   * 按钮点击时执行的动作
   */
  abstract onClick(): void;

  override show(refresh = true) {
    if (!this.isVisible()) {
      this.state.visible = true;
      if (!this.state.collapsed) {
        this.container.style.display = '';
      }
      if (refresh) {
        this.viewer.navbar.autoSize();
      }
    }
  }

  override hide(refresh = true) {
    if (this.isVisible()) {
      this.state.visible = false;
      this.container.style.display = 'none';
      if (refresh) {
        this.viewer.navbar.autoSize();
      }
    }
  }

  /**
   * 根据 {@link isSupported} 的结果隐藏或显示按钮
   * @internal
   */
  checkSupported() {
    resolveBoolean(this.isSupported(), (supported, init) => {
      if (!this.state) {
        return; // the component has been destroyed
      }
      this.state.supported = supported;
      if (!init) {
        this.toggle(supported);
      } else if (!supported) {
        this.hide();
      }
    });
  }

  /**
   * Perform action when the navbar size/content changes
   * @internal
   */
  autoSize() {
    // nothing
  }

  /**
   * 检查按钮是否可显示
   */
  isSupported(): boolean | ResolvableBoolean {
    return true;
  }

  /**
   * 修改按钮激活状态
   */
  toggleActive(active = !this.state.active) {
    if (active !== this.state.active) {
      this.state.active = active;
      toggleClass(this.container, 'psv-button--active', this.state.active);

      if (this.config.iconActive) {
        this.__setIcon(this.state.active ? this.config.iconActive : this.config.icon);
      }
    }
  }

  /**
   * 禁用按钮
   */
  disable() {
    this.container.classList.add('psv-button--disabled');
    this.state.enabled = false;
  }

  /**
   * 启用按钮
   */
  enable() {
    this.container.classList.remove('psv-button--disabled');
    this.state.enabled = true;
  }

  /**
   * 将按钮折叠到导航栏菜单中
   */
  collapse() {
    this.state.collapsed = true;
    this.container.style.display = 'none';
  }

  /**
   * 将按钮从导航栏菜单中展开
   */
  uncollapse() {
    this.state.collapsed = false;
    if (this.state.visible) {
      this.container.style.display = '';
    }
  }

  private __setIcon(icon: string) {
    this.container.innerHTML = icon;
    addClasses(this.container.querySelector('svg'), 'psv-button-svg');
  }
}

export type ButtonConstructor = (new (navbar: Navbar) => AbstractButton) & typeof AbstractButton;
